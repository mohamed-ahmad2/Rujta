"""
main.py — FastAPI microservice for MR-GNN drug interaction prediction.

Endpoints:
    POST /predict          → check interactions between a list of drugs
    GET  /health           → health check (used by .NET before calling)

Run locally:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

.NET calls:
    POST http://localhost:8000/predict
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from inference import load_model, predict_interactions

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Model path (can override via env var) ─────────────────────────────────────
MODEL_PATH = os.getenv("MODEL_PATH", "best_mrgnn_v2.pt")
THRESHOLD  = float(os.getenv("INTERACTION_THRESHOLD", "0.5"))

# ── Global model instance (loaded once at startup) ────────────────────────────
_model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, release on shutdown."""
    global _model
    logger.info(f"Loading model from: {MODEL_PATH}")
    _model = load_model(MODEL_PATH)
    logger.info("✅ Model ready — service is up")
    yield
    _model = None
    logger.info("Model released")


# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="MR-GNN Drug Interaction Service",
    description="Predicts drug-drug interactions using MR-GNN",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten this in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════
#  Request / Response schemas
# ═══════════════════════════════════════════════════════════════════

class DrugInput(BaseModel):
    id:     str = Field(..., example="DB00682")
    name:   str = Field(..., example="Warfarin")
    smiles: str = Field(..., example="CC(=O)Oc1ccccc1C(=O)O")


class PredictRequest(BaseModel):
    drugs: List[DrugInput] = Field(
        ...,
        min_length=2,
        description="List of drugs to check. Must be at least 2.",
        example=[
            {"id": "DB00682", "name": "Warfarin",   "smiles": "CC(=O)Oc1ccccc1C(=O)O"},
            {"id": "DB00945", "name": "Aspirin",    "smiles": "CC(=O)Oc1ccccc1C(=O)O"},
            {"id": "DB01050", "name": "Ibuprofen",  "smiles": "CC(C)Cc1ccc(cc1)C(C)C(=O)O"},
        ]
    )
    threshold: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Probability cutoff to flag an interaction"
    )


class InteractionResult(BaseModel):
    drug1_id:    str
    drug1_name:  str
    drug2_id:    str
    drug2_name:  str
    probability: float
    interacts:   bool


class PredictResponse(BaseModel):
    total_drugs:        int
    total_pairs_checked: int
    interactions_found: int
    interactions:       List[InteractionResult]


# ═══════════════════════════════════════════════════════════════════
#  Endpoints
# ═══════════════════════════════════════════════════════════════════

@app.get("/health")
def health():
    """
    Health check — .NET backend calls this before sending predictions.
    Returns 200 if model is loaded and ready.
    """
    if _model is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
    return {"status": "ok", "model_loaded": True}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    """
    Check drug-drug interactions for a list of drugs.

    - Accepts: list of drugs with id, name, smiles
    - Returns: all pairs that have a predicted interaction
    - Sorted by probability descending (highest risk first)
    """
    if _model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    drugs_dicts = [d.model_dump() for d in request.drugs]

    try:
        interactions = predict_interactions(
            _model,
            drugs_dicts,
            threshold=request.threshold,
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    # total pairs = n*(n-1)/2
    n = len(request.drugs)
    total_pairs = n * (n - 1) // 2

    return PredictResponse(
        total_drugs         = n,
        total_pairs_checked = total_pairs,
        interactions_found  = len(interactions),
        interactions        = interactions,
    )