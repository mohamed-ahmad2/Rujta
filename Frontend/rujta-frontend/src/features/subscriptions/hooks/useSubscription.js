import { useState, useCallback } from "react";
import {
  createSubscription,
  getSubscriptionStatus,
  renewSubscription,
  getAllSubscriptions,
  setSubscriptionStatus,
} from "../api/subscriptionApi";

export const useSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [status, setStatus]   = useState(null);
  const [all, setAll]         = useState([]);

  const run = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Something went wrong";
      setError(msg);
      throw err; // re-throw so callers can catch it
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    (plan) =>
      run(async () => {
        const res = await createSubscription(plan); // no pharmacyId
        return res.data;
      }),
    [run]
  );

  const renew = useCallback(
    (plan) =>
      run(async () => {
        const res = await renewSubscription(plan); // no pharmacyId
        return res.data;
      }),
    [run]
  );

  const fetchStatus = useCallback(
    () =>
      run(async () => {
        const res = await getSubscriptionStatus(); // no pharmacyId
        setStatus(res.data);
      }),
    [run]
  );

  const fetchAll = useCallback(
    () =>
      run(async () => {
        const res = await getAllSubscriptions();
        setAll(res.data);
      }),
    [run]
  );

  const toggleStatus = useCallback(
    (pharmacyId, activate) =>
      run(async () => {
        const res = await setSubscriptionStatus(pharmacyId, activate);
        setAll((prev) =>
          prev.map((s) =>
            s.pharmacyId === pharmacyId
              ? { ...s, pharmacyIsActive: activate, subscriptionStatus: activate ? "Active" : "Expired" }
              : s
          )
        );
        return res.data;
      }),
    [run]
  );

  return { loading, error, status, all, create, renew, fetchStatus, fetchAll, toggleStatus };
};