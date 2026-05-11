"""
main.py
-------
FastAPI web server exposing the MR-GNN Drug-Drug Interaction predictor.
Updated to support drug names and SMILES strings.
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from inference import DDIPredictor


# ── Config ────────────────────────────────────────────────────────────────────

CHECKPOINT_PATH = os.getenv("CHECKPOINT_PATH", "best_model.pt")
THRESHOLD       = float(os.getenv("DDI_THRESHOLD", "0.5"))

predictor: Optional[DDIPredictor] = None


# ── Lifespan (replaces deprecated @app.on_event) ──────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    global predictor
    path = Path(CHECKPOINT_PATH)
    if not path.exists():
        print(f"⚠️  Checkpoint not found at '{path}'. /predict will return 503.")
    else:
        predictor = DDIPredictor(checkpoint_path=path, threshold=THRESHOLD)
    yield
    # teardown (if needed) goes here


# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Drug-Drug Interaction Predictor",
    description=(
        "MR-GNN model (Xu et al., IJCAI 2019) trained on DrugBank DDI dataset. "
        "Achieves 93.75% accuracy and 0.984 ROC-AUC on the held-out test set."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response schemas ────────────────────────────────────────────────

class PredictRequest(BaseModel):
    smiles1: str           = Field(...,       description="SMILES string of the first drug")
    name1:   Optional[str] = Field("drug_1",  description="Name of the first drug")
    smiles2: str           = Field(...,       description="SMILES string of the second drug")
    name2:   Optional[str] = Field("drug_2",  description="Name of the second drug")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "smiles1": "CC(=O)Nc1ccc(O)cc1",
                    "name1":   "Paracetamol",
                    "smiles2": "O=C(O)c1ccccc1OC(C)=O",
                    "name2":   "Aspirin",
                }
            ]
        }
    }


class PredictResponse(BaseModel):
    drug_1:      Optional[str]   = Field(None, description="Name of first drug")
    drug_2:      Optional[str]   = Field(None, description="Name of second drug")
    interaction: Optional[bool]  = Field(None, description="True = interaction predicted")
    probability: Optional[float] = Field(None, description="P(interaction), 0–1")
    confidence:  Optional[str]   = Field(None, description="'high' / 'medium' / 'low'")
    label:       Optional[int]   = Field(None, description="1 = interaction, 0 = none")
    error:       Optional[str]   = Field(None, description="Set if SMILES could not be parsed")


class PairItem(BaseModel):
    smiles1: str
    name1:   Optional[str] = "drug_1"
    smiles2: str
    name2:   Optional[str] = "drug_2"


class BatchRequest(BaseModel):
    pairs: list[PairItem] = Field(..., description="List of drug pairs to evaluate")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "pairs": [
                        {
                            "smiles1": "CC(=O)Nc1ccc(O)cc1",  "name1": "Paracetamol",
                            "smiles2": "O=C(O)c1ccccc1OC(C)=O", "name2": "Aspirin",
                        },
                        {
                            "smiles1": "c1ccc(cc1)C(=O)O",           "name1": "Benzoic Acid",
                            "smiles2": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C", "name2": "Caffeine",
                        },
                    ]
                }
            ]
        }
    }


class BatchPredictItem(PredictResponse):
    index: int = Field(..., description="Position in the original request list")


class BatchResponse(BaseModel):
    results: list[BatchPredictItem]
    total:   int
    errors:  int


class HealthResponse(BaseModel):
    status:      str
    model_ready: bool
    checkpoint:  str
    threshold:   float


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["Utility"])
def health():
    """Liveness / readiness check."""
    return HealthResponse(
        status="ok",
        model_ready=predictor is not None,
        checkpoint=CHECKPOINT_PATH,
        threshold=THRESHOLD,
    )


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
def predict(req: PredictRequest):
    """
    Predict whether two drugs interact.
    Accepts SMILES strings and optional drug names.
    """
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail=f"Model not loaded. Check that '{CHECKPOINT_PATH}' exists.",
        )

    result = predictor.predict(
        smiles1=req.smiles1,
        smiles2=req.smiles2,
        name1=req.name1,
        name2=req.name2,
    )
    return PredictResponse(**result)


@app.post("/predict/batch", response_model=BatchResponse, tags=["Prediction"])
def predict_batch(req: BatchRequest):
    """
    Predict interactions for a list of drug pairs in a single request.
    Maximum 500 pairs per call.
    """
    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail=f"Model not loaded. Check that '{CHECKPOINT_PATH}' exists.",
        )

    if not req.pairs:
        raise HTTPException(status_code=422, detail="'pairs' list must not be empty.")

    if len(req.pairs) > 500:
        raise HTTPException(
            status_code=422,
            detail="Batch size exceeds limit of 500 pairs per request.",
        )

    raw_pairs   = [(p.smiles1, p.smiles2, p.name1, p.name2) for p in req.pairs]
    results     = predictor.predict_batch(raw_pairs)
    error_count = sum(1 for r in results if r.get("error") is not None)

    return BatchResponse(
        results=[BatchPredictItem(**r) for r in results],
        total=len(results),
        errors=error_count,
    )


# ── Dev entrypoint ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)