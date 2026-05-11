// src/features/druginteraction/hook/useDrugInteraction.js
import { useState, useCallback } from "react";
import {
  checkDrugInteractions,
  checkOrderInteractions,
  checkHistoryInteractions,
  getMlHealthStatus,
} from "../api/drugInteractionApi";

// ── helpers ───────────────────────────────────────────────────────────────────

const extractErrorMessage = (err) => {
  if (!err) return "An unknown error occurred";
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data && typeof err.response.data === "string")
    return err.response.data;
  if (err?.response?.status) {
    const status = err.response.status;
    if (status === 401) return "Unauthorized: Please log in again";
    if (status === 403) return "Forbidden: You don't have permission";
    if (status === 500) return "Server error: Please contact support";
    return `Request failed with status ${status}`;
  }
  if (err?.message) return err.message;
  return "Failed to check drug interactions";
};

// mapResult — بيشتغل مع check-order و check-history
// check-history بيحتوي على drug1IsFromHistory و drug2IsFromHistory زيادة
const mapResult = (raw = {}) => {
  const interactions = Array.isArray(raw.interactions) ? raw.interactions : [];
  return {
    totalDrugsChecked:    raw.totalDrugsChecked    ?? 0,
    totalPairsChecked:    raw.totalPairsChecked    ?? 0,
    interactionsFound:    raw.interactionsFound    ?? 0,
    mlServiceUnavailable: raw.mlServiceUnavailable ?? false,
    interactions: interactions
      .map((i) => ({
        drug1Id:            i.drug1Id,
        drug1Name:          i.drug1Name          || "Unknown",
        drug1IsFromHistory: i.drug1IsFromHistory  ?? false,
        drug2Id:            i.drug2Id,
        drug2Name:          i.drug2Name          || "Unknown",
        drug2IsFromHistory: i.drug2IsFromHistory  ?? false,
        probability:        i.probability         ?? 0,
        interacts:          i.interacts           ?? false,
        confidence:         i.confidence          || "low",
        riskLevel:
          (i.probability ?? 0) >= 0.85 ? "High"
          : (i.probability ?? 0) >= 0.65 ? "Medium"
          : "Low",
      }))
      .sort((a, b) => b.probability - a.probability),
  };
};

// ── hook ──────────────────────────────────────────────────────────────────────

export default function useDrugInteraction() {
  const [result,        setResult]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [mlHealth,      setMlHealth]      = useState("unknown");
  const [healthLoading, setHealthLoading] = useState(false);

  // ── الـ function الأصلية — موجودة للتوافق مع أي كود تاني بيستخدمها ────────
  const checkInteractions = useCallback(async (medicineIds, threshold = 0.7) => {
    setLoading(true);
    try {
      const res  = await checkDrugInteractions({ medicineIds, threshold });
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
  }, []);

  // ── الـ function الجديدة للـ CartDrawerUser ──────────────────────────────
  //
  // بتبعت check-order + check-history بالتوازي
  // بترجع { orderResult, historyResult, hasInteractions }
  //
  // hasInteractions = true  → يظهر الـ modal
  // hasInteractions = false → يروح Checkout مباشرة
  const checkOrderAndHistory = useCallback(async (medicineIds, threshold = 0.5) => {
    if (!medicineIds || medicineIds.length === 0) {
      return { orderResult: null, historyResult: null, hasInteractions: false };
    }

    setLoading(true);
    setError(null);

    try {
      // بنبعت الاتنين بالتوازي — Promise.allSettled عشان لو واحد فشل التاني يكمل
      const [orderRes, historyRes] = await Promise.allSettled([
        checkOrderInteractions({ medicineIds, threshold }),
        checkHistoryInteractions({ medicineIds, threshold }),
      ]);

      const orderResult =
        orderRes.status === "fulfilled"
          ? mapResult(orderRes.value?.data ?? orderRes.value ?? {})
          : null;

      const historyResult =
        historyRes.status === "fulfilled"
          ? mapResult(historyRes.value?.data ?? historyRes.value ?? {})
          : null;

      // لو الاتنين فشلوا
      if (!orderResult && !historyResult) {
        const msg = extractErrorMessage(
          orderRes.reason ?? historyRes.reason
        );
        setError(msg);
        return { orderResult: null, historyResult: null, hasInteractions: false };
      }

      const hasInteractions =
        (orderResult?.interactionsFound   ?? 0) > 0 ||
        (historyResult?.interactionsFound ?? 0) > 0;

      // بنحفظ النتيجة بشكل { orderResult, historyResult } عشان الـ modal يعرف يفصل بينهم
      setResult({ orderResult, historyResult });

      return { orderResult, historyResult, hasInteractions };

    } catch (err) {
      console.error("❌ checkOrderAndHistory error:", err);
      setError(extractErrorMessage(err));
      return { orderResult: null, historyResult: null, hasInteractions: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── ml health check ───────────────────────────────────────────────────────
  const refreshHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res  = await getMlHealthStatus();
      const data = res?.data ?? res ?? {};
      setMlHealth(data.mlService === "reachable" ? "ok" : "degraded");
    } catch (err) {
      console.error("❌ refreshHealth error:", err);
      setMlHealth("degraded");
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // ── reset ─────────────────────────────────────────────────────────────────
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
    checkInteractions,      // الأصلي — للـ useCheckout
    checkOrderAndHistory,   // الجديد — للـ CartDrawerUser
    refreshHealth,
    reset,
  };
}