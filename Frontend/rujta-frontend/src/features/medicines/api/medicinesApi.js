// src/features/medicines/api/medicinesApi.js
import apiClient from "../../../shared/api/apiClient";

export const getAllMedicines = () => apiClient.get("/medicines");

export const getMedicineById = (id) => apiClient.get(`/medicines/${id}`);

export const addMedicine = (data) => apiClient.post("/medicines", data);

export const updateMedicine = (id, data) => apiClient.put(`/medicines/${id}`, data);

export const deleteMedicine = (id) => apiClient.delete(`/medicines/${id}`);

export const searchMedicines = (query) =>
  apiClient.get(`/medicines/search?query=${query}`);

export const filterMedicines = (filter) =>
  apiClient.get("/medicines/filter", { params: filter });

export const getPagedMedicines = ({
  pageNumber = 1,
  pageSize = 16,
  searchTerm,
  categoryIds,
  activeIngredient,
} = {}) => {
  const params = { PageNumber: pageNumber, PageSize: pageSize };

  if (searchTerm?.trim()) params.SearchTerm = searchTerm.trim();
  if (activeIngredient?.trim()) params.ActiveIngredient = activeIngredient.trim();
  if (categoryIds && categoryIds.length > 0) params.CategoryIds = categoryIds;

  return apiClient.get("/medicines/paged", {
    params,
    paramsSerializer: {
      indexes: null,
    },
  });
};