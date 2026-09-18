"""Safe, non-destructive checks for services.google_calendar.

Run from the backend directory:

    venv\\Scripts\\python.exe -m tests.test_google_calendar

The Google Calendar API is fully mocked; the real teacher's Calendar is never
touched. No token, ciphertext, or secret is ever printed.
"""

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import Mock, patch

from google.oauth2.credentials import Credentials
from googleapiclient.errors import HttpError

from services.google_calendar import (
    GoogleCalendarApiError,
    GoogleCalendarMeetUnavailableError,
    GoogleCalendarValidationError,
    GoogleCalendarEventResult,
    create_google_calendar_event,
)
from services.google_calendar_credentials import GoogleCalendarNotConnectedError

TZ = timezone(timedelta(hours=5))
START = datetime(2026, 10, 1, 9, 0, 0, tzinfo=TZ)
END = datetime(2026, 10, 1, 10, 0, 0, tzinfo=TZ)

FAKE_CREDENTIALS = Credentials(token="fake-access-token")


class FakeCalendarService:
    """Minimal fake for the discovery-built calendar client."""

    def __init__(self, response=None, error=None):
        self.response = response
        self.error = error
        self.insert_calls = []

    def events(self):
        return self

    def insert(self, **kwargs):
        self.insert_calls.append(kwargs)
        return self

    def execute(self):
        if self.error is not None:
            raise self.error
        return self.response


def _video_response(event_id: str) -> dict:
    return {
        "id": event_id,
        "htmlLink": f"https://www.google.com/calendar/event?eid={event_id}",
        "conferenceData": {
            "entryPoints": [
                {
                    "entryPointType": "video",
                    "uri": "https://meet.google.com/abc-defg-hij",
                }
            ]
        },
    }


def test_a_valid_event_creation() -> None:
    first = FakeCalendarService(response=_video_response("evt-a1"))
    second = FakeCalendarService(response=_video_response("evt-a2"))

    with patch(
        "services.google_calendar.get_google_calendar_credentials",
        return_value=FAKE_CREDENTIALS,
    ), patch("services.google_calendar.build", side_effect=[first, second]):
        result = create_google_calendar_event(
            db=None,
            user_id=uuid.uuid4(),
            title="Mathematics Class",
            description="Algebra lesson",
            start=START,
            end=END,
            timezone="Asia/Karachi",
            attendees=[{"email": "student@example.com"}],
        )
        create_google_calendar_event(
            db=None,
            user_id=uuid.uuid4(),
            title="Second Class",
            start=START,
            end=END,
            timezone="Asia/Karachi",
            attendees=["student@example.com"],
        )

    print("A returns typed result:", isinstance(result, GoogleCalendarEventResult))
    print("A event_id returned:", result.event_id == "evt-a1")
    print(
        "A event_link returned:",
        result.event_link == "https://www.google.com/calendar/event?eid=evt-a1",
    )
    print(
        "A meet_link returned:",
        result.meet_link == "https://meet.google.com/abc-defg-hij",
    )
    print("A start/end preserved:", result.start == START and result.end == END)

    kwargs = first.insert_calls[0]
    print("A calendarId=primary:", kwargs["calendarId"] == "primary")
    print("A conferenceDataVersion=1:", kwargs["conferenceDataVersion"] == 1)
    print("A sendUpdates=all:", kwargs["sendUpdates"] == "all")
    print("A timezone included:", kwargs["body"]["start"]["timeZone"] == "Asia/Karachi")
    print(
        "A attendees placed:",
        kwargs["body"]["attendees"] == [{"email": "student@example.com"}],
    )
    request_id_a = kwargs["body"]["conferenceData"]["createRequest"]["requestId"]
    request_id_b = second.insert_calls[0]["body"]["conferenceData"]["createRequest"][
        "requestId"
    ]
    print("A requestId present:", bool(request_id_a))
    print("A requestId unique per call:", request_id_a != request_id_b)

    assert isinstance(result, GoogleCalendarEventResult)
    assert result.event_id == "evt-a1"
    assert result.event_link == "https://www.google.com/calendar/event?eid=evt-a1"
    assert result.meet_link == "https://meet.google.com/abc-defg-hij"
    assert result.start == START and result.end == END
    assert kwargs["calendarId"] == "primary"
    assert kwargs["conferenceDataVersion"] == 1
    assert kwargs["sendUpdates"] == "all"
    assert kwargs["body"]["start"]["timeZone"] == "Asia/Karachi"
    assert kwargs["body"]["attendees"] == [{"email": "student@example.com"}]
    assert request_id_a and request_id_a != request_id_b
    print("PASS Test A\n")


