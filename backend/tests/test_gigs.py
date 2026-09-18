"""Safe, non-destructive checks for the database-backed Gig API.

Run from the backend directory:

    venv\\Scripts\\python.exe -m tests.test_gigs

Temporary users/gigs are created in the dev database and always removed. No
token, ciphertext, or secret is printed. Existing users/classrooms/sessions
are never touched.
"""

import uuid

from fastapi import HTTPException

import models.classroom  # noqa: F401  (configure mappers)
import models.gig  # noqa: F401  (configure mappers)
import models.session  # noqa: F401  (configure mappers)
import models.teacher_profile  # noqa: F401  (configure mappers)
import models.user  # noqa: F401  (configure mappers)
from api.routes.auth import get_current_user
from api.routes.gigs import archive_gig, create_gig, get_gig, list_gigs, update_gig
from api.routes.search import search_tutors
from database.session import SessionLocal
from models.gig import Gig, GigCategory, GigStatus
from models.teacher_profile import TeacherProfile, TeachingMode
from models.user import User, UserRole
from schemas.gig import FAQItem, GigCreate, GigUpdate, SyllabusItem


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


def _cleanup(db, gigs=(), users=()):
    db.rollback()
    for gig in gigs:
        db.query(Gig).filter(Gig.id == gig.id).delete(
            synchronize_session=False
        )
    for user in users:
        db.query(TeacherProfile).filter(TeacherProfile.user_id == user.id).delete(
            synchronize_session=False
        )
        db.query(Gig).filter(Gig.teacher_id == user.id).delete(
            synchronize_session=False
        )
        db.query(User).filter(User.id == user.id).delete(
            synchronize_session=False
        )
    db.commit()


def test_a_unauthenticated_post_gigs_returns_401() -> None:
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


def test_b_student_cannot_create_gig() -> None:
    db = SessionLocal()
    student = None
    try:
        student = _make_user(
            db, UserRole.student, "student-b", f"student-b-{uuid.uuid4()}@example.com"
        )
        payload = GigCreate(title="Student Gig", city="Karachi", price=1000)
        try:
            create_gig(payload=payload, current_user=student, db=db)
        except HTTPException as exc:
            print("B status code:", exc.status_code)
            assert exc.status_code == 403
        else:
            raise AssertionError("expected HTTP 403")
    finally:
        _cleanup(db, users=((student,) if student else ()))
        db.close()
    print("PASS Test B\n")


def test_c_teacher_creates_gig_as_draft() -> None:
    db = SessionLocal()
    teacher = gig = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-c", f"teacher-c-{uuid.uuid4()}@example.com"
        )
        payload = GigCreate(title="Physics Tutoring", city="Lahore", price=5000)
        gig = create_gig(payload=payload, current_user=teacher, db=db)

        print("C created:", isinstance(gig, Gig))
        print("C teacher_id matches JWT:", gig.teacher_id == teacher.id)
        print("C initial status draft:", gig.status == GigStatus.draft)
        print(
            "C title/city/price:",
            gig.title == "Physics Tutoring"
            and gig.city == "Lahore"
            and gig.price == 5000,
        )

        assert isinstance(gig, Gig)
        assert gig.teacher_id == teacher.id
        assert gig.status == GigStatus.draft
        assert gig.title == "Physics Tutoring"
        assert gig.city == "Lahore"
        assert gig.price == 5000
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=((teacher,) if teacher else ()))
        db.close()
    print("PASS Test C\n")


