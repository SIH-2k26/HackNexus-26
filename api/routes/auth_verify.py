"""
API Key Verification Endpoint for Supabase + Vaultic Authentication Flow (Stage 2)
Validates API keys against FRAUD_API_KEY (Operator) and BANK_REGISTRY (Bank Node).
"""
from fastapi import APIRouter, HTTPException, Header, Body
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timezone

from api.auth import FRAUD_API_KEY, BANK_REGISTRY, _log_auth_failure

router = APIRouter()

class VerifyKeyRequest(BaseModel):
    api_key: str

@router.post("/auth/verify-key")
def verify_api_key_endpoint(
    payload: Optional[VerifyKeyRequest] = None,
    x_api_key: Optional[str] = Header(None)
):
    """
    Validates a Vaultic API key and returns the user role & bank identity.
    Accepts key via JSON body {"api_key": "..."} or x-api-key header.
    """
    key = payload.api_key if (payload and payload.api_key) else x_api_key
    if not key:
        _log_auth_failure("", "/auth/verify-key")
        raise HTTPException(status_code=401, detail="API key is required.")

    # 1. Check if key is Operator / Master Admin key
    if key == FRAUD_API_KEY:
        return {
            "valid": True,
            "role": "operator",
            "bank_name": "Vaultic Central Operator",
            "bank_id": "operator",
            "tier": "admin",
        }

    # 2. Check if key exists in Bank Registry
    if key in BANK_REGISTRY:
        entry = BANK_REGISTRY[key]
        if not entry.get("active", True):
            _log_auth_failure(key, "/auth/verify-key")
            raise HTTPException(status_code=401, detail="API Key has been revoked.")
        
        # Update last_active timestamp
        BANK_REGISTRY[key]["last_active"] = datetime.now(timezone.utc).isoformat()
        
        return {
            "valid": True,
            "role": "bank",
            "bank_name": entry.get("bank_name", "Registered Bank Node"),
            "bank_id": entry.get("bank_name", "bank_node"),
            "tier": entry.get("tier", "standard"),
        }

    # 3. Invalid key attempt
    _log_auth_failure(key, "/auth/verify-key")
    raise HTTPException(status_code=401, detail="Invalid API Key.")
