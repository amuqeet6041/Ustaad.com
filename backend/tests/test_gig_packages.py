"""Safe, non-destructive checks for the Gig Packages API.

Run from the backend directory:

    venv\\Scripts\\python.exe -m tests.test_gig_packages

Temporary users/gigs/packages are created in the dev database and always
removed. No token or secret is printed. Existing data is never touched.
"""

import uuid

from fastapi import HTTPException

import models.classroom  # noqa: F401  (configure mappers)
import models.gig  # noqa: F401  (configure mappers)
import models.gig_package  # noqa: F401  (configure mappers)
import models.session  # noqa: F401  (configure mappers)
import models.teacher_profile  # noqa: F401  (configure mappers)
import models.user  # noqa: F401  (configure mappers)
from api.routes.auth import get_current_user
from api.routes.gig_packages import (
    create_package,
    delete_package,
    list_packages,
    update_package,
)
from api.routes.gigs import create_gig, get_gig, list_gigs
from database.session import SessionLocal
from models.gig import Gig, GigCategory, GigStatus
from models.gig_package import GigPackage, GigPackageTier
from models.teacher_profile import TeacherProfile, TeachingMode
from models.user import User, UserRole
from schemas.gig import GigCreate
from schemas.gig_package import GigPackageCreate, GigPackageUpdate

TIER_ORDER = [
    GigPackageTier.basic,
    GigPackageTier.standard,
    GigPackageTier.premium,
]


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


def _make_gig(db, teacher: User, title: str) -> Gig:
    gig = create_gig(
        payload=GigCreate(
            title=title,
            slug=f"slug-{uuid.uuid4().hex[:12]}",
            category=GigCategory.stem,
            subject="Physics",
        ),
        current_user=teacher,
        db=db,
    )
    return gig


def _package(
    tier: GigPackageTier, name: str = None, price: int = None
) -> GigPackageCreate:
    return GigPackageCreate(
        tier=tier,
        name=name or f"Package {tier.value}",
        title=f"Tier {tier.value.title()}",
        description="Mentorship tier.",
        price=price if price is not None else 1000,
        duration_minutes=60,
        sessions_count=4,
        delivery_days=7,
        features=["1:1 sessions", "Notes"],
    )


def _cleanup(db, packages=(), gigs=(), users=()):
    db.rollback()
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


def test_a_unauthenticated_package_post_returns_401() -> None:
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


def test_b_student_cannot_create_package() -> None:
    db = SessionLocal()
    teacher = student = gig = None
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-b",
            f"pkg-teacher-b-{uuid.uuid4()}@example.com",
        )
        student = _make_user(
            db,
            UserRole.student,
            "pkg-student-b",
            f"pkg-student-b-{uuid.uuid4()}@example.com",
        )
        gig = _make_gig(db, teacher, "Student Block Gig")

        try:
            create_package(
                gig_id=str(gig.id),
                payload=_package(GigPackageTier.basic),
                current_user=student,
                db=db,
            )
        except HTTPException as exc:
            print("B status code:", exc.status_code)
            assert exc.status_code == 403
        else:
            raise AssertionError("expected HTTP 403")
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=(teacher, student))
        db.close()
    print("PASS Test B\n")


def test_c_other_teacher_cannot_create_package() -> None:
    db = SessionLocal()
    owner = other = gig = None
    try:
        owner = _make_user(
            db,
            UserRole.teacher,
            "pkg-owner-c",
            f"pkg-owner-c-{uuid.uuid4()}@example.com",
        )
        other = _make_user(
            db,
            UserRole.teacher,
            "pkg-other-c",
            f"pkg-other-c-{uuid.uuid4()}@example.com",
        )
        gig = _make_gig(db, owner, "Owner-Gig-C")

        try:
            create_package(
                gig_id=str(gig.id),
                payload=_package(GigPackageTier.basic),
                current_user=other,
                db=db,
            )
        except HTTPException as exc:
            print("C status code:", exc.status_code)
            assert exc.status_code == 403
        else:
            raise AssertionError("expected HTTP 403")
    finally:
        _cleanup(db, gigs=((gig,) if gig else ()), users=(owner, other))
        db.close()
    print("PASS Test C\n")