def test_d_public_listing_only_published() -> None:
    db = SessionLocal()
    teacher = gig_draft = gig_approved = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-d", f"teacher-d-{uuid.uuid4()}@example.com"
        )
        gig_draft = create_gig(
            payload=GigCreate(title="Draft Gig", city="Karachi", price=1000),
            current_user=teacher,
            db=db,
        )
        gig_approved = create_gig(
            payload=GigCreate(title="Approved Gig", city="Lahore", price=2000),
            current_user=teacher,
            db=db,
        )

        gig_approved.status = GigStatus.approved
        db.commit()
        db.refresh(gig_approved)

        visible = list_gigs(db=db)
        visible_ids = {g.id for g in visible}
        print("D approved visible:", gig_approved.id in visible_ids)
        print("D draft hidden:", gig_draft.id not in visible_ids)

        assert gig_approved.id in visible_ids
        assert gig_draft.id not in visible_ids
    finally:
        _cleanup(
            db,
            gigs=(gig_draft, gig_approved),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test D\n")


def test_e_public_detail_only_published() -> None:
    db = SessionLocal()
    teacher = gig_draft = gig_active = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-e", f"teacher-e-{uuid.uuid4()}@example.com"
        )
        gig_draft = create_gig(
            payload=GigCreate(title="Private Draft", city="Karachi", price=1000),
            current_user=teacher,
            db=db,
        )
        gig_active = create_gig(
            payload=GigCreate(title="Live Gig", city="Islamabad", price=3000),
            current_user=teacher,
            db=db,
        )
        gig_active.status = GigStatus.active
        db.commit()
        db.refresh(gig_active)

        found = get_gig(gig_id=str(gig_active.id), db=db)
        print("E published returned:", found.id == gig_active.id)
        assert found.id == gig_active.id

        try:
            get_gig(gig_id=str(gig_draft.id), db=db)
        except HTTPException as exc:
            print("E unpublished hidden:", exc.status_code == 404)
            assert exc.status_code == 404
        else:
            raise AssertionError("expected HTTP 404 for unpublished gig")

        try:
            get_gig(gig_id=str(uuid.uuid4()), db=db)
        except HTTPException as exc:
            print("E missing uuid hidden:", exc.status_code == 404)
            assert exc.status_code == 404
        else:
            raise AssertionError("expected HTTP 404 for missing gig")
    finally:
        _cleanup(
            db,
            gigs=(gig_draft, gig_active),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test E\n")


def test_f_non_owner_cannot_update() -> None:
    db = SessionLocal()
    owner = other = gig = None
    try:
        owner = _make_user(
            db, UserRole.teacher, "owner-f", f"owner-f-{uuid.uuid4()}@example.com"
        )
        other = _make_user(
            db, UserRole.teacher, "other-f", f"other-f-{uuid.uuid4()}@example.com"
        )
        gig = create_gig(
            payload=GigCreate(title="Owner Gig", city="Lahore", price=4000),
            current_user=owner,
            db=db,
        )

        try:
            update_gig(
                gig_id=str(gig.id),
                payload=GigUpdate(title="Hijacked"),
                current_user=other,
                db=db,
            )
        except HTTPException as exc:
            print("F non-owner update blocked:", exc.status_code == 403)
            assert exc.status_code == 403
        else:
            raise AssertionError("expected HTTP 403")
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=(owner, other))
        db.close()
    print("PASS Test F\n")


def test_g_non_owner_cannot_archive() -> None:
    db = SessionLocal()
    owner = other = gig = None
    try:
        owner = _make_user(
            db, UserRole.teacher, "owner-g", f"owner-g-{uuid.uuid4()}@example.com"
        )
        other = _make_user(
            db, UserRole.teacher, "other-g", f"other-g-{uuid.uuid4()}@example.com"
        )
        gig = create_gig(
            payload=GigCreate(title="Owner Gig 2", city="Lahore", price=4000),
            current_user=owner,
            db=db,
        )

        try:
            archive_gig(gig_id=str(gig.id), current_user=other, db=db)
        except HTTPException as exc:
            print("G non-owner archive blocked:", exc.status_code == 403)
            assert exc.status_code == 403
        else:
            raise AssertionError("expected HTTP 403")
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=(owner, other))
        db.close()
    print("PASS Test G\n")


def test_h_owner_updates_only_editable_fields() -> None:
    db = SessionLocal()
    teacher = gig = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-h", f"teacher-h-{uuid.uuid4()}@example.com"
        )
        gig = create_gig(
            payload=GigCreate(title="Original", city="Karachi", price=1000),
            current_user=teacher,
            db=db,
        )

        updated = update_gig(
            gig_id=str(gig.id),
            payload=GigUpdate(title="Updated Title", city="Islamabad", price=3500),
            current_user=teacher,
            db=db,
        )
        print("H title updated:", updated.title == "Updated Title")
        print("H city updated:", updated.city == "Islamabad")
        print("H price updated:", updated.price == 3500)
        print("H teacher_id immutable:", updated.teacher_id == teacher.id)
        print("H status immutable:", updated.status == GigStatus.draft)

        assert updated.title == "Updated Title"
        assert updated.city == "Islamabad"
        assert updated.price == 3500
        assert updated.teacher_id == teacher.id
        assert updated.status == GigStatus.draft
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=((teacher,) if teacher else ()))
        db.close()
    print("PASS Test H\n")


