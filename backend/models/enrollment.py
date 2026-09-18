import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base
from models.user import User


class EnrollmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class Enrollment(Base):
    """A student's booking of a published gig, optionally scoped to a package.

    The teacher is NEVER taken from the client — it is derived from the gig the
    student enrolled in (gig.teacher_id). The linked classroom is created in
    the same transaction as the enrollment; enrollment.classroom_id points to
    it so the student's dashboard can jump straight to the classroom.
    """

    __tablename__ = "enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_enrollments_student_id_users"),
        nullable=False,
        index=True,
    )
    teacher_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_enrollments_teacher_id_users"),
        nullable=False,
        index=True,
    )
    gig_id = Column(
        UUID(as_uuid=True),
        ForeignKey("gigs.id", name="fk_enrollments_gig_id_gigs"),
        nullable=False,
        index=True,
    )
    package_id = Column(
        UUID(as_uuid=True),
        ForeignKey("gig_packages.id", name="fk_enrollments_package_id_gig_packages"),
        nullable=True,
        index=True,
    )

    price = Column(Integer, nullable=False)

    status = Column(
        Enum(EnrollmentStatus),
        nullable=False,
        default=EnrollmentStatus.confirmed,
        server_default=EnrollmentStatus.confirmed.value,
    )

    classroom_id = Column(
        UUID(as_uuid=True),
        ForeignKey("classrooms.id", name="fk_enrollments_classroom_id_classrooms"),
        nullable=True,
        index=True,
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

    # Read-only convenience relationships. Since `users` appears in two FKs,
    # foreign_keys must disambiguate student vs teacher.
    student = relationship(User, foreign_keys=[student_id], viewonly=True)
    teacher = relationship(User, foreign_keys=[teacher_id], viewonly=True)
    gig = relationship("Gig", viewonly=True)
    package = relationship("GigPackage", viewonly=True)
    classroom = relationship("Classroom", viewonly=True)