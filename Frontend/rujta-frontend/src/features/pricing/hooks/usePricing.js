import { useState, useCallback } from "react";
import { getPricing, updatePricing } from "../api/pricingApi";

export const usePricing = () => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchPricing = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPricing();
      setPricing(res.data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load pricing");
    } finally {
      setLoading(false);
    }
  }, []);

  const savePricing = useCallback(async (dto) => {
    try {
      setLoading(true);
      const res = await updatePricing(dto);
      setPricing(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save pricing");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fix: expose clearError so components can reset the banner
  const clearError = useCallback(() => setError(null), []);

  return { pricing, loading, error, fetchPricing, savePricing, clearError };
};