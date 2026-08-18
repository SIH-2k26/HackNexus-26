from fastapi import APIRouter, Depends
from api.auth import REGISTERED_KEYS, verify_api_key

router = APIRouter()

@router.get("/status", dependencies=[Depends(verify_api_key)])
def get_status():
    """Returns training history and current global model metrics. Requires valid API key."""
    from api.main import trainer
    latest_metrics = (
        trainer.history[-1]["global_metrics"] if trainer.history else None
    )
    return {
        "status": "active",
        "current_round": trainer.current_round,
        "latest_metrics": latest_metrics,
        "registered_banks": list(REGISTERED_KEYS.values()),
        "history": trainer.history
    }
