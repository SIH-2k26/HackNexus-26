# Vaultic — Privacy-Preserving Federated Fraud Detection Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100.0+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF.svg?style=flat&logo=Vite&logoColor=white)](https://vitejs.dev)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.2.0+-F7931E.svg?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Python](https://img.shields.io/badge/Python-3.9%20%7C%203.10%20%7C%203.11-3776AB.svg?style=flat&logo=Python&logoColor=white)](https://python.org)

**Vaultic** is a decentralized, privacy-preserving machine learning platform designed for collaborative fraud detection across independent financial institutions without centralizing raw customer transaction data.

By combining **Federated Averaging (FedAvg)**, **Differential Privacy (DP)**, **Secure Aggregation (SecAgg)**, and **Dynamic Bank Onboarding**, Vaultic enables member banks to collaboratively train state-of-the-art fraud detection models while maintaining strict regulatory compliance (RBI, GDPR, DPDP Act).

---

## 🏛️ System Architecture

```
vaultic/
├── core/                               # Core Federated Learning & Privacy Engine
│   ├── model.py                        # MLP Classifier architecture (10 → 16 → 8 → 1, 321 parameters)
│   ├── training.py                     # Local model training with SMOTE/oversampling & metrics evaluation
│   ├── fedavg.py                       # Pure Federated Averaging weight extraction & sample-weighted aggregation
│   ├── privacy.py                      # Gaussian Differential Privacy & Zero-Sum Secure Aggregation masking
│   ├── preprocessing.py                # 10-dimensional feature vectorizer & rule-based signal extractor
│   └── trainer.py                      # FederatedTrainer & FlowerStyleCoordinator dynamic multi-bank orchestrator
├── api/                                # Modular FastAPI Backend
│   ├── auth.py                         # Role-based API key verification (Operator vs Bank Node) & key registry
│   ├── main.py                         # App assembly, CORS middleware with Vercel regex, router registry
│   └── routes/
│       ├── train.py                    # POST /train (Admin-only live federated training round)
│       ├── score.py                    # POST /score (Real-time 10-feature transaction inference)
│       ├── status.py                   # GET /status (System telemetry & historical rounds)
│       ├── admin.py                    # POST /admin/banks/upload, POST /register, POST /reset, key management
│       ├── audit.py                    # GET /audit, GET /admin/auth-failures
│       └── export.py                   # GET /export/audit-report (Comprehensive compliance payload)
├── data/                               # Datasets & Bank Data Directories
│   ├── generate_data.py                # Realistic synthetic Indian banking transaction generator (UPI/IMPS/NEFT/RTGS)
│   ├── load_paysim.py                  # PaySim1 Kaggle benchmark dataset loader
│   └── banks/                          # Private institutional data partitions (bank_0.csv ... bank_N.csv)
├── artifacts/
│   └── fraud-detection-dashboard/      # React 19 + TypeScript + Tailwind CSS Frontend
│       ├── src/
│       │   ├── pages/                  # Command Center, Bank Network, Global Model, Real-Time Scoring, Audit
│       │   ├── lib/                    # useFederatedLearning live hook, api-config, Supabase client
│       │   └── components/             # Reusable UI primitives & telemetry charts
│       └── vercel.json                 # Vercel Single-Page Application (SPA) routing configuration
├── deploy/
│   └── render.yaml                     # Render Web Service deployment specification
├── render.yaml                         # Root Render blueprint specification
├── vercel.json                         # Root Vercel build & output specification
├── audit_log.jsonl                     # Immutable round-by-round compliance audit trail
└── auth_failures.jsonl                 # Security audit log for unauthorized requests
```

---

## 🔒 Security & Privacy Guarantees

1. **Zero Raw Data Exposure**:
   - Member banks never share customer transactions, account numbers, or raw telemetry.
   - Only mathematical model weight vectors ($\Delta W$) leave local bank environments.
2. **Calibrated Differential Privacy (DP)**:
   - Configurable Gaussian noise injection ($\sigma = 0.01 / \epsilon$) perturbed across gradient updates to prevent model inversion and membership inference attacks.
3. **Secure Aggregation (SecAgg)**:
   - Algorithmic zero-sum mask cancellation ($\sum_{i=1}^K M_i - \sum_{i=1}^K R_i = 0$) ensuring the central aggregator verifies exact convergence ($\delta < 10^{-9}$) without inspecting individual weights.
4. **Role-Based Isolation**:
   - **Central Operator Key (`FRAUD_API_KEY`)**: Authorized to trigger global training rounds, onboard new bank datasets, reset models, and export compliance reports.
   - **Bank Node Keys (`vlt_...`)**: Scoped strictly to transaction inference (`POST /score`), system status inspection (`GET /status`), and node telemetry (`GET /me`).
