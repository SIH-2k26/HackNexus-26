import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from api.auth import verify_api_key, verify_admin_key, BANK_REGISTRY, REGISTERED_KEYS, _sync_registered_keys
from core.trainer import FlowerStyleCoordinator

router = APIRouter()

class RegisterRequest(BaseModel):
    bank_name: str
    tier: str = "standard"

@router.post("/register")
def register_bank(payload: RegisterRequest):
    """Generates and registers a unique API key for a bank node."""
    bank_name = payload.bank_name.strip()
    if not bank_name:
        raise HTTPException(status_code=400, detail="Bank name cannot be empty.")
    api_key = f"vlt_{secrets.token_hex(32)}"
    BANK_REGISTRY[api_key] = {
        "bank_name": bank_name,
        "tier": payload.tier,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_active": None,
        "active": True,
    }
    _sync_registered_keys()
    return {
        "bank_name": bank_name,
        "api_key": api_key,
        "message": "Bank registered successfully. Store this key — it cannot be retrieved again.",
    }

@router.post("/reset", dependencies=[Depends(verify_api_key)])
def reset_trainer():
    """Restarts the federated trainer and resets models to initial round 0."""
    import api.main
    api.main.trainer = FlowerStyleCoordinator(data_dir="data/banks")
    return {
        "message": "Federated trainer state reset successfully.",
        "current_round": api.main.trainer.current_round,
    }

# ── Admin-only bank management endpoints ────────────────────────────────────

@router.get("/admin/banks", dependencies=[Depends(verify_admin_key)])
def list_banks():
    """Admin-only: Returns full registry of all registered banks."""
    return {
        "total": len(BANK_REGISTRY),
        "banks": [
            {
                "api_key_prefix": k[:8] + "..." + k[-4:],
                "full_key": k,
                **v,
            }
            for k, v in BANK_REGISTRY.items()
        ],
    }

@router.post("/admin/banks/{key}/revoke", dependencies=[Depends(verify_admin_key)])
def revoke_bank_key(key: str):
    """Admin-only: Marks a bank's API key as inactive."""
    if key not in BANK_REGISTRY:
        raise HTTPException(status_code=404, detail="Bank key not found.")
    BANK_REGISTRY[key]["active"] = False
    _sync_registered_keys()
    return {
        "message": f"Key for '{BANK_REGISTRY[key]['bank_name']}' revoked.",
        "bank_name": BANK_REGISTRY[key]["bank_name"],
    }

@router.post("/admin/banks/{key}/reinstate", dependencies=[Depends(verify_admin_key)])
def reinstate_bank_key(key: str):
    """Admin-only: Re-activates a previously revoked bank key."""
    if key not in BANK_REGISTRY:
        raise HTTPException(status_code=404, detail="Bank key not found.")
    BANK_REGISTRY[key]["active"] = True
    _sync_registered_keys()
    return {"message": f"Key for '{BANK_REGISTRY[key]['bank_name']}' reinstated."}
