// src/features/payment/hooks/usePayment.js
import { useState, useCallback } from "react";
import {
  initiatePayment,
  handleCallback,
  createCashOrder,
  getMyPayments,
  getOrderPayments,
  getSubscriptionPayments,
  getAdPayments,
} from "../api/paymentApi";

/**
 * usePayment
 *
 * Covers two completely separate payment flows:
 *
 * ── FLOW 1: CASH ────────────────────────────────────────────────────────────
 *   placeCashOrder(createOrderDto)
 *     → POST /api/orders  [ { ...createOrderDto, paymentMethod: "Cash" } ]
 *     → Backend creates Order immediately with PaymentStatus = Pending
 *     → PaymentStatus switches to Success only when status becomes Delivered
 *
 * ── FLOW 2: ONLINE (Paymob) ─────────────────────────────────────────────────
 *   initiateOnlineOrder(createOrderDto, billingData, amount, currency?)
 *     → POST /api/payments/initiate  { type:"Order", amount, billingData, pendingOrderDtoJson }
 *     → Returns { iframeUrl, paymentToken, paymobOrderId, internalPaymentId }
 *     → Caller redirects user to iframeUrl
 *     → After Paymob, user is redirected back (see usePaymobRedirect below)
 *     → Backend webhook (callback) creates Order + sets PaymentStatus = Success
 *     → On cancel → backend issues Paymob refund automatically
 *
 * ── FLOW 3: SUBSCRIPTION / AD ───────────────────────────────────────────────
 *   initiate(dto)
 *     → POST /api/payments/initiate  with type:"Subscription" or type:"Ad"
 *
 * paymentResult shape: { internalPaymentId, paymentToken, iframeUrl, paymobOrderId }
 */
