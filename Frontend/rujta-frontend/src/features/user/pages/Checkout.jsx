// src/features/pharmacies/pages/Checkout.jsx
import React from "react";
import clickSound from "../../../assets/audio.wav";
import PharmacyMap from "../components/PharmacyMap";
import Toast from "../components/checkout/Toast";
import AddressSelection from "../components/checkout/AddressSelection";
import PharmacyList from "../components/checkout/PharmacyList";
import PaymentModal from "../components/checkout/PaymentModal";
import PaymentIframeModal from "../components/checkout/PaymentIframeModal";
import { useCheckout } from "../hooks/useCheckout";

const audio = new Audio(clickSound);
audio.volume = 0.4;

const Checkout = () => {
  const {
    pharmacies,
    loading,
    error,
    addresses,
    addressesLoading,
    addressesError,
    showLocationPrompt,
    showAddressSelection,
    selectedAddressId,
    setSelectedAddressId,
    showNewAddressForm,
    setShowNewAddressForm,
    isConfirmingAddress,
    newAddressForm,
    setNewAddressForm,
    expandedPharmacies,
    setExpandedPharmacies,
    showPaymentModal,
    setShowPaymentModal,
    selectedPharmacyForPayment,
    paymentMethod,
    setPaymentMethod,
    selectedPharmacies,
    totalSelectedItems,
    totalSelectedQtyPerMedicine,
    creatingOrder,
    selectedMedicines,
    initiatingPayment,
    showPaymentIframe,
    paymentResult,
    userLocation,
    deliveryAddressLocation,
    deliveryAddress,
    hoveredPharmacyId,
    setHoveredPharmacyId,
    routeData,
    toast,
    setToast,
    handleSetLocation,
    handleNewAddressChange,
    handleAddNewAddress,
    handleConfirmAddress,
    handleExpandRange,
    handleTogglePharmacy,
    handleToggleMedicine,
    handleUpdateQty,
    handleOrderClick,
    handlePaymentConfirm,
    handleCloseIframe,
  } = useCheckout();

  const errorMessage = typeof error === "string" ? error : error?.message || "";

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gray-100 p-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex h-[700px] w-[1150px] flex-col rounded-3xl bg-white shadow-xl lg:flex-row">
        {/*LEFT: MAP*/}
        <div className="relative h-full w-full overflow-hidden lg:w-1/2">
          <div className="absolute inset-0 z-0">
            <PharmacyMap
              userLocation={userLocation}
              pharmacies={pharmacies}
              selectedPharmacy={selectedPharmacyForPayment}
              deliveryAddressLocation={deliveryAddressLocation}
              deliveryAddress={deliveryAddress}
              hoveredPharmacyId={hoveredPharmacyId}
              selectedPharmacies={selectedPharmacies}
              routeData={routeData}
            />
          </div>
        </div>

        {/*RIGHT: CONTENT*/}
        <div className="h-full w-full overflow-y-auto bg-white p-8 lg:w-1/2">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              Pharmacy Search & Ranking
            </h1>
          </div>

          {/*Location Prompt*/}
          {showLocationPrompt && (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="mb-2 text-sm text-yellow-700">
                📍 Your location is not set. Allow access to set it
                automatically.
              </p>
              <button
                onClick={handleSetLocation}
                className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Set My Location
              </button>
            </div>
          )}

          {/*Address Selection OR Pharmacy List*/}
          {showAddressSelection ? (
            <AddressSelection
              addresses={addresses}
              addressesLoading={addressesLoading}
              addressesError={addressesError}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              showNewAddressForm={showNewAddressForm}
              setShowNewAddressForm={setShowNewAddressForm}
              newAddressForm={newAddressForm}
              setNewAddressForm={setNewAddressForm}
              handleNewAddressChange={handleNewAddressChange}
              handleAddNewAddress={handleAddNewAddress}
              handleConfirmAddress={handleConfirmAddress}
              isConfirmingAddress={isConfirmingAddress}
              audio={audio}
            />
          ) : (
            <PharmacyList
              pharmacies={pharmacies}
              loading={loading}
              errorMessage={errorMessage}
              expandedPharmacies={expandedPharmacies}
              setExpandedPharmacies={setExpandedPharmacies}
              selectedPharmacies={selectedPharmacies}
              selectedMedicines={selectedMedicines}
              totalSelectedItems={totalSelectedItems}
              totalSelectedQtyPerMedicine={totalSelectedQtyPerMedicine}
              routeData={routeData}
              creatingOrder={creatingOrder}
              showAddressSelection={showAddressSelection}
              onTogglePharmacy={handleTogglePharmacy}
              onToggleMedicine={handleToggleMedicine}
              onUpdateQty={handleUpdateQty}
              onOrderClick={handleOrderClick}
              onExpandRange={handleExpandRange}
              onOpenPaymentModal={() => setShowPaymentModal(true)}
              setHoveredPharmacyId={setHoveredPharmacyId}
            />
          )}
        </div>
      </div>

      {/*Payment Method Modal*/}
      {showPaymentModal && (
        <PaymentModal
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          creatingOrder={creatingOrder}
          initiatingPayment={initiatingPayment}
          onConfirm={handlePaymentConfirm}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/*Paymob Iframe Modal*/}
      {showPaymentIframe && paymentResult?.iframeUrl && (
        <PaymentIframeModal
          iframeUrl={paymentResult.iframeUrl}
          onClose={handleCloseIframe}
        />
      )}
    </div>
  );
};

export default Checkout;
