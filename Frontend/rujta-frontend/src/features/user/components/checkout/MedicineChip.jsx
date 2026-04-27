// src/features/pharmacies/components/checkout/MedicineChip.jsx
import React from "react";

const MedicineChip = ({
  medicine,
  checked,
  quantity,
  onToggle,
  onQtyChange,
}) => {
  const isFullyAvailable = medicine.isFullyAvailable;
  const shortageQty = medicine.shortageQuantity ?? 0;
  const maxQty = Math.max(medicine.requestedQuantity - shortageQty, 1);
  const requestedQty = medicine.requestedQuantity;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-150 ${
        checked
          ? isFullyAvailable
            ? "border-green-300 bg-green-50 shadow-sm"
            : "border-purple-300 bg-purple-50 shadow-sm"
          : isFullyAvailable
            ? "border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/40"
            : "border-purple-100 bg-purple-50/30"
      } `}
    >
      {/* ── Checkbox ──────────────────────────────────────────────── */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className={`h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-2 ${
          isFullyAvailable
            ? "accent-green-500 focus:ring-green-400"
            : "accent-purple-500 focus:ring-purple-400"
        } `}
      />

      {/* ── Image ─────────────────────────────────────────────────── */}
      {medicine.imageUrl ? (
        <img
          src={medicine.imageUrl}
          alt={medicine.medicineName}
          className="h-9 w-9 rounded-lg object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/fallback-medicine.png";
          }}
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg">
          💊
        </div>
      )}

      {/* ── Name + Shortage ───────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={`truncate text-sm font-medium ${
            isFullyAvailable ? "text-gray-800" : "text-purple-700"
          }`}
        >
          {medicine.medicineName}
        </span>

        {!isFullyAvailable && shortageQty > 0 && (
          <span className="text-xs text-purple-400">
            ⚠️ Shortage: {shortageQty} unit{shortageQty > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Stepper (يظهر فقط لما الدواء محدد) ──────────────────── */}
      {checked && (
        <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-1 py-0.5 shadow-inner">
          <button
            type="button"
            onClick={() => onQtyChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className={`flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold transition-colors ${
              quantity <= 1
                ? "cursor-not-allowed text-gray-300"
                : "text-gray-600 hover:bg-gray-100 active:scale-90"
            } `}
          >
            −
          </button>

          <span
            className={`min-w-[1.75rem] text-center text-sm font-semibold ${isFullyAvailable ? "text-green-700" : "text-purple-700"} `}
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => onQtyChange(Math.min(maxQty, quantity + 1))}
            disabled={quantity >= maxQty}
            className={`flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold transition-colors ${
              quantity >= maxQty
                ? "cursor-not-allowed text-gray-300"
                : "text-gray-600 hover:bg-gray-100 active:scale-90"
            } `}
          >
            +
          </button>
        </div>
      )}

      {/* ── Max Badge ─────────────────────────────────────────────── */}
      <div className="ml-1 flex shrink-0 flex-col items-end gap-0.5">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            isFullyAvailable
              ? "bg-green-100 text-green-700"
              : "bg-purple-100 text-purple-600"
          }`}
        >
          Max {maxQty}
        </span>

        {/* لو المطلوب أكبر من المتاح */}
        {requestedQty > maxQty && (
          <span className="text-[10px] text-gray-400 line-through">
            Need {requestedQty}
          </span>
        )}
      </div>
    </div>
  );
};

export default MedicineChip;
