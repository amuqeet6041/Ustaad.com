import enum
import uuid

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class SessionType(str, enum.Enum):
    online = "online"
    in_person = "in_person"


class SessionStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"


class Session(Base):
    """A planned or completed learning session inside a classroom.

    meeting_url and google_event_id are storage fields populated by the Google
    Calendar + Google Meet integration when an online session is created. They
    stay null for in-person sessions.
    """

    __tablename__ = "sessions"

    __table_args__ = (
        CheckConstraint(
            "scheduled_end > scheduled_start",
            name="ck_sessions_end_after_start",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    classroom_id = Column(
        UUID(as_uuid=True),
        ForeignKey("classrooms.id", name="fk_sessions_classroom_id_classrooms"),
        nullable=False,
        index=True,
    )

    title = Column(String, nullable=False)
    description = Column(Text)

    scheduled_start = Column(DateTime(timezone=True), nullable=False)
    scheduled_end = Column(DateTime(timezone=True), nullable=False)

    session_type = Column(
        Enum(SessionType),
        nullable=False,
        default=SessionType.online,
        server_default=SessionType.online.value,
    )
    status = Column(
        Enum(SessionStatus),
        nullable=False,
        default=SessionStatus.scheduled,
        server_default=SessionStatus.scheduled.value,
    )

    # Storage only — Google Meet integration writes here.
    meeting_url = Column(Text)

    # Google Calendar event ID associated with an online session. Populated
    # server-side by the Step 6 integration; stays null for in-person sessions.
    # Google event IDs are opaque strings, so this is NOT a UUID column.
    google_event_id = Column(String(1024), nullable=True, index=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    classroom = relationship("Classroom", back_populates="sessions")