import React from "react";
import PharmacyCard from "./PharmacyCard";

const SpinnerIcon = () => (
  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
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

const PharmacyList = ({
  pharmacies,
  loading,
  errorMessage,
  expandedPharmacies,
  setExpandedPharmacies,
  selectedPharmacies,
  selectedMedicines,
  routeData,
  creatingOrder,
  showAddressSelection,
  onTogglePharmacy,
  onToggleMedicine,
  onOrderClick,
  onExpandRange,
  onOpenPaymentModal,
  setHoveredPharmacyId,
}) => (
  <>
    {loading && (
      <div className="flex items-center gap-2 py-4 text-gray-500">
        <SpinnerIcon /> Loading pharmacies...
      </div>
    )}

    {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}

    <div className="space-y-4">
      {pharmacies.map((pharmacy, i) => (
        <PharmacyCard
          key={pharmacy.pharmacyId}
          pharmacy={pharmacy}
          index={i}
          isExpanded={expandedPharmacies[pharmacy.pharmacyId] || false}
          isSelected={selectedPharmacies.includes(pharmacy.pharmacyId)}
          routeInfo={routeData[pharmacy.pharmacyId]}
          selectedMedicineIds={selectedMedicines[pharmacy.pharmacyId] || []}
          onToggleExpand={() =>
            setExpandedPharmacies((prev) => ({
              ...prev,
              [pharmacy.pharmacyId]: !prev[pharmacy.pharmacyId],
            }))
          }
          onTogglePharmacy={onTogglePharmacy}
          onToggleMedicine={onToggleMedicine}
          onOrderClick={onOrderClick}
          onMouseEnter={() => setHoveredPharmacyId(pharmacy.pharmacyId)}
          onMouseLeave={() => setHoveredPharmacyId(null)}
        />
      ))}
    </div>

    {/* Action Buttons */}
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
      <button
        onClick={onExpandRange}
        disabled={loading || showAddressSelection || creatingOrder}
        className={`w-full rounded-lg px-5 py-2.5 text-sm font-medium transition-all sm:w-auto md:px-6 md:py-3 md:text-base ${
          loading || showAddressSelection || creatingOrder
            ? "cursor-not-allowed bg-gray-300 text-gray-500"
            : "bg-secondary text-white hover:bg-secondary-dark active:scale-95"
        }`}
      >
        🔍 Expand (+5 km)
      </button>

      <button
        onClick={onOpenPaymentModal}
        disabled={loading || !selectedPharmacies.length || creatingOrder}
        className={`w-full rounded-lg px-5 py-2.5 text-sm font-medium transition-all sm:w-auto md:px-6 md:py-3 md:text-base ${
          loading || !selectedPharmacies.length || creatingOrder
            ? "cursor-not-allowed bg-gray-300 text-gray-500"
            : "bg-secondary text-white hover:bg-secondary-dark active:scale-95"
        }`}
      >
        {creatingOrder
          ? "Processing..."
          : `🛒 Order Selected (${selectedPharmacies.length})`}
      </button>
    </div>
  </>
);

export default PharmacyList;
