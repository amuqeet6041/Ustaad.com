import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session as DbSession, selectinload

from api.routes.auth import get_current_user
from database.session import get_db
from models.gig import Gig, GigStatus
from models.gig_package import GigPackage, GigPackageTier
from models.teacher_profile import TeacherProfile
from models.user import User, UserRole
from schemas.gig import GigCreate, GigOut, GigTeacherOut, GigUpdate
from schemas.gig_package import GigPackageOut

router = APIRouter()

# Marketplace-visible statuses for the public listing/detail endpoints.
_PUBLIC_STATUSES = [GigStatus.approved, GigStatus.active]

# Canonical marketplace tier ordering: Basic → Standard → Premium.
_TIER_RANK = {
    GigPackageTier.basic: 0,
    GigPackageTier.standard: 1,
    GigPackageTier.premium: 2,
}


def _parse_gig_id(gig_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(gig_id)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Gig not found")


def _get_owned_gig(db: DbSession, gig_id: str, current_user: User) -> Gig:
    """Return the caller's own gig, or 404/403 when the caller has no access.

    The id comes from the URL path; ownership is verified against the
    authenticated JWT. A 404 hides unknown ids; a 403 blocks non-owners.
    """
    gig_uuid = _parse_gig_id(gig_id)
    gig = db.query(Gig).filter(Gig.id == gig_uuid).first()
    if not gig:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Gig not found")
    if gig.teacher_id != current_user.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "You do not own this gig",
        )
    return gig


def _require_teacher(current_user: User) -> None:
    if current_user.role != UserRole.teacher:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only teachers can manage gigs",
        )


def _as_json_ready(payload: GigCreate | GigUpdate) -> dict:
    """Convert pydantic content sub-models into plain dicts for JSONB columns.

    JSONB columns are json-serialized by SQLAlchemy; pydantic model instances
    are not json-serializable, so syllabus/faqs are dumped to dicts. The
    learning_outcomes/prerequisites string lists are passed through as-is.
    """
    return {
        "learning_outcomes": payload.learning_outcomes,
        "syllabus": (
            [item.model_dump() for item in payload.syllabus]
            if payload.syllabus is not None
            else None
        ),
        "prerequisites": payload.prerequisites,
        "faqs": (
            [item.model_dump() for item in payload.faqs]
            if payload.faqs is not None
            else None
        ),
    }


def _teacher_summary(teacher: User, profile: TeacherProfile | None) -> GigTeacherOut | None:
    """Assemble the safe public teacher summary from pre-loaded rows.

    Identity comes from the `users` row; marketplace fields come from the
    one-to-one `teacher_profiles` row when it exists. Profile-only fields stay
    null when the teacher has no profile — no fabricated values.
    """
    if teacher is None:
        return None
    return GigTeacherOut(
        id=teacher.id,
        name=teacher.full_name,
        city=profile.city if profile else None,
        bio=profile.bio if profile else None,
        education=profile.education if profile else None,
        languages=profile.languages if profile else None,
        teaching_mode=profile.teaching_mode if profile else None,
        hourly_rate=profile.hourly_rate if profile else None,
    )


def _sorted_packages(packages: list[GigPackage]) -> list[GigPackageOut]:
    """Order a gig's packages Basic → Standard → Premium.

    Ordering is by the canonical tier ranking, never by database insertion
    order. GigPackage objects are converted to GigPackageOut instances.
    """
    return [
        GigPackageOut.model_validate(p)
        for p in sorted(packages, key=lambda p: _TIER_RANK.get(p.tier, 99))
    ]


def _gig_rows(db: DbSession):
    """Base query pairing each marketplace-visible gig with its teacher and
    teacher profile, eagerly loading packages (no N+1)."""
    return (
        db.query(Gig, User, TeacherProfile)
        .options(selectinload(Gig.packages))
        .join(User, User.id == Gig.teacher_id)
        .outerjoin(TeacherProfile, TeacherProfile.user_id == User.id)
    )


def _ensure_unique_slug(db: DbSession, slug: str, exclude_gig_id: uuid.UUID | None = None) -> None:
    """Reject slugs already used by another gig (409)."""
    query = db.query(Gig).filter(Gig.slug == slug)
    if exclude_gig_id is not None:
        query = query.filter(Gig.id != exclude_gig_id)
    if query.first():
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "A gig with this slug already exists",
        )


