// src/features/prescription/hooks/usePrescription.js
import { useState } from "react";
import { scanPrescription } from "../api/prescriptionApi";

export const usePrescription = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scan = async (imageFile) => {
    try {
      setLoading(true);
      setError(null);

      const response = await scanPrescription(imageFile);
      setResult(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to scan prescription");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, scan };
};