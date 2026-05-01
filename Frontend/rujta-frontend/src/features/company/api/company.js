// src/features/company/api/company.js
import apiClient from "../../../shared/api/apiClient";

export const getAllCompanies = () => {
  return apiClient.get("/Company");
};

export const getCompanyById = (id) => {
  return apiClient.get(`/Company/${id}`);
};

export const getPharmacyCompanies = () => {
  return apiClient.get("/Company/pharmacy-companies");
};

export const addCompany = (data) => {
  return apiClient.post("/Company", data);
};

export const updateCompany = (id, data) => {
  return apiClient.put(`/Company/${id}`, data);
};

export const deleteCompany = (id) => {
  return apiClient.delete(`/Company/${id}`);
};
