import apiClient from "../../../shared/api/apiClient";

export const getCustomers = () => apiClient.get(`/customers`);

export const getCustomerStats = () => apiClient.get(`/customers/stats`);

export const createCustomer = (data) =>
  apiClient.post(`/customers`, data, {
    headers: { "Content-Type": "application/json" },
  });

export const updateCustomer = (id, data) =>
  apiClient.put(`/customers/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });

export const deleteCustomer = (id) => apiClient.delete(`/customers/${id}`);

export const checkCustomerByPhone = (phoneNumber) =>
  apiClient.get(`/customers/check`, {
    params: { phoneNumber },
  });

export const createOrder = (orders) => apiClient.post(`/Orders`, orders);
