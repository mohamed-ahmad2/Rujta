import { useState, useEffect, useCallback } from "react";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";
import { useOrders } from "../../orders/hooks/useOrders";
import { useAuth } from "../../auth/hooks/useAuth";
import useAddress from "../../address/hook/useAddress";
import { usePayment } from "../../payment/hooks/usePayment";
import apiClient from "../../../shared/api/apiClient";
import { decodePolyline } from "../../../utils/decodePolyline";

export const useCheckout = () => {
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

  const {
    initiate,
    paymentResult,
    loading: initiatingPayment,
    reset: resetPayment,
  } = usePayment();

  // ── Address States ──────────────────────────────────────────────
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

  // ── Pharmacy / Order States ─────────────────────────────────────
  const [expandedPharmacies, setExpandedPharmacies] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentIframe, setShowPaymentIframe] = useState(false);
  const [selectedPharmacyForPayment, setSelectedPharmacyForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [selectedPharmacies, setSelectedPharmacies] = useState([]);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState({});
  const [pendingOrderId, setPendingOrderId] = useState(null);

  // ── Map States ──────────────────────────────────────────────────
  const [userLocation, setUserLocation] = useState(null);
  const [deliveryAddressLocation, setDeliveryAddressLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [hoveredPharmacyId, setHoveredPharmacyId] = useState(null);
  const [routeData, setRouteData] = useState({});

  // ── Toast State ─────────────────────────────────────────────────
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    if (type === "success") setTimeout(() => setToast(null), 3200);
  }, []);

  // ── Route Fetching ──────────────────────────────────────────────
  const fetchRoute = useCallback(
    (pharmacy) => {
      const start = deliveryAddressLocation || userLocation;
      if (!start || !pharmacy) return;
      const cacheKey = pharmacy.pharmacyId;

      setRouteData((prev) => {
        if (prev[cacheKey]) return prev;
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${start.lng},${start.lat};${pharmacy.longitude},${pharmacy.latitude}` +
          `?overview=full&geometries=polyline`;
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (data.code === "Ok" && data.routes?.[0]) {
              const coordinates = decodePolyline(data.routes[0].geometry);
              const distanceKm = (data.routes[0].distance / 1000).toFixed(2);
              const durationMin = Math.round(data.routes[0].duration / 60);
              setRouteData((p) => ({
                ...p,
                [cacheKey]: { coordinates, distanceKm, durationMin },
              }));
            }
          })
          .catch((err) => console.error("OSRM error:", pharmacy.pharmacyId, err));
        return prev;
      });
    },
    [deliveryAddressLocation, userLocation]
  );

  // ── Effects ─────────────────────────────────────────────────────
  useEffect(() => {
    if (pharmacies.length > 0) pharmacies.forEach(fetchRoute);
  }, [pharmacies, fetchRoute]);

  useEffect(() => {
    if (!user) return;
    const stored = JSON.parse(localStorage.getItem(`cart_${user.email}`)) || [];
    setCart(stored);
    fetchUserAddresses();
  }, [user, fetchUserAddresses]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Geolocation error:", err)
    );
  }, []);

  useEffect(() => {
    const msg = typeof error === "string" ? error : error?.message || "";
    if (msg.includes("location not set")) setShowLocationPrompt(true);
  }, [error]);

  // When paymentResult arrives → close payment modal, open iframe
  useEffect(() => {
    if (paymentResult?.iframeUrl) {
      setShowPaymentModal(false);
      setShowPaymentIframe(true);
    }
  }, [paymentResult]);

  // ── Handlers ────────────────────────────────────────────────────
  const handleSetLocation = () => {
    navigator.geolocation?.getCurrentPosition(async ({ coords }) => {
      try {
        await apiClient.put("/users/location", {
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
        setShowLocationPrompt(false);
      } catch (err) {
        console.error("Failed to update location:", err);
      }
    });
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
      console.error("Failed to add address:", err);
    }
  };

  const handleConfirmAddress = async () => {
    if (!selectedAddressId) {
      showToast("error", "Please select a delivery address!");
      return;
    }
    setIsConfirmingAddress(true);
    try {
      if (cart.length > 0)
        await fetchPharmacies(cart, selectedAddressId, pharmaciesRange);
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
    if (selectedAddressId && cart.length > 0)
      await fetchPharmacies(cart, selectedAddressId, newRange);
  };

  const handleTogglePharmacy = (pharmacyId, allMedicineIds = []) => {
    const isCurrentlySelected = selectedPharmacies.includes(pharmacyId);
    if (isCurrentlySelected) {
      setSelectedPharmacies((prev) => prev.filter((id) => id !== pharmacyId));
      setSelectedMedicines((prev) => {
        const updated = { ...prev };
        delete updated[pharmacyId];
        return updated;
      });
    } else {
      setSelectedPharmacies((prev) => [...prev, pharmacyId]);
      setSelectedMedicines((prev) => ({ ...prev, [pharmacyId]: allMedicineIds }));
    }
  };

  const handleToggleMedicine = (pharmacyId, medicineId) => {
    setSelectedMedicines((prev) => {
      const meds = prev[pharmacyId] || [];
      return {
        ...prev,
        [pharmacyId]: meds.includes(medicineId)
          ? meds.filter((id) => id !== medicineId)
          : [...meds, medicineId],
      };
    });
  };

  const handleOrderClick = (pharmacy) => {
    const allMedicineIds = pharmacy.foundMedicines.map((m) => m.medicineId);
    setSelectedPharmacyForPayment(pharmacy);
    setSelectedPharmacies([pharmacy.pharmacyId]);
    setSelectedMedicines({ [pharmacy.pharmacyId]: allMedicineIds });
    setShowPaymentModal(true);
  };

  // ── Core order creation ─────────────────────────────────────────
  const createOrders = async () => {
    if (!cart.length) throw new Error("Your cart is empty!");
    if (!selectedAddressId) throw new Error("No delivery address selected!");
    if (!selectedPharmacies.length) throw new Error("No pharmacies selected!");

    const orderDtos = selectedPharmacies.reduce((acc, pharmacyId) => {
      const pharmacy = pharmacies.find((p) => p.pharmacyId === pharmacyId);
      if (!pharmacy) return acc;
      const items = pharmacy.foundMedicines.filter((m) =>
        selectedMedicines[pharmacyId]?.includes(m.medicineId)
      );
      if (!items.length) return acc;
      acc.push({
        PharmacyID: pharmacyId,
        DeliveryAddressId: selectedAddressId,
        OrderItems: items.map((m) => ({
          MedicineID: m.medicineId,
          Quantity: m.requestedQuantity,
        })),
      });
      return acc;
    }, []);

    if (!orderDtos.length)
      throw new Error("No valid orders. Check selected medicines & quantities.");

    const { data: results } = await apiClient.post("/orders", orderDtos);
    return { results, orderDtos };
  };

  // ── Clear cart after successful order ───────────────────────────
  const clearCartAfterOrder = async (orderDtos) => {
    const orderedIds = new Set(
      orderDtos.flatMap((d) => d.OrderItems.map((i) => i.MedicineID))
    );
    const updatedCart = cart.filter((item) => !orderedIds.has(item.id));
    localStorage.setItem(`cart_${user.email}`, JSON.stringify(updatedCart));
    window.dispatchEvent(new StorageEvent("storage", { key: `cart_${user.email}` }));
    setCart(updatedCart);
    setSelectedPharmacies([]);
    setSelectedMedicines({});
    await fetchUser();
  };

  // ── Cash flow ───────────────────────────────────────────────────
  const handleConfirmOrders = async () => {
    setCreatingOrder(true);
    try {
      const { results, orderDtos } = await createOrders();
      if (results?.length > 0) {
        await clearCartAfterOrder(orderDtos);
        showToast(
          "success",
          `${results.length} order${results.length > 1 ? "s" : ""} placed! 🎉`
        );
        setTimeout(() => window.location.reload(), 3200);
      } else {
        showToast("error", "Failed to create orders. Please try again.");
      }
    } catch (err) {
      console.error("Order error:", err);
      showToast("error", err.message || "Failed to create orders.");
    } finally {
      setCreatingOrder(false);
    }
  };

  // ── Online flow ─────────────────────────────────────────────────
  const handleOnlinePayment = async () => {
    setCreatingOrder(true);
    try {
      const { results, orderDtos } = await createOrders();

      if (!results?.length) {
        showToast("error", "Failed to create orders. Please try again.");
        return;
      }

      // Get order ID — backend returns it as `id` or `orderId`
      const firstOrderId = results[0]?.id ?? results[0]?.orderId ?? results[0];
      setPendingOrderId(firstOrderId);

      // Get delivery address for billing data
      const fullAddress = await fetchById(selectedAddressId);

      const billingData = {
        FirstName: user?.firstName || user?.name?.split(" ")[0] || "Customer",
        LastName: user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "User",
        Email: user?.email || "customer@email.com",
        PhoneNumber: user?.phone || "01000000000",
        Apartment: "N/A",
        Floor: "N/A",
        Street: fullAddress?.street || "N/A",
        Building: fullAddress?.buildingNo || "N/A",
        ShippingMethod: "PKG",
        PostalCode: "NA",
        City: fullAddress?.city || "Cairo",
        Country: "EG",
        State: fullAddress?.governorate || "Cairo",
      };

      // Use totalPrice from the order response — foundMedicines don't carry price
      const totalAmount = results.reduce(
        (sum, order) => sum + (order.totalPrice ?? 0),
        0
      );

      await initiate({
        Type: "Order",
        OrderId: firstOrderId,
        Amount: totalAmount,
        Currency: "EGP",
        BillingData: billingData,
      });

      // Clear cart after initiating payment
      await clearCartAfterOrder(orderDtos);
    } catch (err) {
      console.error("Online payment error:", err);
      showToast("error", err.message || "Failed to initiate payment.");
    } finally {
      setCreatingOrder(false);
    }
  };

  // ── Payment modal confirm ────────────────────────────────────────
  const handlePaymentConfirm = async () => {
    if (paymentMethod === "Cash") {
      setShowPaymentModal(false);
      await handleConfirmOrders();
    } else {
      await handleOnlinePayment();
    }
  };

  const handleCloseIframe = () => {
    setShowPaymentIframe(false);
    resetPayment();
    setPendingOrderId(null);
  };

  return {
    // data
    cart,
    pharmacies,
    loading,
    error,
    addresses,
    addressesLoading,
    addressesError,
    // address states
    pharmaciesRange,
    showLocationPrompt,
    showAddressSelection,
    selectedAddressId,
    showNewAddressForm,
    isConfirmingAddress,
    newAddressForm,
    // pharmacy / order states
    expandedPharmacies,
    showPaymentModal,
    selectedPharmacyForPayment,
    paymentMethod,
    selectedPharmacies,
    creatingOrder,
    selectedMedicines,
    // payment states
    initiatingPayment,
    showPaymentIframe,
    paymentResult,
    // map states
    userLocation,
    deliveryAddressLocation,
    deliveryAddress,
    hoveredPharmacyId,
    routeData,
    // toast
    toast,
    // setters
    setSelectedAddressId,
    setShowNewAddressForm,
    setNewAddressForm,
    setExpandedPharmacies,
    setShowPaymentModal,
    setPaymentMethod,
    setHoveredPharmacyId,
    setToast,
    setShowAddressSelection,
    // handlers
    handleSetLocation,
    handleNewAddressChange,
    handleAddNewAddress,
    handleConfirmAddress,
    handleExpandRange,
    handleTogglePharmacy,
    handleToggleMedicine,
    handleOrderClick,
    handlePaymentConfirm,
    handleCloseIframe,
  };
};
