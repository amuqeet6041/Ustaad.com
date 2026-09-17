from fastapi import APIRouter

router = APIRouter()

@router.post("")
def send_proposal():
    raise NotImplementedError

@router.get("")
def list_proposals():
    raise NotImplementedError

@router.get("/{proposal_id}")
def get_proposal(proposal_id: str):
    raise NotImplementedError

@router.put("/{proposal_id}")
def update_proposal_status(proposal_id: str):
    """Accept / decline / counter-offer / cancel."""
    raise NotImplementedError
