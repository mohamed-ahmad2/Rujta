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

// ASP.NET Core [FromQuery] binds by the DTO's C# property names.
// We explicitly build a plain params object matching InventoryItemFilterDto
// property names exactly — no transformation, no Axios serializer quirks.
export const getPagedInventoryItems = ({
  PageNumber, pageNumber,
  PageSize,   pageSize,
  CategoryId, categoryId,
  Status,     status,
  SearchTerm, searchTerm,
} = {}) => {
  const params = new URLSearchParams();

  // PageNumber — required
  params.set("PageNumber", String(PageNumber ?? pageNumber ?? 1));
  // PageSize — required
  params.set("PageSize",   String(PageSize   ?? pageSize   ?? 10));

  // CategoryId — optional
  const catId = CategoryId ?? categoryId;
  if (catId != null) params.set("CategoryId", String(catId));

  // Status — optional enum string (e.g. "InStock", "LowStock", "OutOfStock")
  // ASP.NET Core binds enum [FromQuery] by name case-insensitively.
  const st = Status ?? status;
  if (st != null && st !== "") params.set("Status", String(st));

  // SearchTerm — optional free-text search against medicine name
  const term = SearchTerm ?? searchTerm;
  if (term != null && term.trim() !== "") params.set("SearchTerm", term.trim());

  return apiClient.get(`/InventoryItem/paged?${params.toString()}`);
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
