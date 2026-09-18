import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session as DbSession, selectinload

from api.routes.auth import get_current_user
from database.session import get_db
from models.classroom import Classroom, ClassroomStatus
from models.enrollment import Enrollment, EnrollmentStatus
from models.gig import Gig, GigStatus
from models.gig_package import GigPackage
from models.user import User, UserRole
from schemas.enrollment import (
    EnrollmentClassroomOut,
    EnrollmentCreate,
    EnrollmentGigOut,
    EnrollmentOut,
)

router = APIRouter()

# Marketplace-visible statuses for public gig listing/detail — mirrored from
# api.routes.gigs so enrollment never touches unpublished gigs.
_PUBLIC_STATUSES = [GigStatus.approved, GigStatus.active]

_ACTIVE_ENROLLMENT_STATUSES = [
    EnrollmentStatus.pending,
    EnrollmentStatus.confirmed,
]

_CLASSROOM_TITLE_MAX = 200


def _parse_enrollment_id(enrollment_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(enrollment_id)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Enrollment not found")


def _enrollment_query(db: DbSession):
    """Base query eagerly loading the nested gig/classroom summaries."""
    return db.query(Enrollment).options(
        selectinload(Enrollment.gig),
        selectinload(Enrollment.classroom),
    )


def _to_out(enrollment: Enrollment) -> EnrollmentOut:
    """Assemble the response, embedding real gig/classroom summaries.

    The nested values come from the database rows already eager-loaded on the
    relationship; nothing is fabricated.
    """
    out = EnrollmentOut.model_validate(enrollment)
    if enrollment.gig is not None:
        out.gig = EnrollmentGigOut(id=enrollment.gig.id, title=enrollment.gig.title)
    if enrollment.classroom is not None:
        out.classroom = EnrollmentClassroomOut(
            id=enrollment.classroom.id,
            title=enrollment.classroom.title,
            status=enrollment.classroom.status,
        )
    return out


def _classroom_title(gig_title: str, teacher_name: str) -> str:
    """Derive a classroom title from real gig data, e.g.

    "O Level Mathematics — with Sameer Malik". Kept within the Classroom.title
    column limit.
    """
    title = f"{gig_title} — with {teacher_name}"
    if len(title) > _CLASSROOM_TITLE_MAX:
        title = title[:_CLASSROOM_TITLE_MAX - 1].rstrip() + "\u2026"
    return title


def _find_published_gig(db: DbSession, gig_id: uuid.UUID) -> Gig:
    gig = db.query(Gig).filter(Gig.id == gig_id).first()
    if not gig or gig.status not in _PUBLIC_STATUSES:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Gig not found")
    return gig


def _resolve_price(db: DbSession, gig: Gig, package_id: uuid.UUID | None) -> tuple[int, GigPackage | None]:
    """Determine the enrollment price server-side.

    When a package is supplied it must belong to the gig; the price then comes
    from that package. With no package the gig's own price is used. A missing
    price is a 422, never a fabricated value.
    """
    if package_id is None:
        if gig.price is None:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                "This program does not have a price set for booking without a package.",
            )
        return gig.price, None

    package = db.query(GigPackage).filter(GigPackage.id == package_id).first()
    if not package or package.gig_id != gig.id:
        # 404 hides whether the package exists and which gig it belongs to.
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Package not found")

    price = package.price if package.price is not None else gig.price
    if price is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "This package does not have a price set for booking.",
        )
    return price, package


def _existing_active_enrollment(
    db: DbSession,
    student_id: uuid.UUID,
    gig: Gig,
    package: GigPackage | None,
) -> Enrollment | None:
    """Return the student's active enrollment for this gig/package, if any."""
    query = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == student_id,
            Enrollment.gig_id == gig.id,
            Enrollment.status.in_(_ACTIVE_ENROLLMENT_STATUSES),
        )
    )
    if package is not None:
        query = query.filter(Enrollment.package_id == package.id)
    else:
        query = query.filter(Enrollment.package_id.is_(None))
    return query.first()


