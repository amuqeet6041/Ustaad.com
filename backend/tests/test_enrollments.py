"""Safe, non-destructive checks for the Enrollment API.

Run from the backend directory:

    venv\\Scripts\\python.exe -m tests.test_enrollments

Temporary users/gigs/packages/enrollments/classrooms are created in the dev
database and always removed. No token or secret is printed. Existing data is
never touched. No real Google Calendar/Meet calls are made here.
"""

import uuid

from fastapi import HTTPException

import models.classroom  # noqa: F401  (configure mappers)
import models.enrollment  # noqa: F401  (configure mappers)
import models.gig  # noqa: F401  (configure mappers)
import models.gig_package  # noqa: F401  (configure mappers)
import models.session  # noqa: F401  (configure mappers)
import models.teacher_profile  # noqa: F401  (configure mappers)
import models.user  # noqa: F401  (configure mappers)
from api.routes.auth import get_current_user
from api.routes.enrollments import (
    create_enrollment,
    get_enrollment,
    list_my_enrollments,
    list_teacher_enrollments,
)
from api.routes.gig_packages import create_package
from api.routes.gigs import create_gig
from database.session import SessionLocal
from models.classroom import Classroom
from models.enrollment import Enrollment
from models.gig import Gig, GigCategory, GigStatus
from models.gig_package import GigPackage, GigPackageTier
from models.teacher_profile import TeacherProfile
from models.user import User, UserRole
from schemas.enrollment import EnrollmentCreate
from schemas.gig import GigCreate
from schemas.gig_package import GigPackageCreate


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


def _make_published_gig(db, teacher: User, title: str) -> Gig:
    gig = create_gig(
        payload=GigCreate(
            title=title,
            slug=f"enroll-slug-{uuid.uuid4().hex[:12]}",
            category=GigCategory.stem,
            subject="Physics",
            city="Lahore",
            price=5000,
        ),
        current_user=teacher,
        db=db,
    )
    gig.status = GigStatus.approved
    db.commit()
    db.refresh(gig)
    return gig


def _make_draft_gig(db, teacher: User, title: str) -> Gig:
    gig = create_gig(
        payload=GigCreate(
            title=title,
            slug=f"enroll-draft-slug-{uuid.uuid4().hex[:12]}",
            category=GigCategory.stem,
            subject="Physics",
        ),
        current_user=teacher,
        db=db,
    )
    return gig


def _make_package(db, teacher: User, gig: Gig, price: int = 4000) -> GigPackage:
    return create_package(
        gig_id=str(gig.id),
        payload=GigPackageCreate(
            tier=GigPackageTier.basic,
            name="Basic Pack",
            title="One Month",
            description="Mentorship tier.",
            price=price,
            duration_minutes=60,
            sessions_count=4,
            delivery_days=7,
            features=["1:1 sessions", "Notes"],
        ),
        current_user=teacher,
        db=db,
    )


def _create_enrollment(db, student: User, gig: Gig, package: GigPackage | None):
    return create_enrollment(
        payload=EnrollmentCreate(
            gig_id=gig.id,
            package_id=package.id if package else None,
        ),
        current_user=student,
        db=db,
    )