def test_i_owner_archives_keeps_row() -> None:
    db = SessionLocal()
    teacher = gig = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-i", f"teacher-i-{uuid.uuid4()}@example.com"
        )
        gig = create_gig(
            payload=GigCreate(title="Archive Me", city="Lahore", price=2500),
            current_user=teacher,
            db=db,
        )
        gig_id = gig.id
        teacher_id = gig.teacher_id

        result = archive_gig(gig_id=str(gig_id), current_user=teacher, db=db)
        print("I archive ack:", result.get("gig_id") == str(gig_id))

        row = db.query(Gig).filter(Gig.id == gig_id).first()
        print("I row still exists:", row is not None)
        print("I status archived:", row.status == GigStatus.archived)

        assert result.get("gig_id") == str(gig_id)
        assert row is not None
        assert row.status == GigStatus.archived
        assert row.teacher_id == teacher_id
        assert row.title == "Archive Me"
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=((teacher,) if teacher else ()))
        db.close()
    print("PASS Test I\n")


def test_j_search_only_published_and_filters() -> None:
    db = SessionLocal()
    teacher = gig_draft = gig_approved = gig_active = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-j", f"teacher-j-{uuid.uuid4()}@example.com"
        )
        gig_draft = create_gig(
            payload=GigCreate(title="Draft Course", city="Karachi", price=900),
            current_user=teacher,
            db=db,
        )
        gig_approved = create_gig(
            payload=GigCreate(title="IELTS Master", city="Lahore", price=4500),
            current_user=teacher,
            db=db,
        )
        gig_active = create_gig(
            payload=GigCreate(title="Python Bootcamp", city="Islamabad", price=6000),
            current_user=teacher,
            db=db,
        )
        gig_approved.status = GigStatus.approved
        gig_active.status = GigStatus.active
        db.commit()

        all_published = search_tutors(db=db)
        all_ids = {g.id for g in all_published}
        print("J draft excluded:", gig_draft.id not in all_ids)
        print("J approved included:", gig_approved.id in all_ids)
        print("J active included:", gig_active.id in all_ids)
        assert gig_draft.id not in all_ids
        assert gig_approved.id in all_ids
        assert gig_active.id in all_ids

        by_query = search_tutors(q="python", db=db)
        print("J q filter:", [g.title for g in by_query] == ["Python Bootcamp"])
        assert [g.title for g in by_query] == ["Python Bootcamp"]

        by_city = search_tutors(city="lahore", db=db)
        print("J city filter:", [g.title for g in by_city] == ["IELTS Master"])
        assert [g.title for g in by_city] == ["IELTS Master"]

        by_budget = search_tutors(budget_min=5000, db=db)
        print("J budget filter:", [g.title for g in by_budget] == ["Python Bootcamp"])
        assert [g.title for g in by_budget] == ["Python Bootcamp"]
    finally:
        _cleanup(
            db,
            gigs=(gig_draft, gig_approved, gig_active),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test J\n")


def test_k_teacher_creates_enriched_gig() -> None:
    db = SessionLocal()
    teacher = gig = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-k", f"teacher-k-{uuid.uuid4()}@example.com"
        )
        payload = GigCreate(
            title="Python & Data Science",
            slug="python-data-science",
            category=GigCategory.programming,
            subject="Python",
            city="Lahore",
            price=5000,
            overview="Hands-on Python data science mentorship.",
            learning_outcomes=["Write Python scripts", "Build data pipelines"],
            syllabus=[
                SyllabusItem(title="Python Basics", detail="Syntax and data types"),
                SyllabusItem(title="Pandas", detail="Data wrangling with DataFrames"),
            ],
            prerequisites=["Basic programming logic"],
            faqs=[FAQItem(question="Do you provide notes?", answer="Yes.")],
        )
        gig = create_gig(payload=payload, current_user=teacher, db=db)

        print("K teacher_id from JWT:", gig.teacher_id == teacher.id)
        print("K initial status draft:", gig.status == GigStatus.draft)
        print("K slug:", gig.slug == "python-data-science")
        print("K category:", gig.category == GigCategory.programming)
        print("K subject:", gig.subject == "Python")
        print("K overview:", gig.overview == payload.overview)
        print("K outcomes:", gig.learning_outcomes == ["Write Python scripts", "Build data pipelines"])
        print("K syllabus:", gig.syllabus == [
            {"title": "Python Basics", "detail": "Syntax and data types"},
            {"title": "Pandas", "detail": "Data wrangling with DataFrames"},
        ])
        print("K faqs:", gig.faqs == [{"question": "Do you provide notes?", "answer": "Yes."}])

        assert gig.teacher_id == teacher.id
        assert gig.status == GigStatus.draft
        assert gig.slug == "python-data-science"
        assert gig.category == GigCategory.programming
        assert gig.subject == "Python"
        assert gig.overview == payload.overview
        assert gig.learning_outcomes == ["Write Python scripts", "Build data pipelines"]
        assert gig.syllabus == [
            {"title": "Python Basics", "detail": "Syntax and data types"},
            {"title": "Pandas", "detail": "Data wrangling with DataFrames"},
        ]
        assert gig.prerequisites == ["Basic programming logic"]
        assert gig.faqs == [{"question": "Do you provide notes?", "answer": "Yes."}]
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=((teacher,) if teacher else ()))
        db.close()
    print("PASS Test K\n")


