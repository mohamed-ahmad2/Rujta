// src/features/user/pages/DrugInteractionModal.jsx
import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MdShoppingCartCheckout } from "react-icons/md";
import { BiArrowBack } from "react-icons/bi";
import { GoAlert } from "react-icons/go";
import { FiClock, FiShoppingCart } from "react-icons/fi";

// ─── risk styles ──────────────────────────────────────────────────────────────

const RISK_STYLES = {
  High:   { bar: "bg-red-500",   badge: "bg-red-50 text-red-800 ring-1 ring-red-200" },
  Medium: { bar: "bg-amber-400", badge: "bg-amber-50 text-amber-800 ring-1 ring-amber-200" },
  Low:    { bar: "bg-green-500", badge: "bg-green-50 text-green-800 ring-1 ring-green-200" },
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-gray-50 px-4 py-3">
      <span className="text-[11px] text-gray-400">{label}</span>
      <span className="text-2xl font-medium text-gray-900">{value ?? "—"}</span>
    </div>
  );
}

// ─── InteractionRow ───────────────────────────────────────────────────────────

function InteractionRow({ item }) {
  const styles = RISK_STYLES[item.riskLevel] ?? RISK_STYLES.Low;
  const pct    = Math.round(item.probability * 100);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-gray-900">
          <span className="truncate">{item.drug1Name}</span>

          {item.drug1IsFromHistory && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-500 ring-1 ring-blue-200">
              <FiClock className="text-[9px]" /> history
            </span>
          )}

          <span className="text-xs font-normal text-gray-400">×</span>
          <span className="truncate">{item.drug2Name}</span>

          {item.drug2IsFromHistory && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-500 ring-1 ring-blue-200">
              <FiClock className="text-[9px]" /> history
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-400">
          IDs: {item.drug1Id} &amp; {item.drug2Id}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-sm font-medium text-gray-800 tabular-nums">{pct}%</span>
        <div className="h-1 w-20 overflow-hidden rounded-full bg-gray-200">
          <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-1.5 mt-0.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}>
            {item.riskLevel}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            item.interacts
              ? "bg-red-50 text-red-800 ring-1 ring-red-200"
              : "bg-green-50 text-green-800 ring-1 ring-green-200"
          }`}>
            {item.interacts ? "Interacts" : "Safe"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── ResultPanel ──────────────────────────────────────────────────────────────

function ResultPanel({ result, emptyMessage }) {
  if (!result) return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-400">
      <span>—</span>
      <span>No data available.</span>
    </div>
  );

  if (result.mlServiceUnavailable) return (
    <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <span>⚠</span>
      <span>ML service unavailable. Could not perform this check — you may still proceed with caution.</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Drugs checked"   value={result.totalDrugsChecked} />
        <StatCard label="Pairs evaluated" value={result.totalPairsChecked} />
        <StatCard label="Interactions"    value={result.interactionsFound} />
      </div>

      {result.interactions.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>✅</span>
          <span>{emptyMessage ?? "No interactions detected."}</span>
        </div>
      ) : (
        <div className="flex max-h-52 flex-col gap-2 overflow-y-auto pr-1">
          {result.interactions.map((item, i) => (
            <InteractionRow key={`${item.drug1Id}-${item.drug2Id}-${i}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DrugInteractionModal ─────────────────────────────────────────────────────
//
// يُستخدم من CartDrawerUser فقط.
// result دايماً بالشكل: { orderResult: {...}, historyResult: {...} }
// بيظهر تابين: "Current order" و "vs. History"
//
// @param {object|null}  result     — { orderResult, historyResult }
// @param {boolean}      loading    — interactionLoading
// @param {string|null}  error      — interactionError
// @param {() => void}   onProceed  — يكمل للـ Checkout
// @param {() => void}   onBack     — يرجع ويمسح

export default function DrugInteractionModal({ result, loading, error, onProceed, onBack }) {
  const [activeTab, setActiveTab] = useState("order");

  const orderResult   = result?.orderResult   ?? null;
  const historyResult = result?.historyResult ?? null;

  const allInteractions = [
    ...(orderResult?.interactions   ?? []),
    ...(historyResult?.interactions ?? []),
  ];
  const hasHighRisk  = allInteractions.some((i) => i.riskLevel === "High" && i.interacts);
  const orderCount   = orderResult?.interactionsFound   ?? 0;
  const historyCount = historyResult?.interactionsFound ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-start gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
            hasHighRisk ? "bg-red-50" : "bg-amber-50"
          }`}>
            <GoAlert className={`text-xl ${hasHighRisk ? "text-red-500" : "text-amber-500"}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight">
              Drug interaction check
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              We checked your cart medicines against each other and your order history.
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
          >
            <IoMdClose className="text-base" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        <div className="px-6 py-4 flex flex-col gap-4">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <span className="ml-3 text-sm text-gray-500">Checking interactions…</span>
            </div>
          )}

          {/* API error */}
          {!loading && error && (
            <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span>⚠</span>
              <span>{error} — you may still proceed, but exercise caution.</span>
            </div>
          )}

          {/* Results */}
          {!loading && !error && result && (
            <>
              {/* High risk banner */}
              {hasHighRisk && (
                <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  <span>🚨</span>
                  <span>
                    <strong>High-risk interactions detected.</strong> Please review before proceeding.
                  </span>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                <button
                  onClick={() => setActiveTab("order")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                    activeTab === "order"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <FiShoppingCart className="text-sm" />
                  Current order
                  {orderCount > 0 && (
                    <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {orderCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                    activeTab === "history"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <FiClock className="text-sm" />
                  vs. History
                  {historyCount > 0 && (
                    <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-white">
                      {historyCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab content */}
              {activeTab === "order" && (
                <ResultPanel
                  result={orderResult}
                  emptyMessage="No interactions found between medicines in your current order."
                />
              )}
              {activeTab === "history" && (
                <ResultPanel
                  result={historyResult}
                  emptyMessage="No interactions found between your order and previous history."
                />
              )}
            </>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        {!loading && (
          <div className="flex gap-3 px-6 pb-6 pt-1">
            <button
              onClick={onBack}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95"
            >
              <BiArrowBack className="text-sm" />
              ← Go back
            </button>
            <button
              onClick={onProceed}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white transition-colors active:scale-95 ${
                hasHighRisk
                  ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                  : "bg-gray-900 hover:bg-gray-700"
              }`}
            >
              <MdShoppingCartCheckout className="text-sm" />
              {hasHighRisk ? "Proceed anyway" : "Proceed to checkout"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}