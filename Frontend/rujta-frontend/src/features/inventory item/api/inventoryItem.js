// src/features/inventory item/api/inventoryItem.js
import apiClient from "../../../shared/api/apiClient";

export const getAllInventoryItems = () => {
  return apiClient.get("/InventoryItem");
};

export const getInventoryItemById = (id) => {
  return apiClient.get(`/InventoryItem/${id}`);
};

export const addInventoryItem = (data) => {
  return apiClient.post("/InventoryItem", data);
};

export const updateInventoryItem = (id, data) => {
  return apiClient.put(`/InventoryItem/${id}`, data);
};

export const deleteInventoryItem = (id) => {
  return apiClient.delete(`/InventoryItem/${id}`);
};

export const getInventoryProducts = () => {
  return apiClient.get("/InventoryItem/products");
};
