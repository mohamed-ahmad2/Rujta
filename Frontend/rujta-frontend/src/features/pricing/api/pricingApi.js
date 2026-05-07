import apiClient from "../../../shared/api/apiClient";

export const getPricing    = ()    => apiClient.get("/pricing");
export const updatePricing = (dto) => apiClient.put("/pricing", dto);