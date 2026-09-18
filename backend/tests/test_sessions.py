"""Safe, non-destructive checks for the Sessions + Google Calendar integration.

Run from the backend directory:

    venv\\Scripts\\python.exe -m tests.test_sessions

The Google Calendar/Meet service call is fully mocked; the real teacher's
Calendar is never touched. Temporary users/classrooms are created in the dev
database and always removed. No token, ciphertext, or secret is printed.
"""

import uuid
from datetime import datetime, timedelta
from unittest.mock import patch
from zoneinfo import ZoneInfo

from fastapi import HTTPException

import models.classroom  # noqa: F401  (configure mappers)
import models.session  # noqa: F401
import models.user  # noqa: F401
import models.gig  # noqa: F401  (configure mappers)
import models.gig_package  # noqa: F401  (configure mappers)
from api.routes.sessions import create_classroom_session, list_classroom_sessions
from database.session import SessionLocal
from models.classroom import Classroom, ClassroomStatus
from models.gig import Gig
from models.session import Session, SessionType
from models.user import User, UserRole
from schemas.session import SessionCreate
from services.google_calendar import GoogleCalendarApiError, GoogleCalendarEventResult

TZ = ZoneInfo("Asia/Karachi")
START = datetime(2026, 12, 1, 9, 0, 0, tzinfo=TZ)
END = datetime(2026, 12, 1, 10, 0, 0, tzinfo=TZ)


