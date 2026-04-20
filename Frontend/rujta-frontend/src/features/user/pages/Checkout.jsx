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

  //------------------------------------

  const fetchRoute = useCallback(
    async (pharmacy) => {
      const start = deliveryAddressLocation || userLocation;
      if (!start || !pharmacy) return;

      const cacheKey = pharmacy.pharmacyId;
      if (routeData[cacheKey]) return;

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${pharmacy.longitude},${pharmacy.latitude}?overview=full&geometries=polyline`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code === "Ok" && data.routes?.[0]) {
          const encoded = data.routes[0].geometry;
          const coordinates = decodePolyline(encoded);

          const distanceKm = (data.routes[0].distance / 1000).toFixed(2);
          const durationMin = Math.round(data.routes[0].duration / 60);

          setRouteData((prev) => ({
            ...prev,
            [cacheKey]: { coordinates, distanceKm, durationMin },
          }));

          console.log(
            `✅ Route + Distance for pharmacy ${pharmacy.pharmacyId}: ${distanceKm} km`,
          );
        } else {
          console.warn("OSRM No route:", data);
        }
      } catch (err) {
        console.error(
          "OSRM route error for pharmacy",
          pharmacy.pharmacyId,
          err,
        );
      }
    },
    [deliveryAddressLocation, userLocation, routeData],
  );

  //------------------------------------

  useEffect(() => {
    if (pharmacies.length === 0) return;

    if (pharmacies[0]) fetchRoute(pharmacies[0]);

    selectedPharmacies.forEach((id) => {
      const p = pharmacies.find((ph) => ph.pharmacyId === id);
      if (p) fetchRoute(p);
    });

    if (hoveredPharmacyId) {
      const p = pharmacies.find((ph) => ph.pharmacyId === hoveredPharmacyId);
      if (p) fetchRoute(p);
    }
  }, [pharmacies, selectedPharmacies, hoveredPharmacyId, fetchRoute]);

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
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
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

  //------------------------------------

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
      alert("Please select a delivery address!");
      return;
    }
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
    setSelectedPharmacies((prev) =>
      prev.includes(pharmacyId)
        ? prev.filter((id) => id !== pharmacyId)
        : [...prev, pharmacyId],
    );
  };

  const handleToggleMedicine = (pharmacyId, medicineId) => {
    setSelectedMedicines((prev) => {
      const pharmacyMeds = prev[pharmacyId] || [];
      const updated = pharmacyMeds.includes(medicineId)
        ? pharmacyMeds.filter((id) => id !== medicineId)
        : [...pharmacyMeds, medicineId];
      return {
        ...prev,
        [pharmacyId]: updated,
      };
    });
  };

  const handleOrderClick = (pharmacy) => {
    setSelectedPharmacyForPayment(pharmacy);
    setSelectedPharmacies([pharmacy.pharmacyId]);

    if (userLocation) {
      setRouteToPharmacy({
        from: userLocation,
        to: {
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
        },
      });
    }

    setShowPaymentModal(true);
  };

  const handleConfirmOrders = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    if (!selectedAddressId) {
      alert("No delivery address selected!");
      return;
    }
    if (selectedPharmacies.length === 0) {
      alert("No pharmacies selected!");
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

      const orderItems = selectedItems.map((m) => ({
        MedicineID: m.medicineId,
        Quantity: m.requestedQuantity,
      }));

      orderDtos.push({
        PharmacyID: pharmacyId,
        DeliveryAddressId: selectedAddressId,
        OrderItems: orderItems,
      });
    }

    if (orderDtos.length === 0) {
      alert(
        "No valid orders to create (check selected medicines & quantities)",
      );
      setCreatingOrder(false);
      return;
    }

    try {
      const response = await apiClient.post("/orders", orderDtos);
      const results = response.data;

      if (results && results.length > 0) {
        alert(`Successfully created ${results.length} order(s)!`);

        const orderedIdsSet = new Set();
        orderDtos.forEach((dto) => {
          dto.OrderItems.forEach((item) => orderedIdsSet.add(item.MedicineID));
        });

        const updatedCart = cart.filter((item) => !orderedIdsSet.has(item.id));
        setCart(updatedCart);
        localStorage.setItem(`cart_${user.email}`, JSON.stringify(updatedCart));

        setSelectedPharmacies([]);
        setSelectedMedicines({});
        await fetchUser();
      } else {
        alert("Failed to create orders!");
      }
    } catch (err) {
      console.error("Error creating orders:", err);
      alert("Failed to create orders. Check console.");
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

  // ──────────────────────────────────────────────
  //  Render
  // ──────────────────────────────────────────────

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gray-100 p-6">
      <div className="flex h-[700px] w-[1150px] flex-col rounded-3xl bg-white shadow-xl lg:flex-row">
        {/* LEFT – MAP */}
        <div className="relative z-0 h-full w-full overflow-hidden lg:w-1/2">
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
              Pharmacy search & ranking
            </h1>
          </div>

          {showLocationPrompt && (
            <div className="mb-6">
              <p className="mb-2 text-yellow-600">
                Your location is not set. Allow access to set it automatically.
              </p>
              <button
                onClick={handleSetLocation}
                className="rounded-xl bg-blue-500 px-5 py-2 font-medium text-white"
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
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Street
                    </label>
                    <input
                      type="text"
                      name="Street"
                      placeholder="Enter street name"
                      value={newAddressForm.Street}
                      onChange={handleNewAddressChange}
                      className="w-full rounded-lg border border-gray-300 p-2 transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Building No
                    </label>
                    <input
                      type="text"
                      name="BuildingNo"
                      placeholder="Enter building number"
                      value={newAddressForm.BuildingNo}
                      onChange={handleNewAddressChange}
                      className="w-full rounded-lg border border-gray-300 p-2 transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="City"
                      placeholder="Enter city"
                      value={newAddressForm.City}
                      onChange={handleNewAddressChange}
                      className="w-full rounded-lg border border-gray-300 p-2 transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Governorate
                    </label>
                    <input
                      type="text"
                      name="Governorate"
                      placeholder="Enter governorate"
                      value={newAddressForm.Governorate}
                      onChange={handleNewAddressChange}
                      className="w-full rounded-lg border border-gray-300 p-2 transition focus:border-secondary focus:ring-1 focus:ring-secondary"
                    />
                  </div>
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
                      className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
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
                    className="hover:bg-secondary-dark rounded-lg bg-secondary px-5 py-2 font-medium text-white transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!selectedAddressId}
                  >
                    Confirm Address
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {loading && <p>Loading pharmacies...</p>}
              {errorMessage && (
                <p className="mb-4 text-red-500">{errorMessage}</p>
              )}

              <div className="space-y-6">
                {pharmacies.map((p, i) => {
                  const isExpanded = expandedPharmacies[p.pharmacyId] || false;
                  const isSelected = selectedPharmacies.includes(p.pharmacyId);
                  const realRoute = routeData[p.pharmacyId];

                  return (
                    <div
                      key={p.pharmacyId}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                      onMouseEnter={() => setHoveredPharmacyId(p.pharmacyId)}
                      onMouseLeave={() => setHoveredPharmacyId(null)}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                        {/* LEFT SIDE */}
                        <div className="flex gap-3">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTogglePharmacy(p.pharmacyId)}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-secondary focus:ring-secondary"
                          />

                          {/* Content */}
                          <div className="space-y-1">
                            <p className="text-lg font-semibold text-gray-800">
                              {i + 1}. {p.name}
                            </p>

                            {/* Location */}
                            <p className="text-xs text-gray-500">
                              📍 {p.distanceKm.toFixed(2)} km • ⏱{" "}
                              {p.estimatedDurationMinutes.toFixed(0)} min
                            </p>

                            {/* Real Route */}
                            {realRoute && (
                              <p className="text-sm font-medium text-green-600">
                                🛣️ {realRoute.distanceKm} km •{" "}
                                {realRoute.durationMin} min
                              </p>
                            )}

                            {/* Contact */}
                            <p className="text-xs text-gray-500">
                              📞 {p.contactNumber}
                            </p>

                            {/* Match */}
                            <p className="text-sm font-medium text-secondary">
                              Match: {p.matchPercentage.toFixed(0)}%
                            </p>

                            {/* Expand Button */}
                            <button
                              onClick={() =>
                                setExpandedPharmacies((prev) => ({
                                  ...prev,
                                  [p.pharmacyId]: !isExpanded,
                                }))
                              }
                              className="hover:text-secondary-dark text-sm font-medium text-secondary transition hover:underline"
                            >
                              {isExpanded ? "Hide Details" : "Show Details"}
                            </button>
                          </div>
                        </div>

                        {/* RIGHT SIDE (Order Button) */}
                        <div className="flex items-start md:items-center">
                          <button
                            onClick={() => handleOrderClick(p)}
                            className="hover:bg-secondary-dark w-full rounded-xl bg-secondary px-5 py-2 font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95 md:w-auto"
                          >
                            Order
                          </button>
                        </div>
                      </div>

                      {/* EXPANDED SECTION */}
                      {isExpanded && (
                        <div className="mt-4 space-y-4 border-t pt-4">
                          {/* Found */}
                          <div>
                            <p className="text-sm font-semibold text-gray-700">
                              ✅ Found Medicines
                            </p>

                            <ul className="mt-1 space-y-1 text-sm">
                              {p.foundMedicines.map((m) => {
                                const colorClass = m.isQuantityEnough
                                  ? "text-green-600"
                                  : "text-purple-600";

                                return (
                                  <li
                                    key={m.medicineId}
                                    className={`flex items-center gap-2 ${colorClass}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        selectedMedicines[
                                          p.pharmacyId
                                        ]?.includes(m.medicineId) || false
                                      }
                                      onChange={() =>
                                        handleToggleMedicine(
                                          p.pharmacyId,
                                          m.medicineId,
                                        )
                                      }
                                      disabled={!m.isQuantityEnough}
                                    />

                                    <span>{m.medicineName}</span>

                                    <span className="text-xs text-gray-500">
                                      ({m.availableQuantity}/
                                      {m.requestedQuantity})
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>

                          {/* Not Found */}
                          <div>
                            <p className="text-sm font-semibold text-red-600">
                              ❌ Not Found
                            </p>

                            <ul className="mt-1 space-y-1 text-sm text-red-500">
                              {p.notFoundMedicines.map((m) => (
                                <li key={m.medicineId}>
                                  {m.medicineName} ({m.requestedQuantity})
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                {/* Expand Button */}
                <button
                  onClick={handleExpandRange}
                  disabled={loading || showAddressSelection || creatingOrder}
                  className={`/* 📱 mobile */ /* 📱➡️ tablet */ /* 💻 desktop */ w-full rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 sm:w-auto sm:px-5 sm:py-2.5 sm:text-base md:px-6 md:py-3 md:text-base ${
                    loading || showAddressSelection || creatingOrder
                      ? "cursor-not-allowed bg-gray-300 text-gray-500"
                      : "hover:bg-secondary-dark bg-secondary text-white active:scale-95"
                  } `}
                >
                  Expand (+5)
                </button>

                {/* Order Button */}
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={
                    loading || selectedPharmacies.length === 0 || creatingOrder
                  }
                  className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 sm:w-auto sm:px-5 sm:py-2.5 sm:text-base md:px-6 md:py-3 md:text-base ${
                    loading || selectedPharmacies.length === 0 || creatingOrder
                      ? "cursor-not-allowed bg-gray-300 text-gray-500"
                      : "hover:bg-secondary-dark bg-secondary text-white active:scale-95"
                  } `}
                >
                  {creatingOrder
                    ? "Processing..."
                    : `Order Selected (${selectedPharmacies.length})`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
          <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-semibold">
              Select Payment Method
            </h2>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Cash"
                  checked={paymentMethod === "Cash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Cash on Delivery
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="Online"
                  checked={paymentMethod === "Online"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Online Payment (Visa / Paymob)
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="rounded-lg bg-gray-300 px-4 py-2"
                disabled={creatingOrder}
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentConfirm}
                className="rounded-lg bg-secondary px-4 py-2 text-white"
                disabled={creatingOrder}
              >
                {creatingOrder ? "Processing..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
