// src/features/ads/api/adsApi.js
import apiClient from "../../../shared/api/apiClient";

export const getAllAds = () => {
  return apiClient.get("/ads");
};

export const getAdById = (id) => {
  return apiClient.get(`/ads/${id}`);
};

export const getActiveAds = () => {
  return apiClient.get("/ads/active");
};

export const getAdsByPharmacy = (pharmacyId) => {
  return apiClient.get(`/ads/pharmacy/${pharmacyId}`);
};

export const createAd = (data) => {
  return apiClient.post("/ads", data);
};

export const updateAd = (id, data) => {
  return apiClient.put(`/ads/${id}`, data);
};

export const deleteAd = (id) => {
  return apiClient.delete(`/ads/${id}`);
};

export const toggleAdStatus = (id, isActive) => {
  return apiClient.patch(`/ads/${id}/status`, { isActive });
};
