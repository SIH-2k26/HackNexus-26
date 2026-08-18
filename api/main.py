import os
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.trainer import FlowerStyleCoordinator
from data.generate_data import generate_bank_datasets

from api.routes.train import router as train_router
from api.routes.score import router as score_router
from api.routes.status import router as status_router
from api.routes.admin import router as admin_router
from api.routes.audit import router as audit_router
from api.routes.me import router as me_router
from api.routes.export import router as export_router
from api.auth import BANK_REGISTRY

app = FastAPI(
    title="Vaultic API — Privacy-Preserving Fraud Detection Platform",
    description="Federated Learning API for Collaborative Bank Fraud Detection",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure dataset exists on startup
if not os.path.exists("data/banks/bank_0.csv") and not os.path.exists("data/bank_0.csv"):
    generate_bank_datasets()

# Global shared trainer instance
trainer = FlowerStyleCoordinator(data_dir="data/banks")

# Track server start time for uptime display
SERVER_START_TIME = datetime.now(timezone.utc).isoformat()

# Mount all route modules
app.include_router(train_router)
app.include_router(score_router)
app.include_router(status_router)
app.include_router(admin_router)
app.include_router(audit_router)
app.include_router(me_router)
app.include_router(export_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Vaultic Federated Learning API",
        "current_round": trainer.current_round,
        "registered_banks": len(BANK_REGISTRY),
        "server_start_time": SERVER_START_TIME,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "docs_url": "/docs",
    }

