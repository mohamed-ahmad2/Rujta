// src/features/pharmacies/hooks/useCheckout.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";
import { useOrders } from "../../orders/hooks/useOrders";
import { useAuth } from "../../auth/hooks/useAuth";
import useAddress from "../../address/hook/useAddress";
import { usePayment } from "../../payment/hooks/usePayment";
import apiClient from "../../../shared/api/apiClient";
import { decodePolyline } from "../../../utils/decodePolyline";
// ✅ NEW: drug interaction hook
import useDrugInteraction from "../../druginteraction/hook/useDrugInteraction";

const getAvailableQty = (medicine) => {
  const shortage = medicine.shortageQuantity ?? 0;
  return Math.max(medicine.requestedQuantity - shortage, 1);
};

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

  // ✅ NEW: drug interaction state
  const {
    result: interactionResult,
    loading: interactionLoading,
    checkInteractions,
    reset: resetInteraction,
  } = useDrugInteraction();
  const [showInteractionModal, setShowInteractionModal] = useState(false);

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
  const [selectedPharmacyForPayment, setSelectedPharmacyForPayment] =
    useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
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
    if (type !== "error") setTimeout(() => setToast(null), 3200);
  }, []);

  // ── Selected Pharmacies (derived) ───────────────────────────────
  const selectedPharmacies = useMemo(
    () =>
      Object.entries(selectedMedicines)
        .filter(([, meds]) => Object.keys(meds).length > 0)
        .map(([pharmacyId]) => pharmacyId),
    [selectedMedicines],
  );

  const totalSelectedItems = useMemo(
    () =>
      Object.values(selectedMedicines).reduce(
        (sum, meds) => sum + Object.keys(meds).length,
        0,
      ),
    [selectedMedicines],
  );

  const totalSelectedQtyPerMedicine = useMemo(() => {
    const result = {};
    Object.values(selectedMedicines).forEach((medsMap) => {
      Object.entries(medsMap).forEach(([medicineId, qty]) => {
        result[medicineId] = (result[medicineId] ?? 0) + qty;
      });
    });
    return result;
  }, [selectedMedicines]);

  // ── Medicine / Pharmacy Toggles ─────────────────────────────────
  const handleToggleMedicine = useCallback((pharmacyId, medicine) => {
    setSelectedMedicines((prev) => {
      const current = prev[pharmacyId] ?? {};
      const exists = medicine.medicineId in current;

      if (exists) {
        const { [medicine.medicineId]: _removed, ...rest } = current;
        return { ...prev, [pharmacyId]: rest };
      }

      return {
        ...prev,
        [pharmacyId]: {
          ...current,
          [medicine.medicineId]: getAvailableQty(medicine),
        },
      };
    });
  }, []);

  const handleUpdateQty = useCallback(
    (pharmacyId, medicineId, newQty, maxQty) => {
      const clamped = Math.min(Math.max(1, newQty), maxQty);
      setSelectedMedicines((prev) => ({
        ...prev,
        [pharmacyId]: {
          ...(prev[pharmacyId] ?? {}),
          [medicineId]: clamped,
        },
      }));
    },
    [],
  );

  const handleTogglePharmacy = useCallback((pharmacyId, allMedicines = []) => {
    setSelectedMedicines((prev) => {
      const current = prev[pharmacyId] ?? {};

      const allSelected =
        allMedicines.length > 0 &&
        allMedicines.every((m) => m.medicineId in current);

      if (allSelected) {
        return { ...prev, [pharmacyId]: {} };
      }

      const newMeds = { ...current };
      allMedicines.forEach((m) => {
        if (!(m.medicineId in current)) {
          newMeds[m.medicineId] = getAvailableQty(m);
        }
      });

      return { ...prev, [pharmacyId]: newMeds };
    });
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
          .catch((err) =>
            console.error("OSRM error:", pharmacy.pharmacyId, err),
          );

        return prev;
      });
    },
    [deliveryAddressLocation, userLocation],
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
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => console.error("Geolocation error:", err),
    );
  }, []);

  useEffect(() => {
    const msg = typeof error === "string" ? error : error?.message || "";
    if (msg.includes("location not set")) setShowLocationPrompt(true);
  }, [error]);

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

  // ✅ MODIFIED: now triggers interaction check first, then opens PaymentModal
  const handleOrderClick = async (pharmacy) => {
    const allMedicineIds = pharmacy.foundMedicines.map((m) => m.medicineId);

    // store pharmacy selection (same as before)
    setSelectedPharmacyForPayment(pharmacy);
    setSelectedPharmacies([pharmacy.pharmacyId]);
    setSelectedMedicines({ [pharmacy.pharmacyId]: allMedicineIds });

    // ✅ run interaction check before showing payment modal
    resetInteraction();
    setShowInteractionModal(true);

  await checkInteractions(allMedicineIds, 0.5);

  };

  // ✅ NEW: user chose to proceed after seeing interactions → open PaymentModal
  const handleInteractionProceed = () => {
    setShowInteractionModal(false);
    setShowPaymentModal(true);
  };

  // ✅ NEW: user chose to go back → close modal, reset selection
  const handleInteractionBack = () => {
    setShowInteractionModal(false);
    resetInteraction();
    setSelectedPharmacyForPayment(null);
    setSelectedPharmacies([]);
    setSelectedMedicines({});
  };


  const createOrders = async () => {
    if (!cart.length) throw new Error("Your cart is empty!");
    if (!selectedAddressId) throw new Error("No delivery address selected!");
    if (!selectedPharmacies.length) throw new Error("No pharmacies selected!");

    const orderDtos = selectedPharmacies.reduce((acc, pharmacyId) => {
      const pharmacy = pharmacies.find(
        (p) => String(p.pharmacyId) === String(pharmacyId),
      );
      if (!pharmacy) return acc;

      const selectedMedsMap = selectedMedicines[pharmacyId] ?? {};
      const normalizedMedsMap = Object.fromEntries(
        Object.entries(selectedMedsMap).map(([k, v]) => [String(k), v]),
      );

      const items = pharmacy.foundMedicines.filter(
        (m) => String(m.medicineId) in normalizedMedsMap,
      );
      if (!items.length) return acc;

      acc.push({
        PharmacyID: pharmacy.pharmacyId,
        DeliveryAddressId: selectedAddressId,
        OrderItems: items.map((m) => ({
          MedicineID: m.medicineId,
          Quantity: normalizedMedsMap[String(m.medicineId)],
        })),
      });
      return acc;
    }, []);

    if (!orderDtos.length)
      throw new Error(
        "No valid orders. Check selected medicines & quantities.",
      );

    const { data: results } = await apiClient.post("/orders", orderDtos);
    return { results, orderDtos };
  };

  // ── Clear cart after successful order ───────────────────────────
  const clearCartAfterOrder = async (orderDtos) => {
    const orderedIds = new Set(
      orderDtos.flatMap((d) => d.OrderItems.map((i) => String(i.MedicineID))),
    );
    const updatedCart = cart.filter((item) => !orderedIds.has(String(item.id)));
    localStorage.setItem(`cart_${user.email}`, JSON.stringify(updatedCart));
    window.dispatchEvent(
      new StorageEvent("storage", { key: `cart_${user.email}` }),
    );
    setCart(updatedCart);
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
          `${results.length} order${results.length > 1 ? "s" : ""} placed! 🎉`,
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

      const firstOrderId = results[0]?.id ?? results[0]?.orderId ?? results[0];
      setPendingOrderId(firstOrderId);

      // Get delivery address for billing data
      const fullAddress = await fetchById(selectedAddressId);

      const billingData = {
        FirstName: user?.firstName || user?.name?.split(" ")[0] || "Customer",
        LastName:
          user?.lastName || user?.name?.split(" ").slice(1).join(" ") || "User",
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
        0,
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
  // ✅ ADD THIS — handles the bottom "Order X items" button
const handleMultiOrderClick = async () => {
  // Collect all selected medicine IDs across all pharmacies
  const allMedicineIds = Object.values(selectedMedicines)
    .flatMap((medsMap) => Object.keys(medsMap).map(Number))
    .filter((id, index, self) => self.indexOf(id) === index); // deduplicate

  if (allMedicineIds.length === 0) return;

  resetInteraction();
  setShowInteractionModal(true);

  await checkInteractions(allMedicineIds, 0.5);
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
    totalSelectedItems,
    creatingOrder,
    selectedMedicines,
    totalSelectedQtyPerMedicine,
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
    // ✅ NEW exports
    showInteractionModal,
    interactionResult,
    interactionLoading,
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
    handleUpdateQty,
    handleOrderClick,
    handlePaymentConfirm,
    handleCloseIframe,
    // ✅ NEW exports
    handleInteractionProceed,
    handleInteractionBack,
    handleMultiOrderClick,   // ← add this

  };
};