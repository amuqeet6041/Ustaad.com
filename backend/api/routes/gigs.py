from fastapi import APIRouter

router = APIRouter()

@router.post("")
def create_gig():
    raise NotImplementedError

@router.get("")
def list_gigs():
    raise NotImplementedError

@router.get("/{gig_id}")
def get_gig(gig_id: str):
    raise NotImplementedError

@router.put("/{gig_id}")
def update_gig(gig_id: str):
    raise NotImplementedError

@router.delete("/{gig_id}")
def archive_gig(gig_id: str):
    raise NotImplementedError
