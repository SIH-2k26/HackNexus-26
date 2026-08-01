"""
data/generate_data.py — Vaultic synthetic bank dataset generator (v2).

Produces 4 bank CSVs with realistic transaction columns and GENUINELY
non-IID fraud patterns per bank.  Each bank is weighted toward a DIFFERENT
dominant fraud pattern so that federated learning actually benefits from
combining local knowledge.

Columns:
    transaction_id, timestamp, amount, transaction_type,
    sender_account_age_days, receiver_account_age_days,
    sender_tx_count_24h, receiver_unique_senders_24h,
    device_changed, location_changed, failed_login_attempts,
    is_fraud
"""

from __future__ import annotations

import os
import random
from datetime import datetime, timedelta
from typing import Optional

import numpy as np
import pandas as pd

# ── Fraud patterns ────────────────────────────────────────────────────────────
# Each helper returns True when the transaction matches that pattern.

def _is_off_hours_high_amount(row):
    """Pattern 1 (SBI / bank_0 dominant): large amount during night hours."""
    return row["amount"] > 30_000 and row["_hour"] in (2, 3, 4)

def _is_velocity_attack(row):
    """Pattern 2 (HDFC / bank_1 dominant): abnormally high sender velocity."""
    return row["sender_tx_count_24h"] > 15

def _is_new_account_device_change(row):
    """Pattern 3 (ICICI / bank_2 dominant): fresh account + device switch."""
    return row["sender_account_age_days"] < 5 and row["device_changed"]

def _is_mule(row):
    """Pattern 4 (Axis / bank_3 dominant): receiver aggregating many senders."""
    return row["receiver_unique_senders_24h"] > 20


# ── Per-bank pattern weights ──────────────────────────────────────────────────
# (off_hours_amount, velocity, new_account_device, mule) — must sum to 1.
BANK_PATTERN_WEIGHTS = {
    0: (0.50, 0.25, 0.15, 0.10),   # SBI:  velocity + off-hours dominant
    1: (0.10, 0.25, 0.55, 0.10),   # HDFC: device-change + new-account dominant
    2: (0.60, 0.10, 0.15, 0.15),   # ICICI: amount-threshold dominant
    3: (0.10, 0.15, 0.10, 0.65),   # Axis: mule-pattern dominant
}

BANK_ROW_COUNTS = {0: 2000, 1: 3000, 2: 2200, 3: 2800}
TX_TYPES = ["UPI", "IMPS", "NEFT", "RTGS"]
FRAUD_RATE = 0.03


def _random_timestamp(rng: np.random.Generator, hour: Optional[int] = None) -> str:
    base = datetime(2024, 1, 1) + timedelta(days=int(rng.integers(0, 365)))
    h = hour if hour is not None else int(rng.integers(0, 24))
    m = int(rng.integers(0, 60))
    return (base + timedelta(hours=h, minutes=m)).isoformat() + "Z"


def _generate_normal_tx(rng: np.random.Generator, tx_id: int) -> dict:
    """Generate a plausibly normal (non-fraud) transaction."""
    hour = int(rng.integers(6, 23))   # business hours
    return {
        "transaction_id": f"TXN_{tx_id:06d}",
        "timestamp": _random_timestamp(rng, hour),
        "amount": float(np.round(rng.lognormal(mean=8.5, sigma=1.2), 2)),   # ~₹5k median
        "transaction_type": rng.choice(TX_TYPES),
        "sender_account_age_days": int(rng.integers(30, 3650)),
        "receiver_account_age_days": int(rng.integers(30, 3650)),
        "sender_tx_count_24h": int(rng.integers(0, 8)),
        "receiver_unique_senders_24h": int(rng.integers(1, 10)),
        "device_changed": bool(rng.random() < 0.05),
        "location_changed": bool(rng.random() < 0.10),
        "failed_login_attempts": int(rng.integers(0, 2)),
        "_hour": hour,
        "is_fraud": 0,
    }


def _inject_fraud_pattern(row: dict, pattern: int, rng: np.random.Generator) -> dict:
    """Override specific fields to make this row match a fraud pattern."""
    row["is_fraud"] = 1
    if pattern == 0:   # off-hours + high amount
        row["amount"] = float(np.round(rng.uniform(30_001, 200_000), 2))
        hour = int(rng.choice([2, 3, 4]))
        row["_hour"] = hour
        row["timestamp"] = _random_timestamp(rng, hour)
    elif pattern == 1:  # velocity attack
        row["sender_tx_count_24h"] = int(rng.integers(16, 40))
    elif pattern == 2:  # new account + device change
        row["sender_account_age_days"] = int(rng.integers(0, 5))
        row["device_changed"] = True
    elif pattern == 3:  # mule
        row["receiver_unique_senders_24h"] = int(rng.integers(21, 60))
    return row


def generate_bank_datasets(output_dir: str = "data/banks", seed: int = 42):
    rng = np.random.default_rng(seed)
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs("data", exist_ok=True)

    for bank_id, num_rows in BANK_ROW_COUNTS.items():
        pattern_weights = BANK_PATTERN_WEIGHTS[bank_id]
        num_fraud = max(1, int(num_rows * FRAUD_RATE))
        num_normal = num_rows - num_fraud

        rows = []
        tx_counter = bank_id * 100_000   # unique ID space per bank

        # Normal transactions
        for _ in range(num_normal):
            tx_counter += 1
            rows.append(_generate_normal_tx(rng, tx_counter))

        # Fraud transactions — pick pattern by bank weight
        for _ in range(num_fraud):
            tx_counter += 1
            base_row = _generate_normal_tx(rng, tx_counter)
            pattern = int(rng.choice([0, 1, 2, 3], p=pattern_weights))
            rows.append(_inject_fraud_pattern(base_row, pattern, rng))

        # Shuffle
        rng.shuffle(rows)

        df = pd.DataFrame(rows)
        fraud_count = int(df["is_fraud"].sum())
        fraud_rate = fraud_count / len(df) * 100

        # Drop internal helper column before saving
        df = df.drop(columns=["_hour"])

        file_path = os.path.join(output_dir, f"bank_{bank_id}.csv")
        df.to_csv(file_path, index=False)
        # Backward-compat flat copy
        df.to_csv(os.path.join("data", f"bank_{bank_id}.csv"), index=False)
        print(
            f"Generated bank_{bank_id}: {len(df)} rows  "
            f"| fraud={fraud_count} ({fraud_rate:.1f}%)"
        )


if __name__ == "__main__":
    generate_bank_datasets()
