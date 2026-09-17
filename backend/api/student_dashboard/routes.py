from fastapi import APIRouter

router = APIRouter()

# See docs: Student Dashboard — Complete Specification.
# Each of these should call into services/student_service.py — keep
# route handlers thin, put business logic in the service layer.

@router.get("/profile")
def get_student_profile():
    """GET /students/profile — own profile."""
    raise NotImplementedError

@router.put("/profile")
def update_student_profile():
    """PUT /students/profile — update own profile."""
    raise NotImplementedError

@router.get("/overview")
def get_student_overview():
    """Dashboard overview cards: active tutors, pending proposals, upcoming sessions."""
    raise NotImplementedError

@router.get("/favorites")
def get_favorites():
    raise NotImplementedError