@router.post(
    "",
    response_model=EnrollmentOut,
    status_code=status.HTTP_201_CREATED,
)
def create_enrollment(
    payload: EnrollmentCreate,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Book a published gig for the authenticated student.

    The student identity comes from the JWT; the teacher is derived from the
    gig (gig.teacher_id) — never accepted from the client. A classroom is
    created in the same transaction and linked to the enrollment, so a
    confirmed enrollment always lands in the student's dashboard. Repeated
    active enrollments for the same gig/package are rejected with 409.
    """
    if current_user.role != UserRole.student:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only students can enroll in learning programs",
        )

    gig = _find_published_gig(db, payload.gig_id)
    price, package = _resolve_price(db, gig, payload.package_id)

    if _existing_active_enrollment(db, current_user.id, gig, package):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "You are already enrolled in this learning program.",
        )

    teacher = db.query(User).filter(User.id == gig.teacher_id).first()
    teacher_name = teacher.full_name if teacher else "Ustaad"

    classroom = Classroom(
        student_id=current_user.id,
        teacher_id=gig.teacher_id,
        gig_id=gig.id,
        title=_classroom_title(gig.title, teacher_name),
        status=ClassroomStatus.active,
    )
    db.add(classroom)
    db.flush()

    enrollment = Enrollment(
        student_id=current_user.id,
        teacher_id=gig.teacher_id,
        gig_id=gig.id,
        package_id=package.id if package else None,
        price=price,
        status=EnrollmentStatus.confirmed,
        classroom_id=classroom.id,
    )
    db.add(enrollment)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "You are already enrolled in this learning program.",
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Could not complete the enrollment. Please try again.",
        )

    db.refresh(enrollment)
    db.refresh(classroom)
    # Re-query with the gig/classroom eager-loads so the nested summaries in
    # the response are backed by real DB rows (the viewonly relationships are
    # not assignable).
    enrollment = (
        _enrollment_query(db).filter(Enrollment.id == enrollment.id).first()
    )
    return _to_out(enrollment)


@router.get("/me", response_model=list[EnrollmentOut])
def list_my_enrollments(
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """List the authenticated student's enrollments.

    Scoped by the JWT (current_user.id); another student's enrollments can
    never leak into this response.
    """
    enrollments = (
        _enrollment_query(db)
        .filter(Enrollment.student_id == current_user.id)
        .order_by(Enrollment.created_at.desc())
        .all()
    )
    return [_to_out(e) for e in enrollments]


@router.get("/teacher", response_model=list[EnrollmentOut])
def list_teacher_enrollments(
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """List enrollments bound to the authenticated teacher's gigs.

    Only teachers may call this, and only enrollments where the gig's teacher
    is the authenticated user are returned.
    """
    if current_user.role != UserRole.teacher:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only teachers can list teacher enrollments",
        )

    enrollments = (
        _enrollment_query(db)
        .filter(Enrollment.teacher_id == current_user.id)
        .order_by(Enrollment.created_at.desc())
        .all()
    )
    return [_to_out(e) for e in enrollments]


@router.get("/{enrollment_id}", response_model=EnrollmentOut)
def get_enrollment(
    enrollment_id: str,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Retrieve one enrollment the caller is a party to.

    The student who enrolled or the teacher of the enrolled gig may read it.
    Unknown ids 404; non-parties get 403.
    """
    enrollment_uuid = _parse_enrollment_id(enrollment_id)
    enrollment = (
        _enrollment_query(db)
        .filter(Enrollment.id == enrollment_uuid)
        .first()
    )
    if not enrollment:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Enrollment not found")

    is_student = enrollment.student_id == current_user.id
    is_teacher = enrollment.teacher_id == current_user.id
    if not is_student and not is_teacher:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "You do not have access to this enrollment",
        )

    return _to_out(enrollment)