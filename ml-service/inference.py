"""
inference.py
------------
Load a trained MR-GNN checkpoint and predict drug-drug interaction
for one or more pairs of SMILES strings.

Checkpoint format produced by the training loop:
    {
        "epoch":     int,
        "model":     state_dict,
        "optimizer": state_dict,
        "scheduler": state_dict,
        "valid_auc": float,
    }
"""
import math

import importlib
from pathlib import Path
from typing import Optional, Union

import torch
import torch.nn.functional as F

from model import MRGNN, NODE_DIM, batch_graphs, smiles_to_graph


# ── Register all NumPy globals PyTorch 2.6+ may refuse ───────────────────────

def _register_numpy_safe_globals() -> None:
    candidates = [
        "numpy.dtype",
        "numpy.ndarray",
        "numpy.core.multiarray.scalar",
        "numpy.core.multiarray._reconstruct",
        "numpy._core.multiarray.scalar",        # numpy >= 2.0
        "numpy._core.multiarray._reconstruct",  # numpy >= 2.0
    ]

    resolved = []

    for mod_name in ("numpy.dtypes",):
        try:
            mod = importlib.import_module(mod_name)
            for attr in dir(mod):
                obj = getattr(mod, attr)
                if isinstance(obj, type):
                    resolved.append(obj)
        except ImportError:
            pass

    for dotted in candidates:
        *mod_parts, attr = dotted.split(".")
        try:
            mod = importlib.import_module(".".join(mod_parts))
            resolved.append(getattr(mod, attr))
        except (ImportError, AttributeError):
            pass

    if resolved:
        torch.serialization.add_safe_globals(resolved)


_register_numpy_safe_globals()


# ── Confidence bands ──────────────────────────────────────────────────────────

def _confidence(prob: float) -> str:
    if prob >= 0.85 or prob <= 0.15:
        return "high"
    if prob >= 0.70 or prob <= 0.30:
        return "medium"
    return "low"


# ── Predictor ────────────────────────────────────────────────────────────────

