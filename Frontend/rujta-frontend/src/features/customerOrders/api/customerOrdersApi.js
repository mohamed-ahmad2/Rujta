import apiClient from "../../../shared/api/apiClient";

export const getCustomers = (pharmacyId) =>
  apiClient.get(`/pharmacies/${pharmacyId}/customers`);

export const getCustomerStats = (pharmacyId) =>
  apiClient.get(`/pharmacies/${pharmacyId}/customers/stats`);

export const createCustomer = (pharmacyId, data) =>
  apiClient.post(`/pharmacies/${pharmacyId}/customers`, data, {
    headers: { "Content-Type": "application/json" },
  });

export const updateCustomer = (pharmacyId, id, data) =>
  apiClient.put(`/pharmacies/${pharmacyId}/customers/${id}`, data, {
    headers: { "Content-Type": "application/json" }
  });

export const deleteCustomer = (pharmacyId, id) =>
  apiClient.delete(`/pharmacies/${pharmacyId}/customers/${id}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`
      // No Content-Type needed for DELETE without body
    }
  });
export const checkCustomerByPhone = (pharmacyId, phoneNumber) =>
  apiClient.get(`/pharmacies/${pharmacyId}/customers/check`, {
    params: { phoneNumber },
  });