def _cleanup(db, enrollments=(), classrooms=(), packages=(), gigs=(), users=()):
    db.rollback()
    for enrollment in enrollments:
        db.query(Enrollment).filter(Enrollment.id == enrollment.id).delete(
            synchronize_session=False
        )
    for classroom in classrooms:
        db.query(Classroom).filter(Classroom.id == classroom.id).delete(
            synchronize_session=False
        )
    for pkg in packages:
        db.query(GigPackage).filter(GigPackage.id == pkg.id).delete(
            synchronize_session=False
        )
    for gig in gigs:
        db.query(GigPackage).filter(GigPackage.gig_id == gig.id).delete(
            synchronize_session=False
        )
        db.query(Gig).filter(Gig.id == gig.id).delete(synchronize_session=False)
    for user in users:
        db.query(Enrollment).filter(
            (Enrollment.student_id == user.id) | (Enrollment.teacher_id == user.id)
        ).delete(synchronize_session=False)
        db.query(Classroom).filter(
            (Classroom.student_id == user.id) | (Classroom.teacher_id == user.id)
        ).delete(synchronize_session=False)
        db.query(TeacherProfile).filter(TeacherProfile.user_id == user.id).delete(
            synchronize_session=False
        )
        db.query(GigPackage).filter(
            GigPackage.gig_id.in_(
                db.query(Gig.id).filter(Gig.teacher_id == user.id)
            )
        ).delete(synchronize_session=False)
        db.query(Gig).filter(Gig.teacher_id == user.id).delete(
            synchronize_session=False
        )
        db.query(User).filter(User.id == user.id).delete(
            synchronize_session=False
        )
    db.commit()


def test_a_unauthenticated_enrollment_rejected() -> None:
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


def test_b_teacher_cannot_create_enrollment() -> None:
    db = SessionLocal()
    teacher = student = gig = pkg = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "owner-b", f"owner-b-{uuid.uuid4()}@example.com"
        )
        student = _make_user(
            db, UserRole.student, "student-b", f"student-b-{uuid.uuid4()}@example.com"
        )
        gig = _make_published_gig(db, teacher, "Teacher-Blocked-Gig")
        pkg = _make_package(db, teacher, gig)

        try:
            create_enrollment(
                payload=EnrollmentCreate(gig_id=gig.id, package_id=pkg.id),
                current_user=teacher,
                db=db,
            )
        except HTTPException as exc:
            print("B status code:", exc.status_code)
            assert exc.status_code == 403
        else:
            raise AssertionError("expected HTTP 403")
    finally:
        _cleanup(db, packages=((pkg,) if pkg else ()), gigs=(gig,), users=(teacher, student))
        db.close()
    print("PASS Test B\n")


def test_c_successful_enrollment_with_package() -> None:
    db = SessionLocal()
    teacher = student = gig = pkg = result = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "owner-c", f"owner-c-{uuid.uuid4()}@example.com"
        )
        student = _make_user(
            db, UserRole.student, "student-c", f"student-c-{uuid.uuid4()}@example.com"
        )
        gig = _make_published_gig(db, teacher, "Enroll-Me-C")
        pkg = _make_package(db, teacher, gig, price=6500)

        result = _create_enrollment(db, student, gig, pkg)

        print("C student_id:", result.student_id == student.id)
        print("C teacher_id:", result.teacher_id == teacher.id)
        print("C gig_id:", result.gig_id == gig.id)
        print("C package_id:", result.package_id == pkg.id)
        print("C price:", result.price == 6500)
        print("C status:", result.status.value == "confirmed")
        print("C classroom_id set:", result.classroom_id is not None)
        print("C nested gig:", result.gig.title == gig.title)

        assert result.student_id == student.id
        assert result.teacher_id == teacher.id
        assert result.gig_id == gig.id
        assert result.package_id == pkg.id
        assert result.price == 6500
        assert result.status.value == "confirmed"
        assert result.classroom_id is not None
        assert result.gig is not None and result.gig.title == gig.title
    finally:
        classrooms = (
            (db.query(Classroom).filter(Classroom.gig_id == gig.id).all(),)
            if gig
            else ()
        )
        rooms = classrooms[0] if classrooms else []
        _cleanup(
            db,
            enrollments=((result,) if result else ()),
            classrooms=tuple(rooms),
            packages=((pkg,) if pkg else ()),
            gigs=((gig,) if gig else ()),
            users=(teacher, student),
        )
        db.close()
    print("PASS Test C\n")


