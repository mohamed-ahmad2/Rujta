import { useState, useCallback } from "react";
import {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../api/category";

export default function useCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // fetch all categories
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllCategories();
      setCategories(res.data || []);
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  // fetch single category by id
  const fetchById = async (id) => {
    setLoading(true);
    try {
      const res = await getCategoryById(id);
      return res.data;
    } catch (err) {
      setError(err?.message || "Failed to fetch category");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // create new category
  const create = async (data) => {
    setLoading(true);
    try {
      const res = await addCategory(data);
      await fetchAll();
      return res.data;
    } catch (err) {
      setError(err?.message || "Failed to add category");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // update existing category
  const update = async (id, data) => {
    setLoading(true);
    try {
      await updateCategory(id, data);
      await fetchAll();
    } catch (err) {
      setError(err?.message || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  // delete category
  const remove = async (id) => {
    setLoading(true);
    try {
      await deleteCategory(id);
      await fetchAll();
    } catch (err) {
      setError(err?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
  };
}
