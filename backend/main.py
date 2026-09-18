from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import auth, classrooms, gigs, proposals, orders, search, sessions
from api.routes.enrollments import router as enrollments_router
from api.routes.gig_packages import router as gig_packages_router
from api.routes.teacher_profiles import router as teacher_profiles_router
from api.student_dashboard import routes as student_dashboard_routes
from api.teacher_dashboard import routes as teacher_dashboard_routes
from api.admin_dashboard import routes as admin_dashboard_routes
from api.routes.google_oauth import router as google_oauth_router

app = FastAPI(title="Ustaad.com API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend dev URL — restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(gigs.router, prefix="/gigs", tags=["gigs"])
app.include_router(gig_packages_router, prefix="/gigs", tags=["gig-packages"])
app.include_router(classrooms.router, prefix="/classrooms", tags=["classrooms"])
app.include_router(enrollments_router, prefix="/enrollments", tags=["enrollments"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
app.include_router(proposals.router, prefix="/proposals", tags=["proposals"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(search.router, prefix="/search", tags=["search"])
app.include_router(teacher_profiles_router, prefix="/teacher-profile", tags=["teacher-profiles"])

app.include_router(student_dashboard_routes.router, prefix="/students", tags=["student-dashboard"])
app.include_router(teacher_dashboard_routes.router, prefix="/teachers", tags=["teacher-dashboard"])
app.include_router(admin_dashboard_routes.router, prefix="/admin", tags=["admin-dashboard"])
app.include_router(google_oauth_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
