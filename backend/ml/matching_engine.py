"""
Tutor matching engine — MVP weighted scoring.
See docs §16 for the full rationale behind these weights and the
evolution path toward collaborative filtering / embeddings.
"""

WEIGHTS = {
    "subject": 0.30,
    "location": 0.20,
    "budget": 0.15,
    "availability": 0.15,
    "education_level": 0.10,
    "teaching_mode": 0.05,
    "experience": 0.03,
    "rating": 0.02,
}

def compute_match_score(student_profile: dict, gig: dict) -> dict:
    """
    Returns {"overall": float, "breakdown": {component: float}}.
    Each component scorer below is a placeholder — replace with real
    comparison logic per docs §16.
    """
    breakdown = {component: 0.0 for component in WEIGHTS}
    overall = sum(breakdown[c] * WEIGHTS[c] for c in WEIGHTS)
    return {"overall": overall, "breakdown": breakdown}
