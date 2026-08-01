import os
import argparse
import numpy as np
import pandas as pd

def process_paysim_dataframe(df):
    """
    Selects, engineers, and normalizes key PaySim features into 10 numeric columns + is_fraud label.
    PaySim columns: step, type, amount, nameOrig, oldbalanceOrg, newbalanceOrig, nameDest, oldbalanceDest, newbalanceDest, isFraud, isFlaggedFraud
    """
    target_col = "isFraud" if "isFraud" in df.columns else "is_fraud"
    if target_col not in df.columns:
        raise ValueError(f"Target column 'isFraud' or 'is_fraud' missing from DataFrame.")
        
    y = df[target_col].values.astype(int)
    
    # 1. Normalized Amount (log scale)
    amount = df["amount"].values if "amount" in df.columns else np.zeros(len(df))
    norm_amount = (np.log1p(np.maximum(0, amount)) - 7.0) / 3.0
    
    # 2. Balance features
    old_orig = df["oldbalanceOrg"].values if "oldbalanceOrg" in df.columns else np.zeros(len(df))
    new_orig = df["newbalanceOrig"].values if "newbalanceOrig" in df.columns else np.zeros(len(df))
    old_dest = df["oldbalanceDest"].values if "oldbalanceDest" in df.columns else np.zeros(len(df))
    new_dest = df["newbalanceDest"].values if "newbalanceDest" in df.columns else np.zeros(len(df))
    
    norm_old_orig = np.log1p(np.maximum(0, old_orig)) / 10.0
    norm_new_orig = np.log1p(np.maximum(0, new_orig)) / 10.0
    norm_old_dest = np.log1p(np.maximum(0, old_dest)) / 10.0
    norm_new_dest = np.log1p(np.maximum(0, new_dest)) / 10.0
    
    # 3. Transaction Type One-Hot / Encoding
    tx_types = df["type"].values if "type" in df.columns else np.array(["TRANSFER"] * len(df))
    is_transfer = (tx_types == "TRANSFER").astype(float)
    is_cash_out = (tx_types == "CASH_OUT").astype(float)
    is_payment = (tx_types == "PAYMENT").astype(float)
    
    # 4. Balance discrepancy indicators (classic fraud signals in PaySim)
    orig_diff = (old_orig - amount - new_orig) / 10000.0
    dest_diff = (old_dest + amount - new_dest) / 10000.0
    
    X = np.column_stack([
        norm_amount,
        is_transfer,
        is_cash_out,
        is_payment,
        norm_old_orig,
        norm_new_orig,
        norm_old_dest,
        norm_new_dest,
        orig_diff,
        dest_diff
    ])
    
    feature_names = [f"feature_{i}" for i in range(10)]
    processed_df = pd.DataFrame(X, columns=feature_names)
    processed_df["is_fraud"] = y
    return processed_df

def generate_sample_paysim(num_samples=2000):
    """Generates synthetic PaySim-structured dataset for fallback demonstration."""
    np.random.seed(42)
    types = np.random.choice(["TRANSFER", "CASH_OUT", "PAYMENT", "DEPOSIT"], size=num_samples, p=[0.3, 0.4, 0.2, 0.1])
    amounts = np.random.exponential(scale=20000, size=num_samples)
    old_orig = amounts + np.random.exponential(scale=50000, size=num_samples)
    new_orig = old_orig - amounts
    old_dest = np.random.exponential(scale=30000, size=num_samples)
    new_dest = old_dest + amounts
    
    # Inject fraud condition (~3% fraud)
    is_fraud = np.zeros(num_samples, dtype=int)
    fraud_idx = np.random.choice(num_samples, size=int(num_samples * 0.03), replace=False)
    is_fraud[fraud_idx] = 1
    # Fraud transactions drain origin balance to 0
    new_orig[fraud_idx] = 0.0
    amounts[fraud_idx] *= 2.5
    
    df = pd.DataFrame({
        "step": np.random.randint(1, 100, size=num_samples),
        "type": types,
        "amount": amounts,
        "nameOrig": [f"C{i:07d}" for i in range(num_samples)],
        "oldbalanceOrg": old_orig,
        "newbalanceOrig": new_orig,
        "nameDest": [f"M{i:07d}" for i in range(num_samples)],
        "oldbalanceDest": old_dest,
        "newbalanceDest": new_dest,
        "isFraud": is_fraud,
        "isFlaggedFraud": np.zeros(num_samples, dtype=int)
    })
    return df

def load_and_partition_paysim(csv_path=None, output_dir="data"):
    """Loads PaySim1 CSV file, processes features, and splits into data/bank_N.csv files."""
    os.makedirs(output_dir, exist_ok=True)
    if csv_path and os.path.exists(csv_path):
        print(f"Loading PaySim1 dataset from: {csv_path}")
        raw_df = pd.read_csv(csv_path)
    else:
        print("No PaySim CSV provided or file not found. Generating sample PaySim structure dataset...")
        raw_df = generate_sample_paysim()
        
    processed_df = process_paysim_dataframe(raw_df)
    
    # Shuffle
    processed_df = processed_df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    # Partition across 4 simulated banks
    total_len = len(processed_df)
    splits = [0, int(total_len * 0.25), int(total_len * 0.55), int(total_len * 0.80), total_len]
    
    for i in range(4):
        bank_sub = processed_df.iloc[splits[i]:splits[i+1]]
        out_file = os.path.join(output_dir, f"bank_{i}.csv")
        bank_sub.to_csv(out_file, index=False)
        fraud_count = bank_sub["is_fraud"].sum()
        print(f"Exported {out_file}: {len(bank_sub)} rows ({fraud_count} fraud)")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PaySim1 Dataset Partitioning Tool")
    parser.add_argument("--csv", type=str, default=None, help="Path to PaySim1 CSV file")
    args = parser.parse_args()
    
    load_and_partition_paysim(csv_path=args.csv)
