from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class GigCreate(BaseModel):
    title: str
    subject_ids: list[UUID]
    city: str
    price: int
    teaching_mode: str  # "online" | "physical" | "both"
    description: Optional[str] = None

class GigOut(BaseModel):
    id: UUID
    title: str
    city: str
    price: int
    status: str

    class Config:
        from_attributes = True
