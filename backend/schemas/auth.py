from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from models.user import UserRole

EMAIL_PATTERN = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"


class StudentRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=EMAIL_PATTERN, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    phone: Optional[str] = Field(default=None, max_length=20)


class TeacherRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=EMAIL_PATTERN, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    phone: Optional[str] = Field(default=None, max_length=20)


class LoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN, max_length=255)
    password: str = Field(..., min_length=1)


class UserOut(BaseModel):
    id: UUID
    full_name: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    phone_verified: Optional[bool] = None
    email_verified: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class CurrentUserResponse(UserOut):
    pass