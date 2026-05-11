import { useState, useCallback } from "react";
import {
  getMyPayments,
  getSubscriptionPayments,
  getAdPayments,
} from "../api/paymentsApi";

export const usePayments = () => {
  const [payments, setPayments]         = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [ads, setAds]                   = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allRes, subRes, adsRes] = await Promise.all([
        getMyPayments(),
        getSubscriptionPayments(),
        getAdPayments(),
      ]);

      setPayments(allRes.data || []);

      const subs = subRes.data || [];
      setSubscription(subs.length > 0 ? subs[0] : null);

      setAds(adsRes.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { payments, subscription, ads, loading, error, fetchAll };
};