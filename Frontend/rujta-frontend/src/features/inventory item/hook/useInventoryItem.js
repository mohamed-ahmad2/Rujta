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

export default function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapItem = (item = {}) => {
    const quantity = toNumber(item.quantity);
    const price = toNumber(item.price);

    return {
      id: `#${item.id ?? "-"}`,
      name: item.medicineName || "Unknown",
      qty: `${quantity} Units`,
      price: `$${price.toFixed(2)}`,
      expiry: item.expiryDate
        ? new Date(item.expiryDate).toLocaleDateString("en-GB")
        : "-",
      status:
        quantity === 0
          ? "Out of stock"
          : quantity < 20
          ? "Low stock"
          : "In stock",
      category: item.categoryName || "General",
      raw: item,
    };
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInventoryProducts();
      setItems((res.data || []).map(mapItem));
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to load inventory items");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = async (id) => {
    setLoading(true);
    try {
      const res = await getInventoryItemById(id);
      return mapItem(res.data);
    } catch (err) {
      setError(err?.message || "Failed to fetch inventory item");
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
      return mapItem(res.data);
    } catch (err) {
      setError(err?.message || "Failed to add inventory item");
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
      setError(err?.message || "Failed to update inventory item");
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
      setError(err?.message || "Failed to delete inventory item");
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
