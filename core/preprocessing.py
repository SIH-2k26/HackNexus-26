"""
core/preprocessing.py — Vaultic shared feature extraction module.

This is the SINGLE source of truth for converting a transaction (whether
loaded from a training CSV row or received as a JSON /score payload) into
a fixed-length numeric feature vector for the MLP model.

Feature vector — 10 dimensions (matches MLPClassifier input & bootstrap_init):
  [0]  norm_amount             log1p(amount) / 12.0
  [1]  norm_hour               hour / 23.0
  [2]  tx_type_code            UPI=0 IMPS=1 NEFT=2 RTGS=3, divided by 3.0
  [3]  norm_sender_age         log1p(sender_account_age_days) / 8.0
  [4]  norm_receiver_age       log1p(receiver_account_age_days) / 8.0
  [5]  norm_sender_velocity    sender_tx_count_24h / 40.0
  [6]  norm_receiver_fans      receiver_unique_senders_24h / 60.0
  [7]  device_changed          0.0 or 1.0
  [8]  location_changed        0.0 or 1.0
  [9]  norm_failed_logins      failed_login_attempts / 5.0
"""

from typing import List

import numpy as np

_TX_TYPE_MAP = {"UPI": 0.0, "IMPS": 1.0, "NEFT": 2.0, "RTGS": 3.0}
_FEATURE_DIM = 10


def _parse_hour(timestamp_str: str) -> int:
    """Extract hour from ISO timestamp string (e.g. '2024-03-15T03:22:00Z')."""
    try:
        ts = str(timestamp_str)
        if "T" in ts:
            return int(ts.split("T")[1].split(":")[0])
    except Exception:
        pass
    return 12  # safe default: noon


def _coerce_bool(val) -> float:
    """Coerce various bool representations to 0.0 / 1.0."""
    if isinstance(val, bool):
        return 1.0 if val else 0.0
    if isinstance(val, (int, float)):
        return 1.0 if val else 0.0
    if isinstance(val, str):
        return 1.0 if val.strip().lower() in ("true", "1", "yes") else 0.0
    return 0.0


def transaction_to_features(tx: dict) -> np.ndarray:
    """
    Convert a transaction dict into a 10-float numpy feature vector.

    Accepts both a CSV-loaded row dict (e.g. from pd.DataFrame.to_dict('records'))
    and a JSON /score API payload dict — the field names are identical in both cases.

    Parameters
    ----------
    tx : dict
        Must contain keys: timestamp, amount, transaction_type,
        sender_account_age_days, receiver_account_age_days,
        sender_tx_count_24h, receiver_unique_senders_24h,
        device_changed, location_changed, failed_login_attempts.

    Returns
    -------
    np.ndarray, shape (10,), dtype float64
    """
    amount = float(tx.get("amount", 0.0))
    hour = _parse_hour(tx.get("timestamp", ""))
    tx_type = str(tx.get("transaction_type", "UPI")).upper().strip()
    sender_age = float(tx.get("sender_account_age_days", 365))
    receiver_age = float(tx.get("receiver_account_age_days", 365))
    sender_vel = float(tx.get("sender_tx_count_24h", 0))
    receiver_fans = float(tx.get("receiver_unique_senders_24h", 0))
    device_chg = _coerce_bool(tx.get("device_changed", False))
    location_chg = _coerce_bool(tx.get("location_changed", False))
    failed_logins = float(tx.get("failed_login_attempts", 0))

    features = np.array([
        np.log1p(max(0.0, amount)) / 12.0,          # [0] amount (log-scaled)
        hour / 23.0,                                  # [1] hour of day
        _TX_TYPE_MAP.get(tx_type, 0.0) / 3.0,        # [2] transaction type ordinal
        np.log1p(max(0.0, sender_age)) / 8.0,        # [3] sender account age
        np.log1p(max(0.0, receiver_age)) / 8.0,      # [4] receiver account age
        min(sender_vel, 40.0) / 40.0,                # [5] sender tx velocity
        min(receiver_fans, 60.0) / 60.0,             # [6] receiver unique senders
        device_chg,                                   # [7] device change flag
        location_chg,                                 # [8] location change flag
        min(failed_logins, 5.0) / 5.0,               # [9] failed login attempts
    ], dtype=np.float64)

    return features


def extract_risk_reasons(tx: dict) -> List[str]:
    """
    Return a list of human-readable fraud-signal strings derived from the same
    parsed values that went into transaction_to_features().  Used by /score to
    build the reason field without re-implementing field extraction separately.
    """
    reasons = []
    amount = float(tx.get("amount", 0.0))
    hour = _parse_hour(tx.get("timestamp", ""))
    sender_age = int(tx.get("sender_account_age_days", 365))
    device_chg = _coerce_bool(tx.get("device_changed", False))
    sender_vel = int(tx.get("sender_tx_count_24h", 0))
    receiver_fans = int(tx.get("receiver_unique_senders_24h", 0))

    if amount > 30_000:
        reasons.append(f"Amount exceeds ₹30,000 (₹{amount:,.0f})")
    if hour in (2, 3, 4):
        reasons.append(f"Off-hours transaction ({hour:02d}:00)")
    if sender_age < 5:
        reasons.append(f"New sender account ({sender_age} days old)")
    if device_chg:
        reasons.append("Device change detected")
    if sender_vel > 15:
        reasons.append(f"{sender_vel} transactions in last 24h")
    if receiver_fans > 20:
        reasons.append(f"Receiver linked to {receiver_fans} senders in 24h")

    return reasons
