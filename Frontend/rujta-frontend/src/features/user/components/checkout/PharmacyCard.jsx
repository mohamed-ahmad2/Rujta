// src/features/pharmacies/components/checkout/PharmacyCard.jsx
import React, { useRef, useEffect } from "react";
import MedicineChip from "../checkout/MedicineChip";

const SpinnerIcon = () => (
  <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8H4z"
    />
  </svg>
);

const PharmacyCard = ({
  pharmacy,
  index,
  isExpanded,
  routeInfo,
  selectedMedicinesMap, // ← { [medicineId]: qty }  بدل array
  onToggleExpand,
  onTogglePharmacy,
  onToggleMedicine,
  onUpdateQty, // ← جديد
  onOrderClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const allMedicines = pharmacy.foundMedicines;
  const allMedIds = allMedicines.map((m) => m.medicineId);
  const selectedCount = Object.keys(selectedMedicinesMap).length;
  const totalCount = allMedIds.length;
  const noneSelected = selectedCount === 0;
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0 && !allSelected;

  const totalShortage = pharmacy.totalShortage ?? 0;
  const partialMatches = pharmacy.partialMatches ?? 0;
  const fullyAvailableCount = pharmacy.foundMedicines.filter(
    (m) => m.isFullyAvailable,
  ).length;
  const partialCount = pharmacy.foundMedicines.filter(
    (m) => !m.isFullyAvailable,
  ).length;

  // ── Indeterminate checkbox ──────────────────────────────────
  const checkboxRef = useRef(null);
  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = someSelected;
  }, [someSelected]);

  useEffect(() => {
    if (selectedCount > 0 && !isExpanded) onToggleExpand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCount]);

  const borderStyle = allSelected
    ? "border-secondary/60 ring-2 ring-secondary/30"
    : someSelected
      ? "border-purple-400/60 ring-2 ring-purple-300/30"
      : "border-gray-200";

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${borderStyle}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 gap-3">
          {/* Checkbox */}
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={allSelected}
            onChange={() => onTogglePharmacy(pharmacy.pharmacyId, allMedicines)}
            title={
              allSelected
                ? "Deselect all"
                : someSelected
                  ? "Select remaining"
                  : "Select all"
            }
            className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 accent-secondary"
          />

          <div className="flex-1 space-y-2">
            <p className="text-base font-semibold text-gray-800">
              {index + 1}. {pharmacy.name}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {routeInfo ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                    🛣️ {routeInfo.distanceKm} km
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                    ⏱ {routeInfo.durationMin} min
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-400">
                  <SpinnerIcon /> Calculating...
                </span>
              )}

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  pharmacy.matchPercentage >= 75
                    ? "bg-green-100 text-green-700"
                    : pharmacy.matchPercentage >= 40
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-600"
                }`}
              >
                {pharmacy.matchPercentage.toFixed(0)}% Match
              </span>

              {pharmacy.matchedDrugs > 0 && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  ✅ {pharmacy.matchedDrugs} Full
                </span>
              )}
              {partialMatches > 0 && (
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                  ⚠️ {partialMatches} Partial
                </span>
              )}
              {totalShortage > 0 && (
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                  📦 -{totalShortage} short
                </span>
              )}

              {allSelected && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                  ✓ All {selectedCount} selected
                </span>
              )}
              {someSelected && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                  ◑ {selectedCount}/{totalCount} selected
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400">📞 {pharmacy.contactNumber}</p>

            <button
              onClick={onToggleExpand}
              className="text-xs font-medium text-secondary transition hover:underline"
            >
              {isExpanded ? "▲ Hide Details" : "▼ Show Details"}
            </button>
          </div>
        </div>

        <button
          onClick={() => onOrderClick(pharmacy)}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-secondary-dark active:scale-95"
        >
          Order
        </button>
      </div>

      {/* ── Expanded Details ─────────────────────────────────────── */}
      {isExpanded && (
        <div className="mt-4 space-y-5 border-t pt-4">
          {/* Summary Bar */}
          <div className="flex flex-wrap gap-2 rounded-xl bg-gray-50 p-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Requested:</span>
              <span className="text-xs font-semibold text-gray-700">
                {pharmacy.totalRequestedDrugs}
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Fully Available:</span>
              <span className="text-xs font-semibold text-green-600">
                {pharmacy.matchedDrugs}
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Partial:</span>
              <span className="text-xs font-semibold text-purple-600">
                {partialMatches}
              </span>
            </div>
            {totalShortage > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Short:</span>
                  <span className="text-xs font-semibold text-orange-600">
                    {totalShortage} units
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Found Medicines */}
          {pharmacy.foundMedicines.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">
                  🟢 Available
                </span>
                {fullyAvailableCount > 0 && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    ✅ {fullyAvailableCount} full
                  </span>
                )}
                {partialCount > 0 && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600">
                    ⚠️ {partialCount} partial
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                {pharmacy.foundMedicines.map((m) => (
                  <MedicineChip
                    key={m.medicineId}
                    medicine={m}
                    checked={m.medicineId in selectedMedicinesMap}
                    quantity={selectedMedicinesMap[m.medicineId] ?? 1}
                    onToggle={() => onToggleMedicine(pharmacy.pharmacyId, m)}
                    onQtyChange={(newQty) =>
                      onUpdateQty(
                        pharmacy.pharmacyId,
                        m.medicineId,
                        newQty,
                        Math.max(
                          m.requestedQuantity - (m.shortageQuantity ?? 0),
                          1,
                        ),
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Not Found */}
          {pharmacy.notFoundMedicines.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">
                  🔴 Unavailable
                </span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                  {pharmacy.notFoundMedicines.length} items
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {pharmacy.notFoundMedicines.map((m) => (
                  <div
                    key={m.medicineId}
                    className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5"
                  >
                    <span className="text-sm text-red-700">
                      {m.medicineName}
                    </span>
                    <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-500">
                      ×{m.requestedQuantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PharmacyCard;