def test_b_attendees_handling() -> None:
    fake = FakeCalendarService(response=_video_response("evt-b1"))
    with patch(
        "services.google_calendar.get_google_calendar_credentials",
        return_value=FAKE_CREDENTIALS,
    ), patch("services.google_calendar.build", return_value=fake):
        create_google_calendar_event(
            db=None,
            user_id=uuid.uuid4(),
            title="Attendee Class",
            start=START,
            end=END,
            timezone="Asia/Karachi",
            attendees=["student@example.com", "guardian@example.com"],
        )
    body = fake.insert_calls[0]["body"]
    print(
        "B string attendees placed:",
        body["attendees"]
        == [
            {"email": "student@example.com"},
            {"email": "guardian@example.com"},
        ],
    )
    assert body["attendees"] == [
        {"email": "student@example.com"},
        {"email": "guardian@example.com"},
    ]

    no_attendee_fake = FakeCalendarService(response=_video_response("evt-b2"))
    with patch(
        "services.google_calendar.get_google_calendar_credentials",
        return_value=FAKE_CREDENTIALS,
    ), patch("services.google_calendar.build", return_value=no_attendee_fake):
        create_google_calendar_event(
            db=None,
            user_id=uuid.uuid4(),
            title="No Attendee Class",
            start=START,
            end=END,
            timezone="Asia/Karachi",
        )
    print("B attendees omitted when none supplied:", "attendees" not in no_attendee_fake.insert_calls[0]["body"])
    assert "attendees" not in no_attendee_fake.insert_calls[0]["body"]

    with patch("services.google_calendar.build") as mock_build:
        try:
            create_google_calendar_event(
                db=None,
                user_id=uuid.uuid4(),
                title="Bad Attendee",
                start=START,
                end=END,
                timezone="Asia/Karachi",
                attendees=["not-an-email"],
            )
        except GoogleCalendarValidationError as exc:
            print("B invalid attendee rejected:", exc.message)
        else:
            raise AssertionError("expected GoogleCalendarValidationError")
        print("B Google API not called for invalid attendee:", mock_build.call_count == 0)
        assert mock_build.call_count == 0
    print("PASS Test B\n")


def test_c_start_after_end() -> None:
    try:
        with patch("services.google_calendar.build") as mock_build, patch(
            "services.google_calendar.get_google_calendar_credentials"
        ) as mock_creds:
            create_google_calendar_event(
                db=None,
                user_id=uuid.uuid4(),
                title="Bad Time Class",
                start=END,
                end=START,
                timezone="Asia/Karachi",
            )
    except GoogleCalendarValidationError as exc:
        print("C raised controlled validation error:", type(exc).__name__)
        print("C message:", exc.message)
        print("C Google API not called:", mock_build.call_count == 0)
        print("C credentials service not called:", mock_creds.call_count == 0)
        assert mock_build.call_count == 0
        assert mock_creds.call_count == 0
    else:
        raise AssertionError("expected GoogleCalendarValidationError")
    print("PASS Test C\n")


