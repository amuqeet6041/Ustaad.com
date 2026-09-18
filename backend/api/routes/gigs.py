from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
import uuid

router = APIRouter()

class PackageTier(BaseModel):
    name: str
    title: str
    description: str
    price: int
    duration_minutes: int
    sessions_count: int
    delivery_days: int
    features: List[str]

class GigResponse(BaseModel):
    id: str
    title: str
    category: str
    subject: str
    ustaad_name: str
    ustaad_title: str
    ustaad_level: str
    rating: float
    review_count: int
    city: str
    teaching_mode: str
    starting_price: int
    match_percent: int
    verified: bool

class GigDetailResponse(GigResponse):
    overview: str
    learning_outcomes: List[str]
    packages: dict[str, PackageTier]
    faqs: List[dict[str, str]]

SAMPLE_GIGS = [
    {
        "id": "gig-1",
        "title": "I will master Cambridge O/A-Level Physics with Past Papers & Problem Solving",
        "category": "STEM",
        "subject": "Physics",
        "ustaad_name": "Dr. Ahmed Khan",
        "ustaad_title": "Senior Cambridge O/A-Level Mathematics & Physics Specialist",
        "ustaad_level": "Top Rated Ustaad",
        "rating": 4.96,
        "review_count": 148,
        "city": "Lahore",
        "teaching_mode": "Both",
        "starting_price": 2000,
        "match_percent": 97,
        "verified": True,
        "overview": "Struggling with Kinematics, Electromagnetism, or Space Physics? Join this intensive exam-focused tutoring package.",
        "learning_outcomes": [
            "Deep conceptual mastery of Cambridge O/A-Level Physics syllabus",
            "Examiner-approved answering techniques for 4-mark and 6-mark questions",
            "Paper 1 MCQ elimination tricks that save 15+ minutes",
        ],
        "packages": {
            "basic": {
                "name": "Basic",
                "title": "Concept Diagnostic & 1 Topic Focus",
                "description": "One 60-minute intensive 1-on-1 session covering any single difficult topic.",
                "price": 2000,
                "duration_minutes": 60,
                "sessions_count": 1,
                "delivery_days": 1,
                "features": ["1-on-1 live session (60 mins)", "PDF notes & formulas", "Session recording"],
            },
            "standard": {
                "name": "Standard",
                "title": "Unit Mastery Bundle (4 Sessions)",
                "description": "Four 60-minute sessions covering an entire syllabus unit with homework review.",
                "price": 7500,
                "duration_minutes": 240,
                "sessions_count": 4,
                "delivery_days": 14,
                "features": ["4 live sessions", "Full formula pack", "WhatsApp Q&A support"],
            },
            "premium": {
                "name": "Premium",
                "title": "Complete Exam Sprint (10 Sessions + Mocks)",
                "description": "Ten 60-minute sessions covering high-yield topics + 2 full graded mock exams.",
                "price": 18000,
                "duration_minutes": 600,
                "sessions_count": 10,
                "delivery_days": 30,
                "features": ["10 intensive classes", "2 Mock Exams graded", "24/7 priority mentorship"],
            },
        },
        "faqs": [
            {"question": "How do classes take place?", "answer": "Conducted via Zoom/Google Meet with interactive whiteboard."},
        ],
    },
    {
        "id": "gig-2",
        "title": "I will coach you for IELTS Band 8+ with Intensive Speaking & Essay Correction",
        "category": "Languages",
        "subject": "IELTS & English",
        "ustaad_name": "Sara Ahmed",
        "ustaad_title": "Certified IELTS Master Coach (Band 8.5) & Corporate English Trainer",
        "ustaad_level": "Top Rated Ustaad",
        "rating": 4.94,
        "review_count": 112,
        "city": "Karachi",
        "teaching_mode": "Online",
        "starting_price": 1800,
        "match_percent": 95,
        "verified": True,
        "overview": "Aiming for Canadian PR, UK PLAB, or scholarships requiring Band 7.5 to 8.5? Get direct coaching.",
        "learning_outcomes": [
            "Master IELTS Writing Task 2 structure",
            "Eliminate hesitations in Speaking test",
        ],
        "packages": {
            "basic": {
                "name": "Basic",
                "title": "1 Mock Speaking Interview + 1 Essay Evaluation",
                "description": "One 45-minute live speaking simulation + detailed feedback on 1 essay.",
                "price": 1800,
                "duration_minutes": 45,
                "sessions_count": 1,
                "delivery_days": 1,
                "features": ["1 Live Mock Speaking test", "1 Writing Task 2 correction"],
            },
            "standard": {
                "name": "Standard",
                "title": "Complete 4-Session IELTS Booster",
                "description": "Four 60-minute sessions focused on Writing and Speaking + 4 essays graded.",
                "price": 6500,
                "duration_minutes": 240,
                "sessions_count": 4,
                "delivery_days": 10,
                "features": ["4 Live classes", "4 Essays evaluated", "WhatsApp voice drills"],
            },
            "premium": {
                "name": "Premium",
                "title": "Comprehensive Band 8.5 Masterclass (8 Sessions)",
                "description": "Full preparation covering all 4 modules with 8 essays and 3 full mocks.",
                "price": 13000,
                "duration_minutes": 480,
                "sessions_count": 8,
                "delivery_days": 25,
                "features": ["8 live sessions", "8 Essays graded", "3 Full mock exams"],
            },
        },
        "faqs": [
            {"question": "Is this for Academic and General?", "answer": "Yes, both formats are supported."},
        ],
    },
    {
        "id": "gig-3",
        "title": "I will mentor you in Modern Full-Stack Python, FastAPI & React from Scratch",
        "category": "Programming",
        "subject": "Python & React",
        "ustaad_name": "Hamza Malik",
        "ustaad_title": "Full-Stack Software Engineer & Python / Web Development Mentor",
        "ustaad_level": "Level 2 Ustaad",
        "rating": 4.91,
        "review_count": 84,
        "city": "Islamabad",
        "teaching_mode": "Both",
        "starting_price": 2500,
        "match_percent": 94,
        "verified": True,
        "overview": "Build real, portfolio-grade web applications with a senior software engineer.",
        "learning_outcomes": [
            "Build and deploy full-stack production-ready web apps",
            "Master async Python, Pydantic schemas, and SQLAlchemy",
        ],
        "packages": {
            "basic": {
                "name": "Basic",
                "title": "Code Review & 1-on-1 Debugging",
                "description": "One 60-minute live screen-share session.",
                "price": 2500,
                "duration_minutes": 60,
                "sessions_count": 1,
                "delivery_days": 1,
                "features": ["60 mins live coding", "Architecture review"],
            },
            "standard": {
                "name": "Standard",
                "title": "4-Session Project Accelerator",
                "description": "Four 75-minute sessions building an end-to-end full-stack project.",
                "price": 9000,
                "duration_minutes": 300,
                "sessions_count": 4,
                "delivery_days": 14,
                "features": ["4 sessions (75m each)", "Git repo starter templates"],
            },
            "premium": {
                "name": "Premium",
                "title": "Full-Stack Career Mentorship",
                "description": "Comprehensive 8-week mentorship including a production SaaS project.",
                "price": 17500,
                "duration_minutes": 600,
                "sessions_count": 8,
                "delivery_days": 30,
                "features": ["8 intensive sessions", "Deployed SaaS project", "Resume review"],
            },
        },
        "faqs": [
            {"question": "Beginners welcome?", "answer": "Yes, zero prior experience required."},
        ],
    },
]

@router.get("", response_model=List[GigResponse])
def list_gigs():
    """List all available tutor service offerings."""
    return SAMPLE_GIGS

@router.get("/{gig_id}", response_model=GigDetailResponse)
def get_gig(gig_id: str):
    """Retrieve full details of a specific gig including tiered packages."""
    for gig in SAMPLE_GIGS:
        if gig["id"] == gig_id:
            return gig
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gig not found")

@router.post("", status_code=status.HTTP_201_CREATED)
def create_gig(payload: dict):
    """Create a new gig (draft/submitted status)."""
    new_id = f"gig-{uuid.uuid4().hex[:6]}"
    payload["id"] = new_id
    payload["status"] = "submitted"
    return {"message": "Gig submitted for moderation", "gig_id": new_id}

@router.put("/{gig_id}")
def update_gig(gig_id: str, payload: dict):
    """Update gig details."""
    return {"message": f"Gig {gig_id} updated successfully"}

@router.delete("/{gig_id}")
def archive_gig(gig_id: str):
    """Archive a gig."""
    return {"message": f"Gig {gig_id} archived successfully"}
