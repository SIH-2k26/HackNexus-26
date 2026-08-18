import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from core.model import new_model, bootstrap_init
from core.training import local_train, evaluate
from core.fedavg import get_weights, set_weights, average_weights
from core.privacy import add_dp_noise, mask_weights, unmask_and_aggregate
from core.preprocessing import transaction_to_features, extract_risk_reasons

# Columns that are NOT features (drop before building X)
_NON_FEATURE_COLS = {"is_fraud", "transaction_id"}


import re

def load_bank_data(data_dir="data/banks", num_banks=4):
    """Loads private dataset for each bank and creates an 80/20 train/test split.

    Calls transaction_to_features() on every row so that training and inference
    share the identical feature extraction path (core/preprocessing.py).
    Discovers all bank_*.csv files dynamically in data_dir.
    """
    bank_data = []
    # Fallback to "data" if "data/banks" doesn't exist
    target_dir = data_dir if os.path.exists(data_dir) else "data"

    # 1. Discover all candidate bank files in target_dir
    found_files = {}
    if os.path.exists(target_dir):
        for f in os.listdir(target_dir):
            if f.startswith("bank_") and f.endswith(".csv"):
                # Extract index or name
                bank_id = f[:-4]
                file_path = os.path.join(target_dir, f)
                found_files[bank_id] = file_path

    # Ensure baseline 0..(num_banks-1) exist or fall back
    for i in range(num_banks):
        bid = f"bank_{i}"
        if bid not in found_files:
            fallback_path = os.path.join("data", f"bank_{i}.csv")
            if os.path.exists(fallback_path):
                found_files[bid] = fallback_path

    if not found_files:
        raise FileNotFoundError(
            f"Missing bank data at {target_dir}. "
            "Run data/generate_data.py first."
        )

    # Sort bank IDs naturally (bank_0, bank_1, ... bank_10)
    sorted_bank_ids = sorted(
        found_files.keys(),
        key=lambda k: int(re.search(r"\d+", k).group()) if re.search(r"\d+", k) else 9999
    )

    for bank_id in sorted_bank_ids:
        file_path = found_files[bank_id]
        df = pd.read_csv(file_path)
        y = df["is_fraud"].values

        # Build feature matrix via the shared preprocessing function so that
        # training and /score use an identical feature representation.
        feature_cols = [c for c in df.columns if c not in _NON_FEATURE_COLS]
        rows = df[feature_cols].to_dict("records")
        X = np.vstack([transaction_to_features(row) for row in rows])

        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, random_state=42, test_size=0.2, stratify=y
            )
        except Exception:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, random_state=42, test_size=0.2, stratify=None
            )

        bank_data.append({
            "bank_id": bank_id,
            "X_train": X_train,
            "X_test": X_test,
            "y_train": y_train,
            "y_test": y_test,
            "sample_count": len(X_train),
        })
    return bank_data


