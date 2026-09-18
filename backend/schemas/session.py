from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from models.session import SessionStatus, SessionType


class SessionCreate(BaseModel):
    """Payload for creating a session (teacher endpoint).

    No user/teacher id is present. Ownership MUST be derived server-side from
    the JWT + classroom path parameter — never from a client-supplied id.
    meeting_url and google_event_id are set by the backend integration and are
    not accepted from the client.
    """

    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    scheduled_start: datetime
    scheduled_end: datetime
    session_type: SessionType = SessionType.online


class SessionOut(BaseModel):
    id: UUID
    classroom_id: UUID
    title: str
    description: Optional[str] = None
    scheduled_start: datetime
    scheduled_end: datetime
    session_type: SessionType
    status: SessionStatus
    meeting_url: Optional[str] = None
    google_event_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)