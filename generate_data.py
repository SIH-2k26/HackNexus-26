import os
import numpy as np
import pandas as pd

def generate_bank_datasets(output_dir="data", seed=42):
    np.random.seed(seed)
    os.makedirs(output_dir, exist_ok=True)
    
    # 4 simulated banks with non-uniform sample sizes
    bank_sample_counts = [500, 750, 300, 450]
    feature_names = [f"feature_{i}" for i in range(10)]
    
    for i, num_samples in enumerate(bank_sample_counts):
        # Generate ~3% fraud (label 1) and 97% normal (label 0)
        num_fraud = int(num_samples * 0.03)
        num_normal = num_samples - num_fraud
        
        # Normal transactions centered around 0 with low variance
        X_normal = np.random.normal(loc=0.0, scale=1.0, size=(num_normal, 10))
        y_normal = np.zeros(num_normal, dtype=int)
        
        # Fraud transactions shifted with higher variance in certain key features
        X_fraud = np.random.normal(loc=1.8, scale=1.5, size=(num_fraud, 10))
        # Make specific features extra indicative of fraud
        X_fraud[:, 0] += 1.5 # high amount indicator
        X_fraud[:, 4] += 2.0 # high velocity indicator
        y_fraud = np.ones(num_fraud, dtype=int)
        
        X = np.vstack([X_normal, X_fraud])
        y = np.concatenate([y_normal, y_fraud])
        
        # Shuffle dataset locally
        indices = np.arange(len(y))
        np.random.shuffle(indices)
        X, y = X[indices], y[indices]
        
        df = pd.DataFrame(X, columns=feature_names)
        df["is_fraud"] = y
        
        file_path = os.path.join(output_dir, f"bank_{i}.csv")
        df.to_csv(file_path, index=False)
        print(f"Generated {file_path}: {len(df)} rows ({num_fraud} fraud, {num_normal} normal)")

if __name__ == "__main__":
    generate_bank_datasets()
