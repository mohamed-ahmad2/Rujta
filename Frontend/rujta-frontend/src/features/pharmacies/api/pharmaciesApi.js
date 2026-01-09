// src/features/pharmacies/api/pharmaciesApi.js
import apiClient from "../../../shared/api/apiClient";

/**
 * Get top pharmacies for cart using selected address
 * @param {Array} items - Cart items [{ medicineId, quantity }]
 * @param {number} addressId - Selected address ID
 * @param {number} topK - Number of pharmacies
 */
export const getTopPharmacies = (items, addressId, topK = 15) => {
  const payload = { items };

  return apiClient.post(`/PriorityPharmacies/top-k`, payload, {
    params: {
      addressId,
      topK,
    },
  });
};
