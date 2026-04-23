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

      // ── DEBUG: remove this log once confirmed working ──
      console.log("📦 raw response:", response);
      console.log("📦 response.data:", response.data);

      // response.data is the object returned by Ok(result) in .NET
      // Expected shape: { availableMedicines: [...], unavailableMedicines: [...] }
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
