from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from models.classroom import ClassroomStatus


class ClassroomCreate(BaseModel):
    """Payload for creating a classroom.

    NOTE: student_id is intentionally absent. The authenticated student's
    identity MUST come from the JWT (get_current_user) when this endpoint is
    implemented — never from an arbitrary client-supplied id.
    """

    teacher_id: UUID
    gig_id: UUID
    title: str = Field(..., min_length=1, max_length=200)
    status: ClassroomStatus = ClassroomStatus.active


class ClassroomTeacherOut(BaseModel):
    """Safe public teacher info embedded in classroom responses.

    Derived server-side from the classroom's teacher relationship. No avatar or
    contact details — only the identity the Student Dashboard card needs.
    """

    id: UUID
    full_name: str

    model_config = ConfigDict(from_attributes=True)


class ClassroomGigOut(BaseModel):
    """Safe public gig info embedded in classroom responses.

    Derived server-side from the classroom's gig relationship. The Student
    Dashboard card uses this to show which learning program the classroom was
    created for.
    """

    id: UUID
    title: str

    model_config = ConfigDict(from_attributes=True)


class ClassroomOut(BaseModel):
    id: UUID
    student_id: UUID
    teacher_id: UUID
    gig_id: UUID
    title: str
    status: ClassroomStatus
    teacher: ClassroomTeacherOut
    gig: Optional[ClassroomGigOut] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)