# Vaultic API — Privacy-Preserving Fraud Detection Platform (PS09)

Vaultic API is a federated learning fraud detection platform designed for collaborative banking fraud detection without raw data sharing.

## Architecture

```
vaultic-api/
├── core/
│   ├── model.py           # MLP architecture (16 -> 8 hidden layers)
│   ├── training.py        # local_train, oversample_fraud, evaluate
│   ├── fedavg.py          # Pure algorithm: get_weights, set_weights, average_weights
│   ├── privacy.py         # add_dp_noise, mask_weights, unmask_and_aggregate
│   └── trainer.py         # FederatedTrainer & FlowerStyleCoordinator
├── api/
│   ├── auth.py            # API key authentication & per-bank key registry
│   ├── main.py            # FastAPI app assembly, CORS, router mounting
│   └── routes/
│       ├── train.py       # POST /train
│       ├── score.py       # POST /score
│       ├── status.py      # GET /status
│       ├── admin.py       # POST /reset, POST /register
│       └── audit.py       # GET /audit
├── data/
│   ├── generate_data.py   # Synthetic data generator
│   ├── load_paysim.py     # PaySim1 real dataset loader
│   └── banks/             # bank_0.csv ... bank_3.csv
├── frontend/
│   └── dashboard.html     # Live console & dashboard
└── deploy/
    └── render.yaml        # Render deployment configuration
```

## Quick Start

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Generate bank datasets:
   ```bash
   python data/generate_data.py
   # or with PaySim1 dataset:
   python data/load_paysim.py
   ```

3. Run federated core self-test:
   ```bash
   python core/trainer.py
   ```

4. Start API backend server:
   ```bash
   uvicorn api.main:app --host 0.0.0.0 --port 8000
   ```

5. Open [frontend/dashboard.html](file:///Users/sarthak/Desktop/Fraud/frontend/dashboard.html) in your browser.
