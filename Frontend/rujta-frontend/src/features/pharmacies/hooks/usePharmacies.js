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
    if (errors) {
      return Object.values(errors).flat().join(" ");
    }
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
  const MAX_CACHE_ENTRIES = 30;

  const startLoading = () => {
    setLoading(true);
    setError(null);
  };

  const stopLoading = () => setLoading(false);

  const buildPagedKey = (pharmacyId, params) =>
    JSON.stringify({
      ph: pharmacyId,
      p: params.pageNumber,
      s: params.pageSize,
      q: params.searchTerm || "",
      c: params.categoryId ?? "",
    });

  const fetchPagedPharmacyMedicines = useCallback(
    async (pharmacyId, params = {}) => {
      const finalParams = {
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 16,
        searchTerm: params.searchTerm,
        categoryId: params.categoryId,
      };

      const key = buildPagedKey(pharmacyId, finalParams);

      if (pagedCacheRef.current.has(key)) {
        const cached = pagedCacheRef.current.get(key);
        setPagedPharmacyMedicines(cached);
        return cached;
      }

      startLoading();
      try {
        const res = await getPagedPharmacyMedicines(pharmacyId, finalParams);
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
        stopLoading();
      }
    },
    [],
  );

  const clearPharmacyMedicinesCache = useCallback(() => {
    pagedCacheRef.current.clear();
  }, []);

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

  const fetchPharmacyMedicines = useCallback(async (pharmacyId) => {
    startLoading();
    try {
      const res = await getPharmacyMedicines(pharmacyId);
      setMedicines(res.data);
    } catch (err) {
      setError(parseError(err));
      setMedicines([]);
    } finally {
      stopLoading();
    }
  }, []);

  const fetchMedicineStock = useCallback(async (pharmacyId, medicineId) => {
    startLoading();
    setStockNotFound(false);
    try {
      const res = await getMedicineStockInPharmacy(pharmacyId, medicineId);
      setStock(res.data.stock);
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
