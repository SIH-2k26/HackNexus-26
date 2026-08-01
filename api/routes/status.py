from fastapi import APIRouter
from api.auth import REGISTERED_KEYS

router = APIRouter()

@router.get("/status")
def get_status():
    """Returns training history and current global model metrics. No auth required."""
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
