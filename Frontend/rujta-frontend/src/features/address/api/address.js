import apiClient from "../../../shared/api/apiClient";

export const getAllAddresses = () => {
  return apiClient.get("/Addresses");
};

export const getAddressById = (id) => {
  return apiClient.get(`/Addresses/${id}`);
};

export const getUserAddresses = () => {
  return apiClient.get("/Addresses/user");
};

export const addAddress = (data) => {
  return apiClient.post("/Addresses", data);
};

export const updateAddress = (id, data) => {
  return apiClient.put(`/Addresses/${id}`, data);
};

export const deleteAddress = (id) => {
  return apiClient.delete(`/Addresses/${id}`);
};