def test_d_classroom_created_and_linked() -> None:
    db = SessionLocal()
    teacher = student = gig = pkg = result = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "owner-d", f"owner-d-{uuid.uuid4()}@example.com"
        )
        student = _make_user(
            db, UserRole.student, "student-d", f"student-d-{uuid.uuid4()}@example.com"
        )
        gig = _make_published_gig(db, teacher, "Classroom-Probe-D")
        pkg = _make_package(db, teacher, gig)

        result = _create_enrollment(db, student, gig, pkg)

        classroom = (
            db.query(Classroom).filter(Classroom.id == result.classroom_id).first()
        )
        print("D classroom exists:", classroom is not None)
        print("D classroom student:", classroom.student_id == student.id)
        print("D classroom teacher:", classroom.teacher_id == teacher.id)
        print("D classroom gig:", classroom.gig_id == gig.id)
        print("D classroom active:", classroom.status.value == "active")
        print("D title from gig:", teacher.full_name in classroom.title)
        print("D title contains gig:", gig.title in classroom.title)

        assert classroom is not None
        assert classroom.student_id == student.id
        assert classroom.teacher_id == teacher.id
        assert classroom.gig_id == gig.id
        assert classroom.status.value == "active"
        assert teacher.full_name in classroom.title
        assert gig.title in classroom.title
    finally:
        classrooms = (db.query(Classroom).filter(Classroom.gig_id == gig.id).all(),)
        _cleanup(
            db,
            enrollments=((result,) if result else ()),
            classrooms=tuple(classrooms[0]),
            packages=((pkg,) if pkg else ()),
            gigs=((gig,) if gig else ()),
            users=(teacher, student),
        )
        db.close()
    print("PASS Test D\n")


def test_e_enroll_without_package_uses_gig_price() -> None:
    db = SessionLocal()
    teacher = student = gig = result = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "owner-e", f"owner-e-{uuid.uuid4()}@example.com"
        )
        student = _make_user(
            db, UserRole.student, "student-e", f"student-e-{uuid.uuid4()}@example.com"
        )
        gig = _make_published_gig(db, teacher, "No-Package-Gig-E")

        result = _create_enrollment(db, student, gig, None)

        print("E package_id null:", result.package_id is None)
        print("E price from gig:", result.price == 5000)
        print("E classroom created:", result.classroom_id is not None)

        assert result.package_id is None
        assert result.price == 5000
        assert result.classroom_id is not None
    finally:
        classrooms = (db.query(Classroom).filter(Classroom.gig_id == gig.id).all(),)
        _cleanup(
            db,
            enrollments=((result,) if result else ()),
            classrooms=tuple(classrooms[0]),
            gigs=((gig,) if gig else ()),
            users=(teacher, student),
        )
        db.close()
    print("PASS Test E\n")


def test_f_nonexistent_gig_rejected() -> None:
    db = SessionLocal()
    student = None
    try:
        student = _make_user(
            db, UserRole.student, "student-f", f"student-f-{uuid.uuid4()}@example.com"
        )
        try:
            create_enrollment(
                payload=EnrollmentCreate(gig_id=uuid.uuid4()),
                current_user=student,
                db=db,
            )
        except HTTPException as exc:
            print("F status code:", exc.status_code)
            assert exc.status_code == 404
        else:
            raise AssertionError("expected HTTP 404")
    finally:
        _cleanup(db, users=((student,) if student else ()))
        db.close()
    print("PASS Test F\n")


def test_g_nonexistent_package_rejected() -> None:
    db = SessionLocal()
    teacher = student = gig = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "owner-g", f"owner-g-{uuid.uuid4()}@example.com"
        )
        student = _make_user(
            db, UserRole.student, "student-g", f"student-g-{uuid.uuid4()}@example.com"
        )
        gig = _make_published_gig(db, teacher, "Missing-Package-Gig-G")

        try:
            create_enrollment(
                payload=EnrollmentCreate(gig_id=gig.id, package_id=uuid.uuid4()),
                current_user=student,
                db=db,
            )
        except HTTPException as exc:
            print("G status code:", exc.status_code)
            assert exc.status_code == 404
        else:
            raise AssertionError("expected HTTP 404")
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=(teacher, student))
        db.close()
    print("PASS Test G\n")