def _make_user(db, role: UserRole, tag: str, email: str) -> User:
    user = User(
        full_name=f"Test {tag}",
        email=email,
        password_hash="not-a-real-hash",
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _make_classroom(db, teacher: User, student: User) -> Classroom:
    gig = Gig(teacher_id=teacher.id, title="Test Gig", price=5000)
    db.add(gig)
    db.commit()
    db.refresh(gig)
    classroom = Classroom(
        student_id=student.id,
        teacher_id=teacher.id,
        gig_id=gig.id,
        title="Test Classroom",
        status=ClassroomStatus.active,
    )
    db.add(classroom)
    db.commit()
    db.refresh(classroom)
    return classroom


def _fake_result(event_id: str = "evt-test-1") -> GoogleCalendarEventResult:
    return GoogleCalendarEventResult(
        event_id=event_id,
        event_link=f"https://www.google.com/calendar/event?eid={event_id}",
        meet_link="https://meet.google.com/abc-defg-hij",
        start=START,
        end=END,
    )


def _cleanup(db, classroom=None, users=()):
    db.rollback()
    if classroom is not None:
        db.query(Session).filter(Session.classroom_id == classroom.id).delete(
            synchronize_session=False
        )
        db.query(Classroom).filter(Classroom.id == classroom.id).delete(
            synchronize_session=False
        )
    for user in users:
        db.query(Gig).filter(Gig.teacher_id == user.id).delete(
            synchronize_session=False
        )
        db.query(User).filter(User.id == user.id).delete(
            synchronize_session=False
        )
    db.commit()


def test_a_teacher_creates_online_session() -> None:
    db = SessionLocal()
    teacher = student = classroom = None
    try:
        teacher = _make_user(db, UserRole.teacher, "teacher-a", f"teacher-a-{uuid.uuid4()}@example.com")
        student = _make_user(db, UserRole.student, "student-a", f"student-a-{uuid.uuid4()}@example.com")
        classroom = _make_classroom(db, teacher, student)

        payload = SessionCreate(
            title="Mathematics Class",
            description="Algebra lesson",
            scheduled_start=START,
            scheduled_end=END,
            session_type=SessionType.online,
        )

        with patch(
            "api.routes.sessions.create_google_calendar_event",
            return_value=_fake_result(),
        ) as mock_create:
            session = create_classroom_session(
                classroom_id=str(classroom.id),
                payload=payload,
                current_user=teacher,
                db=db,
            )

        print("A session created:", isinstance(session, Session))
        print("A google_event_id saved:", session.google_event_id == "evt-test-1")
        print(
            "A meeting_url saved:",
            session.meeting_url == "https://meet.google.com/abc-defg-hij",
        )
        print("A correct classroom used:", session.classroom_id == classroom.id)
        print(
            "A service called with teacher id:",
            mock_create.call_args.kwargs["user_id"] == teacher.id,
        )
        print(
            "A student attendee from DB:",
            mock_create.call_args.kwargs["attendees"] == [{"email": student.email}],
        )

        assert isinstance(session, Session)
        assert session.google_event_id == "evt-test-1"
        assert session.meeting_url == "https://meet.google.com/abc-defg-hij"
        assert session.classroom_id == classroom.id
        assert mock_create.call_count == 1
        assert mock_create.call_args.kwargs["user_id"] == teacher.id
        assert mock_create.call_args.kwargs["attendees"] == [{"email": student.email}]
    finally:
        _cleanup(db, classroom, (teacher, student))
        db.close()
    print("PASS Test A\n")


def test_b_student_cannot_create_session() -> None:
    db = SessionLocal()
    teacher = student = classroom = None
    try:
        teacher = _make_user(db, UserRole.teacher, "teacher-b", f"teacher-b-{uuid.uuid4()}@example.com")
        student = _make_user(db, UserRole.student, "student-b", f"student-b-{uuid.uuid4()}@example.com")
        classroom = _make_classroom(db, teacher, student)

        payload = SessionCreate(
            title="Blocked Student Session",
            scheduled_start=START,
            scheduled_end=END,
        )

        with patch(
            "api.routes.sessions.create_google_calendar_event",
            return_value=_fake_result(),
        ) as mock_create:
            try:
                create_classroom_session(
                    classroom_id=str(classroom.id),
                    payload=payload,
                    current_user=student,
                    db=db,
                )
            except HTTPException as exc:
                print("B status code:", exc.status_code)
                assert exc.status_code == 403
            else:
                raise AssertionError("expected HTTP 403")

        print("B Google Calendar not called:", mock_create.call_count == 0)
        assert mock_create.call_count == 0
    finally:
        _cleanup(db, classroom, (teacher, student))
        db.close()
    print("PASS Test B\n")


def test_c_teacher_does_not_own_classroom() -> None:
    db = SessionLocal()
    owner = other = student = classroom = None
    try:
        owner = _make_user(db, UserRole.teacher, "owner-c", f"owner-c-{uuid.uuid4()}@example.com")
        other = _make_user(db, UserRole.teacher, "other-c", f"other-c-{uuid.uuid4()}@example.com")
        student = _make_user(db, UserRole.student, "student-c", f"student-c-{uuid.uuid4()}@example.com")
        classroom = _make_classroom(db, owner, student)

        payload = SessionCreate(
            title="Blocked Non-Owner Session",
            scheduled_start=START,
            scheduled_end=END,
        )

        with patch(
            "api.routes.sessions.create_google_calendar_event",
            return_value=_fake_result(),
        ) as mock_create:
            try:
                create_classroom_session(
                    classroom_id=str(classroom.id),
                    payload=payload,
                    current_user=other,
                    db=db,
                )
            except HTTPException as exc:
                print("C status code:", exc.status_code)
                assert exc.status_code == 403
            else:
                raise AssertionError("expected HTTP 403")

        print("C Google Calendar not called:", mock_create.call_count == 0)
        assert mock_create.call_count == 0
    finally:
        _cleanup(db, classroom, (owner, other, student))
        db.close()
    print("PASS Test C\n")


def test_d_classroom_does_not_exist() -> None:
    db = SessionLocal()
    teacher = None
    try:
        teacher = _make_user(db, UserRole.teacher, "teacher-d", f"teacher-d-{uuid.uuid4()}@example.com")
        payload = SessionCreate(
            title="Missing Classroom",
            scheduled_start=START,
            scheduled_end=END,
        )
        with patch(
            "api.routes.sessions.create_google_calendar_event",
            return_value=_fake_result(),
        ) as mock_create:
            try:
                create_classroom_session(
                    classroom_id=str(uuid.uuid4()),
                    payload=payload,
                    current_user=teacher,
                    db=db,
                )
            except HTTPException as exc:
                print("D status code:", exc.status_code)
                assert exc.status_code == 404
            else:
                raise AssertionError("expected HTTP 404")

        print("D Google Calendar not called:", mock_create.call_count == 0)
        assert mock_create.call_count == 0
    finally:
        _cleanup(db, None, (teacher,))
        db.close()
    print("PASS Test D\n")


def test_e_in_person_session_skips_google() -> None:
    db = SessionLocal()
    teacher = student = classroom = None
    try:
        teacher = _make_user(db, UserRole.teacher, "teacher-e", f"teacher-e-{uuid.uuid4()}@example.com")
        student = _make_user(db, UserRole.student, "student-e", f"student-e-{uuid.uuid4()}@example.com")
        classroom = _make_classroom(db, teacher, student)

        payload = SessionCreate(
            title="In Person Class",
            scheduled_start=START,
            scheduled_end=END,
            session_type=SessionType.in_person,
        )

        with patch(
            "api.routes.sessions.create_google_calendar_event",
            return_value=_fake_result(),
        ) as mock_create:
            session = create_classroom_session(
                classroom_id=str(classroom.id),
                payload=payload,
                current_user=teacher,
                db=db,
            )

        print("E session created:", isinstance(session, Session))
        print("E google_event_id null:", session.google_event_id is None)
        print("E meeting_url null:", session.meeting_url is None)
        print("E Google Calendar not called:", mock_create.call_count == 0)

        assert isinstance(session, Session)
        assert session.google_event_id is None
        assert session.meeting_url is None
        assert mock_create.call_count == 0
    finally:
        _cleanup(db, classroom, (teacher, student))
        db.close()
    print("PASS Test E\n")


def test_f_google_failure_leaves_no_session() -> None:
    db = SessionLocal()
    teacher = student = classroom = None
    try:
        teacher = _make_user(db, UserRole.teacher, "teacher-f", f"teacher-f-{uuid.uuid4()}@example.com")
        student = _make_user(db, UserRole.student, "student-f", f"student-f-{uuid.uuid4()}@example.com")
        classroom = _make_classroom(db, teacher, student)

        payload = SessionCreate(
            title="Google Failure Session",
            scheduled_start=START,
            scheduled_end=END,
        )

        with patch(
            "api.routes.sessions.create_google_calendar_event",
            side_effect=GoogleCalendarApiError(
                "Google Calendar event creation failed. Please try again."
            ),
        ) as mock_create:
            try:
                create_classroom_session(
                    classroom_id=str(classroom.id),
                    payload=payload,
                    current_user=teacher,
                    db=db,
                )
            except HTTPException as exc:
                print("F status code:", exc.status_code)
                print("F safe message:", exc.detail)
                assert exc.status_code == 502
                assert "Google Calendar event creation failed. Please try again." in exc.detail
            else:
                raise AssertionError("expected HTTP 502")

        remaining = (
            db.query(Session)
            .filter(Session.title == "Google Failure Session")
            .count()
        )
        print("F no session persisted:", remaining == 0)
        print("F service called:", mock_create.call_count == 1)
        assert remaining == 0
        assert mock_create.call_count == 1
    finally:
        _cleanup(db, classroom, (teacher, student))
        db.close()
    print("PASS Test F\n")


def test_g_student_email_from_database() -> None:
    db = SessionLocal()
    teacher = student = classroom = None
    try:
        teacher = _make_user(db, UserRole.teacher, "teacher-g", f"teacher-g-{uuid.uuid4()}@example.com")
        student = _make_user(db, UserRole.student, "student-g", f"attendeefromdb-{uuid.uuid4()}@example.com")
        classroom = _make_classroom(db, teacher, student)

        payload = SessionCreate(
            title="Attendee Source Session",
            scheduled_start=START,
            scheduled_end=END,
        )

        with patch(
            "api.routes.sessions.create_google_calendar_event",
            return_value=_fake_result(),
        ) as mock_create:
            create_classroom_session(
                classroom_id=str(classroom.id),
                payload=payload,
                current_user=teacher,
                db=db,
            )

        sent_emails = mock_create.call_args.kwargs["attendees"]
        print("G attendee email from classroom student:", sent_emails == [{"email": student.email}])
        assert sent_emails == [{"email": student.email}]
    finally:
        _cleanup(db, classroom, (teacher, student))
        db.close()
    print("PASS Test G\n")


def test_h_invalid_datetime_range() -> None:
    db = SessionLocal()
    teacher = student = classroom = None
    try:
        teacher = _make_user(db, UserRole.teacher, "teacher-h", f"teacher-h-{uuid.uuid4()}@example.com")
        student = _make_user(db, UserRole.student, "student-h", f"student-h-{uuid.uuid4()}@example.com")
        classroom = _make_classroom(db, teacher, student)

        payload = SessionCreate(
            title="Bad Range",
            scheduled_start=END,
            scheduled_end=START,
        )

        with patch("api.routes.sessions.create_google_calendar_event") as mock_create:
            try:
                create_classroom_session(
                    classroom_id=str(classroom.id),
                    payload=payload,
                    current_user=teacher,
                    db=db,
                )
            except HTTPException as exc:
                print("H status code:", exc.status_code)
                assert exc.status_code == 422
            else:
                raise AssertionError("expected HTTP 422")

        print("H Google Calendar not called:", mock_create.call_count == 0)
        assert mock_create.call_count == 0
    finally:
        _cleanup(db, classroom, (teacher, student))
        db.close()
    print("PASS Test H\n")


def test_i_naive_datetime() -> None:
    db = SessionLocal()
    teacher = student = classroom = None
    try:
        teacher = _make_user(db, UserRole.teacher, "teacher-i", f"teacher-i-{uuid.uuid4()}@example.com")
        student = _make_user(db, UserRole.student, "student-i", f"student-i-{uuid.uuid4()}@example.com")
        classroom = _make_classroom(db, teacher, student)

        naive_start = datetime(2026, 12, 1, 9, 0, 0)
        payload = SessionCreate(
            title="Naive Time",
            scheduled_start=naive_start,
            scheduled_end=END,
        )

        with patch("api.routes.sessions.create_google_calendar_event") as mock_create:
            try:
                create_classroom_session(
                    classroom_id=str(classroom.id),
                    payload=payload,
                    current_user=teacher,
                    db=db,
                )
            except HTTPException as exc:
                print("I status code:", exc.status_code)
                assert exc.status_code == 422
            else:
                raise AssertionError("expected HTTP 422")

        print("I Google Calendar not called:", mock_create.call_count == 0)
        assert mock_create.call_count == 0
    finally:
        _cleanup(db, classroom, (teacher, student))
        db.close()
    print("PASS Test I\n")


def test_j_existing_student_listing_still_works() -> None:
    db = SessionLocal()
    teacher = student = other = classroom = None
    try:
        teacher = _make_user(db, UserRole.teacher, "teacher-j", f"teacher-j-{uuid.uuid4()}@example.com")
        student = _make_user(db, UserRole.student, "student-j", f"student-j-{uuid.uuid4()}@example.com")
        other = _make_user(db, UserRole.student, "other-j", f"other-j-{uuid.uuid4()}@example.com")
        classroom = _make_classroom(db, teacher, student)

        for i in range(2):
            db.add(
                Session(
                    classroom_id=classroom.id,
                    title=f"Listed Session {i}",
                    scheduled_start=START + timedelta(hours=i),
                    scheduled_end=END + timedelta(hours=i),
                    session_type=SessionType.online,
                )
            )
        db.commit()

        sessions = list_classroom_sessions(
            classroom_id=str(classroom.id),
            current_user=student,
            db=db,
        )
        print("J student lists sessions:", len(sessions) == 2)
        assert len(sessions) == 2

        try:
            list_classroom_sessions(
                classroom_id=str(classroom.id),
                current_user=other,
                db=db,
            )
        except HTTPException as exc:
            print("J non-member student blocked:", exc.status_code == 403)
            assert exc.status_code == 403
        else:
            raise AssertionError("expected HTTP 403")
    finally:
        _cleanup(db, classroom, (teacher, student, other))
        db.close()
    print("PASS Test J\n")


def main() -> None:
    test_a_teacher_creates_online_session()
    test_b_student_cannot_create_session()
    test_c_teacher_does_not_own_classroom()
    test_d_classroom_does_not_exist()
    test_e_in_person_session_skips_google()
    test_f_google_failure_leaves_no_session()
    test_g_student_email_from_database()
    test_h_invalid_datetime_range()
    test_i_naive_datetime()
    test_j_existing_student_listing_still_works()
    print("ALL CHECKS PASSED")


if __name__ == "__main__":
    main()