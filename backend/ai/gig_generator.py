"""
AI Gig Generator — drafts a gig description from structured teacher input.
Output is always a DRAFT the teacher must review before publishing — never
auto-published. See docs §17 for the no-hallucination guardrail.
"""

def generate_gig_draft(subject: str, education_level: str, years_experience: int) -> str:
    raise NotImplementedError("Wire this to your LLM provider of choice.")
