import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    func,
    true,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class GoogleCalendarCredential(Base):
    """Secure storage for a user's Google Calendar OAuth credentials.

    The token columns (refresh_token, access_token) contain values encrypted by
    services/credential_crypto.py. The model itself never encrypts or decrypts;
    that happens in the service layer.
    """

    __tablename__ = "google_calendar_credentials"

    __table_args__ = (
        # The same user cannot store the same Google account twice.
        UniqueConstraint(
            "user_id",
            "google_account_email",
            name="uq_google_calendar_credentials_user_account",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_google_calendar_credentials_user_id_users"),
        nullable=False,
        index=True,
    )

    # The Google account email that authorized the application.
    google_account_email = Column(String, nullable=False)

    # Actual granted OAuth scopes, space-separated.
    scope = Column(Text, nullable=False)

    # Encrypted values — never plaintext. Encryption happens in the service layer.
    refresh_token = Column(Text, nullable=False)
    access_token = Column(Text)

    token_expires_at = Column(DateTime(timezone=True))
    token_uri = Column(String)

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        server_default=true(),
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

    # Child-side relationship only — User model is intentionally untouched.
    user = relationship("User")