// src/features/pharmacists/hook/usePharmacists.js
import { useState, useCallback } from "react";
import {
  getAllPharmacists,
  getPharmacistById,
  getPharmacyStaff,
  getPharmacistsByManager,
  updatePharmacist,
  deletePharmacist,
} from "../api/pharmacistsApi";

export const usePharmacists = () => {
  const [pharmacists, setPharmacists] = useState([]);
  const [selectedPharmacist, setSelectedPharmacist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchList = async (fetchFn) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setPharmacists(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
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
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = useCallback(
    async () => fetchList(getAllPharmacists),
    []
  );

  const fetchPharmacyStaff = useCallback(
    async () => fetchList(getPharmacyStaff),
    []
  );

  const fetchByManager = useCallback(
    async (managerId) =>
      fetchList(() => getPharmacistsByManager(managerId)),
    []
  );

  const fetchById = useCallback(
    async (id) =>
      fetchSingle(getPharmacistById, id, setSelectedPharmacist),
    []
  );


  const runMutation = async (fn, refreshFn) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      if (refreshFn) await refreshFn();
      return res?.data || null;
    } catch (err) {
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data, refreshFn = fetchPharmacyStaff) =>
    runMutation(() => updatePharmacist(id, data), refreshFn);

  const remove = async (id, refreshFn = fetchPharmacyStaff) =>
    runMutation(() => deletePharmacist(id), refreshFn);


  return {
    pharmacists,
    selectedPharmacist,
    loading,
    error,

    fetchAll,
    fetchPharmacyStaff,
    fetchByManager,
    fetchById,

    update,
    remove,
  };
};
