from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from models.gig_package import GigPackageTier


class GigPackageCreate(BaseModel):
    """Payload for creating a package on the authenticated teacher's gig.

    id, gig_id, teacher_id, created_at, and updated_at are intentionally
    absent. The gig_id always comes from the URL path and ownership from the
    JWT — never from arbitrary client-supplied values.
    """

    tier: GigPackageTier
    name: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[int] = Field(default=None, ge=0)
    duration_minutes: int = Field(..., ge=1)
    sessions_count: int = Field(..., ge=1)
    delivery_days: int = Field(..., ge=1)
    features: Optional[list[str]] = None


class GigPackageUpdate(BaseModel):
    """Payload for updating a package on the authenticated teacher's own gig.

    Only editable content fields are accepted. id, gig_id, and ownership are
    immutable from the client's perspective. tier may change but must not
    create a duplicate tier for the same gig (checked server-side).
    """

    tier: Optional[GigPackageTier] = None
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[int] = Field(default=None, ge=0)
    duration_minutes: Optional[int] = Field(default=None, ge=1)
    sessions_count: Optional[int] = Field(default=None, ge=1)
    delivery_days: Optional[int] = Field(default=None, ge=1)
    features: Optional[list[str]] = None


class GigPackageOut(BaseModel):
    id: UUID
    gig_id: UUID
    tier: GigPackageTier
    name: str
    title: str
    description: Optional[str] = None
    price: Optional[int] = None
    duration_minutes: Optional[int] = None
    sessions_count: Optional[int] = None
    delivery_days: Optional[int] = None
    features: Optional[list[str]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)