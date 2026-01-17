// src/features/customerOrders/api/customerOrdersApi.js
import apiClient from "../../../shared/api/apiClient";

/**
 * Create a new customer order
 * POST /api/pharmacies/{pharmacyId}/customers/order
 * PharmacyId is resolved from JWT on backend
 */
export const createCustomerOrder = (data) =>
  apiClient.post("/pharmacies/0/customers/order", data);

export const checkCustomerByPhone = (phoneNumber) =>
  apiClient.get("/pharmacies/0/customers/check", {
    params: { phoneNumber },
  });