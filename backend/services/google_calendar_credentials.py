import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv
from google.auth.exceptions import RefreshError
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from sqlalchemy.orm import Session

from models.google_calendar_credential import GoogleCalendarCredential
from services.credential_crypto import decrypt_secret, encrypt_secret

# Load env vars from backend/.env (services/ -> backend/)
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

logger = logging.getLogger(__name__)

DEFAULT_TOKEN_URI = "https://oauth2.googleapis.com/token"

# Refresh the access token when it is missing or expires within this window.
REFRESH_SAFETY_WINDOW = timedelta(minutes=5)


class GoogleCalendarCredentialsError(Exception):
    """Base class for controlled Google Calendar credential failures.

    Carries a client-safe message only; raw Google responses, tokens, and
    ciphertext are never attached.
    """

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class GoogleCalendarNotConnectedError(GoogleCalendarCredentialsError):
    """The teacher has no active Google Calendar credential."""


class GoogleCalendarReauthorizationRequiredError(GoogleCalendarCredentialsError):
    """The stored Google authorization is no longer valid; user must reconnect."""


class GoogleCalendarCredentialsDecryptionError(GoogleCalendarCredentialsError):
    """Stored credentials could not be decrypted."""


class GoogleCalendarRefreshError(GoogleCalendarCredentialsError):
    """Google refused or failed to complete the token refresh."""


class GoogleCalendarCredentialsPersistenceError(GoogleCalendarCredentialsError):
    """Refreshed credentials could not be persisted to the database."""


class GoogleCalendarConfigurationError(GoogleCalendarCredentialsError):
    """Required Google OAuth configuration is missing."""


def _get_client_config() -> tuple[str, str]:
    """Return (client_id, client_secret), failing closed if unconfigured."""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    if not client_id or not client_secret:
        logger.error("Google OAuth client configuration is missing")
        raise GoogleCalendarConfigurationError(
            "Google Calendar integration is not configured."
        )
    return client_id, client_secret


def _load_active_credential(
    db: Session, user_id: uuid.UUID | str
) -> GoogleCalendarCredential:
    """Load the teacher's active credential or raise a safe not-connected error."""
    try:
        resolved_user_id = (
            user_id if isinstance(user_id, uuid.UUID) else uuid.UUID(str(user_id))
        )
    except (ValueError, AttributeError, TypeError):
        raise GoogleCalendarNotConnectedError("Google Calendar is not connected.")

    credential = (
        db.query(GoogleCalendarCredential)
        .filter(
            GoogleCalendarCredential.user_id == resolved_user_id,
            GoogleCalendarCredential.is_active.is_(True),
        )
        .order_by(GoogleCalendarCredential.updated_at.desc())
        .first()
    )

    if credential is None:
        raise GoogleCalendarNotConnectedError("Google Calendar is not connected.")

    return credential


def _decrypt_token(ciphertext: str | None, label: str) -> str | None:
    """Decrypt a stored token, failing closed without exposing ciphertext."""
    if not ciphertext:
        return None
    try:
        return decrypt_secret(ciphertext)
    except (RuntimeError, ValueError):
        logger.error("Failed to decrypt stored Google Calendar %s", label)
        raise GoogleCalendarCredentialsDecryptionError(
            "Stored Google Calendar credentials are invalid. "
            "Please reconnect Google Calendar."
        )


def _to_google_expiry(expiry: datetime | None) -> datetime | None:
    """Convert a stored tz-aware expiry to the naive UTC google-auth expects.

    google-auth compares ``credentials.expiry`` against a naive UTC ``utcnow()``,
    so the Credentials object must carry a naive UTC datetime or ``valid`` /
    ``before_request`` raise a naive-vs-aware comparison error.
    """
    if expiry is None:
        return None
    if expiry.tzinfo is not None:
        expiry = expiry.astimezone(timezone.utc).replace(tzinfo=None)
    return expiry


def _to_db_expiry(expiry: datetime | None) -> datetime | None:
    """Convert a google-auth expiry to a tz-aware UTC datetime for storage."""
    if expiry is None:
        return None
    if expiry.tzinfo is None:
        return expiry.replace(tzinfo=timezone.utc)
    return expiry.astimezone(timezone.utc)


def _build_credentials(
    credential: GoogleCalendarCredential,
    access_token: str | None,
    refresh_token: str | None,
) -> Credentials:
    """Build a google-auth Credentials object from stored values."""
    client_id, client_secret = _get_client_config()
    scopes = (credential.scope or "").split() or None

    return Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri=credential.token_uri or DEFAULT_TOKEN_URI,
        client_id=client_id,
        client_secret=client_secret,
        scopes=scopes,
        expiry=_to_google_expiry(credential.token_expires_at),
    )


