import { useState, useCallback } from "react";
import {
  initiatePayment,
  handleCallback,
  getMyPayments,
  getOrderPayments,
  getSubscriptionPayments,
  getAdPayments,
} from "../api/paymentApi";

export const usePayment = () => {
  const [paymentResult, setPaymentResult] = useState(null);
  const [payments, setPayments]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  const withLoading = useCallback(async (fn) => {
    try {
      setLoading(true);
      setError(null);
      await fn();
    } catch (err) {
      // ── Full error detail for debugging ──
      console.error("❌ payment error:", err?.response?.data?.errors ?? err?.response?.data ?? err);
      setError(err?.response?.data?.message || "Payment request failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const initiate = useCallback(
    (dto) =>
      withLoading(async () => {
        console.log("💳 Sending payment DTO:", JSON.stringify(dto, null, 2));
        const response = await initiatePayment(dto);
        console.log("📦 initiate response.data:", response.data);
        setPaymentResult(response.data);
      }),
    [withLoading]
  );

  const processCallback = useCallback(
    (dto, hmac) =>
      withLoading(async () => {
        const response = await handleCallback(dto, hmac);
        return response.data;
      }),
    [withLoading]
  );

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

  const reset = useCallback(() => {
    setPaymentResult(null);
    setPayments([]);
    setError(null);
  }, []);

  return {
    paymentResult,
    payments,
    loading,
    error,
    initiate,
    processCallback,
    fetchMyPayments,
    fetchOrderPayments,
    fetchSubscriptionPayments,
    fetchAdPayments,
    reset,
  };
};
