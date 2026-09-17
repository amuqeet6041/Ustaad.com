from fastapi import APIRouter

router = APIRouter()

@router.get("")
def list_orders():
    raise NotImplementedError

@router.get("/{order_id}")
def get_order(order_id: str):
    raise NotImplementedError

@router.put("/{order_id}/complete")
def mark_order_complete(order_id: str):
    raise NotImplementedError
