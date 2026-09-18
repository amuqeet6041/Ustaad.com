from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from models.classroom import ClassroomStatus
from models.enrollment import EnrollmentStatus


class EnrollmentCreate(BaseModel):
    """Payload for a student enrollment.

    student_id, teacher_id, and classroom_id are intentionally absent. The
    authenticated student identity comes from the JWT (get_current_user); the
    teacher is derived server-side from the gig; the classroom is created
    server-side in the same transaction as the enrollment.
    """

    gig_id: UUID
    package_id: Optional[UUID] = None


class EnrollmentGigOut(BaseModel):
    """Safe public gig summary embedded in enrollment responses."""

    id: UUID
    title: str

    model_config = ConfigDict(from_attributes=True)


class EnrollmentClassroomOut(BaseModel):
    """The classroom created together with the enrollment."""

    id: UUID
    title: str
    status: ClassroomStatus

    model_config = ConfigDict(from_attributes=True)


class EnrollmentOut(BaseModel):
    id: UUID
    student_id: UUID
    teacher_id: UUID
    gig_id: UUID
    package_id: Optional[UUID] = None
    price: int
    status: EnrollmentStatus
    classroom_id: Optional[UUID] = None
    gig: Optional[EnrollmentGigOut] = None
    classroom: Optional[EnrollmentClassroomOut] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)