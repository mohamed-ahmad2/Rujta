// src/features/orders/api/ordersApi.js
import apiClient from "../../../shared/api/apiClient";

export const getAllOrders = () => {
    return apiClient.get("/orders");
};

export const getOrderById = (id) => {
    return apiClient.get(`/orders/${id}`);
};

export const getOrderDetails = (id) => {
    return apiClient.get(`/orders/${id}/details`);
};

export const getUserOrders = () => {
    return apiClient.get(`/orders/user`);
};

export const createOrder = (data) => {
    return apiClient.post("/orders", data);
};

export const updateOrder = (id, data) => {
    return apiClient.put(`/orders/${id}`, data);
};

export const deleteOrder = (id) => {
    return apiClient.delete(`/orders/${id}`);
};

// order status actions
export const acceptOrder = (id) => {
    return apiClient.put(`/orders/${id}/accept`);
};

export const processOrder = (id) => {
    return apiClient.put(`/orders/${id}/process`);
};

export const outForDelivery = (id) => {
    return apiClient.put(`/orders/${id}/out-for-delivery`);
};

export const markAsDelivered = (id) => {
    return apiClient.put(`/orders/${id}/delivered`);
};

export const cancelByUser = (id) => {
    return apiClient.put(`/orders/${id}/cancel/user`);
};

export const cancelByPharmacy = (id) => {
    return apiClient.put(`/orders/${id}/cancel/pharmacy`);
};
