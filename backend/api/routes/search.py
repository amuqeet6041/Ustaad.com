from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session as DbSession

from database.session import get_db
from models.gig import Gig, GigCategory, GigStatus
from schemas.gig import GigOut

router = APIRouter()

# Marketplace-visible statuses for the public search endpoint.
_PUBLIC_STATUSES = [GigStatus.approved, GigStatus.active]


@router.get("/tutors", response_model=list[GigOut])
def search_tutors(
    q: Optional[str] = None,
    city: Optional[str] = None,
    subject: Optional[str] = None,
    category: Optional[GigCategory] = None,
    budget_min: Optional[int] = None,
    budget_max: Optional[int] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    db: DbSession = Depends(get_db),
):
    """Search and filter marketplace-visible gigs.

    Only approved/active gigs are returned. Filters operate on the real
    columns that exist on `gigs` and teacher_profiles-joined columns where
    applicable.

    `min_price`/`max_price` are aliases for the legacy `budget_min`/
    `budget_max`; both spellings are accepted, with the price aliases winning
    when both are provided.

    NOTE — rating, verified, and mode are intentionally NOT supported: they
    require real platform data or would need to be derived across
    teacher_profiles. They are not fabricated here.
    """
    query = db.query(Gig).filter(Gig.status.in_(_PUBLIC_STATUSES))

    if q:
        term = q.strip().lower()
        if term:
            query = query.filter(Gig.title.ilike(f"%{term}%"))

    if city:
        city_term = city.strip().lower()
        if city_term and city_term != "all cities":
            query = query.filter(Gig.city.ilike(f"%{city_term}%"))

    if subject:
        subject_term = subject.strip().lower()
        if subject_term:
            query = query.filter(Gig.subject.ilike(f"%{subject_term}%"))

    if category is not None:
        query = query.filter(Gig.category == category)

    # Prefer the explicit price aliases, falling back to the legacy names.
    lo = min_price if min_price is not None else budget_min
    hi = max_price if max_price is not None else budget_max
    if lo is not None:
        query = query.filter(Gig.price >= lo)
    if hi is not None:
        query = query.filter(Gig.price <= hi)

    return query.order_by(Gig.created_at.desc()).all()