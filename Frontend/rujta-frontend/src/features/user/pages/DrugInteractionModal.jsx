// src/features/user/components/checkout/DrugInteractionModal.jsx
import React from "react";

// ─── helpers ──────────────────────────────────────────────────────────────────

const RISK = {
  High:   { bar: "bg-red-500",   badge: "bg-red-50 text-red-800 ring-1 ring-red-200" },
  Medium: { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-800 ring-1 ring-amber-200" },
  Low:    { bar: "bg-green-500", badge: "bg-green-50 text-green-800 ring-1 ring-green-200" },
};

function getRisk(probability) {
  if (probability >= 0.85) return "High";
  if (probability >= 0.65) return "Medium";
  return "Low";
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-gray-50 px-4 py-3">
      <span className="text-[11px] text-gray-400">{label}</span>
      <span className="text-2xl font-medium text-gray-900">{value ?? "—"}</span>
    </div>
  );
}

function InteractionRow({ item }) {
  const risk = getRisk(item.probability);
  const pct = Math.round(item.probability * 100);
  const styles = RISK[risk];

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 px-4 py-3">
      {/* drug names */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-gray-900">
          <span className="truncate">{item.drug1Name}</span>
          <span className="text-xs font-normal text-gray-400">×</span>
          <span className="truncate">{item.drug2Name}</span>
        </div>
        <p className="mt-0.5 text-xs text-gray-400">
          IDs: {item.drug1Id} &amp; {item.drug2Id}
        </p>
      </div>

      {/* probability + badges */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-sm font-medium text-gray-800 tabular-nums">{pct}%</span>
        <div className="h-1 w-20 overflow-hidden rounded-full bg-gray-200">
          <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-1.5 mt-0.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}>
            {risk}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              item.interacts
                ? "bg-red-50 text-red-800 ring-1 ring-red-200"
                : "bg-green-50 text-green-800 ring-1 ring-green-200"
            }`}
          >
            {item.interacts ? "Interacts" : "Safe"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── main modal ───────────────────────────────────────────────────────────────

/**
 * @param {{
 *   result: import("../../../drug interaction/hook/useDrugInteraction").OrderDrugInteractionResponseDto | null,
 *   loading: boolean,
 *   onProceed: () => void,
 *   onBack: () => void,
 * }} props
 */
export default function DrugInteractionModal({ result, loading, onProceed, onBack }) {
  const interactions = result
    ? [...result.interactions].sort((a, b) => b.probability - a.probability)
    : [];

  const hasHighRisk = interactions.some((i) => getRisk(i.probability) === "High" && i.interacts);

  return (
    // backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl">

        {/* header */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Drug interaction check</h2>
          <p className="mt-1 text-sm text-gray-500">
            We checked your selected medicines against your order history.
          </p>
        </div>

        {/* loading state */}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <span className="ml-3 text-sm text-gray-500">Checking interactions…</span>
          </div>
        )}

        {/* ml unavailable warning */}
        {!loading && result?.mlServiceUnavailable && (
          <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span>⚠</span>
            <span>
              The ML service is currently unavailable. We couldn't check for interactions — you may
              still proceed, but exercise caution.
            </span>
          </div>
        )}

        {/* results */}
        {!loading && result && !result.mlServiceUnavailable && (
          <>
            {/* high risk banner */}
            {hasHighRisk && (
              <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <span>🚨</span>
                <span>
                  <strong>High-risk interactions detected.</strong> Please review before proceeding.
                </span>
              </div>
            )}

            {/* stat cards */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Drugs checked" value={result.totalDrugsChecked} />
              <StatCard label="Pairs evaluated" value={result.totalPairsChecked} />
              <StatCard label="Interactions" value={result.interactionsFound} />
            </div>

            {/* interaction list */}
            {interactions.length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                <span>✅</span>
                <span>No interactions detected. Safe to proceed.</span>
              </div>
            ) : (
              <div className="flex max-h-52 flex-col gap-2 overflow-y-auto pr-1">
                {interactions.map((item, i) => (
                  <InteractionRow
                    key={`${item.drug1Id}-${item.drug2Id}-${i}`}
                    item={item}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* actions */}
        {!loading && (
          <div className="flex gap-3 pt-1">
            <button
              onClick={onBack}
              className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              ← Go back
            </button>
            <button
              onClick={onProceed}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition-colors ${
                hasHighRisk
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-900 hover:bg-gray-700"
              }`}
            >
              {hasHighRisk ? "Proceed anyway" : "Proceed to payment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}