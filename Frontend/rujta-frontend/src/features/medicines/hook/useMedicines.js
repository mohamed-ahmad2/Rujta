// src/features/medicines/hook/useMedicines.js
import { useState, useCallback, useRef } from "react";
import {
  getAllMedicines,
  getMedicineById,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  searchMedicines,
  filterMedicines,
  getPagedMedicines, 
} from "../api/medicinesApi";

export default function useMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pagedData, setPagedData] = useState({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 16,
    totalPages: 0,
    hasNextPage: false,
  });

  const cacheRef = useRef(new Map());
  const MAX_CACHE_ENTRIES = 30;

  const buildCacheKey = (params) =>
    JSON.stringify({
      p: params.pageNumber,
      s: params.pageSize,
      q: params.searchTerm || "",
      c: (params.categoryIds || []).slice().sort().join(","),
    });

  const fetchPaged = useCallback(async (params = {}) => {
    const finalParams = {
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 16,
      searchTerm: params.searchTerm,
      categoryIds: params.categoryIds,
    };

    const key = buildCacheKey(finalParams);


    if (cacheRef.current.has(key)) {
      const cached = cacheRef.current.get(key);
      setPagedData(cached);
      return cached;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await getPagedMedicines(finalParams);
      const data = {
        items: res.data.items || [],
        totalCount: res.data.totalCount || 0,
        pageNumber: res.data.pageNumber || 1,
        pageSize: res.data.pageSize || 16,
        totalPages: res.data.totalPages || 0,
        hasNextPage: res.data.hasNextPage || false,
      };

  
      if (cacheRef.current.size >= MAX_CACHE_ENTRIES) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }
      cacheRef.current.set(key, data);

      setPagedData(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load medicines");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMedicinesCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllMedicines();
      setMedicines(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = async (id) => {
    try {
      setLoading(true);
      const res = await getMedicineById(id);
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to fetch medicine");
    } finally {
      setLoading(false);
    }
  };

  const create = async (data) => {
    try {
      setLoading(true);
      const res = await addMedicine(data);
      clearMedicinesCache(); 
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to add medicine");
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    try {
      setLoading(true);
      await updateMedicine(id, data);
      clearMedicinesCache();
    } catch (err) {
      setError(err.message || "Failed to update medicine");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      setLoading(true);
      await deleteMedicine(id);
      clearMedicinesCache();
    } catch (err) {
      setError(err.message || "Failed to delete medicine");
    } finally {
      setLoading(false);
    }
  };

  const search = async (query) => {
    try {
      setLoading(true);
      const res = await searchMedicines(query);
      setMedicines(res.data);
    } catch (err) {
      setError(err.message || "Failed to search");
    } finally {
      setLoading(false);
    }
  };

  const filter = async (filterData) => {
    try {
      setLoading(true);
      const res = await filterMedicines(filterData);
      setMedicines(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to filter medicines");
    } finally {
      setLoading(false);
    }
  };

  return {
    medicines,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    search,
    filter,
    pagedData,
    fetchPaged,
    clearMedicinesCache,
  };
}