// src/features/user/hooks/useCheckout.js
/**
 * useCheckout
 *
 * Manages the full checkout flow:
 *
 * ── CASH ──────────────────────────────────────────────────────────────────────
 *  1. User selects medicines / pharmacy(ies)
 *  2. Clicks "Order" or "Order X items"
 *  3. Drug-interaction check (if applicable)
 *  4. PaymentModal opens → user chooses "Cash"
 *  5. handlePaymentConfirm(null) →  POST /orders  (createCashOrder)
 *     Backend: PaymentStatus = Pending → Success on Delivered
 *  6. Toast success, reset state
 *
 * ── ONLINE (Paymob) ────────────────────────────────────────────────────────────
 *  1–3. Same as above
 *  4. PaymentModal opens → user chooses "Online" → fills billing details
 *  5. handlePaymentConfirm(billingData) →  POST /payments/initiate
 *     Payload: { type:"Order", amount, currency, billingData, pendingOrderDtoJson }
 *  6. Backend returns { iframeUrl, paymentToken, … }
 *  7. PaymentIframeModal opens with iframeUrl
 *  8. Paymob processes payment, calls our webhook callback (/payments/callback)
 *  9. Callback handler creates the order & sets PaymentStatus = Success
 * 10. Paymob redirects browser to UserRedirectUrl with ?success=true&id=…
 * 11. Payments.jsx reads query params and shows PaymentResultBanner
 *
 * ── CANCEL + REFUND ────────────────────────────────────────────────────────────
 *  Handled server-side (OrderService.StatusManagement.cs / HandleRefundIfNeeded)
 *  when Cancel endpoint is called. Frontend just calls the cancel endpoint
 *  and the backend triggers Paymob refund automatically.
 *  The Orders page shows "Refunded" payment status after refresh.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { usePayment } from "../../payment/hooks/usePayment";
import useAddresses from "../../address/hooks/useAddresses";
import { checkDrugInteractions } from "../../medicines/api/medicinesApi";

// ── helpers ───────────────────────────────────────────────────────────────────

/** Build CreateOrderDto for a single pharmacy's selected medicines */
const buildOrderDto = (pharmacyId, medicinesMap, deliveryAddressId) => ({
  pharmacyID: pharmacyId,
  deliveryAddressId,
  paymentMethod: "Cash", // overridden to "Payment" for online
  orderItems: Object.entries(medicinesMap).map(([medicineId, qty]) => ({
    medicineID: Number(medicineId),
    quantity: qty,
  })),
});

// ─────────────────────────────────────────────────────────────────────────────

