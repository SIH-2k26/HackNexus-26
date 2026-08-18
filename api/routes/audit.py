import os
import json
from fastapi import APIRouter, Depends
from api.auth import verify_admin_key

router = APIRouter()
AUDIT_LOG_FILE = "audit_log.jsonl"
AUTH_FAILURES_LOG = "auth_failures.jsonl"

@router.get("/audit", dependencies=[Depends(verify_admin_key)])
def get_audit_trail():
    """Admin-only: Returns last 20 audit trail entries."""
    if not os.path.exists(AUDIT_LOG_FILE):
        return {"total_logs": 0, "logs": []}
    logs = []
    with open(AUDIT_LOG_FILE, "r") as f:
        for line in f:
            if line.strip():
                try:
                    logs.append(json.loads(line))
                except Exception:
                    pass
    return {"total_logs": len(logs), "logs": logs[-20:]}

@router.get("/admin/auth-failures", dependencies=[Depends(verify_admin_key)])
def get_auth_failures():
    """Admin-only: Returns last 20 failed authentication attempts."""
    if not os.path.exists(AUTH_FAILURES_LOG):
        return {"total_failures": 0, "failures": []}
    failures = []
    with open(AUTH_FAILURES_LOG, "r") as f:
        for line in f:
            if line.strip():
                try:
                    failures.append(json.loads(line))
                except Exception:
                    pass
    return {"total_failures": len(failures), "failures": failures[-20:]}