def test_h_package_from_another_gig_rejected() -> None:
    db = SessionLocal()
    teacher = student = gig_a = gig_b = pkg_b = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "owner-h", f"owner-h-{uuid.uuid4()}@example.com"
        )
        student = _make_user(
            db, UserRole.student, "student-h", f"student-h-{uuid.uuid4()}@example.com"
        )
        gig_a = _make_published_gig(db, teacher, "Package-Gig-A-H")
        gig_b = _make_published_gig(db, teacher, "Package-Gig-B-H")
        pkg_b = _make_package(db, teacher, gig_b)

        try:
            create_enrollment(
                payload=EnrollmentCreate(gig_id=gig_a.id, package_id=pkg_b.id),
                current_user=student,
                db=db,
            )
        except HTTPException as exc:
            print("H status code:", exc.status_code)
            assert exc.status_code == 404
        else:
            raise AssertionError("expected HTTP 404 for cross-gig package")
    finally:
        _cleanup(
            db,
            packages=((pkg_b,) if pkg_b else ()),
            gigs=(gig_a, gig_b),
            users=(teacher, student),
        )
        db.close()
    print("PASS Test H\n")


def test_i_unpublished_gig_rejected() -> None:
    db = SessionLocal()
    teacher = student = gig = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "owner-i", f"owner-i-{uuid.uuid4()}@example.com"
        )
        student = _make_user(
            db, UserRole.student, "student-i", f"student-i-{uuid.uuid4()}@example.com"
        )
        gig = _make_draft_gig(db, teacher, "Draft-Gig-I")

        try:
            create_enrollment(
                payload=EnrollmentCreate(gig_id=gig.id),
                current_user=student,
                db=db,
            )
        except HTTPException as exc:
            print("I status code:", exc.status_code)
            assert exc.status_code == 404
        else:
            raise AssertionError("expected HTTP 404 for unpublished gig")
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=(teacher, student))
        db.close()
    print("PASS Test I\n")


def test_j_duplicate_active_enrollment_conflict() -> None:
    db = SessionLocal()
    teacher = student = gig = pkg = result = other = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "owner-j", f"owner-j-{uuid.uuid4()}@example.com"
        )
        student = _make_user(
            db, UserRole.student, "student-j", f"student-j-{uuid.uuid4()}@example.com"
        )
        gig = _make_published_gig(db, teacher, "Dup-Enroll-Gig-J")
        pkg = _make_package(db, teacher, gig)

        result = _create_enrollment(db, student, gig, pkg)

        try:
            _create_enrollment(db, student, gig, pkg)
        except HTTPException as exc:
            print("J status code:", exc.status_code)
            assert exc.status_code == 409
        else:
            raise AssertionError("expected HTTP 409")

        classroom_count = (
            db.query(Classroom)
            .filter(
                Classroom.student_id == student.id,
                Classroom.gig_id == gig.id,
            )
            .count()
        )
        enrollment_count = (
            db.query(Enrollment)
            .filter(
                Enrollment.student_id == student.id,
                Enrollment.gig_id == gig.id,
            )
            .count()
        )
        print("J only one classroom:", classroom_count == 1)
        print("J only one enrollment:", enrollment_count == 1)
        assert classroom_count == 1
        assert enrollment_count == 1
    finally:
        classrooms = (db.query(Classroom).filter(Classroom.gig_id == gig.id).all(),)
        _cleanup(
            db,
            enrollments=((result,) if result else ()),
            classrooms=tuple(classrooms[0]),
            packages=((pkg,) if pkg else ()),
            gigs=((gig,) if gig else ()),
            users=(teacher, student),
        )
        db.close()
    print("PASS Test J\n")


