from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from models.gig import GigCategory, GigStatus
from models.teacher_profile import TeachingMode
from schemas.gig_package import GigPackageOut

# Slugs are URL-friendly: lowercase letters, digits, and single hyphens.
SLUG_PATTERN = r"^[a-z0-9]+(?:-[a-z0-9]+)*$"


class SyllabusItem(BaseModel):
    """One entry in a gig's structured curriculum breakdown."""

    title: str
    detail: str


class FAQItem(BaseModel):
    """One entry in a gig's FAQ accordion."""

    question: str
    answer: str


class GigTeacherOut(BaseModel):
    """Safe public teacher summary embedded in public gig responses.

    Derived server-side from `users` (identity) plus `teacher_profiles`
    (marketplace fields). Never exposes passwords, tokens, or credentials.
    Profile-only fields are null when the teacher has no profile yet; they are
    not fabricated.
    """

    id: UUID
    name: str
    city: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    languages: Optional[list[str]] = None
    teaching_mode: Optional[TeachingMode] = None
    hourly_rate: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class GigCreate(BaseModel):
    """Payload for creating a gig (teacher endpoint).

    teacher_id and status are intentionally absent. The authenticated
    teacher's identity must come from the JWT (get_current_user) when this
    endpoint is called — never from an arbitrary client-supplied id. The
    initial status is always GigStatus.draft, set server-side.
    """

    title: str = Field(..., min_length=1, max_length=200)
    slug: Optional[str] = Field(default=None, max_length=200, pattern=SLUG_PATTERN)
    category: Optional[GigCategory] = None
    subject: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)
    price: Optional[int] = Field(default=None, ge=0)
    overview: Optional[str] = Field(default=None, max_length=10000)
    learning_outcomes: Optional[list[str]] = None
    syllabus: Optional[list[SyllabusItem]] = None
    prerequisites: Optional[list[str]] = None
    faqs: Optional[list[FAQItem]] = None


class GigUpdate(BaseModel):
    """Payload for updating a gig (owner teacher endpoint).

    Only editable content fields are accepted. id, teacher_id, status,
    created_at, and updated_at are immutable from the client's perspective;
    status changes are reserved for future admin/workflow endpoints.
    """

    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    slug: Optional[str] = Field(default=None, max_length=200, pattern=SLUG_PATTERN)
    category: Optional[GigCategory] = None
    subject: Optional[str] = Field(default=None, max_length=100)
    city: Optional[str] = Field(default=None, max_length=100)
    price: Optional[int] = Field(default=None, ge=0)
    overview: Optional[str] = Field(default=None, max_length=10000)
    learning_outcomes: Optional[list[str]] = None
    syllabus: Optional[list[SyllabusItem]] = None
    prerequisites: Optional[list[str]] = None
    faqs: Optional[list[FAQItem]] = None


class GigOut(BaseModel):
    id: UUID
    teacher_id: UUID
    title: str
    slug: Optional[str] = None
    category: Optional[GigCategory] = None
    subject: Optional[str] = None
    city: Optional[str] = None
    price: Optional[int] = None
    status: GigStatus
    overview: Optional[str] = None
    learning_outcomes: Optional[list[str]] = None
    syllabus: Optional[list[SyllabusItem]] = None
    prerequisites: Optional[list[str]] = None
    faqs: Optional[list[FAQItem]] = None
    teacher: Optional[GigTeacherOut] = None
    packages: list[GigPackageOut] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)