class FederatedTrainer:
    """
    Orchestrates federated learning rounds across local bank nodes and
    updates the global model.
    """

    def __init__(self, data_dir="data/banks"):
        self.banks = load_bank_data(data_dir=data_dir)
        self.global_model = new_model()
        bootstrap_init(self.global_model)

        # Initialise local bank models with the same starting weights
        initial_weights = get_weights(self.global_model)
        for bank in self.banks:
            bank["model"] = new_model()
            bootstrap_init(bank["model"])
            set_weights(bank["model"], initial_weights)

        self.current_round = 0
        self.history = []

    def add_bank_node(self, bank_id: str, df: pd.DataFrame, bank_name: str = None) -> dict:
        """Dynamically onboards a new bank dataset to the active federation.
        
        The new bank initializes its local model with the current global model weights
        and seamlessly participates in all subsequent rounds starting from the next round.
        """
        y = df["is_fraud"].values
        feature_cols = [c for c in df.columns if c not in _NON_FEATURE_COLS]
        rows = df[feature_cols].to_dict("records")
        X = np.vstack([transaction_to_features(row) for row in rows])

        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, random_state=42, test_size=0.2, stratify=y
            )
        except Exception:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, random_state=42, test_size=0.2, stratify=None
            )

        # Initialize local bank model with current global model weights
        model = new_model()
        bootstrap_init(model)
        set_weights(model, get_weights(self.global_model))

        bank_entry = {
            "bank_id": bank_id,
            "bank_name": bank_name or bank_id,
            "X_train": X_train,
            "X_test": X_test,
            "y_train": y_train,
            "y_test": y_test,
            "sample_count": len(X_train),
            "model": model,
        }

        # Check if already exists (replace) or append
        existing_idx = next((i for i, b in enumerate(self.banks) if b["bank_id"] == bank_id), None)
        if existing_idx is not None:
            self.banks[existing_idx] = bank_entry
        else:
            self.banks.append(bank_entry)

        return {
            "bank_id": bank_id,
            "bank_name": bank_name or bank_id,
            "sample_count": len(X_train),
            "total_banks": len(self.banks),
        }

    def run_round(
        self,
        use_differential_privacy: bool = True,
        epsilon: float = 1.0,
        simulate_secure_aggregation: bool = False,
    ):
        """Executes one complete federated training round with DP & SecAgg simulation."""
        self.current_round += 1
        client_weights = []
        sample_counts = []
        per_bank_metrics = {}

        # Step 1 — Local training on each bank's private data
        global_w = get_weights(self.global_model)
        for bank in self.banks:
            set_weights(bank["model"], global_w)
            local_train(bank["model"], bank["X_train"], bank["y_train"], epochs=5)

            w = get_weights(bank["model"])
            if use_differential_privacy:
                w = add_dp_noise(w, epsilon=epsilon)

            client_weights.append(w)
            sample_counts.append(bank["sample_count"])

            metrics = evaluate(bank["model"], bank["X_test"], bank["y_test"])
            per_bank_metrics[bank["bank_id"]] = metrics

        # Step 2 — Aggregation (FedAvg or SecAgg Simulation)
        secagg_demo = None
        if simulate_secure_aggregation:
            masked_weights_list, masks_list = [], []
            for w in client_weights:
                mw, mask = mask_weights(w)
                masked_weights_list.append(mw)
                masks_list.append(mask)

            aggregated_w = unmask_and_aggregate(masked_weights_list, masks_list, sample_counts)

            standard_w = average_weights(client_weights, sample_counts)
            delta = float(sum(np.sum(np.abs(a - b)) for a, b in zip(aggregated_w, standard_w)))

            secagg_demo = {
                "enabled": True,
                "num_clients_masked": len(client_weights),
                "mask_cancellation_delta": round(delta, 12),
                "status": "VERIFIED_EXACT" if delta < 1e-9 else "APPROXIMATE",
            }
        else:
            aggregated_w = average_weights(client_weights, sample_counts)

        # Step 3 — Update global model & evaluate across combined test set
        set_weights(self.global_model, aggregated_w)

        all_X_test = np.vstack([b["X_test"] for b in self.banks])
        all_y_test = np.concatenate([b["y_test"] for b in self.banks])
        global_metrics = evaluate(self.global_model, all_X_test, all_y_test)

        total_samples = sum(sample_counts)
        contribution_weights = {
            bank["bank_id"]: round(bank["sample_count"] / total_samples, 4)
            for bank in self.banks
        }

        round_data = {
            "round": self.current_round,
            "global_metrics": global_metrics,
            "per_bank_accuracy": {b_id: m["accuracy"] for b_id, m in per_bank_metrics.items()},
            "per_bank_metrics": per_bank_metrics,
            "per_bank_contribution": contribution_weights,
            "aggregation_method": "FedAvg + SecAgg Simulation" if simulate_secure_aggregation else "FedAvg",
            "dp_info": {
                "enabled": use_differential_privacy,
                "epsilon": float(epsilon) if use_differential_privacy else None,
            },
            "secagg_demo": secagg_demo,
        }
        self.history.append(round_data)
        return round_data

    def predict(self, features):
        """Scores a feature vector (list or ndarray) using the current global model."""
        X = np.array(features, dtype=np.float64).reshape(1, -1)
        prob = float(self.global_model.predict_proba(X)[0][1])
        return {
            "is_fraud": bool(prob > 0.5),
            "fraud_probability": round(prob, 4),
        }

    def predict_rich(self, tx_dict):
        """
        Converts a rich transaction dict into a scored prediction + risk assessment.

        Uses core/preprocessing.transaction_to_features() — the SAME function
        used during training — so training and inference are always aligned.
        """
        features = transaction_to_features(tx_dict)
        base_pred = self.predict(features)
        prob = base_pred["fraud_probability"]

        risk_score = round(prob, 2)
        if risk_score < 0.3:
            risk_label = "LOW"
        elif risk_score <= 0.7:
            risk_label = "MEDIUM"
        else:
            risk_label = "HIGH"

        recommendation = "FLAG" if risk_score > 0.5 else "ALLOW"

        # Reasons reuse the same field-parsing logic as the feature extractor
        reasons = extract_risk_reasons(tx_dict)
        if not reasons:
            if risk_score > 0.5:
                reasons.append("Elevated model risk score — review recommended")
            else:
                reasons.append("Normal transaction parameters verified across bank models")

        return {
            "risk_score": risk_score,
            "risk_label": risk_label,
            "recommendation": recommendation,
            "reason": "; ".join(reasons),
        }


class FlowerStyleCoordinator(FederatedTrainer):
    """
    FlowerStyleCoordinator — implements the same client-server FedAvg pattern
    Flower provides, hand-rolled in plain scikit-learn/numpy so the aggregation
    math in average_weights() stays fully inspectable during demo, rather than
    hidden inside Flower's internals.
    """
    pass


if __name__ == "__main__":
    coordinator = FlowerStyleCoordinator()
    print("=== Vaultic Modular Core: Starting 10 Federated Training Rounds ===")
    for r in range(1, 11):
        res = coordinator.run_round(use_differential_privacy=True, epsilon=1.0)
        g = res["global_metrics"]
        print(
            f"Round {r:2d} | Accuracy: {g['accuracy']:.4f} | "
            f"Precision: {g['precision']:.4f} | Recall: {g['recall']:.4f} | "
            f"F1: {g['f1']:.4f}"
        )
