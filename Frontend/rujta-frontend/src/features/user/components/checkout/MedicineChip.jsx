// src/features/pharmacies/components/MedicineChip.jsx
import React from "react";

const MedicineChip = ({ medicine, checked, onChange }) => {
  const isFullyAvailable = medicine.isFullyAvailable;
  const shortageQty = medicine.shortageQuantity ?? 0;

  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-150 hover:shadow-sm ${
        checked
          ? isFullyAvailable
            ? "border-green-300 bg-green-50"
            : "border-purple-300 bg-purple-50"
          : isFullyAvailable
            ? "border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50"
            : "border-purple-100 bg-purple-50/40"
      }`}
    >
      {/* ── Checkbox ─────────────────────────────────────────── */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`h-4 w-4 rounded border-gray-300 focus:ring-2 ${
          isFullyAvailable
            ? "accent-green-500 focus:ring-green-400"
            : "accent-purple-500 focus:ring-purple-400"
        }`}
      />

      {/* ── Medicine Image ───────────────────────────────────── */}
      {medicine.imageUrl ? (
        <img
          src={medicine.imageUrl}
          alt={medicine.medicineName}
          className="h-8 w-8 rounded-lg object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/fallback-medicine.png";
          }}
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-base">
          💊
        </div>
      )}

      {/* ── Medicine Name + Shortage Warning ─────────────────── */}
      <div className="flex flex-1 flex-col">
        <span
          className={`text-sm font-medium ${
            isFullyAvailable ? "text-gray-800" : "text-purple-700"
          }`}
        >
          {medicine.medicineName}
        </span>

        {!isFullyAvailable && shortageQty > 0 && (
          <span className="text-xs text-purple-500">
            ⚠️ Short by {shortageQty} unit{shortageQty > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Need Badge فقط (بدون Have) ───────────────────────── */}
      <span
        className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
          isFullyAvailable
            ? "bg-green-100 text-green-700"
            : "bg-purple-100 text-purple-600"
        }`}
      >
        Need {medicine.requestedQuantity}
      </span>
    </label>
  );
};

export default MedicineChip;
