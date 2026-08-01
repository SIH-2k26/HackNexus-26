import numpy as np
from sklearn.metrics import precision_recall_fscore_support, accuracy_score

def oversample_fraud(X, y):
    """
    Duplicates fraud examples locally to resolve class imbalance (~3% fraud).
    Without oversampling, models hit 97% accuracy by always predicting 'not fraud' (0% recall).
    """
    fraud_indices = np.where(y == 1)[0]
    if len(fraud_indices) == 0:
        return X, y
    
    normal_indices = np.where(y == 0)[0]
    target_fraud_count = max(len(fraud_indices), int(len(normal_indices) * 0.4))
    
    repeat_factor = (target_fraud_count // len(fraud_indices)) + 1
    oversampled_fraud_idx = np.tile(fraud_indices, repeat_factor)[:target_fraud_count]
    
    all_indices = np.concatenate([normal_indices, oversampled_fraud_idx])
    np.random.shuffle(all_indices)
    
    return X[all_indices], y[all_indices]

def local_train(model, X_train, y_train, epochs=5):
    """One bank's local training pass: oversamples fraud class and runs partial_fit for N epochs."""
    X_bal, y_bal = oversample_fraud(X_train, y_train)
    for _ in range(epochs):
        model.partial_fit(X_bal, y_bal)
    return model

def evaluate(model, X_test, y_test):
    """Evaluates accuracy, precision, recall, and F1 score."""
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(
        y_test, y_pred, average="binary", zero_division=0
    )
    return {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1": round(float(f1), 4)
    }
