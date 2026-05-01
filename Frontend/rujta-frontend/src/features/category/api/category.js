// src/features/category/api/category.js
import apiClient from "../../../shared/api/apiClient";

export const getAllCategories = () => {
  return apiClient.get("/Category");
};

export const getCategoryById = (id) => {
  return apiClient.get(`/Category/${id}`);
};

// 🔒 Pharmacy admin's own pharmacy (uses JWT)
export const getPharmacyCategories = () => {
  return apiClient.get("/Category/pharmacy-categories");
};

// ✅ NEW — Public endpoint for any pharmacy (used in user-facing pages)
export const getCategoriesByPharmacy = (pharmacyId) => {
  return apiClient.get(`/Category/by-pharmacy/${pharmacyId}`);
};

export const addCategory = (data) => {
  return apiClient.post("/Category", data);
};

export const updateCategory = (id, data) => {
  return apiClient.put(`/Category/${id}`, data);
};

export const deleteCategory = (id) => {
  return apiClient.delete(`/Category/${id}`);
};