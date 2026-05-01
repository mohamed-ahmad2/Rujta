// src/features/discounts/api/discounts.js
import apiClient from "../../../shared/api/apiClient";

export const getAllDiscounts = () => {
  return apiClient.get("/Discounts");
};

export const getDiscountById = (id) => {
  return apiClient.get(`/Discounts/${id}`);
};

export const createDiscount = (data) => {
  return apiClient.post("/Discounts", data);
};

export const deactivateDiscount = (id) => {
  return apiClient.put(`/Discounts/${id}/deactivate`);
};

export const deleteDiscount = (id) => {
  return apiClient.delete(`/Discounts/${id}`);
};