def test_d_naive_datetime() -> None:
    naive_start = datetime(2026, 10, 1, 9, 0, 0)
    try:
        with patch("services.google_calendar.build") as mock_build, patch(
            "services.google_calendar.get_google_calendar_credentials"
        ) as mock_creds:
            create_google_calendar_event(
                db=None,
                user_id=uuid.uuid4(),
                title="Naive Class",
                start=naive_start,
                end=END,
                timezone="Asia/Karachi",
            )
    except GoogleCalendarValidationError as exc:
        print("D raised controlled validation error:", type(exc).__name__)
        print("D message:", exc.message)
        print("D Google API not called:", mock_build.call_count == 0)
        print("D credentials service not called:", mock_creds.call_count == 0)
        assert mock_build.call_count == 0
        assert mock_creds.call_count == 0
    else:
        raise AssertionError("expected GoogleCalendarValidationError")
    print("PASS Test D\n")


def test_e_missing_meet_conference() -> None:
    response = {
        "id": "evt-e1",
        "htmlLink": "https://www.google.com/calendar/event?eid=evt-e1",
        "conferenceData": {
            "entryPoints": [
                {"entryPointType": "phone", "uri": "tel:+18001234567"}
            ]
        },
    }
    fake = FakeCalendarService(response=response)
    try:
        with patch(
            "services.google_calendar.get_google_calendar_credentials",
            return_value=FAKE_CREDENTIALS,
        ), patch("services.google_calendar.build", return_value=fake):
            create_google_calendar_event(
                db=None,
                user_id=uuid.uuid4(),
                title="No Meet Class",
                start=START,
                end=END,
                timezone="Asia/Karachi",
            )
    except GoogleCalendarMeetUnavailableError as exc:
        print("E raised controlled Meet error:", type(exc).__name__)
        print("E message:", exc.message)
        print("E event was created (insert called):", len(fake.insert_calls) == 1)
        assert exc.message == "Google Meet conference could not be created/retrieved."
        assert len(fake.insert_calls) == 1
    else:
        raise AssertionError("expected GoogleCalendarMeetUnavailableError")
    print("PASS Test E\n")


def test_f_google_api_failure() -> None:
    resp = Mock(status=403)
    http_error = HttpError(
        resp=resp,
        content=b'{"error": {"message": "super-secret-internal-detail"}}',
        uri="https://www.googleapis.com/calendar/v3",
    )
    fake = FakeCalendarService(error=http_error)
    try:
        with patch(
            "services.google_calendar.get_google_calendar_credentials",
            return_value=FAKE_CREDENTIALS,
        ), patch("services.google_calendar.build", return_value=fake):
            create_google_calendar_event(
                db=None,
                user_id=uuid.uuid4(),
                title="Fail Class",
                start=START,
                end=END,
                timezone="Asia/Karachi",
            )
    except GoogleCalendarApiError as exc:
        print("F raised controlled API error:", type(exc).__name__)
        print("F safe message:", exc.message)
        print("F raw Google detail not exposed:", "super-secret-internal-detail" not in exc.message)
        assert "super-secret-internal-detail" not in exc.message
    else:
        raise AssertionError("expected GoogleCalendarApiError")
    print("PASS Test F\n")


def test_g_credential_service_propagation() -> None:
    try:
        with patch("services.google_calendar.build") as mock_build, patch(
            "services.google_calendar.get_google_calendar_credentials",
            side_effect=GoogleCalendarNotConnectedError(
                "Google Calendar is not connected."
            ),
        ):
            create_google_calendar_event(
                db=None,
                user_id=uuid.uuid4(),
                title="No Credentials Class",
                start=START,
                end=END,
                timezone="Asia/Karachi",
            )
    except GoogleCalendarNotConnectedError as exc:
        print("G propagated Step 4 error:", type(exc).__name__)
        print("G message preserved:", exc.message)
        print("G Google API not called:", mock_build.call_count == 0)
        assert exc.message == "Google Calendar is not connected."
        assert mock_build.call_count == 0
    else:
        raise AssertionError("expected GoogleCalendarNotConnectedError to propagate")
    print("PASS Test G\n")


def main() -> None:
    test_a_valid_event_creation()
    test_b_attendees_handling()
    test_c_start_after_end()
    test_d_naive_datetime()
    test_e_missing_meet_conference()
    test_f_google_api_failure()
    test_g_credential_service_propagation()
    print("ALL CHECKS PASSED")


if __name__ == "__main__":
    main()