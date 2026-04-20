import React, { useEffect, useState, useCallback } from "react";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";
import { useOrders } from "../../orders/hooks/useOrders";
import { useAuth } from "../../auth/hooks/useAuth";
import useAddress from "../../address/hook/useAddress";
import apiClient from "../../../shared/api/apiClient";
import PharmacyMap from "../components/PharmacyMap";

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
  const [selectedPharmacyForPayment, setSelectedPharmacyForPayment] = useState(null);
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
        }
      } catch (err) {
        console.error("OSRM route error for pharmacy", pharmacy.pharmacyId, err);
      }
    },
    [deliveryAddressLocation, userLocation, routeData]
  );

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
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  useEffect(() => {
    const errorMessage = typeof error === "string" ? error : error?.message || "";
    if (errorMessage.includes("User location not set") || errorMessage.includes("location not set")) {
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
        (geoErr) => console.error("Geolocation error:", geoErr)
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
    setIsConfirmingAddress(true);
    try {
      if (cart.length > 0) {
        const dtoItems = cart.map((item) => ({ id: item.id, quantity: item.quantity }));
        await fetchPharmacies(dtoItems, selectedAddressId, pharmaciesRange);
      }
      const fullAddress = await fetchById(selectedAddressId);
      if (fullAddress?.latitude && fullAddress?.longitude) {
        setDeliveryAddressLocation({ lat: fullAddress.latitude, lng: fullAddress.longitude });
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
    const dtoItems = cart.map((item) => ({ id: item.id, quantity: item.quantity }));
    await fetchPharmacies(dtoItems, selectedAddressId, newRange);
  };

  const handleTogglePharmacy = (pharmacyId) => {
    setSelectedPharmacies((prev) => {
      const isAlreadySelected = prev.includes(pharmacyId);
      if (isAlreadySelected) {
        setSelectedMedicines((prevMeds) => {
          const updated = { ...prevMeds };
          delete updated[pharmacyId];
          return updated;
        });
        return prev.filter((id) => id !== pharmacyId);
      } else {
        const pharmacy = pharmacies.find((p) => p.pharmacyId === pharmacyId);
        if (pharmacy) {
          const allMedicineIds = pharmacy.foundMedicines
            .filter((m) => m.isQuantityEnough)
            .map((m) => m.medicineId);
          setSelectedMedicines((prevMeds) => ({ ...prevMeds, [pharmacyId]: allMedicineIds }));
        }
        return [...prev, pharmacyId];
      }
    });
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
    if (userLocation) {
      setRouteToPharmacy({
        from: userLocation,
        to: { latitude: pharmacy.latitude, longitude: pharmacy.longitude },
      });
    }
    setShowPaymentModal(true);
  };

  const handleConfirmOrders = async () => {
    if (cart.length === 0) { alert("Cart is empty!"); return; }
    if (!selectedAddressId) { alert("No delivery address selected!"); return; }
    if (selectedPharmacies.length === 0) { alert("No pharmacies selected!"); return; }

    setCreatingOrder(true);
    const orderDtos = [];

    for (const pharmacyId of selectedPharmacies) {
      const selectedPharmacy = pharmacies.find((p) => p.pharmacyId === pharmacyId);
      if (!selectedPharmacy) continue;

      const selectedMedicineIds = selectedMedicines[pharmacyId] || [];
      const selectedItems = selectedPharmacy.foundMedicines.filter(
        (m) => selectedMedicineIds.includes(m.medicineId) && m.isQuantityEnough
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
      alert("No valid orders to create (check selected medicines & quantities)");
      setCreatingOrder(false);
      return;
    }

    try {
      const response = await apiClient.post("/orders", orderDtos);
      const results = response.data;
      if (results && results.length > 0) {
        alert(`Successfully created ${results.length} order(s)!`);
        const orderedIdsSet = new Set();
        orderDtos.forEach((dto) => dto.OrderItems.forEach((item) => orderedIdsSet.add(item.MedicineID)));
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

  return (
    <div className="w-full min-h-screen bg-gray-100 flex justify-center items-start lg:items-center p-0 lg:p-6">
      <div className="w-full lg:w-[1150px] min-h-screen lg:min-h-0 bg-white shadow-xl lg:rounded-3xl flex flex-col lg:flex-row">

        {/* MAP — أعلى في الموبايل، يسار في الـ desktop */}
        <div className="w-full h-[250px] sm:h-[300px] lg:w-1/2 lg:h-screen lg:sticky lg:top-0 rounded-t-3xl lg:rounded-none lg:rounded-l-3xl overflow-hidden">
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

        {/* CONTENT — تحت في الموبايل، يمين في الـ desktop */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-white rounded-b-3xl lg:rounded-none lg:rounded-r-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">
              Pharmacy search & ranking
            </h1>
          </div>

          {showLocationPrompt && (
            <div className="mb-6">
              <p className="text-yellow-600 mb-2">
                Your location is not set. Allow access to set it automatically.
              </p>
              <button
                onClick={handleSetLocation}
                className="bg-blue-500 text-white px-5 py-2 rounded-xl font-medium"
              >
                Set My Location
              </button>
            </div>
          )}

          {showAddressSelection ? (
            <div className="bg-white p-4 sm:p-8 rounded-2xl w-full shadow-2xl max-h-[70vh] lg:max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">
                Select Delivery Address
              </h2>

              {addressesLoading && <p className="text-gray-600 mb-4">Loading addresses...</p>}
              {addressesError && <p className="text-red-500 mb-4">{addressesError}</p>}

              {!showNewAddressForm ? (
                <div className="flex flex-col gap-4 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose an address:
                  </label>
                  <select
                    value={selectedAddressId || ""}
                    onChange={(e) => setSelectedAddressId(parseInt(e.target.value) || null)}
                    className="border border-gray-300 p-3 rounded-lg w-full focus:border-secondary focus:ring-1 focus:ring-secondary transition text-gray-800"
                  >
                    <option value="">Select an address...</option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.street}, {addr.buildingNo}, {addr.city}, {addr.governorate}{" "}
                        {addr.isDefault ? "(Default)" : ""}
                      </option>
                    ))}
                  </select>
                  {addresses.length === 0 && (
                    <p className="text-gray-600">No addresses found. Please add a new one.</p>
                  )}
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition mt-2"
                  >
                    Add New Address
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mb-6">
                  {[
                    { label: "Street", name: "Street", placeholder: "Enter street name" },
                    { label: "Building No", name: "BuildingNo", placeholder: "Enter building number" },
                    { label: "City", name: "City", placeholder: "Enter city" },
                    { label: "Governorate", name: "Governorate", placeholder: "Enter governorate" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                      <input
                        type="text"
                        name={field.name}
                        placeholder={field.placeholder}
                        value={newAddressForm[field.name]}
                        onChange={handleNewAddressChange}
                        className="border border-gray-300 p-2 rounded-lg w-full focus:border-secondary focus:ring-1 focus:ring-secondary transition"
                      />
                    </div>
                  ))}
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="IsDefault"
                      checked={newAddressForm.IsDefault}
                      onChange={(e) => setNewAddressForm((prev) => ({ ...prev, IsDefault: e.target.checked }))}
                      className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                    />
                    Set as Default
                  </label>
                  <button
                    onClick={handleAddNewAddress}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition mt-2"
                  >
                    Save New Address
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowAddressSelection(false)}
                  className="px-5 py-2 rounded-lg bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                {!showNewAddressForm && (
                  <button
                    onClick={handleConfirmAddress}
                    disabled={!selectedAddressId || isConfirmingAddress}
                    className="px-5 py-2 rounded-lg bg-secondary text-white font-medium hover:bg-secondary-dark transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isConfirmingAddress && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isConfirmingAddress ? "Processing..." : "Confirm Address & Fetch Pharmacies"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {loading && <p>Loading pharmacies...</p>}
              {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

              <div className="space-y-6">
                {pharmacies.map((p, i) => {
                  const isExpanded = expandedPharmacies[p.pharmacyId] || false;
                  const isSelected = selectedPharmacies.includes(p.pharmacyId);
                  const realRoute = routeData[p.pharmacyId];

                  return (
                    <div
                      key={p.pharmacyId}
                      className="pb-6 border rounded-2xl p-4 shadow-sm transition"
                      onMouseEnter={() => setHoveredPharmacyId(p.pharmacyId)}
                      onMouseLeave={() => setHoveredPharmacyId(null)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTogglePharmacy(p.pharmacyId)}
                            className="h-5 w-5 text-secondary focus:ring-secondary border-gray-300 rounded mr-3 mt-1 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-base sm:text-lg font-semibold">
                              {i + 1}. {p.name}
                            </p>
                            <p className="text-gray-500 text-xs sm:text-sm break-words">
                              Lat: {p.latitude.toFixed(4)}, Lng: {p.longitude.toFixed(4)}, Distance:{" "}
                              {p.distanceKm.toFixed(2)} km, Est. Time: {p.estimatedDurationMinutes.toFixed(0)} min
                            </p>

                            {realRoute && (
                              <p className="text-green-600 font-medium text-xs sm:text-sm mt-1">
                                🛣️ Real Road: {realRoute.distanceKm} km • {realRoute.durationMin} min
                              </p>
                            )}

                            <p className="text-gray-500 text-xs sm:text-sm">Contact: {p.contactNumber}</p>
                            <p className="text-sm mt-2">
                              Matched Drugs: {p.matchedDrugs} / {p.totalRequestedDrugs} (
                              {p.matchPercentage.toFixed(2)}%)
                            </p>

                            {isSelected && (
                              <p className="text-sm font-semibold text-blue-700 mt-2">
                                Total:{" "}
                                {(selectedMedicines[p.pharmacyId] || [])
                                  .reduce((sum, medId) => {
                                    const med = p.foundMedicines.find((m) => m.medicineId === medId);
                                    return sum + (med?.price ?? 0) * (med?.requestedQuantity ?? 0);
                                  }, 0)
                                  .toFixed(2)}{" "}
                                EGP
                              </p>
                            )}

                            <button
                              onClick={() =>
                                setExpandedPharmacies((prev) => ({
                                  ...prev,
                                  [p.pharmacyId]: !isExpanded,
                                }))
                              }
                              className="text-secondary hover:underline text-sm font-medium mb-2 transition-colors"
                            >
                              {isExpanded ? "Hide Details" : "Show More Details"}
                            </button>

                            {isExpanded && (
                              <>
                                <p className="text-sm font-medium mt-3">Found Medicines:</p>
                                <ul className="list-disc pl-5 text-sm">
                                  {p.foundMedicines.map((m) => (
                                    <li
                                      key={m.medicineId}
                                      className={`flex justify-between items-center ${
                                        m.isQuantityEnough ? "text-green-600" : "text-purple-600"
                                      }`}
                                    >
                                      <div>
                                        <input
                                          type="checkbox"
                                          checked={selectedMedicines[p.pharmacyId]?.includes(m.medicineId) || false}
                                          onChange={() => handleToggleMedicine(p.pharmacyId, m.medicineId)}
                                          className="mr-2"
                                          disabled={!m.isQuantityEnough}
                                        />
                                        <span>
                                          {m.medicineName} – Requested: {m.requestedQuantity}, Available:{" "}
                                          {m.availableQuantity}
                                          {!m.isQuantityEnough && " (Not enough)"}
                                        </span>
                                      </div>
                                      <span className="font-bold text-blue-600 ml-2 flex-shrink-0">
                                        {m.price != null ? `${m.price} EGP` : "--"}
                                      </span>
                                    </li>
                                  ))}
                                </ul>

                                <p className="text-sm font-medium mt-3">Not Found Medicines:</p>
                                <ul className="list-disc pl-5 text-sm text-red-600">
                                  {p.notFoundMedicines.map((m) => (
                                    <li key={m.medicineId}>
                                      {m.medicineName} – Requested: {m.requestedQuantity}
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleOrderClick(p)}
                          className="bg-secondary text-white px-3 sm:px-5 py-2 rounded-xl font-medium ml-2 flex-shrink-0 text-sm sm:text-base"
                        >
                          Order
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center mt-6 gap-4">
                <button
                  onClick={handleExpandRange}
                  disabled={loading || showAddressSelection || creatingOrder}
                  className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition text-sm sm:text-base ${
                    loading || showAddressSelection || creatingOrder
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-secondary text-white hover:bg-secondary-dark"
                  }`}
                >
                  Expand (+5)
                </button>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={loading || selectedPharmacies.length === 0 || creatingOrder}
                  className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition text-sm sm:text-base ${
                    loading || selectedPharmacies.length === 0 || creatingOrder
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-secondary text-white hover:bg-secondary-dark"
                  }`}
                >
                  {creatingOrder ? "Processing..." : `Order Selected (${selectedPharmacies.length})`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999] px-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
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
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
                disabled={creatingOrder}
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentConfirm}
                className="px-4 py-2 bg-secondary text-white rounded-lg"
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
