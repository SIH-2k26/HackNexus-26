import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, Request
from api.auth import verify_admin_key, BANK_REGISTRY, FRAUD_API_KEY

router = APIRouter()
AUDIT_LOG_FILE = "audit_log.jsonl"

def append_audit_entry(round_result: dict, key_used: str):
    """Appends compliance record to audit_log.jsonl, including bank identity."""
    from api.auth import FRAUD_API_KEY
    if key_used == FRAUD_API_KEY:
        bank_name = "Admin / Dashboard"
        bank_key_prefix = "admin"
    elif key_used in BANK_REGISTRY:
        bank_name = BANK_REGISTRY[key_used]["bank_name"]
        bank_key_prefix = key_used[:8]
    else:
        bank_name = "Unknown"
        bank_key_prefix = key_used[:8] if key_used else "MISSING"

    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "round": round_result.get("round"),
        "triggered_by": bank_name,
        "triggered_by_key_prefix": bank_key_prefix,
        "participating_banks": list(round_result.get("per_bank_accuracy", {}).keys()),
        "global_metrics": round_result.get("global_metrics"),
        "dp_info": round_result.get("dp_info"),
        "aggregation_method": round_result.get("aggregation_method"),
        "secagg_demo": round_result.get("secagg_demo"),
    }
    with open(AUDIT_LOG_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")

@router.post("/train")
def run_train_round(
    request: Request,
    epsilon: float = Query(1.0, description="Differential privacy noise parameter"),
    use_dp: bool = Query(True, description="Enable differential privacy noise injection"),
    simulate_secagg: bool = Query(False, description="Enable Secure Aggregation simulation"),
    key_used: str = Depends(verify_admin_key),
):
    """Runs one federated learning round (local bank training -> FedAvg/SecAgg -> global evaluation)."""
    from api.main import trainer
    round_result = trainer.run_round(
        use_differential_privacy=use_dp,
        epsilon=epsilon,
        simulate_secure_aggregation=simulate_secagg,
    )
    append_audit_entry(round_result, key_used)
    return round_result