def _needs_refresh(credentials: Credentials) -> bool:
    """Refresh when the token is missing, has no expiry, or is near expiry."""
    if not credentials.token:
        return True
    expiry = _to_db_expiry(credentials.expiry)
    if expiry is None:
        return True
    return datetime.now(timezone.utc) + REFRESH_SAFETY_WINDOW >= expiry


def _refresh_error_code(exc: RefreshError) -> str | None:
    """Extract the OAuth error code from a RefreshError without logging it."""
    for arg in getattr(exc, "args", ()) or ():
        if isinstance(arg, dict):
            code = arg.get("error")
            if code:
                return str(code)
        elif isinstance(arg, str):
            code = arg.split(":", 1)[0].strip()
            if code:
                return code
    return None


def _is_invalid_grant(exc: RefreshError) -> bool:
    code = _refresh_error_code(exc)
    if code is not None and code.lower() == "invalid_grant":
        return True
    return "invalid_grant" in str(exc).lower()


def _deactivate_credential(
    db: Session,
    credential: GoogleCalendarCredential,
    user_id: uuid.UUID,
) -> None:
    """Mark a credential inactive after Google rejects the refresh token."""
    try:
        credential.is_active = False
        credential.updated_at = datetime.now(timezone.utc)
        db.commit()
    except Exception:
        db.rollback()
        logger.error(
            "Failed to deactivate revoked Google Calendar credential for user %s",
            user_id,
        )


def _persist_refreshed_credentials(
    db: Session,
    credential: GoogleCalendarCredential,
    credentials: Credentials,
    previous_refresh_token: str | None,
    user_id: uuid.UUID,
) -> None:
    """Encrypt and persist a refreshed access token, rolling back on failure."""
    try:
        credential.access_token = encrypt_secret(credentials.token)
        credential.token_expires_at = _to_db_expiry(credentials.expiry)

        if (
            credentials.refresh_token
            and credentials.refresh_token != previous_refresh_token
        ):
            credential.refresh_token = encrypt_secret(credentials.refresh_token)

        credential.updated_at = datetime.now(timezone.utc)
        db.commit()
    except Exception:
        db.rollback()
        logger.error(
            "Failed to persist refreshed Google Calendar credentials for user %s",
            user_id,
        )
        raise GoogleCalendarCredentialsPersistenceError(
            "Could not save refreshed Google Calendar credentials. Please try again."
        )


def _refresh_credentials(
    db: Session,
    credential: GoogleCalendarCredential,
    credentials: Credentials,
    user_id: uuid.UUID,
) -> None:
    """Refresh the access token in place and persist the result safely."""
    if not credentials.refresh_token:
        logger.error(
            "Google Calendar credential for user %s has no refresh token", user_id
        )
        raise GoogleCalendarReauthorizationRequiredError(
            "Google Calendar authorization has expired. "
            "Please reconnect Google Calendar."
        )

    previous_refresh_token = credentials.refresh_token

    try:
        credentials.refresh(Request())
    except RefreshError as exc:
        if _is_invalid_grant(exc):
            logger.warning(
                "Google Calendar refresh token rejected (invalid_grant) for user %s",
                user_id,
            )
            _deactivate_credential(db, credential, user_id)
            raise GoogleCalendarReauthorizationRequiredError(
                "Google Calendar authorization has expired. "
                "Please reconnect Google Calendar."
            )
        logger.error("Google Calendar token refresh failed for user %s", user_id)
        raise GoogleCalendarRefreshError(
            "Could not refresh Google Calendar access. Please try again."
        )
    except Exception:
        logger.error(
            "Unexpected Google Calendar token refresh failure for user %s", user_id
        )
        raise GoogleCalendarRefreshError(
            "Could not refresh Google Calendar access. Please try again."
        )

    _persist_refreshed_credentials(
        db, credential, credentials, previous_refresh_token, user_id
    )


def get_google_calendar_credentials(
    db: Session, user_id: uuid.UUID | str
) -> Credentials:
    """Return usable Google Calendar credentials for a teacher.

    Finds the teacher's active credential, decrypts the stored tokens, refreshes
    the access token when missing/expired/near expiry, persists the refreshed
    token, and returns a google-auth Credentials object. Tokens are never
    returned as raw strings and never logged.
    """
    credential = _load_active_credential(db, user_id)

    access_token = _decrypt_token(credential.access_token, "access token")
    refresh_token = _decrypt_token(credential.refresh_token, "refresh token")

    credentials = _build_credentials(credential, access_token, refresh_token)

    if not _needs_refresh(credentials):
        return credentials

    _refresh_credentials(db, credential, credentials, credential.user_id)

    return credentials
