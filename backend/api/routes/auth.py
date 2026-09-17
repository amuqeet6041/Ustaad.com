import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database.session import get_db
from models.user import User, UserRole
from schemas.auth import (
    AuthResponse,
    CurrentUserResponse,
    LoginRequest,
    StudentRegisterRequest,
    TeacherRegisterRequest,
)
from services.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)

router = APIRouter()
security = HTTPBearer(auto_error=False)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == normalize_email(email)).first()


def get_user_by_id(db: Session, user_id: str) -> User | None:
    try:
        return db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    except ValueError:
        return None


def issue_token(user: User) -> AuthResponse:
    return AuthResponse(
        access_token=create_access_token(str(user.id), user.role.value),
        token_type="bearer",
        user=user,
    )


def authenticate_user(db: Session, email: str, password: str, role: UserRole) -> User:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    if user.role != role:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            f"This account is registered as {user.role.value}; "
            f"use the {user.role.value} login page.",
        )

    return user


def create_user(
    db: Session,
    full_name: str,
    email: str,
    password: str,
    role: UserRole,
    phone: str | None = None,
) -> User:
    if get_user_by_email(db, email):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "An account with this email already exists",
        )

    user = User(
        full_name=full_name.strip(),
        email=normalize_email(email),
        password_hash=hash_password(password),
        role=role,
        phone=phone.strip() if phone else None,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "An account with this email already exists",
        )
    db.refresh(user)
    return user


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "User no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


@router.post(
    "/register/student",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_student(payload: StudentRegisterRequest, db: Session = Depends(get_db)):
    """Create a student account. Returns a JWT access token on success."""
    user = create_user(
        db,
        full_name=payload.full_name,
        email=payload.email,
        password=payload.password,
        role=UserRole.student,
        phone=payload.phone,
    )
    return issue_token(user)


@router.post(
    "/register/teacher",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_teacher(payload: TeacherRegisterRequest, db: Session = Depends(get_db)):
    """Create a teacher account. Returns a JWT access token on success."""
    user = create_user(
        db,
        full_name=payload.full_name,
        email=payload.email,
        password=payload.password,
        role=UserRole.teacher,
        phone=payload.phone,
    )
    return issue_token(user)


@router.post("/login/student", response_model=AuthResponse)
def login_student(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a student account and return a JWT access token."""
    user = authenticate_user(
        db,
        payload.email,
        payload.password,
        role=UserRole.student,
    )
    return issue_token(user)


@router.post("/login/teacher", response_model=AuthResponse)
def login_teacher(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a teacher account and return a JWT access token."""
    user = authenticate_user(
        db,
        payload.email,
        payload.password,
        role=UserRole.teacher,
    )
    return issue_token(user)


@router.get("/me", response_model=CurrentUserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's safe public information."""
    return current_user