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
 * Handles ALL payment-related async actions:
 *  - Cash orders  →  POST /orders  (createCash)
 *  - Online orders →  POST /payments/initiate  (initiateOnlineOrder)
 *  - Subscriptions / Ads  →  POST /payments/initiate  (initiate)
 *  - Fetch lists
 *
 * paymentResult shape (from initiate):
 *  { internalPaymentId, paymentToken, iframeUrl, paymobOrderId }
 */
export const usePayment = () => {
  const [paymentResult,   setPaymentResult]   = useState(null);
  const [payments,        setPayments]        = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);

  // ── Generic loader wrapper ────────────────────────────────────────────────
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
      throw err;           // re-throw so callers can handle (e.g. show toast)
    } finally {
      setLoading(false);
    }
  }, []);

  // ── 1. Cash Order ─────────────────────────────────────────────────────────
  /**
   * Creates a cash order immediately via POST /orders.
   * Backend sets PaymentStatus = Pending; switches to Success on Delivered.
   * @param {Object} createOrderDto  – matches CreateOrderDto C# shape
   * @returns {Promise<Object[]>}    – array of created OrderDto(s)
   */
  const placeCashOrder = useCallback(
    (createOrderDto) =>
      withLoading(async () => {
        console.log("💵 Placing cash order:", createOrderDto);
        const response = await createCashOrder(createOrderDto);
        console.log("✅ Cash order created:", response.data);
        return response.data;          // array of OrderDto
      }),
    [withLoading]
  );

  // ── 2. Online / Paymob Order ──────────────────────────────────────────────
  /**
   * Initiates a Paymob payment for an ORDER.
   * The actual order is created server-side after callback success.
   *
   * @param {Object} createOrderDto   – matches CreateOrderDto (PaymentMethod must be "Payment")
   * @param {Object} billingData      – matches PaymobBillingDataDto
   * @param {number} amount           – total in EGP
   * @param {string} currency         – default "EGP"
   * @returns {Promise<void>}         – sets paymentResult.iframeUrl
   */
  const initiateOnlineOrder = useCallback(
    (createOrderDto, billingData, amount, currency = "EGP") =>
      withLoading(async () => {
        // Serialize the order DTO to JSON — backend stores it as PendingOrderDtoJson
        const pendingOrderDtoJson = JSON.stringify({
          ...createOrderDto,
          paymentMethod: "Payment",   // ensure correct enum value
        });

        const dto = {
          type: "Order",
          amount,
          currency,
          billingData,
          pendingOrderDtoJson,
        };

        console.log("💳 Initiating online order payment:", dto);
        const response = await initiatePayment(dto);
        console.log("📦 Paymob initiate response:", response.data);
        setPaymentResult(response.data);
      }),
    [withLoading]
  );

  // ── 3. Generic initiate (Subscription / Ad) ───────────────────────────────
  /**
   * For subscription or ad payments (not orders).
   * @param {Object} dto  – full InitiatePaymentDto
   */
  const initiate = useCallback(
    (dto) =>
      withLoading(async () => {
        console.log("💳 Sending payment DTO:", dto);
        const response = await initiatePayment(dto);
        console.log("📦 initiate response:", response.data);
        setPaymentResult(response.data);
      }),
    [withLoading]
  );

  // ── 4. Callback (rarely called from FE) ───────────────────────────────────
  const processCallback = useCallback(
    (dto, hmac) =>
      withLoading(async () => {
        const response = await handleCallback(dto, hmac);
        return response.data;
      }),
    [withLoading]
  );

  // ── 5. Fetch helpers ──────────────────────────────────────────────────────
  const fetchMyPayments = useCallback(
    () =>
      withLoading(async () => {
        const response = await getMyPayments();
        setPayments(response.data);
      }),
    [withLoading]
  );

  const fetchOrderPayments = useCallback(
    () =>
      withLoading(async () => {
        const response = await getOrderPayments();
        setPayments(response.data);
      }),
    [withLoading]
  );

  const fetchSubscriptionPayments = useCallback(
    () =>
      withLoading(async () => {
        const response = await getSubscriptionPayments();
        setPayments(response.data);
      }),
    [withLoading]
  );

  const fetchAdPayments = useCallback(
    () =>
      withLoading(async () => {
        const response = await getAdPayments();
        setPayments(response.data);
      }),
    [withLoading]
  );

  // ── Reset ─────────────────────────────────────────────────────────────────
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