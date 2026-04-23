import React, { useEffect, useState, useCallback } from "react";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";
import { useOrders } from "../../orders/hooks/useOrders";
import { useAuth } from "../../auth/hooks/useAuth";
import useAddress from "../../address/hook/useAddress";
import apiClient from "../../../shared/api/apiClient";
import PharmacyMap from "../components/PharmacyMap";
import clickSound from "../../../assets/audio.wav";

const audio = new Audio(clickSound);
audio.volume = 0.4;

const decodePolyline = (encoded) => {
  let index = 0;
  let lat = 0,
    lng = 0;
  const coordinates = [];
  while (index < encoded.length) {
    let shift = 0,
      result = 0,
      byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    coordinates.push([lat / 1e5, lng / 1e5]);
  }
  return coordinates;
};

// ─── Toast Component ───────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const isSuccess = toast.type === "success";

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] flex items-center justify-center">
      <div
        className={`pointer-events-auto mx-4 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ${
          isSuccess
            ? "border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
            : "border border-red-200 bg-gradient-to-br from-red-50 to-rose-50"
        }`}
        style={{ animation: "fadeInScale 0.3s ease-out" }}
      >
        <div
          className={`h-1.5 w-full ${isSuccess ? "bg-green-400" : "bg-red-400"}`}
        />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl ${
                isSuccess ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isSuccess ? "✅" : "❌"}
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-bold ${isSuccess ? "text-green-800" : "text-red-800"}`}
              >
                {isSuccess
                  ? "Order Placed Successfully!"
                  : "Something went wrong"}
              </h3>
              <p
                className={`mt-1 text-sm ${isSuccess ? "text-green-700" : "text-red-700"}`}
              >
                {toast.message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-xl leading-none text-gray-400 transition hover:text-gray-600"
            >
              ×
            </button>
          </div>
          {isSuccess && (
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-green-100">
              <div
                className="h-full rounded-full bg-green-400"
                style={{ animation: "shrink 3s linear forwards" }}
              />
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className={`rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 ${
                isSuccess
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isSuccess ? "Great! 🎉" : "Close"}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// ─── MedicineChip Component ────────────────────────────────────────────────────
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
      <span
        className={`text-sm font-medium ${enough ? "text-gray-800" : "text-purple-700"}`}
      >
        {medicine.medicineName}
      </span>
      {/* ✅ need فقط */}
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

