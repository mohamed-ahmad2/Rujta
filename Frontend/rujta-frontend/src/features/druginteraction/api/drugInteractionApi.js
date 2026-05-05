// src/features/drug interaction/api/drugInteractionApi.js
import apiClient from "../../../shared/api/apiClient";

export const checkDrugInteractions = (data) => {
  return apiClient.post("/DrugInteraction/check", data);
};

export const getMlHealthStatus = () => {
  return apiClient.get("/DrugInteraction/health");
};