import React, { useEffect, useState } from "react";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";
import { useOrders } from "../../orders/hooks/useOrders";
import { useAuth } from "../../auth/hooks/useAuth";
import useAddress from "../../address/hook/useAddress";
import apiClient from "../../../shared/api/apiClient";
import PharmacyMap from "../components/PharmacyMap";

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

  useEffect(() => {
    if (!user) return;

    const key = `cart_${user.email}`;
    const stored = JSON.parse(localStorage.getItem(key)) || [];
    setCart(stored);

    fetchUserAddresses();
  }, [user]);

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
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        await apiClient.put("/users/location", { latitude, longitude });
        setShowLocationPrompt(false);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;

    setNewAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddNewAddress = async () => {
    try {
      await createAddress(newAddressForm);
      await fetchUserAddresses();
      setShowNewAddressForm(false);
    } catch (err) {
      console.error(err);
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
        : [...prev, pharmacyId]
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

  const handleConfirmOrders = async () => {
    if (!cart || cart.length === 0) {
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
        (p) => p.pharmacyId === pharmacyId
      );

      if (!selectedPharmacy) continue;

      const selectedMedicineIds = selectedMedicines[pharmacyId] || [];

      const selectedItems = selectedPharmacy.foundMedicines.filter(
        (m) =>
          selectedMedicineIds.includes(m.medicineId) &&
          m.isQuantityEnough
      );

      if (selectedItems.length === 0) continue;

      const orderItems = selectedItems.map((m) => ({
        MedicineID: m.medicineId,
        Quantity: m.requestedQuantity,
      }));

      const orderDto = {
        PharmacyID: pharmacyId,
        DeliveryAddressId: selectedAddressId,
        OrderItems: orderItems,
      };

      orderDtos.push(orderDto);
    }

    if (orderDtos.length === 0) {
      alert("No valid orders to create!");
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
          dto.OrderItems.forEach((item) =>
            orderedIdsSet.add(item.MedicineID)
          );
        });

        const updatedCart = cart.filter(
          (item) => !orderedIdsSet.has(item.id)
        );

        setCart(updatedCart);

        const key = `cart_${user.email}`;
        localStorage.setItem(key, JSON.stringify(updatedCart));

        setSelectedPharmacies([]);

        await fetchUser();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create orders!");
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

  const handleOrderClick = (pharmacy) => {
    setSelectedPharmacyForPayment(pharmacy);

    if (userLocation) {
      setRouteToPharmacy({
        from: userLocation,
        to: {
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
        },
      });
    }

    setSelectedPharmacies([pharmacy.pharmacyId]);
    setShowPaymentModal(true);
  };

  const errorMessage =
    typeof error === "string" ? error : error?.message || "";

  return (
    <div>

      {/* باقي JSX كما هو بدون أي علامات conflict */}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999]">
          <div className="bg-white w-full max-w-md mx-4 p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
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