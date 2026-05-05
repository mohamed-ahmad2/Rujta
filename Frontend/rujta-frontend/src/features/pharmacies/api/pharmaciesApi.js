// src/features/pharmacies/api/pharmaciesApi.js
import apiClient from "../../../shared/api/apiClient";

export const getTopPharmacies = (
  items,
  addressId,
  topK = 15,
  maxShortageRange = null
) => {
  const payload = { items };
  const params = { addressId, topK };

  if (maxShortageRange !== null && maxShortageRange !== undefined)
    params.maxShortageRange = maxShortageRange;

  return apiClient.post("/PriorityPharmacies/top-k", payload, { params });
};

export const getAllPharmacies = () => apiClient.get("/pharmacies");

export const getNearestPharmacies = (
  userLat,
  userLon,
  mode = "car",
  topK = 5
) =>
  apiClient.get("/pharmacies/nearest-routed", {
    params: { userLat, userLon, mode, topK },
  });

export const getPharmacyMedicines = (pharmacyId) =>
  apiClient.get(`/pharmacies/${pharmacyId}/medicines`);

export const getMedicineStockInPharmacy = (pharmacyId, medicineId) =>
  apiClient.get(`/pharmacies/${pharmacyId}/medicine/${medicineId}/stock`);


export const getPagedPharmacyMedicines = (
  pharmacyId,
  { pageNumber = 1, pageSize = 16, searchTerm, categoryId } = {},
  signal = undefined  
) => {
  const params = { pageNumber, pageSize };

  if (searchTerm && searchTerm.trim()) params.searchTerm = searchTerm.trim();
  if (
    categoryId !== undefined &&
    categoryId !== null &&
    categoryId !== "All"
  )
    params.categoryId = categoryId;

  return apiClient.get(`/pharmacies/${pharmacyId}/medicines/paged`, {
    params,
    signal,
  });
};