// src/features/super-admin/api/superAdmin.js
import apiClient from "../../../shared/api/apiClient";

const BASE = "/super-admin";

export const createPharmacy = (formData) => {
  return apiClient.post(`${BASE}/pharmacies`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getAllPharmacies = () => {
  return apiClient.get(`${BASE}/pharmacies`);
};

export const getPharmacyById = (id) => {
  return apiClient.get(`${BASE}/pharmacies/${id}`);
};

export const updatePharmacy = (id, data) => {
  return apiClient.put(`${BASE}/pharmacies/${id}`, data);
};

export const deletePharmacy = (id) => {
  return apiClient.delete(`${BASE}/pharmacies/${id}`);
};

export const restorePharmacy = (id) => {
  return apiClient.post(`${BASE}/pharmacies/${id}/restore`);
};

export const resetManagerPassword = (id) => {
  return apiClient.post(`${BASE}/pharmacies/${id}/reset-password`);
};

export const getPharmacyTotalOrders = (id) => {
  return apiClient.get(`${BASE}/pharmacies/${id}/total-orders`);
};

export const getTopPharmacies = (count = 5) => {
  return apiClient.get(`${BASE}/top-pharmacies`, { params: { count } });
};

export const getMainPharmacies = () => {
  return apiClient.get(`${BASE}/pharmacies/main`);
};

export const getBranches = (parentId) => {
  return apiClient.get(`${BASE}/pharmacies/${parentId}/branches`);
};

export const getPharmacyTree = (rootId) => {
  return apiClient.get(`${BASE}/pharmacies/${rootId}/tree`);
};

export const detachBranch = (branchId) => {
  return apiClient.post(`${BASE}/pharmacies/${branchId}/detach`);
};

export const attachBranch = (branchId, parentId) => {
  return apiClient.post(`${BASE}/pharmacies/${branchId}/attach/${parentId}`);
};