def test_k_different_package_same_gig_allowed() -> None:
    db = SessionLocal()
    teacher = student = gig = None
    pkgs = []
    results = []
    try:
        teacher = _make_user(
            db, UserRole.teacher, "owner-k", f"owner-k-{uuid.uuid4()}@example.com"
        )
        student = _make_user(
            db, UserRole.student, "student-k", f"student-k-{uuid.uuid4()}@example.com"
        )
        gig = _make_published_gig(db, teacher, "Multi-Package-Gig-K")
        pkgs.append(_make_package(db, teacher, gig, price=4000))
        pkgs.append(
            create_package(
                gig_id=str(gig.id),
                payload=GigPackageCreate(
                    tier=GigPackageTier.premium,
                    name="Premium Pack",
                    title="Two Months",
                    description="Mentorship tier.",
                    price=9000,
                    duration_minutes=90,
                    sessions_count=8,
                    delivery_days=14,
                    features=["Everything included"],
                ),
                current_user=teacher,
                db=db,
            )
        )

        results.append(_create_enrollment(db, student, gig, pkgs[0]))
        results.append(_create_enrollment(db, student, gig, pkgs[1]))

        print("K two enrollments:", len(results) == 2)
        print("K distinct packages:", results[0].package_id != results[1].package_id)
        print("K two classrooms:", results[0].classroom_id != results[1].classroom_id)

        assert len(results) == 2
        assert results[0].package_id != results[1].package_id
        assert results[0].classroom_id != results[1].classroom_id
    finally:
        classrooms = (db.query(Classroom).filter(Classroom.gig_id == gig.id).all(),)
        _cleanup(
            db,
            enrollments=tuple(results),
            classrooms=tuple(classrooms[0]),
            packages=tuple(pkgs),
            gigs=((gig,) if gig else ()),
            users=(teacher, student),
        )
        db.close()
    print("PASS Test K\n")


def test_l_student_a_cannot_see_student_b_enrollment() -> None:
    db = SessionLocal()
    teacher = student_a = student_b = gig = pkg = result_a = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "owner-l", f"owner-l-{uuid.uuid4()}@example.com"
        )
        student_a = _make_user(
            db, UserRole.student, "student-a-l", f"student-a-l-{uuid.uuid4()}@example.com"
        )
        student_b = _make_user(
            db, UserRole.student, "student-b-l", f"student-b-l-{uuid.uuid4()}@example.com"
        )
        gig = _make_published_gig(db, teacher, "Isolation-Gig-L")
        pkg = _make_package(db, teacher, gig)

        result_a = _create_enrollment(db, student_a, gig, pkg)

        try:
            get_enrollment(
                enrollment_id=str(result_a.id),
                current_user=student_b,
                db=db,
            )
        except HTTPException as exc:
            print("L status code:", exc.status_code)
            assert exc.status_code == 403
        else:
            raise AssertionError("expected HTTP 403")

        mine_b = list_my_enrollments(current_user=student_b, db=db)
        mine_a = list_my_enrollments(current_user=student_a, db=db)
        print("L B sees nothing:", len(mine_b) == 0)
        print("L A sees own:", len(mine_a) == 1 and mine_a[0].id == result_a.id)

        assert len(mine_b) == 0
        assert len(mine_a) == 1 and mine_a[0].id == result_a.id
    finally:
        classrooms = (db.query(Classroom).filter(Classroom.gig_id == gig.id).all(),)
        _cleanup(
            db,
            enrollments=((result_a,) if result_a else ()),
            classrooms=tuple(classrooms[0]),
            packages=((pkg,) if pkg else ()),
            gigs=((gig,) if gig else ()),
            users=(teacher, student_a, student_b),
        )
        db.close()
    print("PASS Test L\n")


