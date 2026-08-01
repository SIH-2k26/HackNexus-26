# PS09 — Privacy-Preserving Fraud Detection API
## Full Proof Document (Team Vortex — HackNexus)

---

## 1. Problem Statement
Create a federated machine learning API allowing banks to collaboratively train fraud detection models without sharing customer transaction databases directly.

---

## 2. Architecture & Modular Breakdown

```
vaultic-api/
├── core/
│   ├── model.py           # MLP architecture (new_model, bootstrap_init)
│   ├── training.py        # local_train, oversample_fraud, evaluate
│   ├── fedavg.py          # Pure algorithm: get_weights, set_weights, average_weights
│   ├── privacy.py         # DP noise, SecAgg masking
│   └── trainer.py         # FederatedTrainer / FlowerStyleCoordinator orchestration
├── api/
│   ├── auth.py            # API key authentication & per-bank registry
│   ├── main.py            # FastAPI app assembly & router mounting
│   └── routes/
│       ├── train.py       # POST /train
│       ├── score.py       # POST /score
│       ├── status.py      # GET /status
│       ├── admin.py       # POST /reset, POST /register
│       └── audit.py       # GET /audit
├── data/
│   ├── generate_data.py   # Synthetic fallback data generator
│   ├── load_paysim.py     # PaySim1 real dataset loader
│   └── banks/             # bank_0.csv ... bank_3.csv
├── frontend/
│   └── dashboard.html     # Live console & visualizer
└── deploy/
    └── render.yaml        # Render deployment configuration
```

---

## 3. Theoretical Foundations

| Concept | Implementation Details |
|---|---|
| **Federated Learning** | 4 simulated banks train local `MLPClassifier` instances on private partitions. |
| **FedAvg** | `W_global = Σ (n_k/N) × W_k` implemented in `core/fedavg.py` weighted by client sample counts. |
| **Differential Privacy** | Calibrated Gaussian noise $\mathcal{N}(0, \sigma/\epsilon)$ injected in `core/privacy.py`. |
| **Secure Aggregation** | Zero-sum masking simulation ($M_i = W_i + R_i$, $\sum M_i - \sum R_i = \sum W_i$). |
| **Class Imbalance Handling** | Minority fraud class oversampling in `core/training.py` ensuring non-zero recall. |

---

## 4. Operational Endpoints

- `POST /train?epsilon=1.0&use_dp=true&simulate_secagg=true`
- `POST /score` (rich transaction schema and legacy feature vector support)
- `GET /status` (live metrics and bank accuracy breakdown)
- `POST /register` (issues unique per-bank API keys)
- `GET /audit` (returns compliance trail records from `audit_log.jsonl`)
- `POST /reset` (resets federated trainer state)
