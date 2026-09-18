from fastapi import APIRouter, Query
from typing import Optional, List
from api.routes.gigs import SAMPLE_GIGS, GigResponse

router = APIRouter()

@router.get("/tutors", response_model=List[GigResponse])
def search_tutors(
    q: Optional[str] = None,
    subject: Optional[str] = None,
    city: Optional[str] = None,
    budget_min: Optional[int] = None,
    budget_max: Optional[int] = None,
    mode: Optional[str] = None,
    verified: Optional[bool] = None,
):
    """
    Search and filter tutor offerings by subject, city, budget, and learning mode.
    """
    results = []
    for gig in SAMPLE_GIGS:
        # Search query matching
        if q:
            term = q.lower()
            if (
                term not in gig["title"].lower()
                and term not in gig["subject"].lower()
                and term not in gig["ustaad_name"].lower()
            ):
                continue

        # Subject match
        if subject and subject.lower() != "all" and subject.lower() not in gig["subject"].lower():
            continue

        # City match
        if city and city.lower() != "all cities":
            if city.lower() == "online only" and gig["teaching_mode"] != "Online":
                continue
            elif city.lower() != "online only" and city.lower() != gig["city"].lower():
                continue

        # Mode match
        if mode and mode.lower() != "all":
            if mode.lower() == "online" and gig["teaching_mode"] == "In-Person":
                continue
            if mode.lower() == "in-person" and gig["teaching_mode"] == "Online":
                continue

        # Budget match
        if budget_min is not None and gig["starting_price"] < budget_min:
            continue
        if budget_max is not None and gig["starting_price"] > budget_max:
            continue

        # Verified match
        if verified is True and not gig["verified"]:
            continue

        results.append(gig)

    return results
