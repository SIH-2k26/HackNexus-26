# PS09 — Privacy-Preserving Fraud Detection API
## Full Proof Document (Team Vortex — HackNexus)

*This document fills every section of the official PS09 documentation structure using the working, tested implementation built for this project.*

---

## Problem Statement

Create a federated machine learning API allowing banks to collaboratively train fraud detection models without sharing customer transaction databases directly.

Fraud rings deliberately split transactions across multiple banks so no single institution's system flags anything unusual. Regulations (RBI data localization, GDPR, banking secrecy laws) and competitive/liability concerns prevent direct data sharing. This project builds a working federated learning system where banks jointly train one shared fraud-detection model — only the *learning* travels between banks, never the data.

---

## Theoretical Foundations — As Implemented

| Concept (from official doc) | How this project implements it |
|---|---|
| **Federated Learning** | 4 simulated banks each train a local `MLPClassifier` on only their own partition of data |
| **Federated Averaging (FedAvg)** | `W_global = Σ (n_k/N) × W_k` — implemented exactly as specified in `average_weights()`, weighted by each bank's sample count |
| **Distributed Machine Learning** | Training happens per-bank, independently, before combination — computation occurs where the data resides |
| **Binary Classification for Fraud Detection** | MLP with sigmoid output — fraud (1) vs. not-fraud (0) |
| **Privacy-Preserving ML** | Only `model.coefs_` / `model.intercepts_` (plain numbers) are ever transmitted — never a transaction row |
| **RESTful API Architecture** | FastAPI with `/train`, `/score`, `/status`, `/reset` — proper HTTP verbs (GET for status, POST for actions) |
| **Client–Server Communication** | Dashboard (client) ↔ FastAPI (server) via JSON over HTTPS-ready endpoints |
| **Statistical Learning Theory (ERM/SRM)** | sklearn's MLPClassifier trains via Empirical Risk Minimization by default, minimizing average Binary Cross-Entropy Loss `L = -[y*log(ŷ) + (1-y)*log(1-ŷ)]` across each bank's local batch each epoch. Structural Risk Minimization (avoiding overfitting) is handled via the small fixed architecture (16→8 neurons) and capped local epochs (5) rather than explicit regularization — a deliberate simplicity tradeoff, noted in Known Limitations. |
| **Anomaly Detection** | Fraud treated as the rare/anomalous class (~3% of data), evaluated via recall specifically |
| **Banking Regulations & Privacy Compliance** | Structural compliance with RBI data localization intent — raw data never leaves each bank's local environment |

---

## Literature Review — Extended With Our Findings

| System | Target Users | Technology | Limitations | Confirms |
|---|---|---|---|---|
| Rule-Based Banking Systems | Small & local banks | Static rules | Can't adapt to new fraud, high false positives | Matches our finding: cooperative/rural banks still on legacy rules |
| HDFC/ICICI Internal AI | Large banks | Centralized ML | Works only within one bank, not shared | Confirms the "visibility ceiling" problem this project solves |
| **Feedzai** | Enterprise banks | AI, behavioral analytics, network intelligence | High cost, enterprise-focused | Validates the concept at scale, but confirms cost/access barrier |
| IBM Federated Learning | Enterprises | FL framework | Requires significant customization | General-purpose framework, not fraud-specific |
| **Project AIKYA** | Research consortium | FL + Differential Privacy | Proof-of-concept | Tier-1 validation that concept works |
| NVIDIA FLARE | Enterprises/research | FL framework | General-purpose | Same access gap as IBM's framework |
| **This project** | Small banks, NBFCs | Lightweight FedAvg, FastAPI, live dashboard | Proof of concept | Targets the research gap directly |

---

## System Design & Architecture

```
  Bank-Client -> REST API Server (FastAPI) -> Auth & Validation
  -> Flower-Style Federated Learning Server -> FedAvg + Secure Aggregation Simulation
  -> Fraud Detection Model -> JSON Response -> Bank-Client
```

---

## Implementation Details

| Layer | Technology | File |
|---|---|---|
| Data generation/partitioning | pandas, numpy | `generate_data.py` |
| FL core (local train + FedAvg) | scikit-learn | `fl_core.py` |
| API | FastAPI + Uvicorn | `api/main.py` |
| Auth | Custom API-key header check | `api/main.py` |
| Frontend | HTML/CSS/JS + Chart.js | `dashboard.html` |
| Deployment config | Render | `render.yaml` |

---

## Challenges & Limitations

| Category | Gap | Note |
|---|---|---|
| **Framework** | Official docs specify Flower (FLWR) as the FL orchestration layer; current build hand-rolls FedAvg in scikit-learn/numpy instead | Deliberate choice: keeps `average_weights()` fully auditable/inspectable on-screen for judges rather than abstracted inside a framework. Swapping to real Flower is possible future work but not done to avoid late-stage risk. |
| **Statistical** | Non-IID data not simulated | Random IID splits used for demo baseline |
| **Security** | No defense against malicious clients | Model poisoning defense is future work |
| **Privacy** | Structural privacy only | Differential privacy noise addition planned in Task 2 |
| **Dataset** | Synthetic data used | PaySim1 real dataset swap planned in Task 4 |

---

## Future Scope

1. **Swap to real dataset** (PaySim1)
2. **Differential privacy**
3. **Per-bank API key issuance**
4. **Non-IID simulation**
5. **Secure aggregation protocol**
