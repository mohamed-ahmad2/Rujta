"""
inference.py — Load MR-GNN weights and run drug-interaction inference.

Usage:
    from inference import load_model, predict_interactions

    model = load_model("best_mrgnn_v2.pt")

    drugs = [
        {"id": "DB00001", "name": "Warfarin",   "smiles": "CC..."},
        {"id": "DB00002", "name": "Aspirin",     "smiles": "CC..."},
        {"id": "DB00003", "name": "Ibuprofen",   "smiles": "CC..."},
    ]
    results = predict_interactions(model, drugs, threshold=0.5)
    # returns list of dicts: {drug1, drug2, probability, interacts}
"""

import itertools
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

import torch

from model import MRGNN, smiles_to_graph, batch_graphs

logger = logging.getLogger(__name__)

# ── Default model config (matches your training CFG) ─────────────────────────
DEFAULT_CFG = dict(
    node_dim   = 32,
    conv_dim   = 384,
    graph_dim  = 128,
    hidden_dim = 512,
    num_layers = 3,
    num_classes= 2,
    dropout    = 0.3,
)


def load_model(
    weights_path: str,
    device: Optional[str] = None,
) -> MRGNN:
    """
    Load MR-GNN from a .pt checkpoint saved during training.

    The checkpoint must contain 'model_state_dict'.
    If it also contains 'cfg', those hyperparameters are used automatically.

    Args:
        weights_path: Path to best_mrgnn_v2.pt
        device:       'cuda', 'cpu', or None (auto-detect)

    Returns:
        model in eval mode, moved to device
    """
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
    device = torch.device(device)

    path = Path(weights_path)
    if not path.exists():
        raise FileNotFoundError(f"Weights file not found: {path.resolve()}")

    checkpoint = torch.load(path, map_location=device, weights_only=False)

    # ── Read config from checkpoint if available ──────────────────────────────
    cfg = checkpoint.get("cfg", DEFAULT_CFG)
    # cfg from your training code uses the same key names as DEFAULT_CFG
    model = MRGNN(
        node_dim   = cfg.get("node_dim",    DEFAULT_CFG["node_dim"]),
        conv_dim   = cfg.get("conv_dim",    DEFAULT_CFG["conv_dim"]),
        graph_dim  = cfg.get("graph_dim",   DEFAULT_CFG["graph_dim"]),
        hidden_dim = cfg.get("hidden_dim",  DEFAULT_CFG["hidden_dim"]),
        num_layers = cfg.get("num_layers",  DEFAULT_CFG["num_layers"]),
        num_classes= cfg.get("num_classes", DEFAULT_CFG["num_classes"]),
        dropout    = cfg.get("dropout",     DEFAULT_CFG["dropout"]),
    ).to(device)

    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    epoch = checkpoint.get("epoch", "?")
    auc   = checkpoint.get("best_val_auc", "?")
    logger.info(f"✅ Model loaded | epoch={epoch} | best_val_auc={auc} | device={device}")
    print(f"✅ Model loaded | epoch={epoch} | best_val_auc={auc} | device={device}")

    return model


@torch.no_grad()
def predict_interactions(
    model: MRGNN,
    drugs: List[Dict[str, Any]],
    threshold: float = 0.5,
    batch_size: int = 64,
) -> List[Dict[str, Any]]:
    """
    Given a list of drugs, check every pair for drug-drug interactions.

    Args:
        model:      Loaded MR-GNN (from load_model)
        drugs:      List of dicts, each must have:
                      - 'id'     (str)  — drug identifier e.g. "DB00001"
                      - 'name'   (str)  — human-readable name e.g. "Warfarin"
                      - 'smiles' (str)  — SMILES string
        threshold:  Probability cutoff to flag an interaction (default 0.5)
        batch_size: How many pairs to run through model at once

    Returns:
        List of dicts for pairs WITH interactions (probability >= threshold):
        [
          {
            "drug1_id":    "DB00001",
            "drug1_name":  "Warfarin",
            "drug2_id":    "DB00002",
            "drug2_name":  "Aspirin",
            "probability": 0.87,
            "interacts":   True
          },
          ...
        ]
        Pairs without interaction are excluded from the returned list.
        If you want ALL pairs, set threshold=0.0.
    """
    device = next(model.parameters()).device

    # ── Step 1: Convert every drug SMILES → graph ─────────────────────────────
    valid_drugs = []
    skipped = []
    for drug in drugs:
        g = smiles_to_graph(drug["smiles"])
        if g is None:
            skipped.append(drug.get("id", "?"))
            logger.warning(f"Could not parse SMILES for drug {drug.get('id','?')} — skipping")
        else:
            valid_drugs.append({**drug, "_graph": g})

    if skipped:
        print(f"⚠️  Skipped {len(skipped)} drug(s) with unparseable SMILES: {skipped}")

    if len(valid_drugs) < 2:
        print("⚠️  Need at least 2 valid drugs to check interactions.")
        return []

    # ── Step 2: Generate all unique pairs ─────────────────────────────────────
    pairs = list(itertools.combinations(valid_drugs, 2))
    print(f"🔍 Checking {len(pairs)} drug pair(s) from {len(valid_drugs)} drug(s)...")

    # ── Step 3: Run model in batches ──────────────────────────────────────────
    all_results = []

    for start in range(0, len(pairs), batch_size):
        batch_pairs = pairs[start : start + batch_size]

        g1_list = [p[0]["_graph"] for p in batch_pairs]
        g2_list = [p[1]["_graph"] for p in batch_pairs]

        g1_batch = batch_graphs(g1_list).to(device)
        g2_batch = batch_graphs(g2_list).to(device)

        logits = model(g1_batch, g2_batch)            # [B, 2]
        probs  = torch.softmax(logits, dim=1)[:, 1]  # [B]  — prob of interaction
        probs  = probs.cpu().tolist()

        for (d1, d2), prob in zip(batch_pairs, probs):
            all_results.append({
                "drug1_id":    d1["id"],
                "drug1_name":  d1["name"],
                "drug2_id":    d2["id"],
                "drug2_name":  d2["name"],
                "probability": round(prob, 4),
                "interacts":   prob >= threshold,
            })

    # ── Step 4: Filter to only interacting pairs ──────────────────────────────
    interactions = [r for r in all_results if r["interacts"]]
    interactions.sort(key=lambda x: x["probability"], reverse=True)

    print(f"✅ Found {len(interactions)} interaction(s) out of {len(pairs)} pair(s)")
    return interactions


# ── Quick smoke test ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    weights = sys.argv[1] if len(sys.argv) > 1 else "best_mrgnn_v2.pt"

    model = load_model(weights)

    # Warfarin, Aspirin, Ibuprofen — known interacting set
    test_drugs = [
        {
            "id":     "DB00682",
            "name":   "Warfarin",
            "smiles": "CC(=O)Oc1ccccc1C(=O)O",   # placeholder — replace with real
        },
        {
            "id":     "DB00945",
            "name":   "Aspirin",
            "smiles": "CC(=O)Oc1ccccc1C(=O)O",
        },
        {
            "id":     "DB01050",
            "name":   "Ibuprofen",
            "smiles": "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
        },
    ]

    results = predict_interactions(model, test_drugs, threshold=0.5)

    print("\n── Interactions found ──")
    for r in results:
        print(
            f"  {r['drug1_name']} ↔ {r['drug2_name']}"
            f"  prob={r['probability']:.3f}"
        )