@router.get("", response_model=list[GigOut])
def list_gigs(db: DbSession = Depends(get_db)):
    """List marketplace-visible gigs on the public marketplace.

    Only approved/active gigs are exposed. Drafts, submissions under review,
    paused, rejected, and archived gigs are never listed publicly. Ordered by
    creation date (newest first). Each response embeds the public teacher
    summary and that gig's packages.
    """
    rows = (
        _gig_rows(db)
        .filter(Gig.status.in_(_PUBLIC_STATUSES))
        .order_by(Gig.created_at.desc())
        .all()
    )
    result = []
    for gig, teacher, profile in rows:
        out = GigOut.model_validate(gig)
        out.teacher = _teacher_summary(teacher, profile)
        out.packages = _sorted_packages(gig.packages)
        result.append(out)
    return result


@router.get("/{gig_id}", response_model=GigOut)
def get_gig(gig_id: str, db: DbSession = Depends(get_db)):
    """Retrieve a single marketplace-visible gig.

    Unpublished or archived gigs are hidden from the public endpoint and
    return 404 rather than leaking private status. The response embeds a
    public teacher summary (users + teacher_profiles) and the gig's packages.
    """
    gig_uuid = _parse_gig_id(gig_id)
    row = (
        _gig_rows(db)
        .filter(Gig.id == gig_uuid, Gig.status.in_(_PUBLIC_STATUSES))
        .first()
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Gig not found")

    gig, teacher, profile = row
    out = GigOut.model_validate(gig)
    out.teacher = _teacher_summary(teacher, profile)
    out.packages = _sorted_packages(gig.packages)
    return out


@router.post(
    "",
    response_model=GigOut,
    status_code=status.HTTP_201_CREATED,
)
def create_gig(
    payload: GigCreate,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Create a gig owned by the authenticated teacher.

    The teacher identity comes exclusively from the JWT; teacher_id is never
    accepted from the client. New gigs always start in GigStatus.draft, which
    is set server-side and is not client-settable. A client-supplied slug must
    be unique across the marketplace (409 on collision).
    """
    _require_teacher(current_user)

    if payload.slug:
        _ensure_unique_slug(db, payload.slug)

    content = _as_json_ready(payload)
    gig = Gig(
        teacher_id=current_user.id,
        title=payload.title,
        slug=payload.slug,
        category=payload.category,
        subject=payload.subject,
        city=payload.city,
        price=payload.price,
        overview=payload.overview,
        **content,
    )
    db.add(gig)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "A gig with this slug already exists",
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Could not save the gig. Please try again.",
        )
    db.refresh(gig)
    return gig


@router.put("/{gig_id}", response_model=GigOut)
def update_gig(
    gig_id: str,
    payload: GigUpdate,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Update the authenticated teacher's own gig.

    Only editable content fields are applied. teacher_id, status, created_at,
    and updated_at can never be modified through this endpoint. A slug change
    must not collide with another gig (409 on conflict).
    """
    _require_teacher(current_user)
    gig = _get_owned_gig(db, gig_id, current_user)

    if payload.slug is not None and payload.slug != gig.slug:
        _ensure_unique_slug(db, payload.slug, exclude_gig_id=gig.id)
        gig.slug = payload.slug

    if payload.title is not None:
        gig.title = payload.title
    if payload.category is not None:
        gig.category = payload.category
    if payload.subject is not None:
        gig.subject = payload.subject
    if payload.city is not None:
        gig.city = payload.city
    if payload.price is not None:
        gig.price = payload.price
    if payload.overview is not None:
        gig.overview = payload.overview

    content = _as_json_ready(payload)
    if content["learning_outcomes"] is not None:
        gig.learning_outcomes = content["learning_outcomes"]
    if content["syllabus"] is not None:
        gig.syllabus = content["syllabus"]
    if content["prerequisites"] is not None:
        gig.prerequisites = content["prerequisites"]
    if content["faqs"] is not None:
        gig.faqs = content["faqs"]

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "A gig with this slug already exists",
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Could not update the gig. Please try again.",
        )
    db.refresh(gig)
    return gig


@router.delete("/{gig_id}")
def archive_gig(
    gig_id: str,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Soft-delete (archive) the authenticated teacher's own gig.

    The row is preserved — needed because classrooms.gig_id foreign-keys to
    gigs.id — by flipping status to GigStatus.archived instead of deleting.
    """
    _require_teacher(current_user)
    gig = _get_owned_gig(db, gig_id, current_user)

    gig.status = GigStatus.archived
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Could not archive the gig. Please try again.",
        )
    db.refresh(gig)
    return {"message": "Gig archived successfully", "gig_id": str(gig.id)}