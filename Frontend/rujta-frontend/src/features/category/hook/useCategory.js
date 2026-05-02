// src/features/category/hook/useCategory.js
import { useState, useCallback } from "react";
import {
  getAllCategories,
  getCategoryById,
  getPharmacyCategories,
  getCategoriesByPharmacy, 
  addCategory,
  updateCategory,
  deleteCategory,
} from "../api/category";

const extractErrorMessage = (err) => {
  if (!err) return "An unknown error occurred";
  if (err?.response?.data?.Message) return err.response.data.Message;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data && typeof err.response.data === "string")
    return err.response.data;
  if (err?.response?.status) {
    const s = err.response.status;
    if (s === 401) return "Unauthorized: Please log in again";
    if (s === 403) return "Forbidden: You don't have permission";
    if (s === 404) return "Category not found";
    if (s === 400) return "Invalid category data";
    if (s === 500) return "Server error: Please contact support";
    return `Request failed with status ${s}`;
  }
  if (err?.message) return err.message;
  return "Failed to load categories";
};

const mapCategory = (category = {}) => ({
  id:   category.id   ?? category.Id   ?? "-",
  name: category.name ?? category.Name ?? "Unnamed Category",
  raw:  category,
});

export default function useCategory() {
  const [categories, setCategories]                 = useState([]);
  const [pharmacyCategories, setPharmacyCategories] = useState([]);
  const [loading, setLoading]                       = useState(false);
  const [error, setError]                           = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getAllCategories();
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setCategories(list.map(mapCategory));
      setError(null);
    } catch (err) {
      console.error("❌ fetchAll categories error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);


  const fetchPharmacyCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getPharmacyCategories();
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setPharmacyCategories(list.map(mapCategory));
      setError(null);
    } catch (err) {
      if (err?.response?.status === 404) {
        setPharmacyCategories([]);
        setError(null);
      } else {
        console.error("❌ fetchPharmacyCategories error:", err);
        setError(extractErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoriesByPharmacy = useCallback(async (pharmacyId) => {
    if (!pharmacyId) return;
    setLoading(true);
    try {
      const res  = await getCategoriesByPharmacy(pharmacyId);
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setPharmacyCategories(list.map(mapCategory));
      setError(null);
    } catch (err) {
      if (err?.response?.status === 404) {
        setPharmacyCategories([]);
        setError(null);
      } else {
        console.error("❌ fetchCategoriesByPharmacy error:", err);
        setError(extractErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = async (id) => {
    setLoading(true);
    try {
      const res = await getCategoryById(id);
      return mapCategory(res?.data ?? res);
    } catch (err) {
      console.error("❌ fetchById category error:", err);
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = async (data) => {
    setLoading(true);
    try {
      const res = await addCategory(data);
      await fetchAll();
      return mapCategory(res?.data ?? res);
    } catch (err) {
      console.error("❌ create category error:", err);
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    setLoading(true);
    try {
      await updateCategory(id, data);
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, name: data.name ?? data.Name ?? c.name, raw: data }
            : c
        )
      );
      setError(null);
    } catch (err) {
      console.error("❌ update category error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setError(null);
    } catch (err) {
      console.error("❌ remove category error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    pharmacyCategories,
    loading,
    error,
    fetchAll,
    fetchPharmacyCategories,
    fetchCategoriesByPharmacy, 
    fetchById,
    create,
    update,
    remove,
  };
}