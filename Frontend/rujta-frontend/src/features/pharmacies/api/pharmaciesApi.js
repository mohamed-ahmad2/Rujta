// src/features/pharmacies/api/pharmaciesApi.js
import apiClient from "../../../shared/api/apiClient";

export const getTopPharmacies = (
  items,
  addressId,
  topK = 15,
  maxShortageRange = null,
) => {
  const payload = { items };

  const params = { addressId, topK };

  if (maxShortageRange !== null && maxShortageRange !== undefined) {
    params.maxShortageRange = maxShortageRange;
  }

  return apiClient.post(`/PriorityPharmacies/top-k`, payload, { params });
};

/* ===================== GENERAL PHARMACIES ===================== */

export const getAllPharmacies = () => {
  return apiClient.get("/pharmacies");
};

export const getPharmacyMedicines = (pharmacyId) => {
  return apiClient.get(`/pharmacies/${pharmacyId}/medicines`);
};

export const getMedicineStockInPharmacy = (pharmacyId, medicineId) => {
  return apiClient.get(
    `/pharmacies/${pharmacyId}/medicine/${medicineId}/stock`,
  );
};