def test_l_duplicate_slug_rejected() -> None:
    db = SessionLocal()
    teacher = gig = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-l", f"teacher-l-{uuid.uuid4()}@example.com"
        )
        gig = create_gig(
            payload=GigCreate(
                title="First Gig",
                slug="shared-slug",
                category=GigCategory.stem,
                subject="Physics",
            ),
            current_user=teacher,
            db=db,
        )

        try:
            create_gig(
                payload=GigCreate(
                    title="Second Gig",
                    slug="shared-slug",
                    category=GigCategory.stem,
                    subject="Maths",
                ),
                current_user=teacher,
                db=db,
            )
        except HTTPException as exc:
            print("L status code:", exc.status_code)
            assert exc.status_code == 409
        else:
            raise AssertionError("expected HTTP 409")
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=((teacher,) if teacher else ()))
        db.close()
    print("PASS Test L\n")


def test_m_owner_updates_content_fields() -> None:
    db = SessionLocal()
    teacher = gig = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-m", f"teacher-m-{uuid.uuid4()}@example.com"
        )
        gig = create_gig(
            payload=GigCreate(title="Original", slug="original-slug"),
            current_user=teacher,
            db=db,
        )

        updated = update_gig(
            gig_id=str(gig.id),
            payload=GigUpdate(
                title="Updated Title",
                slug="updated-slug",
                category=GigCategory.languages,
                subject="IELTS",
                overview="Updated overview.",
                learning_outcomes=["Speak fluently"],
                prerequisites=["A1 level"],
            ),
            current_user=teacher,
            db=db,
        )
        print("M title updated:", updated.title == "Updated Title")
        print("M slug updated:", updated.slug == "updated-slug")
        print("M category updated:", updated.category == GigCategory.languages)
        print("M subject updated:", updated.subject == "IELTS")
        print("M outcomes updated:", updated.learning_outcomes == ["Speak fluently"])
        print("M status immutable:", updated.status == GigStatus.draft)
        print("M teacher immutable:", updated.teacher_id == teacher.id)

        assert updated.title == "Updated Title"
        assert updated.slug == "updated-slug"
        assert updated.category == GigCategory.languages
        assert updated.subject == "IELTS"
        assert updated.overview == "Updated overview."
        assert updated.learning_outcomes == ["Speak fluently"]
        assert updated.prerequisites == ["A1 level"]
        assert updated.status == GigStatus.draft
        assert updated.teacher_id == teacher.id
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=((teacher,) if teacher else ()))
        db.close()
    print("PASS Test M\n")


def test_n_published_detail_returns_teacher_summary() -> None:
    db = SessionLocal()
    teacher = gig = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-n", f"teacher-n-{uuid.uuid4()}@example.com"
        )
        profile = TeacherProfile(
            user_id=teacher.id,
            bio="Expert A-Level Physics mentor",
            education="MSc Physics, LUMS",
            languages=["English", "Urdu"],
            city="Lahore",
            teaching_mode=TeachingMode.online,
            hourly_rate=2500,
        )
        db.add(profile)
        db.commit()

        gig = create_gig(
            payload=GigCreate(
                title="Physics Tutoring",
                slug="physics-tutoring",
                category=GigCategory.stem,
                subject="Physics",
                city="Lahore",
                price=5000,
            ),
            current_user=teacher,
            db=db,
        )
        gig.status = GigStatus.active
        db.commit()
        db.refresh(gig)

        found = get_gig(gig_id=str(gig.id), db=db)
        print("N teacher id:", found.teacher.id == teacher.id)
        print("N teacher name:", found.teacher.name == teacher.full_name)
        print("N teacher city:", found.teacher.city == "Lahore")
        print("N teacher bio:", found.teacher.bio == "Expert A-Level Physics mentor")
        print("N teacher education:", found.teacher.education == "MSc Physics, LUMS")
        print("N teacher languages:", found.teacher.languages == ["English", "Urdu"])
        print("N teacher mode:", found.teacher.teaching_mode == TeachingMode.online)
        print("N teacher rate:", found.teacher.hourly_rate == 2500)

        assert found.teacher is not None
        assert found.teacher.id == teacher.id
        assert found.teacher.name == teacher.full_name
        assert found.teacher.city == "Lahore"
        assert found.teacher.bio == "Expert A-Level Physics mentor"
        assert found.teacher.education == "MSc Physics, LUMS"
        assert found.teacher.languages == ["English", "Urdu"]
        assert found.teacher.teaching_mode == TeachingMode.online
        assert found.teacher.hourly_rate == 2500
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=((teacher,) if teacher else ()))
        db.close()
    print("PASS Test N\n")


