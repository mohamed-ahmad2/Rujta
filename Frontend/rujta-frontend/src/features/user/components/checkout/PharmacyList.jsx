// src/features/pharmacies/components/checkout/PharmacyList.jsx
import React from "react";
import PharmacyCard from "../checkout/PharmacyCard";

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
  totalSelectedItems,
  totalSelectedQtyPerMedicine,
  routeData,
  creatingOrder,
  showAddressSelection,
  onTogglePharmacy,
  onToggleMedicine,
  onUpdateQty,
  onOrderClick,
  onExpandRange,
  onOpenPaymentModal,
  setHoveredPharmacyId,
}) => {
  return (
    <>
      {loading && (
        <div className="flex items-center gap-2 py-4 text-gray-500">
          <SpinnerIcon /> Loading pharmacies...
        </div>
      )}

      {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}

      {!loading && !errorMessage && pharmacies.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
          <span className="text-4xl">🏥</span>
          <p className="text-sm">No pharmacies found.</p>
        </div>
      )}

      {/*Selection Summary Banner*/}
      {totalSelectedItems > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-secondary/30 bg-secondary/5 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-secondary">
            <span>🛒</span>
            <span className="font-semibold">
              {totalSelectedItems} item{totalSelectedItems > 1 ? "s" : ""}
            </span>
            <span className="text-gray-500">from</span>
            <span className="font-semibold">
              {selectedPharmacies.length} pharmacy
              {selectedPharmacies.length > 1 ? "s" : ""}
            </span>
          </div>
          <span className="text-xs text-gray-400">✓ Multi-pharmacy order</span>
        </div>
      )}

      {/*Pharmacy Cards*/}
      <div className="space-y-4">
        {pharmacies.map((pharmacy, i) => {
          const medsMap = selectedMedicines[pharmacy.pharmacyId] ?? {};

          return (
            <PharmacyCard
              key={pharmacy.pharmacyId}
              pharmacy={pharmacy}
              index={i}
              isExpanded={expandedPharmacies[pharmacy.pharmacyId] || false}
              routeInfo={routeData[pharmacy.pharmacyId]}
              selectedMedicinesMap={medsMap}
              totalSelectedQtyPerMedicine={totalSelectedQtyPerMedicine}
              onToggleExpand={() =>
                setExpandedPharmacies((prev) => ({
                  ...prev,
                  [pharmacy.pharmacyId]: !prev[pharmacy.pharmacyId],
                }))
              }
              onTogglePharmacy={onTogglePharmacy}
              onToggleMedicine={onToggleMedicine}
              onUpdateQty={onUpdateQty}
              onOrderClick={onOrderClick}
              onMouseEnter={() => setHoveredPharmacyId(pharmacy.pharmacyId)}
              onMouseLeave={() => setHoveredPharmacyId(null)}
            />
          );
        })}
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
          disabled={loading || totalSelectedItems === 0 || creatingOrder}
          className={`w-full rounded-lg px-5 py-2.5 text-sm font-medium transition-all sm:w-auto md:px-6 md:py-3 md:text-base ${
            loading || totalSelectedItems === 0 || creatingOrder
              ? "cursor-not-allowed bg-gray-300 text-gray-500"
              : "bg-secondary text-white hover:bg-secondary-dark active:scale-95"
          }`}
        >
          {creatingOrder
            ? "Processing..."
            : `🛒 Order ${totalSelectedItems} items (${selectedPharmacies.length} pharmacies)`}
        </button>
      </div>
    </>
  );
};

export default PharmacyList;
