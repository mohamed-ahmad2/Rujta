import { useState, useEffect, useCallback, useMemo } from "react";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";
import { useOrders } from "../../orders/hooks/useOrders";
import { useAuth } from "../../auth/hooks/useAuth";
import useAddress from "../../address/hook/useAddress";
import { usePayment } from "../../payment/hooks/usePayment";
import apiClient from "../../../shared/api/apiClient";
import { decodePolyline } from "../../../utils/decodePolyline";

// ─── Helper ───────────────────────────────────────────────────────────────────
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
  const [showPaymentIframe, setShowPaymentIframe] = useState(false);
  const [selectedPharmacyForPayment, setSelectedPharmacyForPayment] =
    useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [creatingOrder, setCreatingOrder] = useState(false);

  // ✅ { [pharmacyId]: { [medicineId]: selectedQty } }
  const [selectedMedicines, setSelectedMedicines] = useState({});

  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [deliveryAddressLocation, setDeliveryAddressLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [hoveredPharmacyId, setHoveredPharmacyId] = useState(null);
  const [routeData, setRouteData] = useState({});
  const [toast, setToast] = useState(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    if (type !== "error") setTimeout(() => setToast(null), 3200);
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
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

  // ── Conflict Resolver ──────────────────────────────────────────────────────
  // يشيل الدواء من كل الصيدليات الأخرى لو اتحدد في صيدلية جديدة
  const resolveConflict = (prevState, targetPharmacyId, medicineId) => {
    const newState = { ...prevState };
    Object.keys(newState).forEach((pid) => {
      if (pid !== targetPharmacyId && medicineId in (newState[pid] ?? {})) {
        const { [medicineId]: _removed, ...rest } = newState[pid];
        newState[pid] = rest;
      }
    });
    return newState;
  };

  // ── Handler: Toggle Medicine ───────────────────────────────────────────────
  const handleToggleMedicine = useCallback(
    (pharmacyId, medicine) => {
      let hadConflict = false;

      setSelectedMedicines((prev) => {
        const current = prev[pharmacyId] ?? {};
        const exists = medicine.medicineId in current;

        if (exists) {
          // إلغاء تحديد الدواء
          const { [medicine.medicineId]: _removed, ...rest } = current;
          return { ...prev, [pharmacyId]: rest };
        }

        // فحص لو نفس الدواء موجود في صيدلية تانية
        Object.keys(prev).forEach((pid) => {
          if (pid !== pharmacyId && medicine.medicineId in (prev[pid] ?? {})) {
            hadConflict = true;
          }
        });

        // حل الـ conflict + إضافة الدواء
        const resolved = resolveConflict(prev, pharmacyId, medicine.medicineId);
        return {
          ...resolved,
          [pharmacyId]: {
            ...(resolved[pharmacyId] ?? {}),
            [medicine.medicineId]: getAvailableQty(medicine),
          },
        };
      });

      // Toast بعد setState
      if (hadConflict) {
        setTimeout(
          () =>
            showToast(
              "warning",
              "⚠️ تم نقل الدواء تلقائياً من الصيدلية الأخرى لتفادي التكرار",
            ),
          50,
        );
      }
    },
    [showToast],
  );

  // ── Handler: Update Medicine Quantity ─────────────────────────────────────
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

  // ── Handler: Toggle All Medicines in Pharmacy ─────────────────────────────
  const handleTogglePharmacy = useCallback((pharmacyId, allMedicines = []) => {
    setSelectedMedicines((prev) => {
      const current = prev[pharmacyId] ?? {};
      const allSelected =
        allMedicines.length > 0 &&
        allMedicines.every((m) => m.medicineId in current);

      if (allSelected) {
        // شيل كل أدوية الصيدلية
        return { ...prev, [pharmacyId]: {} };
      }

      // حدد كل الأدوية مع حل الـ conflicts
      let newState = { ...prev };
      allMedicines.forEach((m) => {
        newState = resolveConflict(newState, pharmacyId, m.medicineId);
      });

      const newMeds = { ...(newState[pharmacyId] ?? {}) };
      allMedicines.forEach((m) => {
        // لو الدواء كان محدد قبل كده، خلي الكمية زي ما هي
        newMeds[m.medicineId] = current[m.medicineId] ?? getAvailableQty(m);
      });

      return { ...newState, [pharmacyId]: newMeds };
    });
  }, []);

  // ── Handler: Order Click (زر Order على الكارد) ────────────────────────────
  const handleOrderClick = (pharmacy) => {
    const allMedicines = pharmacy.foundMedicines;
    setSelectedPharmacyForPayment(pharmacy);

    // حدد كل أدوية الصيدلية دي فقط وامسح الباقي
    const newMeds = {};
    allMedicines.forEach((m) => {
      newMeds[m.medicineId] = getAvailableQty(m);
    });
    setSelectedMedicines({ [pharmacy.pharmacyId]: newMeds });
    setShowPaymentModal(true);
  };

  // ── Route Fetching ─────────────────────────────────────────────────────────
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

  // ── Effects ────────────────────────────────────────────────────────────────
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

  // ── Handler: Set Location ──────────────────────────────────────────────────
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

  // ── Handler: Address Form ──────────────────────────────────────────────────
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

  // ── Order Creation ─────────────────────────────────────────────────────────
  const createOrders = async () => {
    if (!cart.length) throw new Error("Your cart is empty!");
    if (!selectedAddressId) throw new Error("No delivery address selected!");
    if (!selectedPharmacies.length) throw new Error("No pharmacies selected!");

    const orderDtos = selectedPharmacies.reduce((acc, pharmacyId) => {
      const pharmacy = pharmacies.find((p) => p.pharmacyId === pharmacyId);
      if (!pharmacy) return acc;

      const selectedMedsMap = selectedMedicines[pharmacyId] ?? {};
      const items = pharmacy.foundMedicines.filter(
        (m) => m.medicineId in selectedMedsMap,
      );
      if (!items.length) return acc;

      acc.push({
        PharmacyID: pharmacyId,
        DeliveryAddressId: selectedAddressId,
        OrderItems: items.map((m) => ({
          MedicineID: m.medicineId,
          // ✅ الكمية المختارة من الـ stepper مش requestedQuantity الكاملة
          Quantity: selectedMedsMap[m.medicineId],
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

  const clearCartAfterOrder = async (orderDtos) => {
    const orderedIds = new Set(
      orderDtos.flatMap((d) => d.OrderItems.map((i) => i.MedicineID)),
    );
    const updatedCart = cart.filter((item) => !orderedIds.has(item.id));
    localStorage.setItem(`cart_${user.email}`, JSON.stringify(updatedCart));
    window.dispatchEvent(
      new StorageEvent("storage", { key: `cart_${user.email}` }),
    );
    setCart(updatedCart);
    setSelectedMedicines({});
    await fetchUser();
  };

  // ── Order Confirm: Cash ────────────────────────────────────────────────────
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

  // ── Order Confirm: Online Payment ──────────────────────────────────────────
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

      // ✅ الحساب بناءً على الكمية المختارة من الـ stepper
      const totalAmount = selectedPharmacies.reduce((total, pharmacyId) => {
        const pharmacy = pharmacies.find((p) => p.pharmacyId === pharmacyId);
        if (!pharmacy) return total;
        const selectedMedsMap = selectedMedicines[pharmacyId] ?? {};
        return (
          total +
          pharmacy.foundMedicines
            .filter((m) => m.medicineId in selectedMedsMap)
            .reduce(
              (sum, m) => sum + m.price * selectedMedsMap[m.medicineId],
              0,
            )
        );
      }, 0);

      const dto = {
        Type: "Order",
        OrderId: firstOrderId,
        Amount: Math.round(totalAmount * 100) / 100,
        Currency: "EGP",
        BillingData: billingData,
      };

      await initiate(dto);
      await clearCartAfterOrder(orderDtos);
    } catch (err) {
      console.error("Online payment error:", err);
      showToast("error", err.message || "Failed to initiate payment.");
    } finally {
      setCreatingOrder(false);
    }
  };

  // ── Payment Confirm ────────────────────────────────────────────────────────
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

  // ── Return ─────────────────────────────────────────────────────────────────
  return {
    cart,
    pharmacies,
    loading,
    error,
    addresses,
    addressesLoading,
    addressesError,
    pharmaciesRange,
    showLocationPrompt,
    showAddressSelection,
    selectedAddressId,
    showNewAddressForm,
    isConfirmingAddress,
    newAddressForm,
    expandedPharmacies,
    showPaymentModal,
    selectedPharmacyForPayment,
    paymentMethod,
    selectedPharmacies,
    totalSelectedItems,
    creatingOrder,
    selectedMedicines,
    initiatingPayment,
    showPaymentIframe,
    paymentResult,
    userLocation,
    deliveryAddressLocation,
    deliveryAddress,
    hoveredPharmacyId,
    routeData,
    toast,
    setSelectedAddressId,
    setShowNewAddressForm,
    setNewAddressForm,
    setExpandedPharmacies,
    setShowPaymentModal,
    setPaymentMethod,
    setHoveredPharmacyId,
    setToast,
    setShowAddressSelection,
    handleSetLocation,
    handleNewAddressChange,
    handleAddNewAddress,
    handleConfirmAddress,
    handleExpandRange,
    handleTogglePharmacy,
    handleToggleMedicine,
    handleUpdateQty, // ← جديد
    handleOrderClick,
    handlePaymentConfirm,
    handleCloseIframe,
  };
};