def test_m_enrollment_getter_participant_only() -> None:
    db = SessionLocal()
    teacher = student = outside = gig = pkg = result = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "owner-m", f"owner-m-{uuid.uuid4()}@example.com"
        )
        student = _make_user(
            db, UserRole.student, "student-m", f"student-m-{uuid.uuid4()}@example.com"
        )
        outside = _make_user(
            db, UserRole.student, "outsider-m", f"outsider-m-{uuid.uuid4()}@example.com"
        )
        gig = _make_published_gig(db, teacher, "Getter-Gig-M")
        pkg = _make_package(db, teacher, gig)

        result = _create_enrollment(db, student, gig, pkg)

        seen_by_student = get_enrollment(
            enrollment_id=str(result.id), current_user=student, db=db
        )
        seen_by_teacher = get_enrollment(
            enrollment_id=str(result.id), current_user=teacher, db=db
        )
        print("M student reads own:", seen_by_student.id == result.id)
        print("M teacher reads own:", seen_by_teacher.id == result.id)

        assert seen_by_student.id == result.id
        assert seen_by_teacher.id == result.id
    finally:
        classrooms = (db.query(Classroom).filter(Classroom.gig_id == gig.id).all(),)
        _cleanup(
            db,
            enrollments=((result,) if result else ()),
            classrooms=tuple(classrooms[0]),
            packages=((pkg,) if pkg else ()),
            gigs=((gig,) if gig else ()),
            users=(teacher, student, outside),
        )
        db.close()
    print("PASS Test M\n")


def test_n_teacher_listing_scoped_and_role_checked() -> None:
    db = SessionLocal()
    teacher = other_teacher = student = gig = pkg = result = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "owner-n", f"owner-n-{uuid.uuid4()}@example.com"
        )
        other_teacher = _make_user(
            db, UserRole.teacher, "owner2-n", f"owner2-n-{uuid.uuid4()}@example.com"
        )
        student = _make_user(
            db, UserRole.student, "student-n", f"student-n-{uuid.uuid4()}@example.com"
        )
        gig = _make_published_gig(db, teacher, "Teacher-List-N")
        pkg = _make_package(db, teacher, gig)

        result = _create_enrollment(db, student, gig, pkg)

        mine = list_teacher_enrollments(current_user=teacher, db=db)
        others = list_teacher_enrollments(current_user=other_teacher, db=db)
        print("N owner sees 1:", len(mine) == 1 and mine[0].id == result.id)
        print("N other teacher sees 0:", len(others) == 0)

        assert len(mine) == 1 and mine[0].id == result.id
        assert len(others) == 0

        try:
            list_teacher_enrollments(current_user=student, db=db)
        except HTTPException as exc:
            print("N student blocked:", exc.status_code)
            assert exc.status_code == 403
        else:
            raise AssertionError("expected HTTP 403 for student")
    finally:
        classrooms = (db.query(Classroom).filter(Classroom.gig_id == gig.id).all(),)
        _cleanup(
            db,
            enrollments=((result,) if result else ()),
            classrooms=tuple(classrooms[0]),
            packages=((pkg,) if pkg else ()),
            gigs=((gig,) if gig else ()),
            users=(teacher, other_teacher, student),
        )
        db.close()
    print("PASS Test N\n")


def main() -> None:
    test_a_unauthenticated_enrollment_rejected()
    test_b_teacher_cannot_create_enrollment()
    test_c_successful_enrollment_with_package()
    test_d_classroom_created_and_linked()
    test_e_enroll_without_package_uses_gig_price()
    test_f_nonexistent_gig_rejected()
    test_g_nonexistent_package_rejected()
    test_h_package_from_another_gig_rejected()
    test_i_unpublished_gig_rejected()
    test_j_duplicate_active_enrollment_conflict()
    test_k_different_package_same_gig_allowed()
    test_l_student_a_cannot_see_student_b_enrollment()
    test_m_enrollment_getter_participant_only()
    test_n_teacher_listing_scoped_and_role_checked()
    print("ALL ENROLLMENT CHECKS PASSED")


if __name__ == "__main__":
    main()