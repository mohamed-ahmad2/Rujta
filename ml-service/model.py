"""
model.py — MR-GNN architecture + graph utilities.
Extracted from training code. No training dependencies here.
"""

from dataclasses import dataclass
from functools import lru_cache

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import global_add_pool, global_max_pool as pyg_max_pool
from rdkit import Chem, RDLogger
from rdkit.Chem import SaltRemover

RDLogger.DisableLog("rdApp.*")

# ── Salt remover (shared singleton) ──────────────────────────────────────────
_remover = SaltRemover.SaltRemover()


# ═══════════════════════════════════════════════════════════════════
#  Graph data containers
# ═══════════════════════════════════════════════════════════════════

@dataclass
class GraphData:
    x: torch.Tensor
    edge_index: torch.Tensor

    def to(self, device):
        return GraphData(
            x=self.x.to(device),
            edge_index=self.edge_index.to(device)
        )

    @property
    def num_nodes(self):
        return self.x.size(0)


@dataclass
class GraphBatch:
    x: torch.Tensor
    edge_index: torch.Tensor
    batch: torch.Tensor

    def to(self, device):
        return GraphBatch(
            x=self.x.to(device),
            edge_index=self.edge_index.to(device),
            batch=self.batch.to(device),
        )

    @property
    def num_graphs(self):
        if self.batch.numel() == 0:
            return 0
        return int(self.batch.max().item()) + 1


def batch_graphs(graph_list):
    xs, edge_indices, batches = [], [], []
    node_offset = 0
    for i, g in enumerate(graph_list):
        xs.append(g.x)
        if g.edge_index.numel() > 0:
            edge_indices.append(g.edge_index + node_offset)
        batches.append(torch.full((g.num_nodes,), i, dtype=torch.long))
        node_offset += g.num_nodes
    x = torch.cat(xs, dim=0)
    batch = torch.cat(batches, dim=0)
    edge_index = (
        torch.cat(edge_indices, dim=1)
        if edge_indices
        else torch.zeros((2, 0), dtype=torch.long)
    )
    return GraphBatch(x=x, edge_index=edge_index, batch=batch)


# ═══════════════════════════════════════════════════════════════════
#  SMILES → Graph conversion  (identical to training code)
# ═══════════════════════════════════════════════════════════════════

ATOM_TYPES = [1, 5, 6, 7, 8, 9, 14, 15, 16, 17, 35, 53]  # H B C N O F Si P S Cl Br I
HYBRIDIZATION = {
    Chem.rdchem.HybridizationType.SP:    0,
    Chem.rdchem.HybridizationType.SP2:   1,
    Chem.rdchem.HybridizationType.SP3:   2,
    Chem.rdchem.HybridizationType.SP3D:  3,
    Chem.rdchem.HybridizationType.SP3D2: 4,
}
NODE_DIM = 32  # total atom feature size


def one_hot(value, vocab):
    vec = [0] * len(vocab)
    if value in vocab:
        vec[vocab.index(value)] = 1
    else:
        vec[-1] = 1  # "other" bucket
    return vec


@lru_cache(maxsize=50_000)
def _clean_smiles_cached(smiles_str: str):
    s = str(smiles_str).strip()
    if s == "" or s.lower() == "nan":
        return None
    try:
        mol = Chem.MolFromSmiles(s, sanitize=False)
        if mol is None:
            return None
        try:
            mol = _remover.StripMol(mol, dontUseReactions=True, dontRemoveEverything=True)
        except Exception:
            pass
        try:
            Chem.SanitizeMol(mol)
        except Exception:
            return None
        frags = Chem.GetMolFrags(mol, asMols=True, sanitizeFrags=True)
        if len(frags) > 1:
            mol = max(frags, key=lambda m: m.GetNumAtoms())
        return Chem.MolToSmiles(mol, canonical=True)
    except Exception:
        return None


def clean_smiles(smiles):
    if smiles is None:
        return None
    return _clean_smiles_cached(str(smiles).strip())


@lru_cache(maxsize=50_000)
def _graph_from_clean_smiles(smi: str):
    mol = Chem.MolFromSmiles(smi)
    if mol is None:
        return None

    node_features = []
    for atom in mol.GetAtoms():
        feat = (
            one_hot(atom.GetAtomicNum(), ATOM_TYPES)           # 12
            + one_hot(atom.GetDegree(), list(range(11)))        # 11
            + one_hot(atom.GetHybridization(),
                      list(HYBRIDIZATION.keys()))               # 5
            + [int(atom.GetIsAromatic())]                       # 1
            + [int(atom.IsInRing())]                            # 1
            + [atom.GetFormalCharge()]                          # 1
            + [atom.GetTotalNumHs()]                            # 1
        )                                                       # total = 32
        node_features.append(feat)

    if not node_features:
        return None

    x = torch.tensor(node_features, dtype=torch.float)  # [N, 32]

    edge_index = []
    for bond in mol.GetBonds():
        i, j = bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()
        edge_index += [[i, j], [j, i]]

    edge_index = (
        torch.tensor(edge_index, dtype=torch.long).t().contiguous()
        if edge_index
        else torch.zeros((2, 0), dtype=torch.long)
    )
    return GraphData(x=x, edge_index=edge_index)


def smiles_to_graph(smiles: str):
    """Convert a SMILES string to a GraphData object. Returns None on failure."""
    s = clean_smiles(smiles)
    return None if s is None else _graph_from_clean_smiles(s)


# ═══════════════════════════════════════════════════════════════════
#  MR-GNN layers
# ═══════════════════════════════════════════════════════════════════

