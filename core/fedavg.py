import numpy as np

def get_weights(model):
    """Extracts model weights (coefs_ and intercepts_) as a flat list of numpy arrays."""
    weights = []
    for c in model.coefs_:
        weights.append(np.copy(c))
    for b in model.intercepts_:
        weights.append(np.copy(b))
    return weights

def set_weights(model, weights):
    """Injects aggregated weights into an MLPClassifier model."""
    num_layers = len(model.coefs_)
    for i in range(num_layers):
        model.coefs_[i] = np.copy(weights[i])
        model.intercepts_[i] = np.copy(weights[num_layers + i])

def average_weights(weights_list, sample_counts):
    """
    FedAvg Algorithm: computes sample-weighted average of all client weight vectors.
    W_global = sum( (n_k / N) * W_k )
    """
    total_samples = sum(sample_counts)
    num_weight_arrays = len(weights_list[0])
    aggregated = []
    
    for layer_idx in range(num_weight_arrays):
        layer_sum = np.zeros_like(weights_list[0][layer_idx], dtype=np.float64)
        for client_idx, client_weights in enumerate(weights_list):
            weight_factor = sample_counts[client_idx] / total_samples
            layer_sum += client_weights[layer_idx] * weight_factor
        aggregated.append(layer_sum)
        
    return aggregated
