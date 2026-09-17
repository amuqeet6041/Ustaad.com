from fastapi import APIRouter

router = APIRouter()

# See docs: Admin Dashboard — Complete Specification.

@router.get("/overview")
def get_platform_overview():
    """Total students/teachers/gigs/orders — reads from marketplace_analytics rollup table."""
    raise NotImplementedError

@router.get("/verification-queue")
def get_verification_queue():
    """Pending teacher verification submissions awaiting review."""
    raise NotImplementedError

@router.put("/verification/{teacher_id}")
def review_verification(teacher_id: str):
    raise NotImplementedError

@router.get("/users")
def list_users():
    raise NotImplementedError
