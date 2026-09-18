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


class GigPackageTier(str, enum.Enum):
    """Tier of a gig package.

    Stored as lowercase values following the project's PostgreSQL enum
    convention (UserRole, SessionType, GigStatus, TeachingMode). All three
    tiers of a gig's offer live as rows in `gig_packages`.
    """

    basic = "basic"
    standard = "standard"
    premium = "premium"


class GigPackage(Base):
    """A purchasable plan tier inside a gig.

    A gig has at most one package per tier (basic/standard/premium) — enforced
    by the (gig_id, tier) unique constraint. `features` is JSONB holding a
    list of strings describing what the tier includes.
    """

    __tablename__ = "gig_packages"

    __table_args__ = (
        # Exactly one package per tier per gig.
        UniqueConstraint("gig_id", "tier", name="uq_gig_packages_gig_id_tier"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    gig_id = Column(
        UUID(as_uuid=True),
        ForeignKey("gigs.id", name="fk_gig_packages_gig_id_gigs"),
        nullable=False,
        index=True,
    )

    tier = Column(
        Enum(GigPackageTier),
        nullable=False,
    )
    name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Integer)
    duration_minutes = Column(Integer)
    sessions_count = Column(Integer)
    delivery_days = Column(Integer)
    # List of strings describing what the tier includes.
    features = Column(JSONB)

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

    gig = relationship("Gig", back_populates="packages")