class DDIPredictor:
    """Load a saved MR-GNN checkpoint and expose a .predict() interface."""

    def __init__(
        self,
        checkpoint_path: Union[str, Path],
        device: Optional[str] = None,
        threshold: float = 0.5,
    ):
        self.threshold = threshold
        self.device = torch.device(
            device if device else (
                "cuda" if torch.cuda.is_available() else "cpu")
        )
        self.model = self._load_model(checkpoint_path)

    # ── Checkpoint loading ────────────────────────────────────────────────────

    def _load_model(self, checkpoint_path: Union[str, Path]) -> MRGNN:
        path = Path(checkpoint_path)
        if not path.exists():
            raise FileNotFoundError(f"Checkpoint not found: {path}")

        # Try weights_only=True first; fall back for numpy-typed checkpoints.
        try:
            ckpt = torch.load(path, map_location=self.device,
                              weights_only=True)
            print("🔒 Checkpoint loaded with weights_only=True")
        except Exception as e:
            print(f"⚠️  Safe load failed ({type(e).__name__}: {e})")
            print("↩️  Retrying with weights_only=False (trusted local file)")
            ckpt = torch.load(path, map_location=self.device,
                              weights_only=False)

        # ── Unpack checkpoint ─────────────────────────────────────────────────
        # Format 1 (training loop): {"model": ..., "epoch": ..., "valid_auc": ...}
        # Format 2 (legacy):        {"model_state_dict": ..., "best_val_auc": ...}
        # Format 3 (bare):          state_dict directly
        if isinstance(ckpt, dict) and "model" in ckpt:
            state_dict = ckpt["model"]
            cfg = ckpt.get("cfg", {})
            epoch = ckpt.get("epoch", "?")
            auc = float(ckpt.get("valid_auc", float("nan")))
        elif isinstance(ckpt, dict) and "model_state_dict" in ckpt:
            state_dict = ckpt["model_state_dict"]
            cfg = ckpt.get("cfg", {})
            epoch = ckpt.get("epoch", "?")
            auc = float(ckpt.get("best_val_auc", float("nan")))
        else:
            state_dict = ckpt
            cfg = {}
            epoch = "?"
            auc = float("nan")

        # ── Build model ───────────────────────────────────────────────────────
        model = MRGNN(
            node_dim=cfg.get("node_dim",    NODE_DIM),
            conv_dim=cfg.get("conv_dim",    384),
            graph_dim=cfg.get("graph_dim",   128),
            hidden_dim=cfg.get("hidden_dim",  512),
            num_layers=cfg.get("num_layers",  3),
            num_classes=cfg.get("num_classes", 2),
            dropout=cfg.get("dropout",     0.3),
        ).to(self.device)

        model.load_state_dict(state_dict)
        model.eval()

        auc_str = f"{auc:.4f}" if not math.isnan(auc) else "n/a"
        print(
            f"✅ Model loaded | epoch={epoch} | val_AUC={auc_str} | device={self.device}")
        return model

    # ── Single pair ───────────────────────────────────────────────────────────

    def predict(
        self,
        smiles1: str,
        smiles2: str,
        name1: Optional[str] = "drug_1",
        name2: Optional[str] = "drug_2",
    ) -> dict:
        g1 = smiles_to_graph(smiles1)
        g2 = smiles_to_graph(smiles2)

        if g1 is None or g2 is None:
            bad = ([name1] if g1 is None else []) + \
                ([name2] if g2 is None else [])
            return {
                "drug_1":      name1,
                "drug_2":      name2,
                "interaction": None,
                "probability": None,
                "confidence":  None,
                "label":       None,
                "error":       f"Could not parse SMILES for: {', '.join(bad)}",
            }

        b1 = batch_graphs([g1]).to(self.device)
        b2 = batch_graphs([g2]).to(self.device)

        with torch.no_grad():
            logits = self.model(b1, b2)
            prob = torch.softmax(logits, dim=1)[0, 1].item()

        label = int(prob >= self.threshold)
        return {
            "drug_1":      name1,
            "drug_2":      name2,
            "interaction": bool(label),
            "probability": round(prob, 4),
            "confidence":  _confidence(prob),
            "label":       label,
            "error":       None,
        }

    # ── Batch of pairs ────────────────────────────────────────────────────────

    def predict_batch(self, pairs: list[tuple[str, str, str, str]]) -> list[dict]:
        results = []
        valid_indices = []
        valid_g1 = []
        valid_g2 = []

        for idx, (s1, s2, n1, n2) in enumerate(pairs):
            g1 = smiles_to_graph(s1)
            g2 = smiles_to_graph(s2)

            if g1 is None or g2 is None:
                bad = ([n1] if g1 is None else []) + \
                    ([n2] if g2 is None else [])
                results.append({
                    "index":       idx,
                    "drug_1":      n1,
                    "drug_2":      n2,
                    "interaction": None,
                    "probability": None,
                    "confidence":  None,
                    "label":       None,
                    "error":       f"Could not parse SMILES for: {', '.join(bad)}",
                })
            else:
                valid_indices.append(idx)
                valid_g1.append(g1)
                valid_g2.append(g2)
                results.append({"drug_1": n1, "drug_2": n2})   # placeholder

        if valid_g1:
            b1 = batch_graphs(valid_g1).to(self.device)
            b2 = batch_graphs(valid_g2).to(self.device)

            with torch.no_grad():
                logits = self.model(b1, b2)
                probs = torch.softmax(logits, dim=1)[:, 1].tolist()

            for local_i, global_i in enumerate(valid_indices):
                prob = probs[local_i]
                label = int(prob >= self.threshold)
                results[global_i].update({
                    "index":       global_i,
                    "interaction": bool(label),
                    "probability": round(prob, 4),
                    "confidence":  _confidence(prob),
                    "label":       label,
                    "error":       None,
                })

        return results


# ── CLI convenience ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import json
    import sys

    if len(sys.argv) < 6:
        print("Usage: python inference.py <ckpt> <smi1> <name1> <smi2> <name2>")
        sys.exit(1)

    ckpt_path = sys.argv[1]
    smi1, name1 = sys.argv[2], sys.argv[3]
    smi2, name2 = sys.argv[4], sys.argv[5]

    predictor = DDIPredictor(ckpt_path)
    result = predictor.predict(smi1, smi2, name1, name2)
    print(json.dumps(result, indent=2))
