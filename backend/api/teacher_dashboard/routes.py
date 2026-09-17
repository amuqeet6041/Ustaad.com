from fastapi import APIRouter

router = APIRouter()

# See docs: Teacher Dashboard — Complete Specification.

@router.get("/profile")
def get_teacher_profile():
    """GET /teachers/profile — own profile."""
    raise NotImplementedError

@router.put("/profile")
def update_teacher_profile():
    raise NotImplementedError

@router.post("/verification")
def submit_verification_documents():
    """POST /teachers/verification — submit degree/certificate docs for admin review."""
    raise NotImplementedError

@router.get("/analytics")
def get_teacher_analytics():
    """Earnings, proposal conversion, gig views — reads from teacher_analytics rollup table."""
    raise NotImplementedError

@router.get("/students")
def get_teacher_students():
    """Roster derived from active/completed orders."""
    raise NotImplementedError
