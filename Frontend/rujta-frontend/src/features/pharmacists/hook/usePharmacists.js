// src/features/pharmacists/hook/usePharmacists.js
import { useState, useCallback } from "react";
import {
  getAllPharmacists,
  getPharmacistById,
  getPharmacyStaff,
  getPharmacistsByManager,
  createPharmacist,
  updatePharmacist,
  deletePharmacist,
} from "../api/pharmacistsApi";

export const usePharmacists = () => {
  const [pharmacists, setPharmacists] = useState([]);
  const [selectedPharmacist, setSelectedPharmacist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (err) => {
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;

      return {
        message: "Validation error",
        details: Object.values(errors).flat(),
      };
    }

    return {
      message:
        err.response?.data?.message || err.message || "Something went wrong",
      details: [],
    };
  };

  const fetchList = async (fetchFn) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setPharmacists(res.data);
      return res.data;
    } catch (err) {
      setError(handleError(err));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchSingle = async (fetchFn, param, setStateFn) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn(param);
      setStateFn(res.data);
      return res.data;
    } catch (err) {
      setError(handleError(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const runMutation = async (fn, options = {}) => {
    const { refreshFn, optimisticUpdate } = options;

    setLoading(true);
    setError(null);

    try {
      if (optimisticUpdate) optimisticUpdate();

      const res = await fn();

      if (refreshFn) await refreshFn();

      return res?.data || null;
    } catch (err) {
      setError(handleError(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = useCallback(() => fetchList(getAllPharmacists), []);

  const fetchPharmacyStaff = useCallback(() => fetchList(getPharmacyStaff), []);

  const fetchByManager = useCallback(
    (managerId) => fetchList(() => getPharmacistsByManager(managerId)),
    [],
  );

  const fetchById = useCallback(
    (id) => fetchSingle(getPharmacistById, id, setSelectedPharmacist),
    [],
  );

  const create = async (data, refreshFn = fetchPharmacyStaff) =>
    runMutation(() => createPharmacist(data), { refreshFn });

  const update = async (id, data, refreshFn = fetchPharmacyStaff) =>
    runMutation(() => updatePharmacist(id, data), { refreshFn });

  const remove = async (id, refreshFn = fetchPharmacyStaff) =>
    runMutation(() => deletePharmacist(id), {
      refreshFn,
      optimisticUpdate: () => {
        setPharmacists((prev) => prev.filter((p) => p.id !== id));
      },
    });

  return {
    pharmacists,
    selectedPharmacist,
    loading,
    error,

    fetchAll,
    fetchPharmacyStaff,
    fetchByManager,
    fetchById,

    create,
    update,
    remove,
  };
};
