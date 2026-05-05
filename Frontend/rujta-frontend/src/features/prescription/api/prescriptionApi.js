// src/features/prescription/api/prescriptionApi.js
import apiClient from "../../../shared/api/apiClient";

export const scanPrescription = (imageFiles) => {
  const formData = new FormData();
  
  // imageFiles can be a single File or an array of Files
  const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
  files.forEach((file) => formData.append("images", file));

  return apiClient.post("/prescription/scan", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};