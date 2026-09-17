from fastapi import APIRouter

router = APIRouter()

@router.post("/register")
def register():
    """POST /auth/register — create account (role: student|teacher)."""
    raise NotImplementedError

@router.post("/login")
def login():
    """POST /auth/login — returns JWT access + refresh token."""
    raise NotImplementedError

@router.get("/me")
def get_current_user():
    raise NotImplementedError
