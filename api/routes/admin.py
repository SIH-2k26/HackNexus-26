import os
import io
import re
import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
import pandas as pd

from api.auth import verify_admin_key, BANK_REGISTRY, REGISTERED_KEYS, _sync_registered_keys
from core.trainer import FlowerStyleCoordinator

router = APIRouter()

CSV_TEMPLATE = """transaction_id,timestamp,amount,transaction_type,sender_account_age_days,receiver_account_age_days,sender_tx_count_24h,receiver_unique_senders_24h,device_changed,location_changed,failed_login_attempts,is_fraud
TXN_10001,2024-10-26T14:43:00Z,5083.63,UPI,934,196,2,3,False,False,0,0
TXN_10002,2024-05-18T13:24:00Z,42500.00,RTGS,14,310,12,1,True,True,2,1
TXN_10003,2024-11-30T17:02:00Z,12940.74,IMPS,1845,1749,1,4,False,False,0,0
TXN_10004,2024-11-27T20:25:00Z,31357.94,IMPS,252,1894,8,12,True,False,1,1
TXN_10005,2024-04-29T06:36:00Z,2270.63,NEFT,333,949,1,1,False,False,0,0
"""

REQUIRED_COLUMNS = [
    "timestamp",
    "amount",
    "transaction_type",
    "sender_account_age_days",
    "receiver_account_age_days",
    "sender_tx_count_24h",
    "receiver_unique_senders_24h",
    "device_changed",
    "location_changed",
    "failed_login_attempts",
    "is_fraud",
]

class RegisterRequest(BaseModel):
    bank_name: str
    tier: str = "standard"

class UploadBankRequest(BaseModel):
    bank_name: str
    tier: str = "standard"
    csv_content: str
    filename: str = "dataset.csv"

@router.get("/admin/banks/template-csv", dependencies=[Depends(verify_admin_key)])
def download_bank_csv_template():
    """Admin-only: Returns downloadable sample CSV template for bank onboarding."""
    return PlainTextResponse(
        content=CSV_TEMPLATE,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vaultic_bank_template.csv"}
    )

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

@router.post("/admin/banks/upload", dependencies=[Depends(verify_admin_key)])
async def upload_bank_csv(
    payload: UploadBankRequest,
):
    """Admin-only: Onboards a new bank node with private dataset CSV and adds it to the active federation."""
    name = payload.bank_name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Bank name cannot be empty.")

    if not payload.filename.lower().endswith(".csv") and not payload.filename.lower().endswith(".txt"):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a .csv file.")

    content = payload.csv_content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")

    try:
        df = pd.read_csv(io.StringIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    if len(df) == 0:
        raise HTTPException(status_code=400, detail="Uploaded CSV contains 0 data rows.")

    # Validate required columns
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=400,
            detail=f"CSV schema validation failed. Missing required column(s): {', '.join(missing_cols)}"
        )

    # Validate is_fraud column values
    if df["is_fraud"].isnull().any():
        raise HTTPException(status_code=400, detail="CSV validation error: 'is_fraud' column contains missing/null values.")

    # Determine unique bank_id (e.g. bank_4, bank_5, ...)
    import api.main
    existing_bank_ids = [b["bank_id"] for b in api.main.trainer.banks]
    
    indices = []
    for bid in existing_bank_ids:
        match = re.search(r"bank_(\d+)", bid)
        if match:
            indices.append(int(match.group(1)))
    next_idx = max(indices) + 1 if indices else len(existing_bank_ids)
    bank_id = f"bank_{next_idx}"

    # Save to data/banks/{bank_id}.csv
    save_dir = "data/banks" if os.path.exists("data/banks") else "data"
    os.makedirs(save_dir, exist_ok=True)
    csv_save_path = os.path.join(save_dir, f"{bank_id}.csv")
    df.to_csv(csv_save_path, index=False)

    # Register API key
    api_key = f"vlt_{secrets.token_hex(32)}"
    BANK_REGISTRY[api_key] = {
        "bank_name": name,
        "bank_id": bank_id,
        "tier": payload.tier,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_active": None,
        "active": True,
        "sample_count": len(df),
        "custom_uploaded": True,
    }
    _sync_registered_keys()

    # Add to active trainer dynamically
    trainer_res = api.main.trainer.add_bank_node(bank_id=bank_id, df=df, bank_name=name)

    return {
        "bank_name": name,
        "bank_id": bank_id,
        "api_key": api_key,
        "sample_count": len(df),
        "total_participating_banks": trainer_res["total_banks"],
        "message": f"Bank '{name}' onboarded successfully. It will participate in all subsequent federated rounds starting from round {api.main.trainer.current_round + 1}."
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
                "bank_id": v.get("bank_id"),
                "tier": v.get("tier", "standard"),
                "created_at": v.get("created_at"),
                "last_active": v.get("last_active"),
                "active": v.get("active", True),
                "custom_uploaded": v.get("custom_uploaded", False),
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
