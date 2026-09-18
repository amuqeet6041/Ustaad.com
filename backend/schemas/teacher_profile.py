from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from models.teacher_profile import TeachingMode


class TeacherProfileCreate(BaseModel):
    """Payload for creating the authenticated teacher's own profile.

    user_id is intentionally absent. The identity always comes from the JWT
    (current_user.id) — never from an arbitrary client-supplied id.
    """

    bio: Optional[str] = Field(default=None, max_length=2000)
    education: Optional[str] = Field(default=None, max_length=500)
    languages: Optional[list[str]] = None
    city: Optional[str] = Field(default=None, max_length=100)
    teaching_mode: TeachingMode = TeachingMode.online
    hourly_rate: Optional[int] = Field(default=None, ge=0)


class TeacherProfileUpdate(BaseModel):
    """Payload for updating the authenticated teacher's own profile.

    Only editable content fields are accepted. user_id, id, created_at, and
    updated_at are immutable from the client's perspective.
    """

    bio: Optional[str] = Field(default=None, max_length=2000)
    education: Optional[str] = Field(default=None, max_length=500)
    languages: Optional[list[str]] = None
    city: Optional[str] = Field(default=None, max_length=100)
    teaching_mode: Optional[TeachingMode] = None
    hourly_rate: Optional[int] = Field(default=None, ge=0)


class TeacherProfileOut(BaseModel):
    id: UUID
    user_id: UUID
    bio: Optional[str] = None
    education: Optional[str] = None
    languages: Optional[list[str]] = None
    city: Optional[str] = None
    teaching_mode: TeachingMode
    hourly_rate: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)