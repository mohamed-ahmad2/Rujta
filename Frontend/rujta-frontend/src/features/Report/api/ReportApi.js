// src/features/report/api/reportApi.js
import apiClient from "../../../shared/api/apiClient";

/**
 * Get pharmacy report for logged-in admin (SuperAdmin)
 * Backend: GET /api/Report/PharmacyReport
 */
export const getPharmacyReport = () => {
  return apiClient.get("/Report/PharmacyReport");
};