class WeightedGCL(nn.Module):
    def __init__(self, in_dim, out_dim, max_degree=10):
        super().__init__()
        self.max_degree = max_degree
        self.phi  = nn.ModuleList([nn.Linear(in_dim, out_dim, bias=False) for _ in range(max_degree + 1)])
        self.psi  = nn.ModuleList([nn.Linear(in_dim, out_dim, bias=False) for _ in range(max_degree + 1)])
        self.bias = nn.ParameterList([nn.Parameter(torch.zeros(out_dim))  for _ in range(max_degree + 1)])
        self.bn   = nn.BatchNorm1d(out_dim)

    def forward(self, x, edge_index):
        row, col = edge_index
        N = x.size(0)
        deg = torch.zeros(N, dtype=torch.long, device=x.device)
        if row.numel() > 0:
            deg.index_add_(0, row, torch.ones_like(row))
        deg = deg.clamp(max=self.max_degree)

        neigh = torch.zeros_like(x)
        if row.numel() > 0:
            neigh = neigh.index_add(0, row, x[col])

        out = torch.zeros(N, self.phi[0].out_features, device=x.device)
        for d in range(self.max_degree + 1):
            mask = (deg == d)
            if mask.any():
                out[mask] = self.phi[d](x[mask]) + self.psi[d](neigh[mask]) + self.bias[d]
        return F.relu(self.bn(out))


class GraphPooling(nn.Module):
    def forward(self, x, edge_index):
        row, col = edge_index
        if row.numel() == 0:
            return x
        neigh_max = torch.full_like(x, -1e9)
        neigh_max = neigh_max.index_put((row,), x[col], accumulate=False)
        return torch.maximum(x, neigh_max)


class GraphGather(nn.Module):
    def __init__(self, in_dim, graph_dim, max_degree=10):
        super().__init__()
        self.max_degree = max_degree
        self.theta = nn.ModuleList([nn.Linear(in_dim, graph_dim, bias=False) for _ in range(max_degree + 1)])
        self.beta  = nn.ParameterList([nn.Parameter(torch.zeros(graph_dim))  for _ in range(max_degree + 1)])

    def forward(self, x, edge_index, batch):
        row, _ = edge_index
        N = x.size(0)
        deg = torch.zeros(N, dtype=torch.long, device=x.device)
        if row.numel() > 0:
            deg.index_add_(0, row, torch.ones_like(row))
        deg = deg.clamp(max=self.max_degree)

        out = torch.zeros(N, self.theta[0].out_features, device=x.device)
        for d in range(self.max_degree + 1):
            mask = (deg == d)
            if mask.any():
                out[mask] = self.theta[d](x[mask]) + self.beta[d]
        return global_add_pool(out, batch)  # [B, graph_dim]


# ═══════════════════════════════════════════════════════════════════
#  Full MR-GNN
# ═══════════════════════════════════════════════════════════════════

class MRGNN(nn.Module):
    def __init__(
        self,
        node_dim=32,
        conv_dim=384,
        graph_dim=128,
        hidden_dim=512,
        num_layers=3,
        num_classes=2,
        dropout=0.3,
        max_degree=10,
    ):
        super().__init__()
        self.num_layers = num_layers
        self.graph_dim  = graph_dim
        self.conv_dim   = conv_dim

        dims = [node_dim] + [conv_dim] * num_layers

        self.convs   = nn.ModuleList()
        self.pools   = nn.ModuleList()
        self.gathers = nn.ModuleList()

        for i in range(num_layers):
            self.convs.append(WeightedGCL(dims[i], conv_dim, max_degree))
            self.pools.append(GraphPooling())

        for d in dims:
            self.gathers.append(GraphGather(d, graph_dim, max_degree))

        self.s_lstm = nn.LSTMCell(graph_dim,     graph_dim)
        self.i_lstm = nn.LSTMCell(2 * graph_dim, 2 * graph_dim)

        self.global_proj = nn.Linear(conv_dim, graph_dim)

        fc_in = 6 * graph_dim  # 768
        self.fc1     = nn.Linear(fc_in, hidden_dim)
        self.fc2     = nn.Linear(hidden_dim, num_classes)
        self.dropout = nn.Dropout(dropout)
        self.bn_fc   = nn.BatchNorm1d(hidden_dim)

    def encode(self, data):
        x, ei, batch = data.x, data.edge_index, data.batch
        states = [self.gathers[0](x, ei, batch)]
        for i in range(self.num_layers):
            x = self.convs[i](x, ei)
            x = self.pools[i](x, ei)
            states.append(self.gathers[i + 1](x, ei, batch))
        return states, x

    def global_pool(self, x, batch):
        return pyg_max_pool(self.global_proj(x), batch)

    def dual_lstm(self, sx, sy):
        B   = sx[0].size(0)
        dev = sx[0].device
        hx = cx = torch.zeros(B, self.graph_dim,     device=dev)
        hy = cy = torch.zeros(B, self.graph_dim,     device=dev)
        hi = ci = torch.zeros(B, 2 * self.graph_dim, device=dev)
        for gx, gy in zip(sx, sy):
            hx, cx = self.s_lstm(gx, (hx, cx))
            hy, cy = self.s_lstm(gy, (hy, cy))
            hi, ci = self.i_lstm(torch.cat([gx, gy], dim=1), (hi, ci))
        return hx, hy, hi

    def forward(self, dx, dy):
        sx, fx = self.encode(dx)
        sy, fy = self.encode(dy)
        s_x, s_y, h = self.dual_lstm(sx, sy)
        p_x = self.global_pool(fx, dx.batch)
        p_y = self.global_pool(fy, dy.batch)
        e_x = torch.cat([s_x, p_x], dim=1)
        e_y = torch.cat([s_y, p_y], dim=1)
        fused = torch.cat([e_x, e_y, h], dim=1)
        z = F.relu(self.bn_fc(self.fc1(self.dropout(fused))))
        z = self.dropout(z)
        return self.fc2(z)