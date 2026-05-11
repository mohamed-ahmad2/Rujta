import apiClient from "../../../shared/api/apiClient";

export const getMyPayments = () => apiClient.get("/payments/my");

export const getOrderPayments = () => apiClient.get("/payments/my/orders");

export const getSubscriptionPayments = () =>
  apiClient.get("/payments/my/subscriptions");

export const getAdPayments = () => apiClient.get("/payments/my/ads");