export const useCheckout = () => {
  // ── external hooks ────────────────────────────────────────────────────────
  const {
    paymentResult,
    loading: paymentLoading,
    error: paymentError,
    placeCashOrder,
    initiateOnlineOrder,
    showPaymentIframe: paymentIframeVisible, // from hook state if you expose it
  } = usePayment();

  const {
    addresses,
    loading: addressesLoading,
    error: addressesError,
    fetchAddresses,
    addAddress,
  } = useAddresses?.() ?? {
    addresses: [],
    loading: false,
    error: null,
    fetchAddresses: () => {},
    addAddress: () => {},
  };

  // ── pharmacy / medicine state (from parent context or local) ──────────────
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── selection state ───────────────────────────────────────────────────────
  /**
   * selectedMedicines: { [pharmacyId]: { [medicineId]: qty } }
   */
  const [selectedMedicines, setSelectedMedicines] = useState({});
  const [expandedPharmacies, setExpandedPharmacies] = useState({});
  const [hoveredPharmacyId, setHoveredPharmacyId] = useState(null);
  const [routeData, setRouteData] = useState({});

  // ── address state ─────────────────────────────────────────────────────────
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showAddressSelection, setShowAddressSelection] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isConfirmingAddress, setIsConfirmingAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    street: "",
    buildingNo: "",
    city: "",
    governorate: "",
  });
  const [userLocation, setUserLocation] = useState(null);
  const [deliveryAddressLocation, setDeliveryAddressLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  // ── payment modal state ───────────────────────────────────────────────────
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPharmacyForPayment, setSelectedPharmacyForPayment] =
    useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [showPaymentIframe, setShowPaymentIframe] = useState(false);
  const [localPaymentResult, setLocalPaymentResult] = useState(null);

  // ── drug interaction state ────────────────────────────────────────────────
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [interactionResult, setInteractionResult] = useState(null);
  const [interactionLoading, setInteractionLoading] = useState(false);

  // ── pending order context (saved before interaction check) ────────────────
  const pendingOrderRef = useRef(null); // { pharmacy?, isMulti }

  // ── toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Derived
  // ─────────────────────────────────────────────────────────────────────────

  const selectedPharmacies = Object.keys(selectedMedicines).filter(
    (pid) => Object.keys(selectedMedicines[pid] ?? {}).length > 0,
  );

  const totalSelectedItems = selectedPharmacies.reduce(
    (acc, pid) =>
      acc +
      Object.values(selectedMedicines[pid] ?? {}).reduce((s, q) => s + q, 0),
    0,
  );

  const totalSelectedQtyPerMedicine = Object.values(selectedMedicines).reduce(
    (acc, medsMap) => {
      Object.entries(medsMap).forEach(([mid, qty]) => {
        acc[mid] = (acc[mid] ?? 0) + qty;
      });
      return acc;
    },
    {},
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Selection handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleTogglePharmacy = useCallback((pharmacyId, allMedicines) => {
    setSelectedMedicines((prev) => {
      const current = prev[pharmacyId] ?? {};
      const allSelected = allMedicines.every((m) => m.medicineId in current);

      if (allSelected) {
        const next = { ...prev };
        delete next[pharmacyId];
        return next;
      }

      const newMap = {};
      allMedicines.forEach((m) => {
        newMap[m.medicineId] = current[m.medicineId] ?? 1;
      });
      return { ...prev, [pharmacyId]: newMap };
    });
  }, []);

  const handleToggleMedicine = useCallback((pharmacyId, medicine) => {
    setSelectedMedicines((prev) => {
      const current = { ...(prev[pharmacyId] ?? {}) };
      if (medicine.medicineId in current) {
        delete current[medicine.medicineId];
      } else {
        current[medicine.medicineId] = 1;
      }
      return { ...prev, [pharmacyId]: current };
    });
  }, []);

  const handleUpdateQty = useCallback((pharmacyId, medicineId, newQty, max) => {
    setSelectedMedicines((prev) => ({
      ...prev,
      [pharmacyId]: {
        ...(prev[pharmacyId] ?? {}),
        [medicineId]: Math.min(max, Math.max(1, newQty)),
      },
    }));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Location / Address
  // ─────────────────────────────────────────────────────────────────────────

  const handleSetLocation = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setShowLocationPrompt(false);
      },
      () => setShowLocationPrompt(true),
    );
  }, []);

  const handleNewAddressChange = useCallback((field, value) => {
    setNewAddressForm((f) => ({ ...f, [field]: value }));
  }, []);

  const handleAddNewAddress = useCallback(async () => {
    try {
      await addAddress(newAddressForm);
      await fetchAddresses();
      setShowNewAddressForm(false);
      setNewAddressForm({
        street: "",
        buildingNo: "",
        city: "",
        governorate: "",
      });
    } catch {
      showToast("Failed to add address", "error");
    }
  }, [addAddress, fetchAddresses, newAddressForm, showToast]);

  const handleConfirmAddress = useCallback(async () => {
    if (!selectedAddressId) {
      showToast("Please select a delivery address", "error");
      return;
    }
    setIsConfirmingAddress(true);
    try {
      const addr = addresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        setDeliveryAddress(addr);
        setDeliveryAddressLocation(addr.location ?? null);
      }
      setShowAddressSelection(false);
    } finally {
      setIsConfirmingAddress(false);
    }
  }, [selectedAddressId, addresses]);

  // ─────────────────────────────────────────────────────────────────────────
  // Range expand
  // ─────────────────────────────────────────────────────────────────────────

  const handleExpandRange = useCallback(() => {
    // trigger parent search with expanded radius — implementation depends on
    // how pharmacies are fetched (pass this up or call a context action)
    console.log("Expanding search range by +5km");
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Drug interaction check
  // ─────────────────────────────────────────────────────────────────────────

  const runInteractionCheck = useCallback(async (medicineIds) => {
    if (!medicineIds || medicineIds.length < 2) return true; // no check needed
    setInteractionLoading(true);
    setInteractionResult(null);
    try {
      const result = await checkDrugInteractions(medicineIds);
      if (result?.hasInteractions) {
        setInteractionResult(result);
        setShowInteractionModal(true);
        return false; // caller should wait for user decision
      }
      return true;
    } catch {
      return true; // if check fails, proceed anyway
    } finally {
      setInteractionLoading(false);
    }
  }, []);

  const handleInteractionProceed = useCallback(() => {
    setShowInteractionModal(false);
    setInteractionResult(null);
    // Re-open payment modal that was pending
    setShowPaymentModal(true);
  }, []);

  const handleInteractionBack = useCallback(() => {
    setShowInteractionModal(false);
    setInteractionResult(null);
    pendingOrderRef.current = null;
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Order click handlers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Single-pharmacy Order button (PharmacyCard)
   */
  const handleOrderClick = useCallback(
    async (pharmacy) => {
      if (!selectedAddressId) {
        setShowAddressSelection(true);
        return;
      }

      setSelectedPharmacyForPayment(pharmacy);
      pendingOrderRef.current = { pharmacy, isMulti: false };

      const medicineIds = Object.keys(
        selectedMedicines[pharmacy.pharmacyId] ?? {},
      ).map(Number);
      const canProceed = await runInteractionCheck(medicineIds);
      if (canProceed) setShowPaymentModal(true);
    },
    [selectedAddressId, selectedMedicines, runInteractionCheck],
  );

  /**
   * Multi-pharmacy Order button (PharmacyList bottom banner)
   */
  const handleMultiOrderClick = useCallback(async () => {
    if (!selectedAddressId) {
      setShowAddressSelection(true);
      return;
    }

    pendingOrderRef.current = { isMulti: true };

    const allMedicineIds = [
      ...new Set(
        Object.values(selectedMedicines).flatMap((m) =>
          Object.keys(m).map(Number),
        ),
      ),
    ];
    const canProceed = await runInteractionCheck(allMedicineIds);
    if (canProceed) setShowPaymentModal(true);
  }, [selectedAddressId, selectedMedicines, runInteractionCheck]);

  // ─────────────────────────────────────────────────────────────────────────
  // Payment confirm — called by PaymentModal
  //  billingData = null  → Cash
  //  billingData = {...} → Online (Paymob)
  // ─────────────────────────────────────────────────────────────────────────

  const handlePaymentConfirm = useCallback(
    async (billingData) => {
      const isOnline = billingData !== null;
      const isMulti = pendingOrderRef.current?.isMulti ?? false;

      setShowPaymentModal(false);

      // ── Build order DTO(s) ────────────────────────────────────────────────
      const buildDtos = () => {
        if (!isMulti && selectedPharmacyForPayment) {
          const pid = selectedPharmacyForPayment.pharmacyId;
          const meds = selectedMedicines[pid] ?? {};
          return [buildOrderDto(pid, meds, selectedAddressId)];
        }
        // multi-pharmacy
        return selectedPharmacies.map((pid) =>
          buildOrderDto(pid, selectedMedicines[pid] ?? {}, selectedAddressId),
        );
      };

      const orderDtos = buildDtos();
      if (!orderDtos.length) {
        showToast("No items selected", "error");
        return;
      }

      // ── CASH ──────────────────────────────────────────────────────────────
      if (!isOnline) {
        setCreatingOrder(true);
        try {
          // For multi-pharmacy, POST /orders accepts an array
          const cashDtos = orderDtos.map((d) => ({
            ...d,
            paymentMethod: "Cash",
          }));
          await placeCashOrder(cashDtos.length === 1 ? cashDtos[0] : cashDtos);
          showToast(
            "Order placed successfully! Pay when your delivery arrives. 🎉",
          );
          resetCheckoutState();
        } catch (err) {
          showToast(
            err?.response?.data?.message ||
              "Failed to place order. Please try again.",
            "error",
          );
        } finally {
          setCreatingOrder(false);
        }
        return;
      }

      // ── ONLINE (Paymob) ───────────────────────────────────────────────────
      // Note: Paymob supports one payment per initiation.
      // For multi-pharmacy online, we initiate one payment per order
      // (or handle it as a single payment if the backend aggregates).
      // Current backend: one InitiatePaymentDto → one Paymob order.
      // We initiate for each pharmacy order separately.
      setInitiatingPayment(true);
      try {
        // Calculate total for this payment
        const dto = orderDtos[0]; // primary / single order
        const total = computeTotal(dto, pharmacies);

        const onlineDto = { ...dto, paymentMethod: "Payment" };
        await initiateOnlineOrder(onlineDto, billingData, total);
        // paymentResult is now set in usePayment → contains iframeUrl
        setShowPaymentIframe(true);
      } catch (err) {
        showToast(
          err?.response?.data?.message ||
            "Failed to initiate payment. Please try again.",
          "error",
        );
      } finally {
        setInitiatingPayment(false);
      }
    },
    [
      selectedPharmacyForPayment,
      selectedMedicines,
      selectedPharmacies,
      selectedAddressId,
      pharmacies,
      placeCashOrder,
      initiateOnlineOrder,
      showToast,
    ],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Iframe close
  // ─────────────────────────────────────────────────────────────────────────

  const handleCloseIframe = useCallback(() => {
    setShowPaymentIframe(false);
    setLocalPaymentResult(null);
    // Don't reset full state here — let the Paymob redirect handle it.
    // If user just closed without paying, show a gentle notice.
    showToast(
      "Payment window closed. If you completed payment, your order will appear shortly.",
      "info",
    );
  }, [showToast]);

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  const resetCheckoutState = () => {
    setSelectedMedicines({});
    setSelectedPharmacyForPayment(null);
    pendingOrderRef.current = null;
    setPaymentMethod("Cash");
  };

  /**
   * Compute total from selected medicines + pharmacy price data.
   * Falls back to 0 if prices are not available client-side.
   */
  const computeTotal = (dto, pharmacyList) => {
    const pharmacy = pharmacyList.find((p) => p.pharmacyId === dto.pharmacyID);
    if (!pharmacy) return 0;

    return dto.orderItems.reduce((sum, item) => {
      const med = pharmacy.foundMedicines?.find(
        (m) => m.medicineId === item.medicineID,
      );
      const price = med?.price ?? med?.unitPrice ?? 0;
      return sum + price * item.quantity;
    }, 0);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Exposed state & handlers
  // ─────────────────────────────────────────────────────────────────────────

  return {
    // pharmacy list
    pharmacies,
    loading,
    error,
    // address
    addresses,
    addressesLoading,
    addressesError,
    showLocationPrompt,
    showAddressSelection,
    setShowAddressSelection,
    selectedAddressId,
    setSelectedAddressId,
    showNewAddressForm,
    setShowNewAddressForm,
    isConfirmingAddress,
    newAddressForm,
    setNewAddressForm,
    // map
    userLocation,
    deliveryAddressLocation,
    deliveryAddress,
    hoveredPharmacyId,
    setHoveredPharmacyId,
    routeData,
    // pharmacy card
    expandedPharmacies,
    setExpandedPharmacies,
    // selection
    selectedMedicines,
    selectedPharmacies,
    totalSelectedItems,
    totalSelectedQtyPerMedicine,
    // payment modal
    showPaymentModal,
    setShowPaymentModal,
    selectedPharmacyForPayment,
    paymentMethod,
    setPaymentMethod,
    creatingOrder,
    initiatingPayment,
    // iframe
    showPaymentIframe,
    paymentResult: localPaymentResult ?? paymentResult,
    // drug interaction
    showInteractionModal,
    interactionResult,
    interactionLoading,
    // toast
    toast,
    setToast,
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
    handleMultiOrderClick,
    handlePaymentConfirm,
    handleCloseIframe,
    handleInteractionProceed,
    handleInteractionBack,
  };
};