def test_o_public_detail_excludes_private_user_fields() -> None:
    db = SessionLocal()
    teacher = gig = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-o", f"teacher-o-{uuid.uuid4()}@example.com"
        )
        gig = create_gig(
            payload=GigCreate(title="Safe Gig", slug="safe-gig"),
            current_user=teacher,
            db=db,
        )
        gig.status = GigStatus.approved
        db.commit()
        db.refresh(gig)

        found = get_gig(gig_id=str(gig.id), db=db)
        dumped = found.model_dump()
        print("O teacher present:", dumped.get("teacher") is not None)
        print("O name present:", dumped["teacher"].get("name") == teacher.full_name)

        assert dumped.get("teacher") is not None
        assert dumped["teacher"].get("name") == teacher.full_name

        assert "email" not in dumped["teacher"]
        assert "password_hash" not in dumped["teacher"]
        assert "phone" not in dumped["teacher"]
        assert "role" not in dumped["teacher"]
        assert "phone_verified" not in dumped["teacher"]
        assert "email_verified" not in dumped["teacher"]
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=((teacher,) if teacher else ()))
        db.close()
    print("PASS Test O\n")


def test_p_search_supports_subject_and_category() -> None:
    db = SessionLocal()
    teacher = gig_a = gig_b = None
    try:
        teacher = _make_user(
            db, UserRole.teacher, "teacher-p", f"teacher-p-{uuid.uuid4()}@example.com"
        )
        gig_a = create_gig(
            payload=GigCreate(
                title="IELTS Master",
                slug="ielts-master",
                category=GigCategory.languages,
                subject="IELTS",
                city="Lahore",
                price=4500,
            ),
            current_user=teacher,
            db=db,
        )
        gig_b = create_gig(
            payload=GigCreate(
                title="Python Bootcamp",
                slug="python-bootcamp",
                category=GigCategory.programming,
                subject="Python",
                city="Islamabad",
                price=6000,
            ),
            current_user=teacher,
            db=db,
        )
        gig_a.status = GigStatus.approved
        gig_b.status = GigStatus.active
        db.commit()

        by_subject = search_tutors(subject="python", db=db)
        print("P subject filter:", [g.title for g in by_subject] == ["Python Bootcamp"])
        assert [g.title for g in by_subject] == ["Python Bootcamp"]

        by_category = search_tutors(category=GigCategory.languages, db=db)
        print("P category filter:", [g.title for g in by_category] == ["IELTS Master"])
        assert [g.title for g in by_category] == ["IELTS Master"]

        by_price_alias = search_tutors(min_price=5000, db=db)
        print("P min_price alias:", [g.title for g in by_price_alias] == ["Python Bootcamp"])
        assert [g.title for g in by_price_alias] == ["Python Bootcamp"]

        legacy_budget = search_tutors(budget_min=5000, db=db)
        print("P legacy budget alias:", [g.title for g in legacy_budget] == ["Python Bootcamp"])
        assert [g.title for g in legacy_budget] == ["Python Bootcamp"]
    finally:
        _cleanup(
            db,
            gigs=(gig_a, gig_b),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test P\n")


def main() -> None:
    test_a_unauthenticated_post_gigs_returns_401()
    test_b_student_cannot_create_gig()
    test_c_teacher_creates_gig_as_draft()
    test_d_public_listing_only_published()
    test_e_public_detail_only_published()
    test_f_non_owner_cannot_update()
    test_g_non_owner_cannot_archive()
    test_h_owner_updates_only_editable_fields()
    test_i_owner_archives_keeps_row()
    test_j_search_only_published_and_filters()
    test_k_teacher_creates_enriched_gig()
    test_l_duplicate_slug_rejected()
    test_m_owner_updates_content_fields()
    test_n_published_detail_returns_teacher_summary()
    test_o_public_detail_excludes_private_user_fields()
    test_p_search_supports_subject_and_category()
    print("ALL CHECKS PASSED")


if __name__ == "__main__":
    main()