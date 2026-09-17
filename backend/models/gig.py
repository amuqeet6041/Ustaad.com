import uuid
from sqlalchemy import Column, String, Integer, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database.base import Base
import enum

class GigStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    under_review = "under_review"
    approved = "approved"
    active = "active"
    paused = "paused"
    rejected = "rejected"
    archived = "archived"

class Gig(Base):
    __tablename__ = "gigs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id"), nullable=False)
    title = Column(String, nullable=False)
    city = Column(String)
    price = Column(Integer)
    status = Column(Enum(GigStatus), default=GigStatus.draft)
    # See full schema in docs §20 — extend with education_level, teaching_mode,
    # pricing_type, description, requirements, etc.
