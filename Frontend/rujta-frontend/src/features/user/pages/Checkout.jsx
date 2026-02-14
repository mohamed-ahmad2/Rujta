import React, { useEffect, useState } from "react";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";
import { useOrders } from "../../orders/hooks/useOrders";
import { useAuth } from "../../auth/hooks/useAuth";
import useAddress from "../../address/hook/useAddress"; // Assuming the hook is in this path based on the provided useAddress.js
import apiClient from "../../../shared/api/apiClient";


const Checkout = () => {
  const [cart, setCart] = useState([]);
  const { pharmacies, loading, error, fetchPharmacies } = usePharmacies();
  const { create } = useOrders();
  const { user } = useAuth();
  const {
    addresses,
    loading: addressesLoading,
    error: addressesError,
    fetchUserAddresses,
    create: createAddress,
  } = useAddress();
  const [pharmaciesRange, setPharmaciesRange] = useState(5); // Starting with 5 as requested, not 0

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showAddressSelection, setShowAddressSelection] = useState(true); // New state to show address form first
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
  const [selectedPharmacyForPayment, setSelectedPharmacyForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // Show location prompt if needed
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

  // Load cart from localStorage and fetch user addresses
  useEffect(() => {
    if (!user) return;

    const key = `cart_${user.email}`;
    const stored = JSON.parse(localStorage.getItem(key)) || [];
    setCart(stored);

    fetchUserAddresses(); // Fetch user's addresses on load
  }, [user]);

  const handleSetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await apiClient.put("/users/location", { latitude, longitude });
            setShowLocationPrompt(false);
          } catch (updateErr) {
            console.error("Failed to update location:", updateErr);
          }
        },
        (geoErr) => {
          console.error("Geolocation error:", geoErr);
        },
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
      await fetchUserAddresses(); // Refresh addresses after adding new one
      setShowNewAddressForm(false);
    } catch (err) {
      console.error("Failed to add new address:", err);
    }
  };

  // New function to confirm address and fetch pharmacies
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
      await fetchPharmacies(dtoItems, selectedAddressId, pharmaciesRange); // Fetch pharmacies with selected address
    }

    setShowAddressSelection(false); // Hide address selection and show pharmacies
  };

  const handleExpandRange = async () => {
    const newRange = pharmaciesRange + 5; // Adding +5 each time as per the button label
    setPharmaciesRange(newRange);

    if (!selectedAddressId || cart.length === 0) return;

    const dtoItems = cart.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    }));

    await fetchPharmacies(dtoItems, selectedAddressId, newRange);
  };

  // Modified handleConfirmOrder to create order directly
  const handleConfirmOrder = async (pharmacyId) => {
    if (!cart || cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (!selectedAddressId) {
      alert("No delivery address selected!");
      return;
    }

    const selectedPharmacy = pharmacies.find(
      (p) => p.pharmacyId === pharmacyId,
    );
    if (!selectedPharmacy) {
      alert("Selected pharmacy not found!");
      return;
    }

    const availableItems = selectedPharmacy.foundMedicines.filter(
      (m) => m.isQuantityEnough,
    );
    if (availableItems.length === 0) {
      alert("No available medicines in this pharmacy!");
      return;
    }

    const orderItems = availableItems.map((m) => ({
      MedicineID: m.medicineId,
      Quantity: m.requestedQuantity,
    }));

    const orderDto = {
      PharmacyID: pharmacyId,
      DeliveryAddressId: selectedAddressId,
      OrderItems: orderItems,
    };

    console.log("Creating order with DTO:", orderDto);

    try {
      const result = await create(orderDto);
      console.log("Create order result:", result);

      if (result) {
        alert("Order created successfully!");
        // Remove only the ordered items from cart
        const orderedIds = availableItems.map((m) => m.medicineId);
        const updatedCart = cart.filter(
          (item) => !orderedIds.includes(item.id),
        );
        setCart(updatedCart);
        const key = `cart_${user.email}`;
        localStorage.setItem(key, JSON.stringify(updatedCart));
      } else {
        alert("Failed to create order!");
      }
    } catch (err) {
      console.error("Error while creating order:", err);
      alert("Failed to create order! See console for details.");
    }
  };
const handlePaymentConfirm = async () => {
  if (paymentMethod === "Cash") {
    setShowPaymentModal(false);
    setTimeout(() => {
      handleConfirmOrder(selectedPharmacyForPayment);
    }, 0);
  } else {
    // Online Payment
    window.location.href = `/user/payment`; // بدون pharmacyId
  }
};


  const errorMessage = typeof error === "string" ? error : error?.message || "";

  return (
    <div className="w-screen h-screen p-6 bg-gray-100 flex justify-center items-center">
      <div className="w-[1150px] h-[700px] bg-white shadow-xl rounded-3xl overflow-hidden flex">
        {/* LEFT SIDE */}
        <div className="w-1/2 h-full relative">
          <div
            className="absolute inset-0 bg-cover bg-center brightness-95"
            style={{
              backgroundImage:
                "url('https://static1.makeuseofimages.com/wordpress/wp-content/uploads/2023/05/google-maps-icon-on-map.jpg')",
            }}
          ></div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/2 h-full p-8 overflow-y-auto bg-white">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">
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
            // Show address selection form first
            <div className="bg-white p-8 rounded-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Select Delivery Address
              </h2>

              {addressesLoading && (
                <p className="text-gray-600 mb-4">Loading addresses...</p>
              )}
              {addressesError && (
                <p className="text-red-500 mb-4">{addressesError}</p>
              )}

              {!showNewAddressForm ? (
                <div className="flex flex-col gap-4 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose an address:
                  </label>
                  <select
                    value={selectedAddressId || ""}
                    onChange={(e) =>
                      setSelectedAddressId(parseInt(e.target.value) || null)
                    }
                    className="border border-gray-300 p-3 rounded-lg w-full focus:border-secondary focus:ring-1 focus:ring-secondary transition text-gray-800"
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
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition mt-2"
                  >
                    Add New Address
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street
                    </label>
                    <input
                      type="text"
                      name="Street"
                      placeholder="Enter street name"
                      value={newAddressForm.Street}
                      onChange={handleNewAddressChange}
                      className="border border-gray-300 p-2 rounded-lg w-full focus:border-secondary focus:ring-1 focus:ring-secondary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Building No
                    </label>
                    <input
                      type="text"
                      name="BuildingNo"
                      placeholder="Enter building number"
                      value={newAddressForm.BuildingNo}
                      onChange={handleNewAddressChange}
                      className="border border-gray-300 p-2 rounded-lg w-full focus:border-secondary focus:ring-1 focus:ring-secondary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="City"
                      placeholder="Enter city"
                      value={newAddressForm.City}
                      onChange={handleNewAddressChange}
                      className="border border-gray-300 p-2 rounded-lg w-full focus:border-secondary focus:ring-1 focus:ring-secondary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Governorate
                    </label>
                    <input
                      type="text"
                      name="Governorate"
                      placeholder="Enter governorate"
                      value={newAddressForm.Governorate}
                      onChange={handleNewAddressChange}
                      className="border border-gray-300 p-2 rounded-lg w-full focus:border-secondary focus:ring-1 focus:ring-secondary transition"
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
                    className="px-5 py-2 rounded-lg bg-secondary text-white font-medium hover:bg-secondary-dark transition"
                    disabled={!selectedAddressId}
                  >
                    Confirm Address & Fetch Pharmacies
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Show pharmacies after address selection
            <>
              {loading && <p>Loading pharmacies...</p>}
              {errorMessage && (
                <p className="text-red-500 mb-4">{errorMessage}</p>
              )}

              <div className="space-y-6">
                {pharmacies.map((p, i) => {
                  const isExpanded = expandedPharmacies[p.pharmacyId] || false;
                  return (
                    <div
                      key={p.pharmacyId}
                      className="pb-6 border rounded-2xl p-4 shadow-sm transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-lg font-semibold">
                            {i + 1}. {p.name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Lat: {p.latitude.toFixed(4)}, Lng:{" "}
                            {p.longitude.toFixed(4)}, Distance:{" "}
                            {p.distanceKm.toFixed(2)} km, Est. Time:{" "}
                            {p.estimatedDurationMinutes.toFixed(0)} min
                          </p>
                          <p className="text-gray-500 text-sm">
                            Contact: {p.contactNumber}
                          </p>
                          <p className="text-sm mt-2">
                            Matched Drugs: {p.matchedDrugs} /{" "}
                            {p.totalRequestedDrugs} (
                            {p.matchPercentage.toFixed(2)}
                            %)
                          </p>
                          <button
                            onClick={() =>
                              setExpandedPharmacies((prev) => ({
                                ...prev,
                                [p.pharmacyId]: !isExpanded,
                              }))
                            }
                            className="text-secondary hover:text-secondary-dark hover:underline text-sm font-medium mb-2 transition-colors"
                          >
                            {isExpanded ? "Hide Details" : "Show More Details"}
                          </button>
                          {isExpanded && (
                            <>
                              <p className="text-sm font-medium mt-3">
                                Found Medicines:
                              </p>
                              <ul className="list-disc pl-5 text-sm">
                                {p.foundMedicines.map((m) => {
                                  let colorClass = "text-green-600";

                                  if (!m.isQuantityEnough) {
                                    colorClass = "text-purple-600";
                                  }

                                  return (
                                    <li
                                      key={m.medicineId}
                                      className={colorClass}
                                    >
                                      {m.medicineName} – Requested:{" "}
                                      {m.requestedQuantity}, Available:{" "}
                                      {m.availableQuantity}
                                      {!m.isQuantityEnough && " (Not enough)"}
                                    </li>
                                  );
                                })}
                              </ul>

                              <p className="text-sm font-medium mt-3">
                                Not Found Medicines:
                              </p>
                              <ul className="list-disc pl-5 text-sm text-red-600">
                                {p.notFoundMedicines.map((m) => (
                                  <li key={m.medicineId}>
                                    {m.medicineName} – Requested:{" "}
                                    {m.requestedQuantity}
                                  </li>
                                ))}
                              </ul>

                            </>
                          )}
                        </div>

                        <button
                              onClick={() => {
                                setSelectedPharmacyForPayment(p.pharmacyId);
                                setShowPaymentModal(true);
                              }}
                              className="bg-secondary text-white px-5 py-2 rounded-xl font-medium"
                            >
                              Order
                            </button>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Moved the Expand button to the bottom, after the pharmacies list, for better UX (e.g., user sees results first then expands if needed). Adjusted shape to rounded-lg for a softer look, increased padding for better touch target. */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleExpandRange}
                  disabled={loading || showAddressSelection}
                  className={`px-6 py-3 rounded-lg font-medium transition
                    ${
                      loading || showAddressSelection
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-secondary text-white hover:bg-secondary-dark"
                    }`}
                >
                  Expand (+5)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {showPaymentModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white w-[400px] p-6 rounded-2xl shadow-xl">
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
        >
          Cancel
        </button>

        <button
          onClick={handlePaymentConfirm}
          className="px-4 py-2 bg-secondary text-white rounded-lg"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Checkout;