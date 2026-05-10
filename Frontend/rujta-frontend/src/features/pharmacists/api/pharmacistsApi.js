// src/features/pharmacists/api/pharmacistsApi.js
import apiClient from "../../../shared/api/apiClient";

const BASE_URL = "/PharmacistManagement";

export const getAllPharmacists = () =>
  apiClient.get(`${BASE_URL}/GetAllPharmacist`);

export const getPharmacistById = (id) =>
  apiClient.get(`${BASE_URL}/GetPharmacistById/${id}`);

export const getPharmacyStaff = () =>
  apiClient.get(`${BASE_URL}/staff`);

export const getPharmacistsByManager = (managerId) =>
  apiClient.get(`${BASE_URL}/GetPharmacistByManager/${managerId}`);

export const createPharmacist = (data) =>
  apiClient.post(`${BASE_URL}/AddStaff`, data);

export const updatePharmacist = (id, data) =>
  apiClient.put(`${BASE_URL}/UpdateStaff/${id}`, data);

export const deletePharmacist = (id) =>
  apiClient.delete(`${BASE_URL}/DeleteStaff/${id}`);