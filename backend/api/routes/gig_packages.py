import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session as DbSession

from api.routes.gigs import (
    _PUBLIC_STATUSES,
    _get_owned_gig,
    _parse_gig_id,
    _require_teacher,
)
from api.routes.auth import get_current_user
from database.session import get_db
from models.gig import Gig, GigStatus
from models.gig_package import GigPackage, GigPackageTier
from models.user import User
from schemas.gig_package import GigPackageCreate, GigPackageOut, GigPackageUpdate

router = APIRouter()

# Canonical marketplace tier ordering: Basic → Standard → Premium.
_TIER_RANK = {
    GigPackageTier.basic: 0,
    GigPackageTier.standard: 1,
    GigPackageTier.premium: 2,
}


def _parse_package_id(package_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(package_id)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Package not found")


def _tier_rank(tier: GigPackageTier) -> int:
    return _TIER_RANK.get(tier, 99)


def _ensure_unique_tier(db: DbSession, gig_id: uuid.UUID, tier: GigPackageTier) -> None:
    """Reject a tier that already exists on the same gig (409)."""
    existing = (
        db.query(GigPackage)
        .filter(GigPackage.gig_id == gig_id, GigPackage.tier == tier)
        .first()
    )
    if existing:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "A package with this tier already exists for this gig",
        )


def _get_owned_package(db: DbSession, gig: Gig, package_id: str) -> GigPackage:
    """Return a package belonging to the given gig, or 404."""
    package_uuid = _parse_package_id(package_id)
    package = (
        db.query(GigPackage)
        .filter(GigPackage.id == package_uuid, GigPackage.gig_id == gig.id)
        .first()
    )
    if not package:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Package not found")
    return package


def _get_packages_for_gig(db: DbSession, gig: Gig) -> list[GigPackageOut]:
    """Return a gig's packages ordered Basic → Standard → Premium."""
    packages = (
        db.query(GigPackage)
        .filter(GigPackage.gig_id == gig.id)
        .order_by(GigPackage.created_at.asc())
        .all()
    )
    return [
        GigPackageOut.model_validate(p)
        for p in sorted(packages, key=lambda p: _tier_rank(p.tier))
    ]


@router.get("/{gig_id}/packages", response_model=list[GigPackageOut])
def list_packages(gig_id: str, db: DbSession = Depends(get_db)):
    """Publicly list packages for a published (approved/active) gig.

    Drafts, submissions under review, paused, rejected, and archived gigs
    return 404 — their packages are never exposed publicly. Packages are
    ordered Basic → Standard → Premium.
    """
    gig_uuid = _parse_gig_id(gig_id)
    gig = (
        db.query(Gig)
        .filter(Gig.id == gig_uuid, Gig.status.in_(_PUBLIC_STATUSES))
        .first()
    )
    if not gig:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Gig not found")
    return _get_packages_for_gig(db, gig)


@router.post(
    "/{gig_id}/packages",
    response_model=GigPackageOut,
    status_code=status.HTTP_201_CREATED,
)
def create_package(
    gig_id: str,
    payload: GigPackageCreate,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Create a package on the authenticated teacher's own gig.

    The gig comes from the URL path and ownership from the JWT — gig_id and
    teacher identity are never accepted from the client. A second package with
    the same tier on the same gig is rejected with 409.
    """
    _require_teacher(current_user)
    gig = _get_owned_gig(db, gig_id, current_user)

    _ensure_unique_tier(db, gig.id, payload.tier)

    package = GigPackage(
        gig_id=gig.id,
        tier=payload.tier,
        name=payload.name,
        title=payload.title,
        description=payload.description,
        price=payload.price,
        duration_minutes=payload.duration_minutes,
        sessions_count=payload.sessions_count,
        delivery_days=payload.delivery_days,
        features=payload.features,
    )
    db.add(package)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "A package with this tier already exists for this gig",
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Could not save the package. Please try again.",
        )
    db.refresh(package)
    return package


@router.put("/{gig_id}/packages/{package_id}", response_model=GigPackageOut)
def update_package(
    gig_id: str,
    package_id: str,
    payload: GigPackageUpdate,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Update a package on the authenticated teacher's own gig.

    Ownership is enforced twice: the gig belongs to the caller, and the package
    belongs to that gig. The package can never be moved to another gig, and its
    tier cannot be changed into one already used by a sibling package (409).
    """
    _require_teacher(current_user)
    gig = _get_owned_gig(db, gig_id, current_user)
    package = _get_owned_package(db, gig, package_id)

    if payload.tier is not None and payload.tier != package.tier:
        _ensure_unique_tier(db, gig.id, payload.tier)
        package.tier = payload.tier

    if payload.name is not None:
        package.name = payload.name
    if payload.title is not None:
        package.title = payload.title
    if payload.description is not None:
        package.description = payload.description
    if payload.price is not None:
        package.price = payload.price
    if payload.duration_minutes is not None:
        package.duration_minutes = payload.duration_minutes
    if payload.sessions_count is not None:
        package.sessions_count = payload.sessions_count
    if payload.delivery_days is not None:
        package.delivery_days = payload.delivery_days
    if payload.features is not None:
        package.features = payload.features

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "A package with this tier already exists for this gig",
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Could not update the package. Please try again.",
        )
    db.refresh(package)
    return package


@router.delete("/{gig_id}/packages/{package_id}")
def delete_package(
    gig_id: str,
    package_id: str,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Hard-delete a package on the authenticated teacher's own gig.

    Unlike gigs (which are soft-archived because classrooms reference them),
    packages are a normal hard delete: no booking/order system depends on
    package records yet.
    """
    _require_teacher(current_user)
    gig = _get_owned_gig(db, gig_id, current_user)
    package = _get_owned_package(db, gig, package_id)

    package_id_str = str(package.id)
    db.delete(package)
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Could not delete the package. Please try again.",
        )
    return {"message": "Package deleted successfully", "package_id": package_id_str}