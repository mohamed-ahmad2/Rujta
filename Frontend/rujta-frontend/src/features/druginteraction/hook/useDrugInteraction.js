// src/features/drug interaction/hook/useDrugInteraction.js
import { useState, useCallback } from "react";
import { checkDrugInteractions, getMlHealthStatus } from "../api/drugInteractionApi";

// ✅ Helper to extract the real error message from any error type
const extractErrorMessage = (err) => {
  if (!err) return "An unknown error occurred";

  // Axios error with backend message
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data) {
    if (typeof err.response.data === "string") return err.response.data;
  }

  // Axios status-based error
  if (err?.response?.status) {
    const status = err.response.status;
    if (status === 401) return "Unauthorized: Please log in again";
    if (status === 403) return "Forbidden: You don't have permission";
    if (status === 500) return "Server error: Please contact support";
    return `Request failed with status ${status}`;
  }

  // Network or standard Error
  if (err?.message) return err.message;

  return "Failed to check drug interactions";
};

// ✅ Maps the raw API response to a clean result object
const mapResult = (raw = {}) => {
  const interactions = Array.isArray(raw.interactions) ? raw.interactions : [];

  return {
    totalDrugsChecked: raw.totalDrugsChecked ?? 0,
    totalPairsChecked: raw.totalPairsChecked ?? 0,
    interactionsFound: raw.interactionsFound ?? 0,
    mlServiceUnavailable: raw.mlServiceUnavailable ?? false,
    interactions: interactions
      .map((i) => ({
        drug1Id: i.drug1Id,
        drug1Name: i.drug1Name || "Unknown",
        drug2Id: i.drug2Id,
        drug2Name: i.drug2Name || "Unknown",
        probability: i.probability ?? 0,
        interacts: i.interacts ?? false,
        // Derived risk level — mirrors backend RiskLevel property
        riskLevel:
          (i.probability ?? 0) >= 0.85
            ? "High"
            : (i.probability ?? 0) >= 0.65
              ? "Medium"
              : "Low",
      }))
      .sort((a, b) => b.probability - a.probability), // highest probability first
  };
};

export default function useDrugInteraction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [mlHealth, setMlHealth] = useState("unknown"); // "unknown" | "ok" | "degraded"
  const [healthLoading, setHealthLoading] = useState(false);

  // ─── check interactions ────────────────────────────────────────────────────
      const checkInteractions = useCallback(async (medicineIds, threshold = 0.7) => {
      setLoading(true);
      try {
       const res = await checkDrugInteractions({ medicineIds, threshold });
        // ✅ handle both axios (res.data) and custom apiClient (res directly)
        const data = res?.data ?? res ?? {};
        const mapped = mapResult(data);
        setResult(mapped);
        setError(null);
        return mapped;
      } catch (err) {
        console.error("❌ checkInteractions error:", err);
        setError(extractErrorMessage(err));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─── ml health check ───────────────────────────────────────────────────────
  const refreshHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await getMlHealthStatus();
      const data = res?.data ?? res ?? {};
      setMlHealth(data.mlService === "reachable" ? "ok" : "degraded");
    } catch (err) {
      console.error("❌ refreshHealth error:", err);
      setMlHealth("degraded");
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // ─── reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    loading,
    error,
    mlHealth,
    healthLoading,
    checkInteractions,
    refreshHealth,
    reset,
  };
}