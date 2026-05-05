import apiClient from "../../../shared/api/apiClient";

export const createSubscription = (pharmacyId, plan) =>
  apiClient.post("/subscription/create", { pharmacyId, plan });

export const getSubscriptionStatus = (pharmacyId) =>
  apiClient.get(`/subscription/status/${pharmacyId}`);

export const renewSubscription = (pharmacyId, plan) =>
  apiClient.post("/subscription/renew", { pharmacyId, plan });

export const getAllSubscriptions = () =>
  apiClient.get("/subscription/all");

export const setSubscriptionStatus = (pharmacyId, activate) =>
  apiClient.patch("/subscription/set-status", { pharmacyId, activate });