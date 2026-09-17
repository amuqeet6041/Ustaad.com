# Ustaad.com

AI-powered tutoring marketplace — two-sided platform connecting students and
verified tutors. See the full technical documentation and color scheme guide
shared alongside this project for complete architecture, database schema, and
API design.

## Structure

```
ustaad-project/
├── frontend/     Next.js + React + Tailwind (student, teacher, admin dashboards)
└── backend/      FastAPI + PostgreSQL + Celery
```

## Getting started

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
Runs at http://localhost:3000 — the landing page (`app/(public)/page.tsx`) is
fully built. Every other route is a placeholder page ready to be built out.

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```
Runs at http://localhost:8000 — visit /docs for the auto-generated API explorer.
Every route currently raises NotImplementedError — that's intentional, they're
signposted stubs matching the documented API design.

## What's already built
- Landing page (fully designed, using the Ustaad color system)
- Tailwind config wired to the exact brand palette (`tailwind.config.ts`)
- Shared components: Navbar, Footer, TutorCard
- Full folder structure for student / teacher / admin dashboards (frontend + backend)
- FastAPI route skeleton matching the documented API design
- SQLAlchemy model + Pydantic schema examples (User, Gig)
- Matching engine weight constants (docs §16)

## What's next (not built yet)
- Database models for remaining tables (see docs §20 for full schema)
- Real authentication (JWT issuing/validation)
- Dashboard UI for student/teacher/admin routes (currently placeholders)
- Matching engine scoring logic (currently returns zeros)
- Alembic migrations
