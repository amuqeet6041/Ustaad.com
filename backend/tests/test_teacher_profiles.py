"""Safe, non-destructive checks for the TeacherProfile API.

Run from the backend directory:

    venv\\Scripts\\python.exe -m tests.test_teacher_profiles

Temporary users/profiles are created in the dev database and always removed.
No token, ciphertext, or secret is printed. Existing users/classrooms/sessions
are never touched.
"""

import uuid

from fastapi import HTTPException

import models.teacher_profile  # noqa: F401  (configure mappers)
import models.user  # noqa: F401  (configure mappers)
from api.routes.auth import get_current_user
from api.routes.teacher_profiles import (
    create_my_teacher_profile,
    get_my_teacher_profile,
    update_my_teacher_profile,
)
from database.session import SessionLocal
from models.teacher_profile import TeacherProfile, TeachingMode
from models.user import User, UserRole
from schemas.teacher_profile import TeacherProfileCreate, TeacherProfileUpdate


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


def _cleanup(db, users=()):
    db.rollback()
    for user in users:
        db.query(TeacherProfile).filter(TeacherProfile.user_id == user.id).delete(
            synchronize_session=False
        )
        db.query(User).filter(User.id == user.id).delete(
            synchronize_session=False
        )
    db.commit()


def test_a_unauthenticated_get_me_returns_401() -> None:
    db = SessionLocal()
    try:
        try:
            get_current_user(credentials=None, db=db)
        except HTTPException as exc:
            print("A status code:", exc.status_code)
            assert exc.status_code == 401
        else:
            raise AssertionError("expected HTTP 401")
    finally:
        db.close()
    print("PASS Test A\n")


def test_b_student_cannot_create_profile() -> None:
    db = SessionLocal()
    student = None
    try:
        student = _make_user(
            db, UserRole.student, "student-b", f"student-b-{uuid.uuid4()}@example.com"
        )
        payload = TeacherProfileCreate(bio="I am a student")
        try:
            create_my_teacher_profile(payload=payload, current_user=student, db=db)
        except HTTPException as exc:
            print("B status code:", exc.status_code)
            assert exc.status_code == 403
        else:
            raise AssertionError("expected HTTP 403")
    finally:
        _cleanup(db, users=((student,) if student else ()))
        db.close()
    print("PASS Test B\n")


def test_c_teacher_creates_own_profile() -> None:
    db = SessionLocal()
    teacher = profile = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-c", f"teacher-c-{uuid.uuid4()}@example.com"
        )
        payload = TeacherProfileCreate(
            bio="Physics mentor for A-Level students",
            education="MSc Physics, LUMS",
            languages=["English", "Urdu"],
            city="Lahore",
            teaching_mode=TeachingMode.both,
            hourly_rate=2500,
        )
        profile = create_my_teacher_profile(payload=payload, current_user=teacher, db=db)

        print("C is profile:", isinstance(profile, TeacherProfile))
        print("C user_id from JWT:", profile.user_id == teacher.id)
        print("C bio:", profile.bio == payload.bio)
        print("C languages:", profile.languages == ["English", "Urdu"])
        print("C teaching_mode:", profile.teaching_mode == TeachingMode.both)

        assert isinstance(profile, TeacherProfile)
        assert profile.user_id == teacher.id
        assert profile.bio == payload.bio
        assert profile.education == payload.education
        assert profile.languages == ["English", "Urdu"]
        assert profile.city == "Lahore"
        assert profile.teaching_mode == TeachingMode.both
        assert profile.hourly_rate == 2500
    finally:
        _cleanup(db, users=((teacher,) if teacher else ()))
        db.close()
    print("PASS Test C\n")


