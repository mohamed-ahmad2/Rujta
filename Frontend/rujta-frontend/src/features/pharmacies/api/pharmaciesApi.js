// src/features/pharmacies/api/pharmaciesApi.js
import apiClient from "../../../shared/api/apiClient";

/* ===================== PRIORITY PHARMACIES ===================== */

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

/* ===================== GENERAL PHARMACIES ===================== */

// جلب كل الصيدليات
export const getAllPharmacies = () => {
  return apiClient.get("/pharmacies");
};

// جلب كل أدوية صيدلية (IDs فقط)
export const getPharmacyMedicines = (pharmacyId) => {
  return apiClient.get(`/pharmacies/${pharmacyId}/medicines`);
};

// جلب المخزون لدواء معين داخل صيدلية
export const getMedicineStockInPharmacy = (pharmacyId, medicineId) => {
  return apiClient.get(
    `/pharmacies/${pharmacyId}/medicine/${medicineId}/stock`
  );
};
