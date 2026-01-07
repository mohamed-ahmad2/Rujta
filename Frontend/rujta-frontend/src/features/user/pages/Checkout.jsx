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
    const { addresses, loading: addressesLoading, error: addressesError, fetchUserAddresses, create: createAddress } = useAddress();

    const [showLocationPrompt, setShowLocationPrompt] = useState(false);

    // FOR ORDER FORM
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [selectedPharmacyId, setSelectedPharmacyId] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddressForm, setNewAddressForm] = useState({
        Street: "",
        BuildingNo: "",
        City: "",
        Governorate: "",
        IsDefault: false,
    });

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

        if (stored.length > 0) {
            const dtoItems = stored.map((item) => ({
                id: item.id,
                quantity: item.quantity,
            }));
            fetchPharmacies(dtoItems);
        }

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
                }
            );
        }
    };

    // Open order form and reset states
    const openOrderForm = (pharmacyId) => {
        setSelectedPharmacyId(pharmacyId);
        setSelectedAddress(null);
        setShowNewAddressForm(false);
        setNewAddressForm({
            Street: "",
            BuildingNo: "",
            City: "",
            Governorate: "",
            IsDefault: false,
        });
        setShowOrderForm(true);
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

    const handleConfirmOrder = async () => {
        if (!cart || cart.length === 0) {
            alert("Cart is empty!");
            return;
        }

        if (!selectedAddress) {
            alert("Please select a delivery address!");
            return;
        }

        const orderItems = cart.map((item) => ({
            MedicineID: item.id,
            Quantity: item.quantity,
        }));

        const orderDto = {
            PharmacyID: selectedPharmacyId,
            DeliveryAddress: selectedAddress, // Send the selected address object
            OrderItems: orderItems,
        };

        console.log("Creating order with DTO:", orderDto);

        try {
            const result = await create(orderDto);
            console.log("Create order result:", result);

            if (result) {
                alert("Order created successfully!");
                setShowOrderForm(false);
            } else {
                alert("Failed to create order!");
            }
        } catch (err) {
            console.error("Error while creating order:", err);
            alert("Failed to create order! See console for details.");
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
                    <h1 className="text-2xl font-semibold mb-6">
                        Pharmacy search & ranking
                    </h1>

                    {loading && <p>Loading pharmacies...</p>}
                    {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
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

                    <div className="space-y-6">
                        {pharmacies.map((p, i) => (
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
                                            Lat: {p.latitude.toFixed(4)}, Lng: {p.longitude.toFixed(4)}, Distance:{" "}
                                            {p.distanceKm.toFixed(2)} km
                                        </p>
                                        <p className="text-sm mt-2">
                                            Matched Drugs: {p.matchedDrugs} / {p.totalRequestedDrugs} (
                                            {p.matchPercentage.toFixed(2)}%)
                                        </p>
                                        <p className="text-sm font-medium mt-3">Found Medicines:</p>
                                        <ul className="list-disc pl-5 text-sm">
                                            {p.foundMedicines.map((m) => (
                                                <li key={m.medicineId}>
                                                    {m.medicineName} - Requested: {m.requestedQuantity}, Available: {m.availableQuantity} (Enough: {m.isQuantityEnough ? "Yes" : "No"})
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-sm font-medium mt-3">Not Found Medicines:</p>
                                        <ul className="list-disc pl-5 text-sm">
                                            {p.notFoundMedicines.map((m) => (
                                                <li key={m.medicineId}>
                                                    {m.medicineName} - Requested: {m.requestedQuantity}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => openOrderForm(p.pharmacyId)}
                                        className="bg-secondary text-white px-5 py-2 rounded-xl font-medium"
                                    >
                                        Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ORDER FORM MODAL */}
                    {showOrderForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white p-6 rounded-xl w-[400px]">
                                <h2 className="text-xl font-semibold mb-4">Select Delivery Address</h2>

                                {addressesLoading && <p>Loading addresses...</p>}
                                {addressesError && <p className="text-red-500">{addressesError}</p>}

                                {!showNewAddressForm ? (
                                    <div className="flex flex-col gap-3">
                                        {addresses.length > 0 ? (
                                            addresses.map((addr) => (
                                                <div
                                                    key={addr.id}
                                                    className={`border p-3 rounded cursor-pointer ${selectedAddress?.Id === addr.id ? "bg-gray-200" : ""}`}
                                                    onClick={() => setSelectedAddress(addr)}
                                                >
                                                    <p>{addr.street}, {addr.buildingNo}</p>
                                                    <p>{addr.city}, {addr.governorate}</p>
                                                    {addr.isDefault && <p className="text-green-600">Default</p>}
                                                </div>
                                            ))
                                        ) : (
                                            <p>No addresses found. Add a new one.</p>
                                        )}
                                        <button
                                            onClick={() => setShowNewAddressForm(true)}
                                            className="bg-gray-300 text-black px-3 py-2 rounded mt-2"
                                        >
                                            Add New Address
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <input
                                            type="text"
                                            name="Street"
                                            placeholder="Street"
                                            value={newAddressForm.Street}
                                            onChange={handleNewAddressChange}
                                            className="border p-2 rounded"
                                        />
                                        <input
                                            type="text"
                                            name="BuildingNo"
                                            placeholder="Building No"
                                            value={newAddressForm.BuildingNo}
                                            onChange={handleNewAddressChange}
                                            className="border p-2 rounded"
                                        />
                                        <input
                                            type="text"
                                            name="City"
                                            placeholder="City"
                                            value={newAddressForm.City}
                                            onChange={handleNewAddressChange}
                                            className="border p-2 rounded"
                                        />
                                        <input
                                            type="text"
                                            name="Governorate"
                                            placeholder="Governorate"
                                            value={newAddressForm.Governorate}
                                            onChange={handleNewAddressChange}
                                            className="border p-2 rounded"
                                        />
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="IsDefault"
                                                checked={newAddressForm.IsDefault}
                                                onChange={(e) => setNewAddressForm((prev) => ({ ...prev, IsDefault: e.target.checked }))}
                                            />
                                            <span className="ml-2">Set as Default</span>
                                        </label>
                                        <button
                                            onClick={handleAddNewAddress}
                                            className="bg-blue-500 text-white px-3 py-2 rounded mt-2"
                                        >
                                            Save New Address
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        onClick={() => setShowOrderForm(false)}
                                        className="px-4 py-2 rounded bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    {!showNewAddressForm && (
                                        <button
                                            onClick={handleConfirmOrder}
                                            className="px-4 py-2 rounded bg-secondary text-white"
                                            disabled={!selectedAddress}
                                        >
                                            Confirm Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Checkout;