// ─── Main Checkout Component ───────────────────────────────────────────────────
const Checkout = () => {
  const [cart, setCart] = useState([]);
  const { pharmacies, loading, error, fetchPharmacies } = usePharmacies();
  const { fetchUser } = useOrders();
  const { user } = useAuth();
  const {
    addresses,
    loading: addressesLoading,
    error: addressesError,
    fetchUserAddresses,
    create: createAddress,
    fetchById,
  } = useAddress();

  const [pharmaciesRange, setPharmaciesRange] = useState(5);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showAddressSelection, setShowAddressSelection] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isConfirmingAddress, setIsConfirmingAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    Street: "",
    BuildingNo: "",
    City: "",
    Governorate: "",
    IsDefault: false,
  });

  const [expandedPharmacies, setExpandedPharmacies] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPharmacyForPayment, setSelectedPharmacyForPayment] =
    useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [selectedPharmacies, setSelectedPharmacies] = useState([]);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [routeToPharmacy, setRouteToPharmacy] = useState(null);
  const [selectedMedicines, setSelectedMedicines] = useState({});
  const [deliveryAddressLocation, setDeliveryAddressLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [hoveredPharmacyId, setHoveredPharmacyId] = useState(null);
  const [routeData, setRouteData] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    if (type === "success") {
      setTimeout(() => setToast(null), 3200);
    }
  }, []);

  const fetchRoute = useCallback(
    async (pharmacy) => {
      const start = deliveryAddressLocation || userLocation;
      if (!start || !pharmacy) return;
      const cacheKey = pharmacy.pharmacyId;
      setRouteData((prev) => {
        if (prev[cacheKey]) return prev;
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${pharmacy.longitude},${pharmacy.latitude}?overview=full&geometries=polyline`;
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (data.code === "Ok" && data.routes?.[0]) {
              const encoded = data.routes[0].geometry;
              const coordinates = decodePolyline(encoded);
              const distanceKm = (data.routes[0].distance / 1000).toFixed(2);
              const durationMin = Math.round(data.routes[0].duration / 60);
              setRouteData((p) => ({
                ...p,
                [cacheKey]: { coordinates, distanceKm, durationMin },
              }));
            }
          })
          .catch((err) =>
            console.error(
              "OSRM route error for pharmacy",
              pharmacy.pharmacyId,
              err,
            ),
          );
        return prev;
      });
    },
    [deliveryAddressLocation, userLocation],
  );

  useEffect(() => {
    if (pharmacies.length === 0) return;
    pharmacies.forEach((p) => fetchRoute(p));
  }, [pharmacies, fetchRoute]);

  useEffect(() => {
    if (!user) return;
    const key = `cart_${user.email}`;
    const stored = JSON.parse(localStorage.getItem(key)) || [];
    setCart(stored);
    fetchUserAddresses();
  }, [user, fetchUserAddresses]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => console.error("Geolocation error:", err),
      );
    }
  }, []);

  useEffect(() => {
    const errorMessage =
      typeof error === "string" ? error : error?.message || "";
    if (
      errorMessage.includes("User location not set") ||
      errorMessage.includes("location not set")
    ) {
      setShowLocationPrompt(true);
    }
  }, [error]);

  const handleSetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await apiClient.put("/users/location", { latitude, longitude });
            setUserLocation({ lat: latitude, lng: longitude });
            setShowLocationPrompt(false);
          } catch (updateErr) {
            console.error("Failed to update location:", updateErr);
          }
        },
        (geoErr) => console.error("Geolocation error:", geoErr),
      );
    }
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNewAddress = async () => {
    try {
      await createAddress(newAddressForm);
      await fetchUserAddresses();
      setShowNewAddressForm(false);
    } catch (err) {
      console.error("Failed to add new address:", err);
    }
  };

  const handleConfirmAddress = async () => {
    if (!selectedAddressId) {
      showToast("error", "Please select a delivery address!");
      return;
    }
    setIsConfirmingAddress(true);
    try {
      if (cart.length > 0) {
        const dtoItems = cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        }));
        await fetchPharmacies(dtoItems, selectedAddressId, pharmaciesRange);
      }
      const fullAddress = await fetchById(selectedAddressId);
      if (fullAddress?.latitude && fullAddress?.longitude) {
        setDeliveryAddressLocation({
          lat: fullAddress.latitude,
          lng: fullAddress.longitude,
        });
        setDeliveryAddress(fullAddress);
      }
      setShowAddressSelection(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConfirmingAddress(false);
    }
  };

  const handleExpandRange = async () => {
    const newRange = pharmaciesRange + 5;
    setPharmaciesRange(newRange);
    if (!selectedAddressId || cart.length === 0) return;
    const dtoItems = cart.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }));
    await fetchPharmacies(dtoItems, selectedAddressId, newRange);
  };

  const handleTogglePharmacy = (pharmacyId) => {
    const isAlreadySelected = selectedPharmacies.includes(pharmacyId);
    if (isAlreadySelected) {
      setSelectedPharmacies((prev) => prev.filter((id) => id !== pharmacyId));
      setSelectedMedicines((prev) => {
        const updated = { ...prev };
        delete updated[pharmacyId];
        return updated;
      });
    } else {
      const pharmacy = pharmacies.find((p) => p.pharmacyId === pharmacyId);
      const allMedicineIds =
        pharmacy?.foundMedicines
          .filter((m) => m.isQuantityEnough)
          .map((m) => m.medicineId) ?? [];
      setSelectedPharmacies((prev) => [...prev, pharmacyId]);
      setSelectedMedicines((prev) => ({
        ...prev,
        [pharmacyId]: allMedicineIds,
      }));
    }
  };

  const handleToggleMedicine = (pharmacyId, medicineId) => {
    setSelectedMedicines((prev) => {
      const pharmacyMeds = prev[pharmacyId] || [];
      const updated = pharmacyMeds.includes(medicineId)
        ? pharmacyMeds.filter((id) => id !== medicineId)
        : [...pharmacyMeds, medicineId];
      return { ...prev, [pharmacyId]: updated };
    });
  };

  const handleOrderClick = (pharmacy) => {
    setSelectedPharmacyForPayment(pharmacy);
    setSelectedPharmacies([pharmacy.pharmacyId]);
    const allMedicineIds = pharmacy.foundMedicines
      .filter((m) => m.isQuantityEnough)
      .map((m) => m.medicineId);
    setSelectedMedicines({ [pharmacy.pharmacyId]: allMedicineIds });
    if (userLocation) {
      setRouteToPharmacy({
        from: userLocation,
        to: { latitude: pharmacy.latitude, longitude: pharmacy.longitude },
      });
    }
    setShowPaymentModal(true);
  };

  const handleConfirmOrders = async () => {
    if (cart.length === 0) {
      showToast("error", "Your cart is empty!");
      return;
    }
    if (!selectedAddressId) {
      showToast("error", "No delivery address selected!");
      return;
    }
    if (selectedPharmacies.length === 0) {
      showToast("error", "No pharmacies selected!");
      return;
    }

    setCreatingOrder(true);
    const orderDtos = [];

    for (const pharmacyId of selectedPharmacies) {
      const selectedPharmacy = pharmacies.find(
        (p) => p.pharmacyId === pharmacyId,
      );
      if (!selectedPharmacy) continue;
      const selectedMedicineIds = selectedMedicines[pharmacyId] || [];
      const selectedItems = selectedPharmacy.foundMedicines.filter(
        (m) => selectedMedicineIds.includes(m.medicineId) && m.isQuantityEnough,
      );
      if (selectedItems.length === 0) continue;
      orderDtos.push({
        PharmacyID: pharmacyId,
        DeliveryAddressId: selectedAddressId,
        OrderItems: selectedItems.map((m) => ({
          MedicineID: m.medicineId,
          Quantity: m.requestedQuantity,
        })),
      });
    }

    if (orderDtos.length === 0) {
      showToast(
        "error",
        "No valid orders to create. Check selected medicines & quantities.",
      );
      setCreatingOrder(false);
      return;
    }

    try {
      const response = await apiClient.post("/orders", orderDtos);
      const results = response.data;
      if (results && results.length > 0) {
        const orderedIdsSet = new Set();
        orderDtos.forEach((dto) =>
          dto.OrderItems.forEach((item) => orderedIdsSet.add(item.MedicineID)),
        );
        const updatedCart = cart.filter((item) => !orderedIdsSet.has(item.id));
        localStorage.setItem(`cart_${user.email}`, JSON.stringify(updatedCart));
        window.dispatchEvent(
          new StorageEvent("storage", { key: `cart_${user.email}` }),
        );
        setCart(updatedCart);
        setSelectedPharmacies([]);
        setSelectedMedicines({});
        await fetchUser();
        showToast(
          "success",
          `${results.length} order${results.length > 1 ? "s" : ""} placed successfully! 🎉`,
        );
        setTimeout(() => window.location.reload(), 3200);
      } else {
        showToast("error", "Failed to create orders. Please try again.");
      }
    } catch (err) {
      console.error("Error creating orders:", err);
      showToast("error", "Failed to create orders. Check console for details.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handlePaymentConfirm = async () => {
    setShowPaymentModal(false);
    if (paymentMethod === "Cash") {
      await handleConfirmOrders();
    } else {
      window.location.href = `/user/payment`;
    }
  };

  const errorMessage = typeof error === "string" ? error : error?.message || "";

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gray-100 p-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex h-[700px] w-[1150px] flex-col rounded-3xl bg-white shadow-xl lg:flex-row">
        {/* LEFT – MAP */}
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

        {/* RIGHT – CONTENT */}
        <div className="h-full w-full overflow-y-auto bg-white p-8 lg:w-1/2">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              Pharmacy Search & Ranking
            </h1>
          </div>

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

          {showAddressSelection ? (
            <div className="max-h-[80vh] w-full overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">
                Select Delivery Address
              </h2>

              {addressesLoading && (
                <p className="mb-4 text-gray-600">Loading addresses...</p>
              )}
              {addressesError && (
                <p className="mb-4 text-red-500">{addressesError}</p>
              )}

              {!showNewAddressForm ? (
                <div className="mb-6 flex flex-col gap-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Choose an address:
                  </label>
                  <select
                    value={selectedAddressId || ""}
                    onChange={(e) =>
                      setSelectedAddressId(parseInt(e.target.value) || null)
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                  >
                    <option value="">Select an address...</option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.street}, {addr.buildingNo}, {addr.city},{" "}
                        {addr.governorate} {addr.isDefault ? "(Default)" : ""}
                      </option>
                    ))}
                  </select>
                  {addresses.length === 0 && (
                    <p className="text-gray-600">
                      No addresses found. Please add a new one.
                    </p>
                  )}
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="mt-2 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 transition hover:bg-gray-300"
                  >
                    Add New Address
                  </button>
                </div>
              ) : (
                <div className="mb-6 flex flex-col gap-4">
                  {[
                    {
                      label: "Street",
                      name: "Street",
                      placeholder: "Enter street name",
                    },
                    {
                      label: "Building No",
                      name: "BuildingNo",
                      placeholder: "Enter building number",
                    },
                    {
                      label: "City",
                      name: "City",
                      placeholder: "Enter city",
                    },
                    {
                      label: "Governorate",
                      name: "Governorate",
                      placeholder: "Enter governorate",
                    },
                  ].map(({ label, name, placeholder }) => (
                    <div key={name}>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        {label}
                      </label>
                      <input
                        type="text"
                        name={name}
                        placeholder={placeholder}
                        value={newAddressForm[name]}
                        onChange={handleNewAddressChange}
                        className="w-full rounded-lg border border-gray-300 p-2 transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                  ))}
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="IsDefault"
                      checked={newAddressForm.IsDefault}
                      onChange={(e) =>
                        setNewAddressForm((prev) => ({
                          ...prev,
                          IsDefault: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 accent-secondary"
                    />
                    Set as Default
                  </label>
                  <button
                    onClick={handleAddNewAddress}
                    className="mt-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600"
                  >
                    Save New Address
                  </button>
                  <button
                    onClick={() => {
                      setShowAddressSelection(false);
                      window.location.reload();
                    }}
                    className="rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-800 transition hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="mt-6 flex justify-center gap-4">
                {!showNewAddressForm && (
                  <button
                    onClick={() => {
                      handleConfirmAddress();
                      audio.currentTime = 0;
                      audio.play();
                    }}
                    disabled={!selectedAddressId || isConfirmingAddress}
                    className="rounded-lg bg-secondary px-5 py-2 font-medium text-white transition-all duration-200 hover:bg-secondary-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isConfirmingAddress ? "Searching..." : "Confirm Address"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {loading && (
                <div className="flex items-center gap-2 py-4 text-gray-500">
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
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
                  Loading pharmacies...
                </div>
              )}
              {errorMessage && (
                <p className="mb-4 text-red-500">{errorMessage}</p>
              )}

              <div className="space-y-4">
                {pharmacies.map((p, i) => {
                  const isExpanded = expandedPharmacies[p.pharmacyId] || false;
                  const isSelected = selectedPharmacies.includes(p.pharmacyId);
                  const realRoute = routeData[p.pharmacyId];
                  const availableCount = p.foundMedicines.filter(
                    (m) => m.isQuantityEnough,
                  ).length;
                  const partialCount = p.foundMedicines.filter(
                    (m) => !m.isQuantityEnough,
                  ).length;
                  const selectedCount = (selectedMedicines[p.pharmacyId] || [])
                    .length;

                  return (
                    <div
                      key={p.pharmacyId}
                      className={`rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                        isSelected
                          ? "border-secondary/50 ring-1 ring-secondary/30"
                          : "border-gray-200"
                      }`}
                      onMouseEnter={() => setHoveredPharmacyId(p.pharmacyId)}
                      onMouseLeave={() => setHoveredPharmacyId(null)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* LEFT SIDE */}
                        <div className="flex flex-1 gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTogglePharmacy(p.pharmacyId)}
                            className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 accent-secondary"
                          />

                          <div className="flex-1 space-y-2">
                            <p className="text-base font-semibold text-gray-800">
                              {i + 1}. {p.name}
                            </p>

                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {realRoute ? (
                                <>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                                    🛣️ {realRoute.distanceKm} km
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                                    ⏱ {realRoute.durationMin} min
                                  </span>
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-400">
                                  <svg
                                    className="h-3 w-3 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
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
                                  Calculating...
                                </span>
                              )}

                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  p.matchPercentage >= 75
                                    ? "bg-green-100 text-green-700"
                                    : p.matchPercentage >= 40
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-600"
                                }`}
                              >
                                {p.matchPercentage.toFixed(0)}% Match
                              </span>

                              {isSelected && (
                                <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                                  ✓ {selectedCount} selected
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-400">
                              📞 {p.contactNumber}
                            </p>

                            <button
                              onClick={() =>
                                setExpandedPharmacies((prev) => ({
                                  ...prev,
                                  [p.pharmacyId]: !isExpanded,
                                }))
                              }
                              className="text-xs font-medium text-secondary transition hover:underline"
                            >
                              {isExpanded ? "▲ Hide Details" : "▼ Show Details"}
                            </button>
                          </div>
                        </div>

                        {/* RIGHT SIDE – Order Button */}
                        <button
                          onClick={() => handleOrderClick(p)}
                          className="rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-secondary-dark active:scale-95"
                        >
                          Order
                        </button>
                      </div>

                      {/* ── EXPANDED SECTION ──────────────────────────────────── */}
                      {isExpanded && (
                        <div className="mt-4 space-y-5 border-t pt-4">
                          {/* Found Medicines */}
                          {p.foundMedicines.length > 0 && (
                            <div>
                              <div className="mb-3 flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-700">
                                  ✅ Found Medicines
                                </span>
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                  {availableCount} available
                                </span>
                                {partialCount > 0 && (
                                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600">
                                    {partialCount} partial
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {p.foundMedicines.map((m) => (
                                  <MedicineChip
                                    key={m.medicineId}
                                    medicine={m}
                                    checked={
                                      selectedMedicines[p.pharmacyId]?.includes(
                                        m.medicineId,
                                      ) || false
                                    }
                                    onChange={() =>
                                      handleToggleMedicine(
                                        p.pharmacyId,
                                        m.medicineId,
                                      )
                                    }
                                    disabled={!m.isQuantityEnough}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Not Found Medicines */}
                          {p.notFoundMedicines.length > 0 && (
                            <div>
                              <div className="mb-3 flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-700">
                                  ❌ Not Found
                                </span>
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                                  {p.notFoundMedicines.length} items
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {p.notFoundMedicines.map((m) => (
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
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <button
                  onClick={handleExpandRange}
                  disabled={loading || showAddressSelection || creatingOrder}
                  className={`w-full rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 sm:w-auto md:px-6 md:py-3 md:text-base ${
                    loading || showAddressSelection || creatingOrder
                      ? "cursor-not-allowed bg-gray-300 text-gray-500"
                      : "bg-secondary text-white hover:bg-secondary-dark active:scale-95"
                  }`}
                >
                  🔍 Expand (+5 km)
                </button>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={
                    loading || selectedPharmacies.length === 0 || creatingOrder
                  }
                  className={`w-full rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 sm:w-auto md:px-6 md:py-3 md:text-base ${
                    loading || selectedPharmacies.length === 0 || creatingOrder
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
          )}
        </div>
      </div>

      {/* ── Payment Modal ─────────────────────────────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
          <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-1 text-xl font-semibold">
              Select Payment Method
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              Choose how you'd like to pay for your order.
            </p>
            <div className="flex flex-col gap-3">
              {[
                {
                  value: "Cash",
                  label: "💵 Cash on Delivery",
                  desc: "Pay when your order arrives",
                },
                {
                  value: "Online",
                  label: "💳 Online Payment",
                  desc: "Visa / Mastercard via Paymob",
                },
              ].map(({ value, label, desc }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                    paymentMethod === value
                      ? "border-secondary bg-secondary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-secondary"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={creatingOrder}
                className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentConfirm}
                disabled={creatingOrder}
                className="rounded-lg bg-secondary px-5 py-2 font-medium text-white hover:bg-secondary-dark disabled:opacity-50"
              >
                {creatingOrder ? "Processing..." : "Continue →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
