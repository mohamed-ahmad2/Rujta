// src/features/payment/api/paymentApi.js
import apiClient from "../../../shared/api/apiClient";

export const initiatePayment = (dto) =>
  apiClient.post("/payments/initiate", dto);

export const handleCallback = (dto, hmac) =>
  apiClient.post("/payments/callback", dto, {
    params: { hmac },
  });

export const getMyPayments = () =>
  apiClient.get("/payments/my");

export const getOrderPayments = () =>
  apiClient.get("/payments/my/orders");

export const getSubscriptionPayments = () =>
  apiClient.get("/payments/my/subscriptions");

export const getAdPayments = () =>
  apiClient.get("/payments/my/ads");