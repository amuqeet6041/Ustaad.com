"""Safe, non-destructive checks for services.google_calendar_credentials.

Run from the backend directory:

    venv\\Scripts\\python.exe -m tests.test_google_calendar_credentials

Tests A-C run against the real dev database. Test B and Test D create
temporary credential rows keyed to the existing teacher and always remove
them. No token, ciphertext, or secret is ever printed.
"""

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from google.auth.exceptions import RefreshError
from google.oauth2.credentials import Credentials

import models.google_calendar_credential  # noqa: F401  (configure mappers)
import models.user  # noqa: F401
from database.session import SessionLocal
from models.google_calendar_credential import GoogleCalendarCredential
from models.user import User
from services.credential_crypto import decrypt_secret
from services.google_calendar_credentials import (
    GoogleCalendarNotConnectedError,
    GoogleCalendarReauthorizationRequiredError,
    get_google_calendar_credentials,
)

TEACHER_EMAIL = "teacher.demo@ustaad.com"
CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events"

NEW_ACCESS_TOKEN = "test-refreshed-access-token"
OLD_ACCESS_TOKEN = "test-old-access-token"
OLD_REFRESH_TOKEN = "test-old-refresh-token"


def _teacher_id(db) -> uuid.UUID:
    teacher = db.query(User).filter(User.email == TEACHER_EMAIL).first()
    if teacher is None:
        raise RuntimeError("expected demo teacher is missing")
    return teacher.id


def _make_temp_credential(db, teacher_id, suffix: str) -> GoogleCalendarCredential:
    credential = GoogleCalendarCredential(
        user_id=teacher_id,
        google_account_email=f"__step4_test_{suffix}@example.com",
        scope=CALENDAR_SCOPE,
        access_token=_encrypt(OLD_ACCESS_TOKEN),
        refresh_token=_encrypt(OLD_REFRESH_TOKEN),
        token_expires_at=datetime.now(timezone.utc) - timedelta(hours=1),
        token_uri="https://oauth2.googleapis.com/token",
        is_active=True,
    )
    db.add(credential)
    db.commit()
    db.refresh(credential)
    return credential


def _encrypt(value: str) -> str:
    from services.credential_crypto import encrypt_secret

    return encrypt_secret(value)


def _delete_temp(db, credential) -> None:
    db.rollback()
    db.query(GoogleCalendarCredential).filter(
        GoogleCalendarCredential.id == credential.id
    ).delete()
    db.commit()


def test_a_existing_valid_credential() -> None:
    db = SessionLocal()
    try:
        credentials = get_google_calendar_credentials(db, _teacher_id(db))
        print("A returns Credentials:", isinstance(credentials, Credentials))
        print("A has access token:", credentials.token is not None)
        print("A has refresh token:", credentials.refresh_token is not None)
        print("A credentials.valid:", bool(credentials.valid))
        assert isinstance(credentials, Credentials)
        assert credentials.token is not None
        assert credentials.refresh_token is not None
        assert credentials.valid
    finally:
        db.close()
    print("PASS Test A\n")


def test_b_expired_token_refreshes_and_persists() -> None:
    db = SessionLocal()
    temp = None
    try:
        temp = _make_temp_credential(db, _teacher_id(db), "refresh")
        old_ciphertext = temp.access_token

        def fake_refresh(self, request):
            self.token = NEW_ACCESS_TOKEN
            self.expiry = datetime.now(timezone.utc) + timedelta(hours=1)

        with patch.object(Credentials, "refresh", fake_refresh):
            credentials = get_google_calendar_credentials(db, _teacher_id(db))

        db.expire_all()
        row = (
            db.query(GoogleCalendarCredential)
            .filter(GoogleCalendarCredential.id == temp.id)
            .first()
        )

        print("B returned new access token:", credentials.token == NEW_ACCESS_TOKEN)
        print("B stored ciphertext changed:", row.access_token != old_ciphertext)
        print(
            "B stored access token decrypts to refreshed value:",
            decrypt_secret(row.access_token) == NEW_ACCESS_TOKEN,
        )
        print(
            "B refresh token preserved:",
            decrypt_secret(row.refresh_token) == OLD_REFRESH_TOKEN,
        )
        print("B expiry updated into the future:", row.token_expires_at is not None and row.token_expires_at > datetime.now(timezone.utc))
        print("B expiry timezone-aware:", row.token_expires_at.tzinfo is not None)

        assert credentials.token == NEW_ACCESS_TOKEN
        assert row.access_token != old_ciphertext
        assert decrypt_secret(row.access_token) == NEW_ACCESS_TOKEN
        assert decrypt_secret(row.refresh_token) == OLD_REFRESH_TOKEN
        assert row.token_expires_at > datetime.now(timezone.utc)
        assert row.token_expires_at.tzinfo is not None
    finally:
        if temp is not None:
            _delete_temp(db, temp)
        db.close()
    print("PASS Test B\n")


def test_c_no_active_credential() -> None:
    db = SessionLocal()
    try:
        try:
            get_google_calendar_credentials(db, uuid.uuid4())
        except GoogleCalendarNotConnectedError as exc:
            print("C raised controlled error:", type(exc).__name__)
            print("C safe message:", exc.message)
            assert exc.message == "Google Calendar is not connected."
        else:
            raise AssertionError("expected GoogleCalendarNotConnectedError")
    finally:
        db.close()
    print("PASS Test C\n")


def test_d_invalid_refresh_token_deactivates() -> None:
    db = SessionLocal()
    temp = None
    try:
        temp = _make_temp_credential(db, _teacher_id(db), "revoked")

        def fake_refresh(self, request):
            raise RefreshError(
                "invalid_grant: Token has been expired or revoked.",
                {"error": "invalid_grant"},
            )

        with patch.object(Credentials, "refresh", fake_refresh):
            try:
                get_google_calendar_credentials(db, _teacher_id(db))
            except GoogleCalendarReauthorizationRequiredError as exc:
                print("D raised controlled error:", type(exc).__name__)
                print("D safe message:", exc.message)
                assert (
                    exc.message
                    == "Google Calendar authorization has expired. "
                    "Please reconnect Google Calendar."
                )
            else:
                raise AssertionError("expected GoogleCalendarReauthorizationRequiredError")

        db.expire_all()
        row = (
            db.query(GoogleCalendarCredential)
            .filter(GoogleCalendarCredential.id == temp.id)
            .first()
        )
        print("D credential deactivated:", row.is_active is False)
        assert row.is_active is False
    finally:
        if temp is not None:
            _delete_temp(db, temp)
        db.close()
    print("PASS Test D\n")


def main() -> None:
    test_a_existing_valid_credential()
    test_b_expired_token_refreshes_and_persists()
    test_c_no_active_credential()
    test_d_invalid_refresh_token_deactivates()
    print("ALL CHECKS PASSED")


if __name__ == "__main__":
    main()