export const usePayment = () => {
  const [paymentResult, setPaymentResult] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Generic wrapper ────────────────────────────────────────────────────────
  const withLoading = useCallback(async (fn) => {
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Payment request failed";
      console.error("❌ Payment error:", err?.response?.data ?? err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── FLOW 1: Cash Order ─────────────────────────────────────────────────────
  /**
   * Creates a cash order immediately.
   * PaymentStatus starts as Pending, becomes Success upon Delivered.
   *
   * @param {Object} createOrderDto  – { pharmacyID, deliveryAddressId, paymentMethod:"Cash", orderItems:[{medicineID, quantity}] }
   * @returns {Promise<Object[]>}    – array of OrderDto
   */
  const placeCashOrder = useCallback(
    (createOrderDto) =>
      withLoading(async () => {
        // Ensure paymentMethod is Cash (backend will reject Payment method here)
        const dto = { ...createOrderDto, paymentMethod: "Cash" };
        console.log("💵 Placing cash order:", dto);
        const response = await createCashOrder(dto);
        console.log("✅ Cash order created:", response.data);
        return response.data; // OrderDto[]
      }),
    [withLoading],
  );

  // ── FLOW 2: Online Order (Paymob) ──────────────────────────────────────────
  /**
   * Initiates a Paymob payment for an order.
   * The actual Order is NOT created yet — it is created server-side after
   * the Paymob webhook callback fires with success.
   *
   * Steps after this call:
   *   1. Read paymentResult.iframeUrl and render it (iframe or redirect)
   *   2. Paymob redirects user to UserRedirectUrl (?success=true|false&id=...)
   *   3. Backend callback creates Order + marks PaymentStatus = Success
   *
   * @param {Object} createOrderDto  – { pharmacyID, deliveryAddressId, paymentMethod:"Payment", orderItems:[{medicineID, quantity}] }
   * @param {Object} billingData     – PaymobBillingDataDto { firstName, lastName, email, phoneNumber, ... }
   * @param {number} amount          – total in EGP
   * @param {string} currency        – default "EGP"
   * @returns {Promise<Object>}      – PaymentResponseDto { iframeUrl, paymentToken, paymobOrderId, internalPaymentId }
   */
  const initiateOnlineOrder = useCallback(
    (createOrderDto, billingData, amount, currency = "EGP") =>
      withLoading(async () => {
        // Serialize CreateOrderDto as JSON string for the backend
        const pendingOrderDtoJson = JSON.stringify({
          ...createOrderDto,
          paymentMethod: "Payment", // must be Payment for this flow
        });

        const dto = {
          type: "Order", // PaymentType.Order
          amount,
          currency,
          billingData,
          pendingOrderDtoJson, // backend stores and uses this after callback
        };

        console.log("💳 Initiating online order payment:", dto);
        const response = await initiatePayment(dto);
        console.log("📦 Paymob initiate response:", response.data);
        setPaymentResult(response.data);
        return response.data;
      }),
    [withLoading],
  );

  // ── FLOW 3: Generic initiate (Subscription / Ad) ───────────────────────────
  /**
   * @param {Object} dto  – InitiatePaymentDto
   *   For Subscription: { type:"Subscription", subscriptionId, amount, currency, billingData }
   *   For Ad:           { type:"Ad", adId, amount, currency, billingData }
   */
  const initiate = useCallback(
    (dto) =>
      withLoading(async () => {
        console.log("💳 Initiating payment:", dto);
        const response = await initiatePayment(dto);
        console.log("📦 initiate response:", response.data);
        setPaymentResult(response.data);
        return response.data;
      }),
    [withLoading],
  );

  // ── Paymob Callback (server-to-server; rarely from FE) ────────────────────
  const processCallback = useCallback(
    (dto, hmac) =>
      withLoading(async () => {
        const response = await handleCallback(dto, hmac);
        return response.data;
      }),
    [withLoading],
  );

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchMyPayments = useCallback(
    () =>
      withLoading(async () => {
        const response = await getMyPayments();
        setPayments(response.data ?? []);
      }),
    [withLoading],
  );

  const fetchOrderPayments = useCallback(
    () =>
      withLoading(async () => {
        const response = await getOrderPayments();
        setPayments(response.data ?? []);
      }),
    [withLoading],
  );

  const fetchSubscriptionPayments = useCallback(
    () =>
      withLoading(async () => {
        const response = await getSubscriptionPayments();
        setPayments(response.data ?? []);
      }),
    [withLoading],
  );

  const fetchAdPayments = useCallback(
    () =>
      withLoading(async () => {
        const response = await getAdPayments();
        setPayments(response.data ?? []);
      }),
    [withLoading],
  );

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setPaymentResult(null);
    setPayments([]);
    setError(null);
  }, []);

  return {
    // state
    paymentResult,
    payments,
    loading,
    error,
    // actions
    placeCashOrder,
    initiateOnlineOrder,
    initiate,
    processCallback,
    // fetchers
    fetchMyPayments,
    fetchOrderPayments,
    fetchSubscriptionPayments,
    fetchAdPayments,
    // utils
    reset,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// usePaymobRedirect
//
// Place this hook in the page/component Paymob redirects back to.
// Reads ?success=true/false&id=... query params and calls onSuccess/onFail.
//
// Usage:
//   const { result, txId, dismiss } = usePaymobRedirect({ onSuccess: refetch });
// ─────────────────────────────────────────────────────────────────────────────
export const usePaymobRedirect = ({ onSuccess, onFail } = {}) => {
  const [result, setResult] = useState(null); // null | "success" | "fail"
  const [txId, setTxId] = useState(null);
  const [handled, setHandled] = useState(false);

  // Run once on mount
  useState(() => {
    if (handled) return;
    setHandled(true);

    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    if (success === null) return;

    const id = params.get("id") || params.get("order") || null;
    setTxId(id);

    if (success === "true") {
      setResult("success");
      onSuccess?.({ txId: id });
    } else {
      setResult("fail");
      onFail?.({ txId: id });
    }

    // Clean URL
    window.history.replaceState({}, "", window.location.pathname);
  });

  return {
    result, // "success" | "fail" | null
    txId,
    isSuccess: result === "success",
    isFail: result === "fail",
    dismiss: () => setResult(null),
  };
};