def test_d_owner_creates_basic_package() -> None:
    db = SessionLocal()
    teacher = gig = pkg = None
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-d",
            f"pkg-teacher-d-{uuid.uuid4()}@example.com",
        )
        gig = _make_gig(db, teacher, "Basic-Tier-Gig")

        pkg = create_package(
            gig_id=str(gig.id),
            payload=_package(
                GigPackageTier.basic, name="Basics", price=1500
            ),
            current_user=teacher,
            db=db,
        )
        print("D is package:", isinstance(pkg, GigPackage))
        print("D tier:", pkg.tier == GigPackageTier.basic)
        print("D gig_id from path:", pkg.gig_id == gig.id)
        print("D teacher ownership:", gig.teacher_id == teacher.id)
        print("D name/title:", pkg.name == "Basics" and pkg.title == "Tier Basic")
        print("D price:", pkg.price == 1500)
        print("D features:", pkg.features == ["1:1 sessions", "Notes"])

        assert isinstance(pkg, GigPackage)
        assert pkg.tier == GigPackageTier.basic
        assert pkg.gig_id == gig.id
        assert gig.teacher_id == teacher.id
        assert pkg.name == "Basics"
        assert pkg.title == "Tier Basic"
        assert pkg.price == 1500
        assert pkg.features == ["1:1 sessions", "Notes"]
    finally:
        _cleanup(
            db,
            packages=((pkg,) if pkg else ()),
            gigs=((gig,) if gig else ()),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test D\n")


def test_e_all_three_tiers_on_one_gig() -> None:
    db = SessionLocal()
    teacher = gig = None
    pkgs = []
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-e",
            f"pkg-teacher-e-{uuid.uuid4()}@example.com",
        )
        gig = _make_gig(db, teacher, "Three-Tier-Gig")

        for tier in TIER_ORDER:
            pkgs.append(
                create_package(
                    gig_id=str(gig.id),
                    payload=_package(tier),
                    current_user=teacher,
                    db=db,
                )
            )
        print("E created tiers:", [p.tier for p in pkgs] == TIER_ORDER)
        counts = (
            db.query(GigPackage).filter(GigPackage.gig_id == gig.id).count()
        )
        print("E rows in db:", counts == 3)
        assert [p.tier for p in pkgs] == TIER_ORDER
        assert counts == 3
    finally:
        _cleanup(
            db,
            packages=tuple(pkgs),
            gigs=((gig,) if gig else ()),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test E\n")


def test_f_duplicate_tier_on_same_gig_rejected() -> None:
    db = SessionLocal()
    teacher = gig = pkg = other = None
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-f",
            f"pkg-teacher-f-{uuid.uuid4()}@example.com",
        )
        gig = _make_gig(db, teacher, "Dup-Tier-Gig")
        pkg = create_package(
            gig_id=str(gig.id),
            payload=_package(GigPackageTier.standard),
            current_user=teacher,
            db=db,
        )

        try:
            create_package(
                gig_id=str(gig.id),
                payload=_package(GigPackageTier.standard),
                current_user=teacher,
                db=db,
            )
        except HTTPException as exc:
            print("F status code:", exc.status_code)
            assert exc.status_code == 409
        else:
            raise AssertionError("expected HTTP 409")

        other = (
            db.query(GigPackage).filter(GigPackage.gig_id == gig.id).count()
        )
        print("F still one package:", other == 1)
        assert other == 1
    finally:
        _cleanup(
            db,
            packages=((pkg,) if pkg else ()),
            gigs=((gig,) if gig else ()),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test F\n")


def test_g_same_tier_on_different_gigs_ok() -> None:
    db = SessionLocal()
    teacher = gig_a = gig_b = None
    pkgs = []
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-g",
            f"pkg-teacher-g-{uuid.uuid4()}@example.com",
        )
        gig_a = _make_gig(db, teacher, "Gig-A-G")
        gig_b = _make_gig(db, teacher, "Gig-B-G")

        pkgs.append(
            create_package(
                gig_id=str(gig_a.id),
                payload=_package(GigPackageTier.premium),
                current_user=teacher,
                db=db,
            )
        )
        pkgs.append(
            create_package(
                gig_id=str(gig_b.id),
                payload=_package(GigPackageTier.premium),
                current_user=teacher,
                db=db,
            )
        )
        print(
            "G distinct gig ids:",
            pkgs[0].gig_id != pkgs[1].gig_id,
        )
        print("G both premium:", all(p.tier == GigPackageTier.premium for p in pkgs))
        assert pkgs[0].gig_id != pkgs[1].gig_id
        assert all(p.tier == GigPackageTier.premium for p in pkgs)
    finally:
        _cleanup(
            db,
            packages=tuple(pkgs),
            gigs=(gig_a, gig_b),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test G\n")


def test_h_public_packages_only_for_published_gig() -> None:
    db = SessionLocal()
    teacher = gig_live = gig_draft = gig_archived = None
    pkgs = []
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-h",
            f"pkg-teacher-h-{uuid.uuid4()}@example.com",
        )
        gig_live = _make_gig(db, teacher, "Live-Gig-H")
        gig_draft = _make_gig(db, teacher, "Draft-Gig-H")
        gig_archived = _make_gig(db, teacher, "Archived-Gig-H")

        gig_live.status = GigStatus.approved
        gig_archived.status = GigStatus.archived
        db.commit()

        for gig, tier in (
            (gig_live, GigPackageTier.basic),
            (gig_live, GigPackageTier.standard),
            (gig_draft, GigPackageTier.basic),
            (gig_archived, GigPackageTier.premium),
        ):
            pkgs.append(
                create_package(
                    gig_id=str(gig.id),
                    payload=_package(tier),
                    current_user=teacher,
                    db=db,
                )
            )

        live = list_packages(gig_id=str(gig_live.id), db=db)
        print("H live shows 2:", len(live) == 2)
        assert len(live) == 2

        for hidden in (gig_draft, gig_archived):
            try:
                list_packages(gig_id=str(hidden.id), db=db)
            except HTTPException as exc:
                print("H hidden status:", exc.status_code)
                assert exc.status_code == 404
            else:
                raise AssertionError("expected HTTP 404 for unpublished gig")

        try:
            list_packages(gig_id=str(uuid.uuid4()), db=db)
        except HTTPException as exc:
            print("H missing uuid hidden:", exc.status_code)
            assert exc.status_code == 404
        else:
            raise AssertionError("expected HTTP 404 for missing gig")
    finally:
        _cleanup(
            db,
            packages=tuple(pkgs),
            gigs=(gig_live, gig_draft, gig_archived),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test H\n")


def test_i_packages_ordered_basic_standard_premium() -> None:
    db = SessionLocal()
    teacher = gig = None
    pkgs = []
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-i",
            f"pkg-teacher-i-{uuid.uuid4()}@example.com",
        )
        gig = _make_gig(db, teacher, "Ordered-Packages-Gig")
        gig.status = GigStatus.active
        db.commit()

        for tier in (GigPackageTier.premium, GigPackageTier.basic, GigPackageTier.standard):
            pkgs.append(
                create_package(
                    gig_id=str(gig.id),
                    payload=_package(tier),
                    current_user=teacher,
                    db=db,
                )
            )

        visible = list_packages(gig_id=str(gig.id), db=db)
        print("I order:", [p.tier for p in visible] == TIER_ORDER)
        assert [p.tier for p in visible] == TIER_ORDER
    finally:
        _cleanup(
            db,
            packages=tuple(pkgs),
            gigs=((gig,) if gig else ()),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test I\n")


def test_j_owner_updates_package() -> None:
    db = SessionLocal()
    teacher = gig = pkg = updated = None
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-j",
            f"pkg-teacher-j-{uuid.uuid4()}@example.com",
        )
        gig = _make_gig(db, teacher, "Update-Package-Gig")
        pkg = create_package(
            gig_id=str(gig.id),
            payload=_package(GigPackageTier.basic, name="Original", price=1000),
            current_user=teacher,
            db=db,
        )
        original_created = pkg.created_at

        updated = update_package(
            gig_id=str(gig.id),
            package_id=str(pkg.id),
            payload=GigPackageUpdate(
                name="Renamed",
                title="New Title",
                price=2500,
                sessions_count=6,
                delivery_days=10,
            ),
            current_user=teacher,
            db=db,
        )
        print("J name:", updated.name == "Renamed")
        print("J title:", updated.title == "New Title")
        print("J price:", updated.price == 2500)
        print("J sessions:", updated.sessions_count == 6)
        print("J delivery:", updated.delivery_days == 10)
        print("J tier unchanged:", updated.tier == GigPackageTier.basic)
        print("J gig immutable:", updated.gig_id == gig.id)
        print("J created_at preserved:", updated.created_at == original_created)

        assert updated.name == "Renamed"
        assert updated.title == "New Title"
        assert updated.price == 2500
        assert updated.sessions_count == 6
        assert updated.delivery_days == 10
        assert updated.tier == GigPackageTier.basic
        assert updated.gig_id == gig.id
        assert updated.created_at == original_created
    finally:
        _cleanup(
            db,
            packages=(pkg, updated) if updated else ((pkg,) if pkg else ()),
            gigs=((gig,) if gig else ()),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test J\n")


def test_k_cannot_move_package_to_another_gig() -> None:
    db = SessionLocal()
    teacher = gig_a = gig_b = pkg = None
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-k",
            f"pkg-teacher-k-{uuid.uuid4()}@example.com",
        )
        gig_a = _make_gig(db, teacher, "Gig-A-K")
        gig_b = _make_gig(db, teacher, "Gig-B-K")
        pkg = create_package(
            gig_id=str(gig_a.id),
            payload=_package(GigPackageTier.standard),
            current_user=teacher,
            db=db,
        )

        try:
            update_package(
                gig_id=str(gig_b.id),
                package_id=str(pkg.id),
                payload=GigPackageUpdate(name="Moved"),
                current_user=teacher,
                db=db,
            )
        except HTTPException as exc:
            print("K status code:", exc.status_code)
            assert exc.status_code == 404
        else:
            raise AssertionError("expected HTTP 404 for cross-gig package")

        row = db.query(GigPackage).filter(GigPackage.id == pkg.id).first()
        print("K still on gig A:", row.gig_id == gig_a.id)
        assert row.gig_id == gig_a.id
    finally:
        _cleanup(
            db,
            packages=((pkg,) if pkg else ()),
            gigs=(gig_a, gig_b),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test K\n")


def test_l_duplicate_tier_on_update_rejected() -> None:
    db = SessionLocal()
    teacher = gig = None
    pkgs = []
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-l",
            f"pkg-teacher-l-{uuid.uuid4()}@example.com",
        )
        gig = _make_gig(db, teacher, "Update-Dup-Tier-Gig")
        pkgs.append(
            create_package(
                gig_id=str(gig.id),
                payload=_package(GigPackageTier.basic),
                current_user=teacher,
                db=db,
            )
        )
        pkgs.append(
            create_package(
                gig_id=str(gig.id),
                payload=_package(GigPackageTier.standard),
                current_user=teacher,
                db=db,
            )
        )

        try:
            update_package(
                gig_id=str(gig.id),
                package_id=str(pkgs[0].id),
                payload=GigPackageUpdate(tier=GigPackageTier.standard),
                current_user=teacher,
                db=db,
            )
        except HTTPException as exc:
            print("L status code:", exc.status_code)
            assert exc.status_code == 409
        else:
            raise AssertionError("expected HTTP 409")

        row = db.query(GigPackage).filter(GigPackage.id == pkgs[0].id).first()
        print("L tier unchanged:", row.tier == GigPackageTier.basic)
        assert row.tier == GigPackageTier.basic
    finally:
        _cleanup(
            db,
            packages=tuple(pkgs),
            gigs=((gig,) if gig else ()),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test L\n")


def test_m_owner_deletes_package_hard() -> None:
    db = SessionLocal()
    teacher = gig = pkg = None
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-m",
            f"pkg-teacher-m-{uuid.uuid4()}@example.com",
        )
        gig = _make_gig(db, teacher, "Delete-Package-Gig")
        pkg = create_package(
            gig_id=str(gig.id),
            payload=_package(GigPackageTier.basic),
            current_user=teacher,
            db=db,
        )
        pkg_id = str(pkg.id)

        result = delete_package(
            gig_id=str(gig.id),
            package_id=pkg_id,
            current_user=teacher,
            db=db,
        )
        print("M ack package_id:", result.get("package_id") == pkg_id)

        row = db.query(GigPackage).filter(GigPackage.id == pkg.id).first()
        print("M row gone (hard delete):", row is None)
        count = (
            db.query(GigPackage).filter(GigPackage.gig_id == gig.id).count()
        )
        print("M zero rows remain:", count == 0)

        assert result.get("package_id") == pkg_id
        assert row is None
        assert count == 0
    finally:
        _cleanup(
            db,
            gigs=((gig,) if gig else ()),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test M\n")


def test_n_non_owner_cannot_delete_package() -> None:
    db = SessionLocal()
    owner = other = gig = pkg = None
    try:
        owner = _make_user(
            db,
            UserRole.teacher,
            "pkg-owner-n",
            f"pkg-owner-n-{uuid.uuid4()}@example.com",
        )
        other = _make_user(
            db,
            UserRole.teacher,
            "pkg-other-n",
            f"pkg-other-n-{uuid.uuid4()}@example.com",
        )
        gig = _make_gig(db, owner, "Delete-Protected-Gig")
        pkg = create_package(
            gig_id=str(gig.id),
            payload=_package(GigPackageTier.basic),
            current_user=owner,
            db=db,
        )

        try:
            delete_package(
                gig_id=str(gig.id),
                package_id=str(pkg.id),
                current_user=other,
                db=db,
            )
        except HTTPException as exc:
            print("N status code:", exc.status_code)
            assert exc.status_code == 403
        else:
            raise AssertionError("expected HTTP 403")

        row = db.query(GigPackage).filter(GigPackage.id == pkg.id).first()
        print("N package still present:", row is not None)
        assert row is not None
    finally:
        _cleanup(
            db,
            packages=((pkg,) if pkg else ()),
            gigs=((gig,) if gig else ()),
            users=(owner, other),
        )
        db.close()
    print("PASS Test N\n")


def test_o_published_gig_list_includes_teacher_and_packages() -> None:
    db = SessionLocal()
    teacher = gig = None
    pkgs = []
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-o",
            f"pkg-teacher-o-{uuid.uuid4()}@example.com",
        )
        db.add(
            TeacherProfile(
                user_id=teacher.id,
                bio="Package-aware mentor",
                education="MSc Physics",
                languages=["English"],
                city="Lahore",
                teaching_mode=TeachingMode.online,
                hourly_rate=2000,
            )
        )
        db.commit()

        gig = _make_gig(db, teacher, "List-Embed-Gig")
        gig.status = GigStatus.approved
        db.commit()
        for tier in TIER_ORDER:
            pkgs.append(
                create_package(
                    gig_id=str(gig.id),
                    payload=_package(tier),
                    current_user=teacher,
                    db=db,
                )
            )

        visible = list_gigs(db=db)
        match = next((g for g in visible if g.id == gig.id), None)
        print("O gig found in listing:", match is not None)
        print("O teacher embedded:", match.teacher is not None)
        print("O teacher name:", match.teacher.name == teacher.full_name)
        print("O teacher bio:", match.teacher.bio == "Package-aware mentor")
        print(
            "O packages embedded:",
            [p.tier for p in match.packages] == TIER_ORDER,
        )

        assert match is not None
        assert match.teacher is not None
        assert match.teacher.id == teacher.id
        assert match.teacher.name == teacher.full_name
        assert match.teacher.bio == "Package-aware mentor"
        assert [p.tier for p in match.packages] == TIER_ORDER
    finally:
        _cleanup(
            db,
            packages=tuple(pkgs),
            gigs=((gig,) if gig else ()),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test O\n")


def test_p_published_detail_includes_teacher_and_packages() -> None:
    db = SessionLocal()
    teacher = gig = None
    pkgs = []
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-p",
            f"pkg-teacher-p-{uuid.uuid4()}@example.com",
        )
        gig = _make_gig(db, teacher, "Detail-Embed-Gig")
        gig.status = GigStatus.active
        db.commit()
        for tier in TIER_ORDER:
            pkgs.append(
                create_package(
                    gig_id=str(gig.id),
                    payload=_package(tier),
                    current_user=teacher,
                    db=db,
                )
            )

        found = get_gig(gig_id=str(gig.id), db=db)
        print("P detail teacher embedded:", found.teacher is not None)
        print("P detail teacher id:", found.teacher.id == teacher.id)
        print(
            "P detail packages:",
            [p.tier for p in found.packages] == TIER_ORDER,
        )
        print(
            "P package prices:",
            [p.price for p in found.packages] == [1000, 1000, 1000],
        )

        assert found.teacher is not None
        assert found.teacher.id == teacher.id
        assert [p.tier for p in found.packages] == TIER_ORDER
        assert all(p.gig_id == gig.id for p in found.packages)
    finally:
        _cleanup(
            db,
            packages=tuple(pkgs),
            gigs=((gig,) if gig else ()),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test P\n")


def test_q_no_private_fields_exposed() -> None:
    db = SessionLocal()
    teacher = gig = pkg = None
    try:
        teacher = _make_user(
            db,
            UserRole.teacher,
            "pkg-teacher-q",
            f"pkg-teacher-q-{uuid.uuid4()}@example.com",
        )
        gig = _make_gig(db, teacher, "No-Leak-Gig")
        pkg = create_package(
            gig_id=str(gig.id),
            payload=_package(GigPackageTier.basic),
            current_user=teacher,
            db=db,
        )
        gig.status = GigStatus.active
        db.commit()

        found = get_gig(gig_id=str(gig.id), db=db)
        dumped = found.model_dump()
        print("Q package count safe:", len(dumped["packages"]) == 1)
        pkg_dump = dumped["packages"][0]
        print(
            "Q package fields:",
            sorted(pkg_dump.keys()),
        )

        assert "teacher_id" not in pkg_dump
        assert "password_hash" not in pkg_dump
        assert "password" not in pkg_dump
        assert "email" not in dumped["teacher"]
        assert "password_hash" not in dumped["teacher"]
        assert "phone" not in dumped["teacher"]
        assert set(pkg_dump) <= {
            "id",
            "gig_id",
            "tier",
            "name",
            "title",
            "description",
            "price",
            "duration_minutes",
            "sessions_count",
            "delivery_days",
            "features",
            "created_at",
            "updated_at",
        }
    finally:
        _cleanup(
            db,
            packages=((pkg,) if pkg else ()),
            gigs=((gig,) if gig else ()),
            users=((teacher,) if teacher else ()),
        )
        db.close()
    print("PASS Test Q\n")


def main() -> None:
    test_a_unauthenticated_package_post_returns_401()
    test_b_student_cannot_create_package()
    test_c_other_teacher_cannot_create_package()
    test_d_owner_creates_basic_package()
    test_e_all_three_tiers_on_one_gig()
    test_f_duplicate_tier_on_same_gig_rejected()
    test_g_same_tier_on_different_gigs_ok()
    test_h_public_packages_only_for_published_gig()
    test_i_packages_ordered_basic_standard_premium()
    test_j_owner_updates_package()
    test_k_cannot_move_package_to_another_gig()
    test_l_duplicate_tier_on_update_rejected()
    test_m_owner_deletes_package_hard()
    test_n_non_owner_cannot_delete_package()
    test_o_published_gig_list_includes_teacher_and_packages()
    test_p_published_detail_includes_teacher_and_packages()
    test_q_no_private_fields_exposed()
    print("ALL GIG PACKAGE CHECKS PASSED")


if __name__ == "__main__":
    main()