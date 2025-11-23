// src/features/medicines/api/medicinesApi.js
import apiClient from "../../../shared/api/apiClient";

export const getAllMedicines = () => {
  return apiClient.get("/medicines");
};

export const getMedicineById = (id) => {
  return apiClient.get(`/medicines/${id}`);
};

export const addMedicine = (data) => {
  return apiClient.post("/medicines", data);
};

export const updateMedicine = (id, data) => {
  return apiClient.put(`/medicines/${id}`, data);
};

export const deleteMedicine = (id) => {
  return apiClient.delete(`/medicines/${id}`);
};

export const searchMedicines = (query) => {
  return apiClient.get(`/medicines/search?query=${query}`);
};
