import numpy as np

def add_dp_noise(weights, epsilon=1.0):
    """
    Task 2: Adds calibrated Gaussian noise to each client's weights for Differential Privacy protection.
    Noise scale is inversely proportional to epsilon.
    """
    if epsilon <= 0:
        return weights
    noisy_weights = []
    sigma = 0.01 / max(0.01, float(epsilon))
    for layer in weights:
        noise = np.random.normal(loc=0.0, scale=sigma, size=layer.shape)
        noisy_weights.append(layer + noise)
    return noisy_weights

def mask_weights(weights):
    """
    Task 3: Generates a random mask R_i per client, computes M_i = W_i + R_i.
    Returns (masked_weights, mask).
    """
    masked_weights = []
    masks = []
    for layer in weights:
        R_i = np.random.normal(loc=0.0, scale=0.5, size=layer.shape)
        M_i = layer + R_i
        masked_weights.append(M_i)
        masks.append(R_i)
    return masked_weights, masks

def unmask_and_aggregate(masked_weights_list, masks_list, sample_counts):
    """
    Task 3: Demonstrates Secure Aggregation math:
    Sum( (n_k/N) * M_k ) - Sum( (n_k/N) * R_k ) = Sum( (n_k/N) * W_k )
    The client masks cancel out exactly on aggregation.
    """
    total_samples = sum(sample_counts)
    num_layers = len(masked_weights_list[0])
    unmasked_aggregated = []
    
    for layer_idx in range(num_layers):
        masked_sum = np.zeros_like(masked_weights_list[0][layer_idx], dtype=np.float64)
        mask_sum = np.zeros_like(masks_list[0][layer_idx], dtype=np.float64)
        
        for client_idx in range(len(masked_weights_list)):
            weight_factor = sample_counts[client_idx] / total_samples
            masked_sum += masked_weights_list[client_idx][layer_idx] * weight_factor
            mask_sum += masks_list[client_idx][layer_idx] * weight_factor
            
        unmasked_layer = masked_sum - mask_sum
        unmasked_aggregated.append(unmasked_layer)
        
    return unmasked_aggregated
