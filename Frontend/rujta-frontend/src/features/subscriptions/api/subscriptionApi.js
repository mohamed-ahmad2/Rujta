import apiClient from "../../../shared/api/apiClient";

export const createSubscription = (plan) =>
  apiClient.post("/subscription/create", { plan });

export const getSubscriptionStatus = () =>
  apiClient.get("/subscription/status");

export const renewSubscription = (plan) =>
  apiClient.post("/subscription/renew", { plan });

export const getAllSubscriptions = () =>
  apiClient.get("/subscription/all");

export const setSubscriptionStatus = (pharmacyId, activate) =>
  apiClient.patch("/subscription/set-status", { pharmacyId, activate });