5. **CORS & Domain Whitelisting**:
   - Strict origin validation preventing cross-site request forgery, with built-in regex matching for secure Vercel deployment domains (`https://*.vercel.app`).

---

## ⚡ Dynamic Bank Onboarding via CSV

Vaultic supports live institution onboarding without requiring system resets or downtime:

- **Endpoint**: `POST /admin/banks/upload` (Protected by Operator Key)
- **Dataset Schema**: Validates the 10-feature schema + `is_fraud` label:
  ```csv
  transaction_id,timestamp,amount,transaction_type,sender_account_age_days,receiver_account_age_days,sender_tx_count_24h,receiver_unique_senders_24h,device_changed,location_changed,failed_login_attempts,is_fraud
  TXN_10001,2024-10-26T14:43:00Z,5083.63,UPI,934,196,2,3,False,False,0,0
  TXN_10002,2024-05-18T13:24:00Z,42500.00,RTGS,14,310,12,1,True,True,2,1
  ```
- **Instant Key Provisioning**: Automatically generates a scoped token (`vlt_...`) and registers the institution in `BANK_REGISTRY`.
- **Automatic Weight Rebalancing**: When a new bank node with $n_{new}$ samples joins, the total sample count $N = \sum n_k$ recalculates automatically, smoothly rebalancing FedAvg contribution weights ($n_k / N$) on subsequent training rounds.

---

## 📡 REST API Reference

| Method | Endpoint | Auth Required | Description |
|---|---|:---:|---|
| `POST` | `/auth/verify-key` | None | Validates API key and returns identity (`operator` or `bank`) |
| `POST` | `/score` | **API Key** | Scores a rich transaction dict and returns fraud probability & risk reasons |
| `POST` | `/train` | **Admin Key** | Executes one federated training round (local training $\rightarrow$ DP $\rightarrow$ FedAvg) |
| `POST` | `/admin/banks/upload` | **Admin Key** | Onboards a new bank node with private dataset CSV |
| `GET` | `/admin/banks/template-csv` | **Admin Key** | Downloads reference CSV schema template |
| `GET` | `/admin/banks` | **Admin Key** | Lists all registered bank nodes with masked key previews |
| `POST` | `/admin/banks/{prefix}/revoke` | **Admin Key** | Deactivates a bank node's API token |
| `POST` | `/admin/banks/{prefix}/reinstate` | **Admin Key** | Reactivates a bank node's API token |
| `POST` | `/reset` | **Admin Key** | Resets trainer state and models to initial baseline |
| `GET` | `/status` | **API Key** | Returns current round telemetry and historical accuracy |
| `GET` | `/audit` | **Admin Key** | Returns immutable round-by-round compliance audit trail |
| `GET` | `/admin/auth-failures` | **Admin Key** | Returns log of failed/unauthorized access attempts |
| `GET` | `/export/audit-report` | **Admin Key** | Downloads full compliance audit report JSON payload |
| `GET` | `/me` | **API Key** | Returns calling node profile and performance telemetry |

---

## 📊 Machine Learning Model Details

- **Architecture**: Multi-Layer Perceptron (MLP) Binary Classifier
- **Layer Dimensions**:
  $$\text{Input}(10) \longrightarrow \text{Dense}(16, \text{ReLU}) \longrightarrow \text{Dense}(8, \text{ReLU}) \longrightarrow \text{Output}(1, \text{Sigmoid})$$
- **Total Parameters**: 321 trainable weights and biases
- **Feature Vector (10 Dimensions)**:
  1. `norm_amount`: Log-scaled transaction amount ($\frac{\ln(1 + \text{amount})}{12.0}$)
  2. `norm_hour`: Hour of day normalized ($\frac{\text{hour}}{23.0}$)
  3. `tx_type_code`: Channel ordinal (UPI: $0.0$, IMPS: $0.33$, NEFT: $0.66$, RTGS: $1.0$)
  4. `norm_sender_age`: Log-scaled sender account age in days
  5. `norm_receiver_age`: Log-scaled receiver account age in days
  6. `norm_sender_velocity`: Sender 24-hour transaction frequency
  7. `norm_receiver_fans`: Receiver 24-hour unique sender count
  8. `device_changed`: Binary flag ($0.0$ / $1.0$)
  9. `location_changed`: Binary flag ($0.0$ / $1.0$)
  10. `norm_failed_logins`: Failed authentication attempts normalized ($\frac{\text{attempts}}{5.0}$)

---

## 🛡️ License

This project is licensed under the MIT License. Developed for privacy-preserving inter-bank fraud intelligence collaboration.
