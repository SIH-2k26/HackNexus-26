import numpy as np
from sklearn.neural_network import MLPClassifier

def new_model():
    """Defines the shared MLP neural network architecture (16 -> 8 hidden layers)."""
    return MLPClassifier(
        hidden_layer_sizes=(16, 8),
        activation="relu",
        solver="adam",
        max_iter=1,
        random_state=42,
        warm_start=True
    )

def bootstrap_init(model):
    """Workaround so sklearn's partial_fit recognizes both classes (0 and 1) before training starts."""
    dummy_X = np.zeros((2, 10))
    dummy_y = np.array([0, 1])
    model.partial_fit(dummy_X, dummy_y, classes=np.array([0, 1]))
