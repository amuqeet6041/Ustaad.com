import logging
import re
import uuid
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import datetime, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from services.google_calendar_credentials import get_google_calendar_credentials

logger = logging.getLogger(__name__)

# Google Calendar API metadata
CALENDAR_API_NAME = "calendar"
CALENDAR_API_VERSION = "v3"
PRIMARY_CALENDAR_ID = "primary"
CONFERENCE_SOLUTION_TYPE = "hangoutsMeet"

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class GoogleCalendarServiceError(Exception):
    """Base class for controlled Google Calendar event service failures.

    Carries a client-safe message only; raw Google API responses and
    credentials are never attached.
    """

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class GoogleCalendarValidationError(GoogleCalendarServiceError):
    """The caller supplied invalid event data; Google was not called."""


class GoogleCalendarMeetUnavailableError(GoogleCalendarServiceError):
    """The Calendar event was created but no Google Meet conference resulted."""


class GoogleCalendarApiError(GoogleCalendarServiceError):
    """The Google Calendar API request failed."""


@dataclass
class GoogleCalendarEventResult:
    """Safe metadata returned to the caller after event creation."""

    event_id: str
    event_link: str | None
    meet_link: str
    start: datetime
    end: datetime


def _validate_timezone(timezone: str) -> str:
    """Validate that the timezone is a known IANA identifier."""
    if not isinstance(timezone, str) or not timezone.strip():
        raise GoogleCalendarValidationError("A timezone is required.")
    tz_name = timezone.strip()
    try:
        ZoneInfo(tz_name)
    except (ZoneInfoNotFoundError, ValueError):
        raise GoogleCalendarValidationError(
            f"Timezone is not a recognized IANA identifier: {tz_name}"
        )
    return tz_name


def _validate_datetime(value: datetime, label: str) -> datetime:
    if not isinstance(value, datetime):
        raise GoogleCalendarValidationError(
            f"{label} must be a datetime."
        )
    if value.tzinfo is None:
        raise GoogleCalendarValidationError(
            f"{label} must be timezone-aware."
        )
    return value


def _validate_title(title: str) -> str:
    if not isinstance(title, str) or not title.strip():
        raise GoogleCalendarValidationError("Event title must not be empty.")
    return title.strip()


def _normalize_attendees(attendees: Sequence[str | Mapping[str, str]] | None) -> list[str]:
    """Normalize and validate attendee emails."""
    if attendees is None:
        return []

    emails: list[str] = []
    for entry in attendees:
        if isinstance(entry, str):
            email = entry
        elif isinstance(entry, Mapping):
            email = entry.get("email", "")
        else:
            raise GoogleCalendarValidationError(
                "Each attendee must be an email address or a mapping with an 'email' key."
            )

        if not isinstance(email, str) or not email.strip():
            raise GoogleCalendarValidationError(
                "Each attendee must have a non-empty email address."
            )
        email = email.strip()
        if not _EMAIL_RE.match(email):
            raise GoogleCalendarValidationError(
                f"Attendee email is invalid: {email}"
            )
        emails.append(email)

    return emails


def _extract_meet_link(event: dict, event_id: str) -> str:
    """Extract the Google Meet video entry point from a created event."""
    entry_points = (
        (event.get("conferenceData") or {}).get("entryPoints") or []
    )
    for entry_point in entry_points:
        if entry_point.get("entryPointType") == "video":
            uri = entry_point.get("uri")
            if uri:
                return uri

    logger.error(
        "Google Calendar event %s was created without a video conference entry point",
        event_id,
    )
    raise GoogleCalendarMeetUnavailableError(
        "Google Meet conference could not be created/retrieved."
    )


def create_google_calendar_event(
    *,
    db,
    user_id: uuid.UUID | str,
    title: str,
    start: datetime,
    end: datetime,
    timezone: str,
    description: str | None = None,
    attendees: Sequence[str | Mapping[str, str]] | None = None,
) -> GoogleCalendarEventResult:
    """Create a Google Calendar event with a Google Meet conference.

    Credentials are obtained exclusively through
    ``get_google_calendar_credentials(db, user_id)``; this service never
    queries the credential table or decrypts tokens itself. Google errors
    are converted to safe controlled errors; no raw responses or credentials
    are returned or logged.
    """
    title = _validate_title(title)
    start = _validate_datetime(start, "Event start time")
    end = _validate_datetime(end, "Event end time")
    timezone = _validate_timezone(timezone)

    if end <= start:
        raise GoogleCalendarValidationError(
            "Event end time must be after the start time."
        )

    attendee_emails = _normalize_attendees(attendees)

    credentials = get_google_calendar_credentials(db, user_id)

    event_body: dict = {
        "summary": title,
        "start": {
            "dateTime": start.isoformat(),
            "timeZone": timezone,
        },
        "end": {
            "dateTime": end.isoformat(),
            "timeZone": timezone,
        },
        "conferenceData": {
            "createRequest": {
                "requestId": str(uuid.uuid4()),
                "conferenceSolutionKey": {
                    "type": CONFERENCE_SOLUTION_TYPE,
                },
            }
        },
    }

    if description is not None:
        event_body["description"] = description

    if attendee_emails:
        event_body["attendees"] = [{"email": email} for email in attendee_emails]

    try:
        calendar_service = build(
            CALENDAR_API_NAME,
            CALENDAR_API_VERSION,
            credentials=credentials,
        )
        event = (
            calendar_service.events()
            .insert(
                calendarId=PRIMARY_CALENDAR_ID,
                body=event_body,
                conferenceDataVersion=1,
                sendUpdates="all",
            )
            .execute()
        )
    except HttpError as exc:
        status = getattr(exc, "resp", None)
        status_code = getattr(status, "status", None)
        logger.error(
            "Google Calendar API event creation failed (status=%s)", status_code
        )
        raise GoogleCalendarApiError(
            "Google Calendar event creation failed. Please try again."
        )
    except Exception:
        logger.exception("Unexpected Google Calendar API event creation failure")
        raise GoogleCalendarApiError(
            "Google Calendar event creation failed. Please try again."
        )

    event_id = event.get("id", "")
    if not event_id:
        raise GoogleCalendarApiError(
            "Google Calendar did not return an event identifier."
        )

    meet_link = _extract_meet_link(event, event_id)

    return GoogleCalendarEventResult(
        event_id=event_id,
        event_link=event.get("htmlLink"),
        meet_link=meet_link,
        start=start,
        end=end,
    )