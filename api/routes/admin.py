import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from api.auth import verify_admin_key, BANK_REGISTRY, REGISTERED_KEYS, _sync_registered_keys
from core.trainer import FlowerStyleCoordinator

router = APIRouter()

class RegisterRequest(BaseModel):
    bank_name: str
    tier: str = "standard"

@router.post("/register", dependencies=[Depends(verify_admin_key)])
def register_bank(payload: RegisterRequest):
    """Admin-only: Generates and registers a unique API key for a bank node."""
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

@router.post("/reset", dependencies=[Depends(verify_admin_key)])
def reset_trainer():
    """Admin-only: Restarts the federated trainer and resets models to initial round 0."""
    import api.main
    api.main.trainer = FlowerStyleCoordinator(data_dir="data/banks")
    return {
        "message": "Federated trainer state reset successfully.",
        "current_round": api.main.trainer.current_round,
    }

# ── Admin-only bank management endpoints ────────────────────────────────────

def _find_bank_key(key_or_prefix: str) -> str:
    """Finds the actual registry key by full key or prefix."""
    if key_or_prefix in BANK_REGISTRY:
        return key_or_prefix
    # Match by prefix (strip ellipsis if present)
    clean_prefix = key_or_prefix.replace("...", "").split("...")[0].strip()
    if clean_prefix:
        for k in BANK_REGISTRY:
            if k.startswith(clean_prefix):
                return k
    return ""

@router.get("/admin/banks", dependencies=[Depends(verify_admin_key)])
def list_banks():
    """Admin-only: Returns registry of all registered banks with masked key prefixes (no plaintext key leak)."""
    return {
        "total": len(BANK_REGISTRY),
        "banks": [
            {
                "api_key_prefix": k[:8] + "..." + k[-4:] if len(k) > 12 else k[:4] + "...",
                "bank_name": v.get("bank_name", "Unknown"),
                "tier": v.get("tier", "standard"),
                "created_at": v.get("created_at"),
                "last_active": v.get("last_active"),
                "active": v.get("active", True),
            }
            for k, v in BANK_REGISTRY.items()
        ],
    }

@router.post("/admin/banks/{key_or_prefix}/revoke", dependencies=[Depends(verify_admin_key)])
def revoke_bank_key(key_or_prefix: str):
    """Admin-only: Marks a bank's API key as inactive."""
    target_key = _find_bank_key(key_or_prefix)
    if not target_key:
        raise HTTPException(status_code=404, detail="Bank key not found.")
    BANK_REGISTRY[target_key]["active"] = False
    _sync_registered_keys()
    return {
        "message": f"Key for '{BANK_REGISTRY[target_key]['bank_name']}' revoked.",
        "bank_name": BANK_REGISTRY[target_key]["bank_name"],
    }

@router.post("/admin/banks/{key_or_prefix}/reinstate", dependencies=[Depends(verify_admin_key)])
def reinstate_bank_key(key_or_prefix: str):
    """Admin-only: Re-activates a previously revoked bank key."""
    target_key = _find_bank_key(key_or_prefix)
    if not target_key:
        raise HTTPException(status_code=404, detail="Bank key not found.")
    BANK_REGISTRY[target_key]["active"] = True
    _sync_registered_keys()
    return {"message": f"Key for '{BANK_REGISTRY[target_key]['bank_name']}' reinstated."}
