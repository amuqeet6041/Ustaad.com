from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import auth, gigs, proposals, orders, search
from api.student_dashboard import routes as student_dashboard_routes
from api.teacher_dashboard import routes as teacher_dashboard_routes
from api.admin_dashboard import routes as admin_dashboard_routes

app = FastAPI(title="Ustaad.com API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend dev URL — restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(gigs.router, prefix="/gigs", tags=["gigs"])
app.include_router(proposals.router, prefix="/proposals", tags=["proposals"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(search.router, prefix="/search", tags=["search"])

app.include_router(student_dashboard_routes.router, prefix="/students", tags=["student-dashboard"])
app.include_router(teacher_dashboard_routes.router, prefix="/teachers", tags=["teacher-dashboard"])
app.include_router(admin_dashboard_routes.router, prefix="/admin", tags=["admin-dashboard"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
