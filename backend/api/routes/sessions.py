import logging
import uuid
from datetime import datetime
from typing import List
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session as DbSession

from api.routes.auth import get_current_user
from database.session import get_db
from models.classroom import Classroom, ClassroomStatus
from models.session import Session, SessionType
from models.user import User, UserRole
from schemas.session import SessionCreate, SessionOut
from services.google_calendar import (
    GoogleCalendarApiError,
    GoogleCalendarMeetUnavailableError,
    GoogleCalendarValidationError,
    create_google_calendar_event,
)
from services.google_calendar_credentials import (
    GoogleCalendarCredentialsError,
    GoogleCalendarNotConnectedError,
    GoogleCalendarReauthorizationRequiredError,
)

logger = logging.getLogger(__name__)

router = APIRouter()


def _parse_classroom_id(classroom_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(classroom_id)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Classroom not found")


def _validate_session_times(start: datetime, end: datetime) -> None:
    if start.tzinfo is None or end.tzinfo is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "scheduled_start and scheduled_end must be timezone-aware.",
        )
    if end <= start:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "scheduled_end must be after scheduled_start.",
        )


def _resolve_timezone(value: datetime) -> str:
    """Derive an IANA timezone name from the supplied aware datetime.

    Never hardcodes a zone; the contract is that online session times carry a
    recognized IANA timezone (e.g. a zoneinfo.ZoneInfo). Fixed-offset datetimes
    without a named zone are rejected instead of guessing.
    """
    tzinfo = value.tzinfo
    if isinstance(tzinfo, ZoneInfo):
        return tzinfo.key

    name = value.tzname() if tzinfo else None
    if name:
        try:
            ZoneInfo(name)
            return name
        except (ZoneInfoNotFoundError, ValueError, TypeError):
            pass

    raise HTTPException(
        status.HTTP_422_UNPROCESSABLE_ENTITY,
        "scheduled_start must carry a recognized IANA timezone.",
    )


def _create_online_session_artifacts(
    db: DbSession,
    teacher: User,
    classroom: Classroom,
    payload: SessionCreate,
) -> tuple[str | None, str | None]:
    """Create the Google Calendar event + Meet conference for an online session.

    The attendee email is resolved server-side from the classroom student's
    User record and is never accepted from the client. Controlled Google
    errors (Step 4 + Step 5) are translated to safe API errors.
    """
    student = db.query(User).filter(User.id == classroom.student_id).first()
    if not student:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "The classroom student record is missing.",
        )

    timezone = _resolve_timezone(payload.scheduled_start)

    try:
        result = create_google_calendar_event(
            db=db,
            user_id=teacher.id,
            title=payload.title,
            description=payload.description,
            start=payload.scheduled_start,
            end=payload.scheduled_end,
            timezone=timezone,
            attendees=[{"email": student.email}],
        )
    except GoogleCalendarNotConnectedError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, exc.message)
    except GoogleCalendarReauthorizationRequiredError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, exc.message)
    except GoogleCalendarCredentialsError:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "Google Calendar credentials are temporarily unavailable.",
        )
    except GoogleCalendarMeetUnavailableError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, exc.message)
    except GoogleCalendarApiError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, exc.message)
    except GoogleCalendarValidationError as exc:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            exc.message,
        )

    return result.event_id, result.meet_link


@router.get("/classroom/{classroom_id}", response_model=List[SessionOut])
def list_classroom_sessions(
    classroom_id: str,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """List sessions for a classroom the authenticated student belongs to.

    The student identity comes from the JWT (get_current_user) and is never
    supplied by the client. A student can only read sessions for a classroom
    where they are the `student`. Returns sessions ordered by scheduled_start.
    """
    classroom_uuid = _parse_classroom_id(classroom_id)

    classroom = (
        db.query(Classroom).filter(Classroom.id == classroom_uuid).first()
    )
    if not classroom:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Classroom not found")

    if classroom.student_id != current_user.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "You do not have access to this classroom's sessions",
        )

    sessions = (
        db.query(Session)
        .filter(Session.classroom_id == classroom_uuid)
        .order_by(Session.scheduled_start.asc())
        .all()
    )
    return sessions


@router.post(
    "/classroom/{classroom_id}",
    response_model=SessionOut,
    status_code=status.HTTP_201_CREATED,
)
def create_classroom_session(
    classroom_id: str,
    payload: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: DbSession = Depends(get_db),
):
    """Create a session in a classroom the authenticated teacher owns.

    The teacher identity comes exclusively from the JWT. Online sessions call
    the Step 5 Calendar service (credential handling delegated to the Step 4
    service) to create a Google Calendar event with a Google Meet conference;
    google_event_id and meeting_url are then persisted. In-person sessions
    skip Google entirely.
    """
    if current_user.role != UserRole.teacher:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only teachers can create sessions",
        )

    if not payload.title.strip():
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "title must not be empty",
        )

    classroom_uuid = _parse_classroom_id(classroom_id)

    classroom = (
        db.query(Classroom).filter(Classroom.id == classroom_uuid).first()
    )
    if not classroom:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Classroom not found")

    if classroom.teacher_id != current_user.id:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "You do not own this classroom",
        )

    if classroom.status != ClassroomStatus.active:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Classroom is {classroom.status.value} and cannot accept new sessions",
        )

    _validate_session_times(payload.scheduled_start, payload.scheduled_end)

    if payload.session_type == SessionType.online:
        google_event_id, meeting_url = _create_online_session_artifacts(
            db, current_user, classroom, payload
        )
    else:
        google_event_id = None
        meeting_url = None

    session = Session(
        classroom_id=classroom_uuid,
        title=payload.title.strip(),
        description=payload.description,
        scheduled_start=payload.scheduled_start,
        scheduled_end=payload.scheduled_end,
        session_type=payload.session_type,
        google_event_id=google_event_id,
        meeting_url=meeting_url,
    )
    db.add(session)
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        if google_event_id:
            logger.error(
                "Created Google Calendar event %s but failed to persist the "
                "Ustaad session; the Google event requires manual "
                "cleanup/reconciliation.",
                google_event_id,
            )
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Could not save the session. Please try again.",
        )
    db.refresh(session)
    return session