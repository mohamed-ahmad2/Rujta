// src/features/inventory item/hook/useInventoryItem.js
import { useState, useCallback } from "react";
import {
  getInventoryItemById,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryProducts,
} from "../api/inventoryItem";

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

// ✅ Helper لاستخراج رسالة الخطأ الحقيقية من أي نوع من الـ errors
const extractErrorMessage = (err) => {
  if (!err) return "An unknown error occurred";

  // Axios error with backend message
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data) {
    if (typeof err.response.data === "string") return err.response.data;
  }

  // Axios status-based error
  if (err?.response?.status) {
    const status = err.response.status;
    if (status === 401) return "Unauthorized: Please log in again";
    if (status === 403) return "Forbidden: You don't have permission";
    if (status === 500) return "Server error: Please contact support";
    return `Request failed with status ${status}`;
  }

  // Network or standard Error
  if (err?.message) return err.message;

  return "Failed to load inventory items";
};

export default function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapItem = (item = {}) => {
    const quantity = toNumber(item.quantity);
    const price = toNumber(item.price);
    const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;

    // ✅ Fix: استخدام التاريخ الحالي بدل التاريخ الـ hardcoded
    const today = new Date();
    const expired = expiryDate && expiryDate < today;

    let status;
    if (expired) {
      status = "Out of stock";
    } else {
      status =
        quantity === 0
          ? "Out of stock"
          : quantity < 10
            ? "Low stock"
            : "In stock";
    }

    return {
      id: `#${item.id ?? "-"}`,
      name: item.medicineName || item.MedicineName || "Unknown", // ✅ handle PascalCase fallback
      qty: `${quantity} Units`,
      price: `$${price.toFixed(2)}`,
      expiry: expiryDate ? expiryDate.toLocaleDateString("en-GB") : "-",
      status,
      category: item.categoryName || item.CategoryName || "General", // ✅ handle PascalCase fallback
      expired,
      raw: item,
    };
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInventoryProducts();
      // ✅ handle both axios (res.data) and custom apiClient (res directly)
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setItems(list.map(mapItem));
      setError(null);
    } catch (err) {
      console.error("❌ fetchAll inventory error:", err); // ✅ للـ debugging
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = async (id) => {
    setLoading(true);
    try {
      const res = await getInventoryItemById(id);
      return mapItem(res?.data ?? res);
    } catch (err) {
      console.error("❌ fetchById error:", err);
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = async (data) => {
    setLoading(true);
    try {
      const res = await addInventoryItem(data);
      await fetchAll();
      return mapItem(res?.data ?? res);
    } catch (err) {
      console.error("❌ create error:", err);
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    setLoading(true);
    try {
      await updateInventoryItem(id, data);
      await fetchAll();
    } catch (err) {
      console.error("❌ update error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      await deleteInventoryItem(id);
      await fetchAll();
    } catch (err) {
      console.error("❌ remove error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
  };
}
