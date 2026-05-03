import { useState, useEffect, useRef } from "react";
import { useDrugInteraction } from "./useDrugInteraction"; // adjust path

// ─── helpers ──────────────────────────────────────────────────────────────────

function getRiskLevel(probability) {
  if (probability >= 0.85) return "High";
  if (probability >= 0.65) return "Medium";
  return "Low";
}

const RISK_STYLES = {
  High:   "bg-red-50   text-red-800   ring-1 ring-red-200",
  Medium: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  Low:    "bg-green-50 text-green-800 ring-1 ring-green-200",
};

const RISK_BAR_COLOR = {
  High:   "bg-red-500",
  Medium: "bg-amber-400",
  Low:    "bg-green-500",
};

const HEALTH_CONFIG = {
  unknown:  { dot: "bg-gray-400", label: "ML service: unknown" },
  ok:       { dot: "bg-green-500", label: "ML service: reachable" },
  degraded: { dot: "bg-red-500",  label: "ML service: unreachable" },
};

// ─── sub-components ───────────────────────────────────────────────────────────

function MedicineTags({ medicines, onRemove }) {
  if (medicines.length === 0) {
    return (
      <p className="text-xs text-gray-400 py-1 select-none">
        No medicines added yet
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {medicines.map((m) => (
        <span
          key={m.id}
          className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 ring-1 ring-blue-200 text-xs px-2.5 py-1 rounded-full"
        >
          <span className="font-medium">#{m.id}</span>
          <span className="text-blue-600">{m.name}</span>
          <button
            onClick={() => onRemove(m.id)}
            className="text-blue-400 hover:text-blue-700 leading-none ml-0.5 focus:outline-none"
            aria-label={`Remove ${m.name}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-medium text-gray-900">{value ?? "—"}</p>
    </div>
  );
}

function InteractionRow({ interaction }) {
  const risk = getRiskLevel(interaction.probability);
  const pct = Math.round(interaction.probability * 100);
  return (
    <div className="flex items-center gap-4 border border-gray-100 rounded-xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 flex-wrap">
          <span className="truncate">{interaction.drug1Name}</span>
          <span className="text-gray-400 text-xs font-normal">×</span>
          <span className="truncate">{interaction.drug2Name}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          IDs: {interaction.drug1Id} &amp; {interaction.drug2Id}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="text-sm font-medium text-gray-800">{pct}%</span>
        <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${RISK_BAR_COLOR[risk]}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-1.5 mt-0.5">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${RISK_STYLES[risk]}`}>
            {risk}
          </span>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              interaction.interacts
                ? "bg-red-50 text-red-800 ring-1 ring-red-200"
                : "bg-green-50 text-green-800 ring-1 ring-green-200"
            }`}
          >
            {interaction.interacts ? "Interacts" : "Safe"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function DrugInteractionChecker() {
  const { result, loading, error, mlHealth, healthLoading, checkInteractions, refreshHealth, reset } =
    useDrugInteraction();

  const [patientUserId, setPatientUserId] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [medIdInput, setMedIdInput] = useState("");
  const [medNameInput, setMedNameInput] = useState("");
  const [threshold, setThreshold] = useState(0.5);
  const [dupError, setDupError] = useState(false);
  const medIdRef = useRef(null);

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  function addMedicine() {
    const id = parseInt(medIdInput, 10);
    if (!id || isNaN(id) || id < 1) return;
    if (medicines.find((m) => m.id === id)) {
      setDupError(true);
      setTimeout(() => setDupError(false), 1200);
      return;
    }
    const name = medNameInput.trim() || `Medicine #${id}`;
    setMedicines((prev) => [...prev, { id, name }]);
    setMedIdInput("");
    setMedNameInput("");
    medIdRef.current?.focus();
    reset();
  }

  function removeMedicine(id) {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    reset();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (medicines.length === 0 || !patientUserId.trim()) return;
    await checkInteractions(
      medicines.map((m) => m.id),
      patientUserId.trim(),
      threshold
    );
  }

  const health = HEALTH_CONFIG[mlHealth];
  const sortedInteractions = result
    ? [...result.interactions].sort((a, b) => b.probability - a.probability)
    : [];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 font-sans">
      {/* header */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-900">Drug interaction checker</h1>
        <p className="text-sm text-gray-500 mt-1">
          Check interactions between new order medicines and patient history
        </p>
      </div>

      {/* form card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm">

        {/* patient id */}
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-2">
            Patient
          </p>
          <label className="block text-xs text-gray-500 mb-1">Patient user ID (GUID)</label>
          <input
            type="text"
            value={patientUserId}
            onChange={(e) => setPatientUserId(e.target.value)}
            placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder:text-gray-300"
          />
        </div>

        <hr className="border-gray-100 mb-5" />

        {/* medicines */}
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-2">
            New order medicines
          </p>

          {/* tag display */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-h-[44px] mb-2">
            <MedicineTags medicines={medicines} onRemove={removeMedicine} />
          </div>

          {/* add row */}
          <div className="flex gap-2">
            <input
              ref={medIdRef}
              type="number"
              min="1"
              value={medIdInput}
              onChange={(e) => setMedIdInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMedicine())}
              placeholder="Medicine ID"
              className={`w-32 bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder:text-gray-300 ${
                dupError ? "border-red-400" : "border-gray-200"
              }`}
            />
            <input
              type="text"
              value={medNameInput}
              onChange={(e) => setMedNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMedicine())}
              placeholder="Name (display only)"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 placeholder:text-gray-300"
            />
            <button
              type="button"
              onClick={addMedicine}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
            >
              + Add
            </button>
          </div>
          {dupError && (
            <p className="text-xs text-red-500 mt-1">This medicine ID is already added.</p>
          )}
          <p className="text-xs text-gray-400 mt-1.5">
            Enter the numeric ID from your database. Name is for display only.
          </p>
        </div>

        <hr className="border-gray-100 mb-5" />

        {/* threshold */}
        <div className="mb-5">
          <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-2">
            Interaction threshold
          </p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(threshold * 100)}
              onChange={(e) => setThreshold(parseInt(e.target.value, 10) / 100)}
              className="flex-1 accent-gray-700"
            />
            <span className="text-sm font-medium text-gray-800 w-10 text-right tabular-nums">
              {threshold.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Probability above which a pair is flagged as interacting.
          </p>
        </div>

        <hr className="border-gray-100 mb-5" />

        {/* submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || medicines.length === 0 || !patientUserId.trim()}
          className="w-full py-2.5 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {loading ? "Checking…" : "Check interactions"}
        </button>

        {/* health status */}
        <div className="flex items-center gap-2 mt-3">
          <span className={`inline-block w-2 h-2 rounded-full ${health.dot}`} />
          <span className="text-xs text-gray-400">{health.label}</span>
          <button
            type="button"
            onClick={refreshHealth}
            disabled={healthLoading}
            className="text-xs text-gray-400 underline ml-1 hover:text-gray-600 disabled:opacity-50"
          >
            {healthLoading ? "…" : "refresh"}
          </button>
        </div>
      </div>

      {/* error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {/* results */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-3">
            Results
          </p>

          {/* ml unavailable warning */}
          {result.mlServiceUnavailable && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-4 flex gap-2">
              <span>⚠</span>
              <span>
                ML service was unavailable — the order may proceed, but no interaction data was
                returned.
              </span>
            </div>
          )}

          {/* stat cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatCard label="Drugs checked" value={result.totalDrugsChecked} />
            <StatCard label="Pairs evaluated" value={result.totalPairsChecked} />
            <StatCard label="Interactions found" value={result.interactionsFound} />
          </div>

          {/* interaction list */}
          {sortedInteractions.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              No interactions detected above the threshold.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedInteractions.map((interaction, i) => (
                <InteractionRow key={`${interaction.drug1Id}-${interaction.drug2Id}-${i}`} interaction={interaction} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}