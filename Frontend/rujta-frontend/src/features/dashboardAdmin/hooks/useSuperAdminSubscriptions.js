import { useCallback, useState } from "react";
import apiClient from "../../../shared/api/apiClient";

export default function useSuperAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/admin/subscription/all");
      setSubscriptions(res.data);
    } catch (err) {
      setError(err.message || "Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  const activate = async (pharmacyId) => {
    const res = await apiClient.post(`/admin/subscription/activate/${pharmacyId}`);
    return res.data;
  };

  const deactivate = async (pharmacyId) => {
    const res = await apiClient.post(`/admin/subscription/deactivate/${pharmacyId}`);
    return res.data;
  };

  return { subscriptions, loading, error, fetchAll, activate, deactivate };
}