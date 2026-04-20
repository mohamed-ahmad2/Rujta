// src/features/prescription/api/prescriptionApi.js
import apiClient from "../../../shared/api/apiClient";

/**
 * Scan prescription image
 * Backend: POST /api/prescription/scan
 * @param {File} imageFile - صورة الروشتة
 */
export const scanPrescription = (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  return apiClient.post("/prescription/scan", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};