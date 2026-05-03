// src/features/super-admin/api/superAdmin.js
import apiClient from "../../../shared/api/apiClient";

const BASE = "/super-admin";

export const createPharmacy = (formData) => {
  return apiClient.post(`${BASE}/pharmacies`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getAllPharmacies = () => apiClient.get(`${BASE}/pharmacies`);

export const getPharmacyById = (id) =>
  apiClient.get(`${BASE}/pharmacies/${id}`);

export const updatePharmacy = (id, data) =>
  apiClient.put(`${BASE}/pharmacies/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });

export const deletePharmacy = (id) =>
  apiClient.delete(`${BASE}/pharmacies/${id}`);

export const restorePharmacy = (id) =>
  apiClient.post(`${BASE}/pharmacies/${id}/restore`);

export const resetManagerPassword = (id) =>
  apiClient.post(`${BASE}/pharmacies/${id}/reset-password`);

export const getPharmacyTotalOrders = (id) =>
  apiClient.get(`${BASE}/pharmacies/${id}/total-orders`);

export const getTopPharmacies = (count = 5) =>
  apiClient.get(`${BASE}/top-pharmacies`, { params: { count } });

export const getMainPharmacies = () => apiClient.get(`${BASE}/pharmacies/main`);

export const getBranches = (parentId) =>
  apiClient.get(`${BASE}/pharmacies/${parentId}/branches`);

export const getPharmacyTree = (rootId) =>
  apiClient.get(`${BASE}/pharmacies/${rootId}/tree`);

export const detachBranch = (branchId) =>
  apiClient.post(`${BASE}/pharmacies/${branchId}/detach`);

export const attachBranch = (branchId, parentId) =>
  apiClient.post(`${BASE}/pharmacies/${branchId}/attach/${parentId}`);
