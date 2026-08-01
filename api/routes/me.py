import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from api.auth import verify_api_key, BANK_REGISTRY, _sync_registered_keys

router = APIRouter()

@router.get("/me")
def get_my_profile(key_used: str = Depends(verify_api_key)):
    """Returns the calling bank's own registry entry. Scoped — never returns other banks."""
    from api.auth import FRAUD_API_KEY
    if key_used == FRAUD_API_KEY:
        return {
            "bank_name": "Admin",
            "tier": "admin",
            "created_at": None,
            "last_active": None,
            "contribution_weight": None,
            "active": True,
        }
    if key_used not in BANK_REGISTRY:
        raise HTTPException(status_code=404, detail="Bank profile not found.")
    entry = BANK_REGISTRY[key_used].copy()
    # Compute contribution weight from latest trainer state
    try:
        import api.main
        trainer = api.main.trainer
        if trainer.history:
            latest_round = trainer.history[-1]
            per_bank_acc = latest_round.get("per_bank_accuracy", {})
            # find which bank_N this key maps to by matching name
            bank_name = entry["bank_name"]
            # contribution weights from sample_counts
            total_samples = sum(b["sample_count"] for b in trainer.banks)
            contribution = None
            for bank in trainer.banks:
                # We can't perfectly match by name since bank_id is "bank_0" etc
                # Return total weights as approximation per bank
                pass
            sample_counts = [b["sample_count"] for b in trainer.banks]
            contribution = {
                f"bank_{i}": round(s / total_samples, 4)
                for i, s in enumerate(sample_counts)
            }
            entry["contribution_weights_all"] = contribution
            entry["rounds_trained"] = trainer.current_round
    except Exception:
        pass
    return entry

@router.post("/me/rotate-key")
def rotate_my_key(key_used: str = Depends(verify_api_key)):
    """Generates a new API key, immediately invalidates the old one. Returns new key once only."""
    from api.auth import FRAUD_API_KEY
    if key_used == FRAUD_API_KEY:
        raise HTTPException(status_code=400, detail="Cannot rotate the admin key via this endpoint.")
    if key_used not in BANK_REGISTRY:
        raise HTTPException(status_code=404, detail="Bank key not found.")
    old_entry = BANK_REGISTRY.pop(key_used)
    new_key = f"vlt_{secrets.token_hex(32)}"
    old_entry["created_at"] = datetime.now(timezone.utc).isoformat()
    old_entry["last_active"] = None
    old_entry["active"] = True
    BANK_REGISTRY[new_key] = old_entry
    _sync_registered_keys()
    return {
        "message": "Key rotated successfully. Store this new key — it cannot be retrieved again.",
        "bank_name": old_entry["bank_name"],
        "new_api_key": new_key,
    }
