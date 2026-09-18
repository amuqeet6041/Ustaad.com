import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DbSession

from api.routes.auth import get_current_user
from database.session import get_db
from models.classroom import Classroom
from models.user import User, UserRole
from schemas.classroom import ClassroomOut

router = APIRouter()

# Step 7 — student classroom read endpoints.
# The authenticated student is resolved from the JWT (get_current_user) and is
# never trusted from a client-supplied value. The backend enforces ownership:
# the frontend only renders whatever the authenticated request returns.


def _parse_classroom_id(classroom_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(classroom_id)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Classroom not found")


@router.get("", response_model=List[ClassroomOut])
def list_classrooms(
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """List classrooms the authenticated student (or teacher) is part of.

    Ownership comes from the JWT, not from any client input. A student only
    sees classrooms where they are the student; a teacher only sees classrooms
    where they are the teacher.
    """
    if current_user.role == UserRole.student:
        classrooms = (
            db.query(Classroom)
            .filter(Classroom.student_id == current_user.id)
            .order_by(Classroom.created_at.desc())
            .all()
        )
    elif current_user.role == UserRole.teacher:
        classrooms = (
            db.query(Classroom)
            .filter(Classroom.teacher_id == current_user.id)
            .order_by(Classroom.created_at.desc())
            .all()
        )
    else:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only students and teachers can list classrooms",
        )
    return classrooms


@router.post("")
def create_classroom():
    """Create a classroom for the authenticated student + teacher + gig."""
    raise NotImplementedError


@router.get("/{classroom_id}", response_model=ClassroomOut)
def get_classroom(
    classroom_id: str,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Retrieve a single classroom the caller participates in.

    The classroom id comes from the URL path; membership is verified against
    the authenticated JWT. 404 hides unknown ids; 403 blocks non-participants.
    """
    classroom_uuid = _parse_classroom_id(classroom_id)

    classroom = (
        db.query(Classroom).filter(Classroom.id == classroom_uuid).first()
    )
    if not classroom:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Classroom not found")

    is_student = classroom.student_id == current_user.id
    is_teacher = classroom.teacher_id == current_user.id
    if not is_student and not is_teacher:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "You do not have access to this classroom",
        )

    return classroom