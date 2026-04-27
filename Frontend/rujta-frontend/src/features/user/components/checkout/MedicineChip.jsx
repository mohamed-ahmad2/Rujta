// src/features/pharmacies/components/checkout/MedicineChip.jsx
import React from "react";

const MedicineChip = ({
  medicine,
  checked,
  quantity,
  effectiveMax, // ← الـ max الذكي بعد حساب الصيدليات الأخرى
  selectedInOtherPharmacies, // ← كمية نفس الدواء محددة في صيدليات أخرى
  pharmacyColor,
  onToggle,
  onQtyChange,
}) => {
  const isFullyAvailable = medicine.isFullyAvailable;
  const shortageQty = medicine.shortageQuantity ?? 0;
  const requestedQty = medicine.requestedQuantity;

  // الكمية الإجمالية المغطاة (هذه الصيدلية + غيرها)
  const totalCovered = (checked ? quantity : 0) + selectedInOtherPharmacies;
  const isFulfilledElsewhere = selectedInOtherPharmacies >= requestedQty;

  // ── ألوان ──────────────────────────────────────────────────
  const chipColor = checked
    ? pharmacyColor
    : isFullyAvailable
      ? "#10B981"
      : "#F59E0B"; // amber للـ partial

  const bgColor = checked
    ? `${chipColor}12`
    : !isFullyAvailable
      ? "#FFFBEB"
      : "#ffffff";

  const borderColor = checked
    ? chipColor
    : !isFullyAvailable
      ? "#FCD34D"
      : "#E5E7EB";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderRadius: 12,
        border: `1.5px solid ${borderColor}`,
        padding: "8px 12px",
        backgroundColor: bgColor,
        transition: "all 0.15s",
        boxShadow: checked ? `0 0 0 2px ${chipColor}20` : "none",
        opacity: isFulfilledElsewhere && !checked ? 0.55 : 1,
      }}
    >
      {/* ── Checkbox ──────────────────────────────────────────── */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        style={{
          width: 16,
          height: 16,
          cursor: "pointer",
          accentColor: chipColor,
          flexShrink: 0,
        }}
      />

      {/* ── Image ─────────────────────────────────────────────── */}
      {medicine.imageUrl ? (
        <img
          src={medicine.imageUrl}
          alt={medicine.medicineName}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            objectFit: "cover",
            flexShrink: 0,
          }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/fallback-medicine.png";
          }}
        />
      ) : (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: !isFullyAvailable ? "#FEF3C7" : "#F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {!isFullyAvailable ? "⚠️" : "💊"}
        </div>
      )}

      {/* ── Name + Badges ─────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: checked
              ? chipColor
              : !isFullyAvailable
                ? "#92400E"
                : "#374151",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {medicine.medicineName}
        </span>

        {/* Warning: partial availability */}
        {!isFullyAvailable && shortageQty > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#FEF3C7",
              border: "1px solid #FCD34D",
              borderRadius: 6,
              padding: "2px 6px",
              width: "fit-content",
            }}
          >
            <span style={{ fontSize: 11 }}>⚠️</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#92400E" }}>
              Short by {shortageQty} unit{shortageQty > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* ✅ Coverage indicator: لو نفس الدواء متحدد في صيدليات أخرى */}
        {selectedInOtherPharmacies > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              backgroundColor:
                totalCovered >= requestedQty ? "#D1FAE5" : "#EFF6FF",
              border: `1px solid ${totalCovered >= requestedQty ? "#6EE7B7" : "#BFDBFE"}`,
              borderRadius: 6,
              padding: "2px 6px",
              width: "fit-content",
            }}
          >
            <span style={{ fontSize: 11 }}>
              {totalCovered >= requestedQty ? "✅" : "🔗"}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: totalCovered >= requestedQty ? "#065F46" : "#1E40AF",
              }}
            >
              {selectedInOtherPharmacies} from other pharmacy
              {totalCovered >= requestedQty
                ? " — Fully covered!"
                : ` (${totalCovered}/${requestedQty} total)`}
            </span>
          </div>
        )}
      </div>

      {/* ── Stepper ───────────────────────────────────────────── */}
      {checked && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            border: `1px solid ${chipColor}44`,
            borderRadius: 8,
            padding: "2px 4px",
            backgroundColor: "#fff",
          }}
        >
          <button
            type="button"
            onClick={() => onQtyChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            style={{
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              border: "none",
              background: "none",
              cursor: quantity <= 1 ? "not-allowed" : "pointer",
              color: quantity <= 1 ? "#D1D5DB" : "#374151",
              fontWeight: 700,
              fontSize: 16,
            }}
            onMouseEnter={(e) => {
              if (quantity > 1)
                e.currentTarget.style.backgroundColor = "#F3F4F6";
            }}
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            −
          </button>

          <span
            style={{
              minWidth: 24,
              textAlign: "center",
              fontSize: 13,
              fontWeight: 700,
              color: chipColor,
            }}
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => onQtyChange(Math.min(effectiveMax, quantity + 1))}
            disabled={quantity >= effectiveMax}
            style={{
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              border: "none",
              background: "none",
              cursor: quantity >= effectiveMax ? "not-allowed" : "pointer",
              color: quantity >= effectiveMax ? "#D1D5DB" : "#374151",
              fontWeight: 700,
              fontSize: 16,
            }}
            onMouseEnter={(e) => {
              if (quantity < effectiveMax)
                e.currentTarget.style.backgroundColor = "#F3F4F6";
            }}
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            +
          </button>
        </div>
      )}

      {/* ── Max / Coverage Badge ──────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 2,
          flexShrink: 0,
          marginLeft: 4,
        }}
      >
        <span
          style={{
            borderRadius: 999,
            padding: "2px 8px",
            fontSize: 11,
            fontWeight: 700,
            backgroundColor: checked
              ? `${chipColor}20`
              : !isFullyAvailable
                ? "#FEF3C7"
                : "#F3F4F6",
            color: checked
              ? chipColor
              : !isFullyAvailable
                ? "#92400E"
                : "#6B7280",
            border:
              !isFullyAvailable && !checked ? "1px solid #FCD34D" : "none",
          }}
        >
          Max {effectiveMax}
        </span>

        {requestedQty > effectiveMax && (
          <span
            style={{
              fontSize: 10,
              color: "#9CA3AF",
              textDecoration: "line-through",
            }}
          >
            Need {requestedQty}
          </span>
        )}
      </div>
    </div>
  );
};

export default MedicineChip;
