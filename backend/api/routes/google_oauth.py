import logging
import os
import secrets
import threading
import time
import uuid
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from google.auth.transport.requests import AuthorizedSession
from google_auth_oauthlib.flow import Flow
from dotenv import load_dotenv
from sqlalchemy.orm import Session

from api.routes.auth import get_current_user
from database.session import get_db
from models.google_calendar_credential import GoogleCalendarCredential
from models.user import User, UserRole
from services.credential_crypto import encrypt_secret

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/google",
    tags=["Google OAuth"],
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events"

# Non-sensitive identity scopes required so the userinfo endpoint can identify
# the authorized Google account. Without these, a calendar.events-only token
# gets HTTP 401 from userinfo. Kept minimal and separate from the Calendar
# scope so the Calendar permission itself is not broadened.
GOOGLE_IDENTITY_SCOPES = (
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
)

GOOGLE_REQUESTED_SCOPES = [
    *GOOGLE_IDENTITY_SCOPES,
    GOOGLE_CALENDAR_SCOPE,
]

# Authenticated Google account identity endpoint. Requires the
# userinfo.email identity scope above (see Google's API quickstarts).
GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo"

# ---------------------------------------------------------------------------
# DEVELOPMENT-ONLY OAuth state store.
#
# Preserves the PKCE code_verifier and the initiating teacher's user_id (tied
# to the OAuth `state`) between /oauth/start and /oauth/callback. Google
# requires the exact code_verifier that produced the `code_challenge` during
# token exchange.
#
# This in-memory dict is NOT production-safe:
#   - it lives only in the current worker's memory, so it is lost on restart
#     (including `--reload` restarts triggered by code changes),
#   - it is not shared across multiple worker processes,
#   - it is not durable, so an abandoned entry simply expires.
# Replace with a shared store (e.g. Redis/database) before production use.
# ---------------------------------------------------------------------------
_OAUTH_STATE_TTL_SECONDS = 10 * 60  # 10 minutes
_oauth_state_store: dict[str, dict] = {}
_oauth_state_lock = threading.Lock()


def _purge_expired_oauth_states(now: float) -> None:
    expired = [
        state
        for state, entry in _oauth_state_store.items()
        if now - entry["created_at"] > _OAUTH_STATE_TTL_SECONDS
    ]
    for state in expired:
        _oauth_state_store.pop(state, None)


def _store_oauth_state(state: str, user_id: str, code_verifier: str) -> None:
    with _oauth_state_lock:
        _purge_expired_oauth_states(time.time())
        _oauth_state_store[state] = {
            "user_id": user_id,
            "code_verifier": code_verifier,
            "created_at": time.time(),
        }


def _consume_oauth_state(state: str) -> dict | None:
    """Returns and removes the stored state entry (single use)."""
    with _oauth_state_lock:
        _purge_expired_oauth_states(time.time())
        return _oauth_state_store.pop(state, None)


def create_google_flow(state: str | None = None) -> Flow:
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise RuntimeError("Google OAuth credentials are not configured.")

    client_config = {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [GOOGLE_REDIRECT_URI],
        }
    }

    flow = Flow.from_client_config(
        client_config,
        scopes=GOOGLE_REQUESTED_SCOPES,
        state=state,
    )

    flow.redirect_uri = GOOGLE_REDIRECT_URI

    return flow


def _get_google_account_email(credentials) -> str | None:
    """Returns the authorized Google account email using the access token.

    Never trusts a frontend-supplied email. The legacy userinfo endpoint is
    compatible with the current calendar.events scope.
    """
    try:
        session = AuthorizedSession(credentials)
        response = session.get(GOOGLE_USERINFO_ENDPOINT)
        if response.status_code != 200:
            logger.error("Google userinfo request failed with status %s", response.status_code)
            return None
        payload = response.json()
        return payload.get("email")
    except Exception as exc:
        logger.error("Failed to fetch Google account identity: %s", exc)
        return None


@router.get("/oauth/start")
async def google_oauth_start(
    current_user: User = Depends(get_current_user),
):
    """
    Starts the Google Calendar OAuth authorization flow.

    Requires an authenticated teacher. The teacher's user_id is bound to the
    generated OAuth `state` server-side (never placed in the Google URL).
    """

    if not GOOGLE_REDIRECT_URI:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_REDIRECT_URI is not configured.",
        )

    if current_user.role != UserRole.teacher:
        raise HTTPException(
            status_code=403,
            detail="Only teachers can connect Google Calendar.",
        )

    state = secrets.token_urlsafe(32)

    flow = create_google_flow(state)

    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )

    # PKCE: the Flow auto-generates a code_verifier (and derives the
    # code_challenge) inside authorization_url(). We must keep that exact
    # verifier for the callback's token exchange.
    if not flow.code_verifier:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate a PKCE code verifier.",
        )

    _store_oauth_state(state, str(current_user.id), flow.code_verifier)

    return RedirectResponse(url=authorization_url)


