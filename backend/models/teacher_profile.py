import enum
import uuid

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from database.base import Base


class TeachingMode(str, enum.Enum):
    """Marketplace delivery mode for a teacher's learning programs.

    Stored as lowercase snake_case values, consistent with UserRole,
    SessionType, and GigStatus. The frontend uses these same concepts
    ("Online"/"In-Person"/"Both") but translates them at the UI layer.
    """

    online = "online"
    in_person = "in_person"
    both = "both"


class TeacherProfile(Base):
    """Marketplace-specific teacher information, kept out of the `users`
    authentication/identity table.

    One-to-one with users.id: a User row with role="teacher" may own at most
    one profile. Identity fields (name, email, role) stay on `users`; all
    marketplace content lives here.
    """

    __tablename__ = "teacher_profiles"

    __table_args__ = (
        # Each teacher maps to exactly one marketplace profile.
        UniqueConstraint("user_id", name="uq_teacher_profiles_user_id"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_teacher_profiles_user_id_users"),
        nullable=False,
        index=True,
    )

    bio = Column(Text)
    education = Column(String)
    languages = Column(JSONB)
    city = Column(String)
    teaching_mode = Column(
        Enum(TeachingMode),
        nullable=False,
        default=TeachingMode.online,
        server_default=TeachingMode.online.value,
    )
    hourly_rate = Column(Integer)

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

    # Child-side relationship only — User model is intentionally untouched.
    user = relationship("User")