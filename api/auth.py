import os
import json
import secrets
from datetime import datetime, timezone
from typing import Optional
from fastapi import Header, HTTPException, Request

FRAUD_API_KEY = os.getenv("FRAUD_API_KEY", "demo-key-12345")

# Bank registry: {api_key: {bank_name, created_at, tier, active}}
BANK_REGISTRY: dict[str, dict] = {}

# Legacy alias — routes still import REGISTERED_KEYS
@property
def _registered_keys_compat():
    return {k: v["bank_name"] for k, v in BANK_REGISTRY.items() if v.get("active", True)}

AUTH_FAILURES_LOG = "auth_failures.jsonl"

def _log_auth_failure(key_attempt: str, endpoint: str):
    """Log first 8 chars of failed key — never the full key."""
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "attempted_key_prefix": key_attempt[:8] if key_attempt else "MISSING",
        "endpoint": endpoint,
    }
    with open(AUTH_FAILURES_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")

def verify_api_key(request: Request, x_api_key: Optional[str] = Header(None)):
    """Validates API Key against registered bank keys or master admin key."""
    endpoint = str(request.url.path) if request else "unknown"
    if not x_api_key:
        _log_auth_failure("", endpoint)
        raise HTTPException(status_code=401, detail="Missing X-API-Key header.")
    if x_api_key == FRAUD_API_KEY:
        return x_api_key
    if x_api_key in BANK_REGISTRY:
        entry = BANK_REGISTRY[x_api_key]
        if not entry.get("active", True):
            _log_auth_failure(x_api_key, endpoint)
            raise HTTPException(status_code=401, detail="API Key has been revoked.")
        # Update last_active timestamp
        BANK_REGISTRY[x_api_key]["last_active"] = datetime.now(timezone.utc).isoformat()
        return x_api_key
    _log_auth_failure(x_api_key, endpoint)
    raise HTTPException(status_code=401, detail="Invalid API Key.")

def verify_admin_key(x_api_key: Optional[str] = Header(None)):
    """Validates admin/master key only — bank keys are NOT sufficient."""
    if not x_api_key or x_api_key != FRAUD_API_KEY:
        raise HTTPException(status_code=403, detail="Admin key required.")
    return x_api_key

# Legacy compatibility shim — imported by existing routes
REGISTERED_KEYS: dict[str, str] = {}

def _sync_registered_keys():
    """Keep legacy REGISTERED_KEYS dict in sync with BANK_REGISTRY for existing route modules."""
    REGISTERED_KEYS.clear()
    for k, v in BANK_REGISTRY.items():
        if v.get("active", True):
            REGISTERED_KEYS[k] = v["bank_name"]
