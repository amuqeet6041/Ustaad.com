from fastapi import APIRouter, Query

router = APIRouter()

@router.get("/tutors")
def search_tutors(
    subject: str | None = None,
    city: str | None = None,
    budget_min: int | None = None,
    budget_max: int | None = None,
    mode: str | None = None,
):
    """
    GET /search/tutors — structured filter search.
    See docs §34 for the full query flow: SQL filters -> matching engine -> ranking.
    """
    raise NotImplementedError