def test_d_duplicate_create_returns_409() -> None:
    db = SessionLocal()
    teacher = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-d", f"teacher-d-{uuid.uuid4()}@example.com"
        )
        payload = TeacherProfileCreate(bio="First profile", city="Karachi")
        create_my_teacher_profile(payload=payload, current_user=teacher, db=db)

        try:
            create_my_teacher_profile(payload=payload, current_user=teacher, db=db)
        except HTTPException as exc:
            print("D status code:", exc.status_code)
            assert exc.status_code == 409
        else:
            raise AssertionError("expected HTTP 409")
    finally:
        _cleanup(db, users=((teacher,) if teacher else ()))
        db.close()
    print("PASS Test D\n")


def test_e_teacher_retrieves_own_profile() -> None:
    db = SessionLocal()
    teacher = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-e", f"teacher-e-{uuid.uuid4()}@example.com"
        )
        create_my_teacher_profile(
            payload=TeacherProfileCreate(bio="Bio E", city="Islamabad"),
            current_user=teacher,
            db=db,
        )

        found = get_my_teacher_profile(current_user=teacher, db=db)
        print("E found:", found.user_id == teacher.id)
        print("E bio:", found.bio == "Bio E")
        assert found.user_id == teacher.id
        assert found.bio == "Bio E"
        assert found.city == "Islamabad"
    finally:
        _cleanup(db, users=((teacher,) if teacher else ()))
        db.close()
    print("PASS Test E\n")


def test_f_teacher_updates_own_profile() -> None:
    db = SessionLocal()
    teacher = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-f", f"teacher-f-{uuid.uuid4()}@example.com"
        )
        create_my_teacher_profile(
            payload=TeacherProfileCreate(bio="Before", city="Lahore"),
            current_user=teacher,
            db=db,
        )

        updated = update_my_teacher_profile(
            payload=TeacherProfileUpdate(
                bio="After",
                languages=["English", "Punjabi"],
                hourly_rate=3000,
            ),
            current_user=teacher,
            db=db,
        )
        print("F bio updated:", updated.bio == "After")
        print("F languages updated:", updated.languages == ["English", "Punjabi"])
        print("F rate updated:", updated.hourly_rate == 3000)
        print("F user_id immutable:", updated.user_id == teacher.id)

        assert updated.bio == "After"
        assert updated.languages == ["English", "Punjabi"]
        assert updated.hourly_rate == 3000
        assert updated.user_id == teacher.id
    finally:
        _cleanup(db, users=((teacher,) if teacher else ()))
        db.close()
    print("PASS Test F\n")


def test_g_cannot_access_another_teachers_profile_via_me() -> None:
    """GET /me always resolves current_user.id; teacher B never sees A's."""
    db = SessionLocal()
    teacher_a = teacher_b = None
    try:
        teacher_a = _make_user(
            db, UserRole.teacher, "teacher-a-g", f"teacher-a-g-{uuid.uuid4()}@example.com"
        )
        teacher_b = _make_user(
            db, UserRole.teacher, "teacher-b-g", f"teacher-b-g-{uuid.uuid4()}@example.com"
        )
        create_my_teacher_profile(
            payload=TeacherProfileCreate(bio="Only A should see this", city="Karachi"),
            current_user=teacher_a,
            db=db,
        )

        # B has no profile of its own → 404, never A's data.
        try:
            get_my_teacher_profile(current_user=teacher_b, db=db)
        except HTTPException as exc:
            print("G status code:", exc.status_code)
            assert exc.status_code == 404
        else:
            raise AssertionError("expected HTTP 404")

        # A still reads its own profile.
        found = get_my_teacher_profile(current_user=teacher_a, db=db)
        print("G A bio intact:", found.bio == "Only A should see this")
        assert found.bio == "Only A should see this"
    finally:
        _cleanup(db, users=(teacher_a, teacher_b))
        db.close()
    print("PASS Test G\n")


def main() -> None:
    test_a_unauthenticated_get_me_returns_401()
    test_b_student_cannot_create_profile()
    test_c_teacher_creates_own_profile()
    test_d_duplicate_create_returns_409()
    test_e_teacher_retrieves_own_profile()
    test_f_teacher_updates_own_profile()
    test_g_cannot_access_another_teachers_profile_via_me()
    print("ALL CHECKS PASSED")


if __name__ == "__main__":
    main()