// src/features/pharmacists/api/pharmacistsApi.js
import apiClient from "../../../shared/api/apiClient";

export const getAllPharmacists = () =>
  apiClient.get("/PharmacistManagement/GetAllPharmacist");

export const getPharmacistById = (id) =>
  apiClient.get(`/PharmacistManagement/GetPharmacistById/${id}`);

export const getPharmacyStaff = () =>
  apiClient.get("/PharmacistManagement/staff");

export const getPharmacistsByManager = (managerId) =>
  apiClient.get(`/PharmacistManagement/GetPharmacistByManager/${managerId}`);

export const updatePharmacist = (id, data) =>
  apiClient.put(`/PharmacistManagement/UpdateStaff/${id}`, data);

export const deletePharmacist = (id) =>
  apiClient.delete(`/PharmacistManagement/DeleteStaff/${id}`);
