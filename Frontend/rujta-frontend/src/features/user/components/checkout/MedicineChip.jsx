import React from "react";

const MedicineChip = ({ medicine, checked, onChange, disabled }) => {
  const enough = medicine.isQuantityEnough;

  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-150 ${
        disabled ? "cursor-not-allowed opacity-60" : "hover:shadow-sm"
      } ${
        checked && !disabled
          ? "border-green-300 bg-green-50"
          : enough
            ? "border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50"
            : "border-purple-100 bg-purple-50/40"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 rounded border-gray-300 accent-green-500 focus:ring-green-400"
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

      {/* ── Medicine Name ────────────────────────────────────── */}
      <span
        className={`text-sm font-medium ${enough ? "text-gray-800" : "text-purple-700"}`}
      >
        {medicine.medicineName}
      </span>

      {/* ── Quantity Badge ───────────────────────────────────── */}
      <span
        className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
          enough
            ? "bg-green-100 text-green-700"
            : "bg-purple-100 text-purple-600"
        }`}
      >
        need {medicine.requestedQuantity}
      </span>
    </label>
  );
};

export default MedicineChip;
