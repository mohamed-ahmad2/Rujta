// src/features/pharmacies/hooks/usePharmacies.js
import { useState, useCallback, useRef } from "react";
import {
  getTopPharmacies,
  getAllPharmacies,
  getNearestPharmacies,
  getPharmacyMedicines,
  getMedicineStockInPharmacy,
  getPagedPharmacyMedicines,
} from "../api/pharmaciesApi";

const parseError = (err) => {
  if (err?.response?.status === 401)
    return "Unauthorized. Please log in first.";
  if (err?.response?.status === 404)
    return err?.response?.data?.message ?? "Resource not found.";
  if (err?.response?.status === 400) {
    const errors = err?.response?.data?.errors;
    if (errors) return Object.values(errors).flat().join(" ");
    return err?.response?.data?.message ?? "Invalid request.";
  }
  if (err?.response?.status >= 500)
    return "Server error. Please try again later.";
  if (!err?.response) return "Network error. Please check your connection.";
  return (
    err?.response?.data?.message ??
    err?.message ??
    "An unexpected error occurred."
  );
};

export const usePharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [medicinesLoading, setMedicinesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockNotFound, setStockNotFound] = useState(false);

  const [pagedPharmacyMedicines, setPagedPharmacyMedicines] = useState({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 16,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const pagedCacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);
  const MAX_CACHE_ENTRIES = 30;

  const startLoading = () => {
    setLoading(true);
    setError(null);
  };
  const stopLoading = () => setLoading(false);

  const buildPagedKey = (params) =>
    JSON.stringify({
      p: params.pageNumber,
      s: params.pageSize,
      q: params.searchTerm || "",
      c: params.categoryId ?? "",
    });

  // ─────────────────────────────────────────
  // ✅ Paged medicines — race-condition safe
  // ─────────────────────────────────────────
  const fetchPagedPharmacyMedicines = useCallback(async (params = {}) => {
    const finalParams = {
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 16,
      searchTerm: params.searchTerm,
      categoryId: params.categoryId,
    };

    const key = buildPagedKey(finalParams);

    if (pagedCacheRef.current.has(key)) {
      setPagedPharmacyMedicines(pagedCacheRef.current.get(key));
      return pagedCacheRef.current.get(key);
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setMedicinesLoading(true);
    setError(null);

    try {
      const res = await getPagedPharmacyMedicines(finalParams, signal);

      if (signal.aborted) return null;

      const data = {
        items: res.data.items || [],
        totalCount: res.data.totalCount || 0,
        pageNumber: res.data.pageNumber || 1,
        pageSize: res.data.pageSize || 16,
        totalPages: res.data.totalPages || 0,
        hasNextPage: res.data.hasNextPage || false,
        hasPreviousPage: res.data.hasPreviousPage || false,
      };

      if (pagedCacheRef.current.size >= MAX_CACHE_ENTRIES) {
        const firstKey = pagedCacheRef.current.keys().next().value;
        pagedCacheRef.current.delete(firstKey);
      }

      pagedCacheRef.current.set(key, data);
      setPagedPharmacyMedicines(data);
      return data;
    } catch (err) {
      if (
        err?.name === "CanceledError" ||
        err?.code === "ERR_CANCELED" ||
        signal.aborted
      )
        return null;

      setError(parseError(err));
      setPagedPharmacyMedicines({
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 16,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      return null;
    } finally {
      if (!signal.aborted) setMedicinesLoading(false);
    }
  }, []);

  const clearPharmacyMedicinesCache = useCallback(() => {
    pagedCacheRef.current.clear();
  }, []);

  // ─────────────────────────────────────────
  // Other fetchers
  // ─────────────────────────────────────────
  const fetchPharmacies = useCallback(
    async (cartItems, addressId, topK = 5, maxShortageRange = null) => {
      startLoading();
      try {
        const dtoItems = cartItems.map((item) => ({
          medicineId: item.id,
          quantity: item.quantity,
          pharmacyId: item.pharmacyId ?? null,
        }));
        const res = await getTopPharmacies(
          dtoItems,
          addressId,
          topK,
          maxShortageRange,
        );
        setPharmacies(res.data);
      } catch (err) {
        setError(parseError(err));
        setPharmacies([]);
      } finally {
        stopLoading();
      }
    },
    [],
  );

  const fetchAllPharmacies = useCallback(async () => {
    startLoading();
    try {
      const res = await getAllPharmacies();
      setPharmacies(res.data);
    } catch (err) {
      setError(parseError(err));
      setPharmacies([]);
    } finally {
      stopLoading();
    }
  }, []);

  const fetchNearestPharmacies = useCallback(
    async (userLat, userLon, mode = "car", topK = 5) => {
      startLoading();
      try {
        const res = await getNearestPharmacies(userLat, userLon, mode, topK);
        setPharmacies(res.data);
      } catch (err) {
        setError(parseError(err));
        setPharmacies([]);
      } finally {
        stopLoading();
      }
    },
    [],
  );

  const fetchPharmacyMedicines = useCallback(async () => {
    startLoading();
    try {
      const res = await getPharmacyMedicines();
      setMedicines(res.data);
    } catch (err) {
      setError(parseError(err));
      setMedicines([]);
    } finally {
      stopLoading();
    }
  }, []);

  const fetchMedicineStock = useCallback(async (medicineId) => {
    startLoading();
    setStockNotFound(false);
    try {
      const res = await getMedicineStockInPharmacy(medicineId);
      setStock(res.data);
    } catch (err) {
      if (err?.response?.status === 404) {
        setStockNotFound(true);
        setStock(null);
      } else {
        setError(parseError(err));
      }
    } finally {
      stopLoading();
    }
  }, []);

  return {
    pharmacies,
    medicines,
    stock,
    loading,
    medicinesLoading,
    error,
    stockNotFound,
    fetchPharmacies,
    fetchAllPharmacies,
    fetchNearestPharmacies,
    fetchPharmacyMedicines,
    fetchMedicineStock,
    pagedPharmacyMedicines,
    fetchPagedPharmacyMedicines,
    clearPharmacyMedicinesCache,
  };
};