@router.get("/oauth/callback")
async def google_oauth_callback(
    code: str,
    state: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Google redirects the user here after authorization.

    Verifies and consumes the state, exchanges the code, and stores the
    teacher's encrypted Google credentials.
    """

    if not code:
        raise HTTPException(
            status_code=400,
            detail="Authorization code is missing.",
        )

    if not state:
        raise HTTPException(
            status_code=400,
            detail="OAuth state parameter is missing.",
        )

    entry = _consume_oauth_state(state)

    if entry is None:
        raise HTTPException(
            status_code=400,
            detail="OAuth state does not match an active authorization request.",
        )

    user_id = entry["user_id"]
    code_verifier = entry["code_verifier"]

    flow = create_google_flow(state)
    flow.code_verifier = code_verifier

    try:
        flow.fetch_token(code=code)
    except Exception as exc:
        logger.error("Google OAuth token exchange failed: %s", exc)
        raise HTTPException(
            status_code=400,
            detail="Google OAuth token exchange failed. "
            "Please start the authorization flow again.",
        )

    credentials = flow.credentials

    # The stored OAuth state is bound to a teacher; verify the initiating
    # account still exists and is still a teacher.
    try:
        user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    except ValueError:
        user = None

    if user is None:
        raise HTTPException(
            status_code=400,
            detail="The initiating account no longer exists.",
        )

    if user.role != UserRole.teacher:
        raise HTTPException(
            status_code=403,
            detail="Only teachers can connect Google Calendar.",
        )

    granted_scopes = list(credentials.scopes or [])
    if GOOGLE_CALENDAR_SCOPE not in granted_scopes:
        raise HTTPException(
            status_code=400,
            detail="Google did not authorize the required Calendar scope.",
        )

    email = _get_google_account_email(credentials)
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Could not determine the authorized Google account.",
        )

    access_token = credentials.token
    refresh_token = credentials.refresh_token
    token_expires_at = credentials.expiry  # timezone-aware UTC datetime
    if token_expires_at is not None and token_expires_at.tzinfo is None:
        token_expires_at = token_expires_at.replace(tzinfo=timezone.utc)
    token_uri = credentials.token_uri

    if not access_token:
        raise HTTPException(
            status_code=400,
            detail="Google did not return an access token.",
        )

    existing = (
        db.query(GoogleCalendarCredential)
        .filter(
            GoogleCalendarCredential.user_id == user.id,
            GoogleCalendarCredential.google_account_email == email,
        )
        .first()
    )

    # No refresh token this time: keep a valid existing one, or bail out
    # rather than persisting a record that can never refresh.
    if not refresh_token and existing is None:
        raise HTTPException(
            status_code=400,
            detail="Google did not return a refresh token. Please authorize "
            "again with offline access and consent.",
        )

    try:
        # One active calendar per teacher; preserve multi-account capability.
        db.query(GoogleCalendarCredential).filter(
            GoogleCalendarCredential.user_id == user.id
        ).update({GoogleCalendarCredential.is_active: False})

        if existing is None:
            existing = GoogleCalendarCredential(
                user_id=user.id,
                google_account_email=email,
                scope=" ".join(granted_scopes),
                refresh_token=encrypt_secret(refresh_token),
                access_token=encrypt_secret(access_token),
                token_expires_at=token_expires_at,
                token_uri=token_uri,
                is_active=True,
            )
            db.add(existing)
        else:
            existing.scope = " ".join(granted_scopes)
            if refresh_token:
                existing.refresh_token = encrypt_secret(refresh_token)
            existing.access_token = encrypt_secret(access_token)
            existing.token_expires_at = token_expires_at
            if token_uri:
                existing.token_uri = token_uri
            existing.is_active = True

        db.commit()
    except Exception:
        db.rollback()
        logger.error("Failed to persist Google Calendar credentials")
        raise HTTPException(
            status_code=500,
            detail="Failed to save Google Calendar credentials. Please try again.",
        )

    db.refresh(existing)

    logger.info(
        "Stored Google Calendar credential for user %s (account %s, active=%s)",
        user.id,
        email,
        existing.is_active,
    )

    return {
        "message": "Google Calendar connected successfully.",
        "connected": True,
        "google_account_email": email,
        "scopes": granted_scopes,
    }