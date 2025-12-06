// src/features/pharmacies/api/pharmaciesApi.js
import apiClient from "../../../shared/api/apiClient";

export const getTopPharmacies = (items, topK = 15) => {
  const payload = { items }; // wrap once
  return apiClient.post(`/PriorityPharmacies/top-k?topK=${topK}`, payload);
};

