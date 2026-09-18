import enum
import uuid

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base
from models.user import User


class ClassroomStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class Classroom(Base):
    """An active learning relationship between a student, a teacher, and a
    purchased gig.
    """

    __tablename__ = "classrooms"

    __table_args__ = (
        # A classroom cannot have the same user as both student and teacher.
        CheckConstraint("student_id <> teacher_id", name="ck_classrooms_student_not_teacher"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_classrooms_student_id_users"),
        nullable=False,
        index=True,
    )
    teacher_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_classrooms_teacher_id_users"),
        nullable=False,
        index=True,
    )
    gig_id = Column(
        UUID(as_uuid=True),
        ForeignKey("gigs.id", name="fk_classrooms_gig_id_gigs"),
        nullable=False,
        index=True,
    )

    title = Column(String, nullable=False)

    status = Column(
        Enum(ClassroomStatus),
        nullable=False,
        default=ClassroomStatus.active,
        server_default=ClassroomStatus.active.value,
    )

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

    # Read-only convenience relationships. Both endpoints point at the same
    # `users` table, so foreign_keys must disambiguate the two FKs.
    student = relationship(User, foreign_keys=[student_id], viewonly=True)
    teacher = relationship(User, foreign_keys=[teacher_id], viewonly=True)
    gig = relationship("Gig", viewonly=True)

    # Sessions in this classroom. String reference avoids a circular import
    # with models.session (which references "Classroom" by name too).
    sessions = relationship(
        "Session",
        back_populates="classroom",
        cascade="all, delete-orphan",
    )