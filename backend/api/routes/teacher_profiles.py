from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session as DbSession

from api.routes.auth import get_current_user
from database.session import get_db
from models.teacher_profile import TeacherProfile
from models.user import User, UserRole
from schemas.teacher_profile import (
    TeacherProfileCreate,
    TeacherProfileOut,
    TeacherProfileUpdate,
)

router = APIRouter()


def _require_teacher(current_user: User) -> None:
    if current_user.role != UserRole.teacher:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only teachers can manage teacher profiles",
        )


def _get_own_profile(db: DbSession, current_user: User) -> TeacherProfile:
    """Return the authenticated teacher's own profile or 404.

    Identity always comes from the JWT; there is no way to reach another
    teacher's profile through these `/me` endpoints.
    """
    profile = (
        db.query(TeacherProfile)
        .filter(TeacherProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Teacher profile not found")
    return profile


@router.get("/me", response_model=TeacherProfileOut)
def get_my_teacher_profile(
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Return the authenticated teacher's marketplace profile.

    Missing profiles return 404 rather than fabricating empty data.
    """
    _require_teacher(current_user)
    return _get_own_profile(db, current_user)


@router.post(
    "/me",
    response_model=TeacherProfileOut,
    status_code=status.HTTP_201_CREATED,
)
def create_my_teacher_profile(
    payload: TeacherProfileCreate,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Create the authenticated teacher's marketplace profile.

    user_id is derived exclusively from the JWT. Duplicate creation returns
    409 rather than silently overwriting the existing profile.
    """
    _require_teacher(current_user)

    existing = (
        db.query(TeacherProfile)
        .filter(TeacherProfile.user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Teacher profile already exists",
        )

    profile = TeacherProfile(
        user_id=current_user.id,
        bio=payload.bio,
        education=payload.education,
        languages=payload.languages,
        city=payload.city,
        teaching_mode=payload.teaching_mode,
        hourly_rate=payload.hourly_rate,
    )
    db.add(profile)
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Could not save the teacher profile. Please try again.",
        )
    db.refresh(profile)
    return profile


@router.put("/me", response_model=TeacherProfileOut)
def update_my_teacher_profile(
    payload: TeacherProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Update the authenticated teacher's own marketplace profile.

    Only editable content fields are applied. user_id, id, created_at, and
    updated_at can never be modified through this endpoint.
    """
    _require_teacher(current_user)
    profile = _get_own_profile(db, current_user)

    if payload.bio is not None:
        profile.bio = payload.bio
    if payload.education is not None:
        profile.education = payload.education
    if payload.languages is not None:
        profile.languages = payload.languages
    if payload.city is not None:
        profile.city = payload.city
    if payload.teaching_mode is not None:
        profile.teaching_mode = payload.teaching_mode
    if payload.hourly_rate is not None:
        profile.hourly_rate = payload.hourly_rate

    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Could not update the teacher profile. Please try again.",
        )
    db.refresh(profile)
    return profile