// src/features/prescription/hooks/usePrescription.js
import { useState } from "react";
import { scanPrescription } from "../api/prescriptionApi";

export const usePrescription = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // imageFiles: File | File[]
  const scan = async (imageFiles) => {
    try {
      setLoading(true);
      setError(null);
      const response = await scanPrescription(imageFiles);
      console.log("📦 raw response:", response);
      console.log("✅ response.data:", response.data);
    console.log("✅ availableMedicines:", response.data?.availableMedicines);
    console.log("✅ notFoundMedicines:", response.data?.notFoundMedicines);
      setResult(response.data);
    } catch (err) {
      console.error("❌ scan error:", err);
      setError(err?.response?.data?.message || "Failed to scan prescription");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, scan };
};