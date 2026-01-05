// src/features/category/api/category.js
import apiClient from "../../../shared/api/apiClient";

export const getAllCategories = () => {
  return apiClient.get("/Category");
};

export const getCategoryById = (id) => {
  return apiClient.get(`/Category/${id}`);
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
