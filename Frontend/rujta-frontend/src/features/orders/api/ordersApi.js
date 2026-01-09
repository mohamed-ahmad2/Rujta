// src/features/orders/api/ordersApi.js
import apiClient from "../../../shared/api/apiClient";

export const getAllOrders = () => apiClient.get("/orders");
export const getOrderById = (id) => apiClient.get(`/orders/${id}`);
export const getOrderDetails = (id) => apiClient.get(`/orders/${id}/details`);

export const getUserOrders = () => apiClient.get("/orders/user");
export const getPharmacyOrders = () => apiClient.get("/orders/pharmacy/orders");

export const createOrder = (data) => apiClient.post("/orders", data);
export const updateOrder = (id, data) => apiClient.put(`/orders/${id}`, data);
export const deleteOrder = (id) => apiClient.delete(`/orders/${id}`);

export const acceptOrder = (id) => apiClient.put(`/orders/${id}/accept`,{});
export const processOrder = (id) => apiClient.put(`/orders/${id}/process`);
export const outForDelivery = (id) => apiClient.put(`/orders/${id}/out-for-delivery`);
export const markAsDelivered = (id) => apiClient.put(`/orders/${id}/delivered`);
export const cancelOrderByUser = (id) => apiClient.put(`/orders/${id}/cancel/user`);
export const cancelOrderByPharmacy = (id) => apiClient.put(`/orders/${id}/cancel/pharmacy`);