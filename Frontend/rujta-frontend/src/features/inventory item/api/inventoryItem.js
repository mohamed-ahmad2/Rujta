// src/features/inventory item/api/inventoryItem.js
import apiClient from "../../../shared/api/apiClient";

export const getAllInventoryItems = () => {
  return apiClient.get("/InventoryItem");
};

export const getInventoryItemById = (id) => {
  return apiClient.get(`/InventoryItem/${id}`);
};

export const getInventoryProducts = () => {
  return apiClient.get("/InventoryItem/products");
};

export const getPagedInventoryItems = (
  {
    PageNumber,
    pageNumber,
    PageSize,
    pageSize,
    CategoryId,
    categoryId,
    Status,
    status,
    SearchTerm,
    searchTerm,
  } = {},
  signal,
) => {
  const params = new URLSearchParams();

  params.set("PageNumber", String(PageNumber ?? pageNumber ?? 1));
  params.set("PageSize", String(PageSize ?? pageSize ?? 16));

  const catId = CategoryId ?? categoryId;
  if (catId != null) params.set("CategoryId", String(catId));

  const st = Status ?? status;
  if (st != null && st !== "") params.set("Status", String(st));

  const term = SearchTerm ?? searchTerm;
  if (term != null && term.trim() !== "") {
    params.set("SearchTerm", term.trim());
  }

  return apiClient.get(`/InventoryItem/paged?${params.toString()}`, { signal });
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
