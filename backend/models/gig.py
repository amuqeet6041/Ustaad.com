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


class GigStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    under_review = "under_review"
    approved = "approved"
    active = "active"
    paused = "paused"
    rejected = "rejected"
    archived = "archived"


class GigCategory(str, enum.Enum):
    """Marketplace category for a gig.

    Stored as lowercase snake_case values (matching the existing UserRole /
    SessionType / GigStatus convention). The frontend's display labels
    ("STEM", "Test Prep", "Commerce & Business", ...) are UI-layer
    translations of these stable enum values.
    """

    stem = "stem"
    programming = "programming"
    languages = "languages"
    test_prep = "test_prep"
    commerce_business = "commerce_business"
    arts_humanities = "arts_humanities"


class Gig(Base):
    __tablename__ = "gigs"

    __table_args__ = (
        # A slug uniquely identifies a gig across the whole marketplace.
        UniqueConstraint("slug", name="uq_gigs_slug"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_gigs_teacher_id_users"),
        nullable=False,
        index=True,
    )
    title = Column(String, nullable=False)
    slug = Column(String, index=True)
    category = Column(Enum(GigCategory))
    subject = Column(String)
    city = Column(String)
    price = Column(Integer)
    overview = Column(Text)
    # Structured marketplace content. JSONB stores arbitrary JSON; the
    # schemas layer validates the shape (learning_outcomes: [str], syllabus:
    # [{title, detail}], prerequisites: [str], faqs: [{question, answer}]).
    learning_outcomes = Column(JSONB)
    syllabus = Column(JSONB)
    prerequisites = Column(JSONB)
    faqs = Column(JSONB)
    status = Column(
        Enum(GigStatus),
        nullable=False,
        default=GigStatus.draft,
        server_default=GigStatus.draft.value,
    )
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Purchasable plan tiers for this gig. String reference avoids a circular
    # import with models.gig_package (which references "Gig" by name too).
    packages = relationship(
        "GigPackage",
        back_populates="gig",
        cascade="all, delete-orphan",
    )
    # See full schema in docs §20 — extend with education_level, teaching_mode,
    # pricing_type, description, requirements, etc.