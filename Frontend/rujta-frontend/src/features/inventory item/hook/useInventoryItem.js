// src/features/inventory item/hook/useInventoryItem.js
import { useState, useCallback } from "react";
import {
  getAllInventoryItems,
  getInventoryItemById,
  getInventoryProducts,
  getPagedInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../api/inventoryItem";

const extractErrorMessage = (err) => {
  const res = err?.response;

  if (res?.data?.message) return res.data.message;
  if (typeof res?.data === "string") return res.data;

  switch (res?.status) {
    case 400:
      return "Invalid request data";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not found";
    case 500:
      return "Server error";
    default:
      return err?.message || "Unexpected error";
  }
};

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// ─── Map string enum → display label ────────────────────────────────────────
// Handles both string enums  ("InStock") and numeric enums (0)
const mapStatus = (rawStatus, expired) => {
  if (expired) return "Expired";

  // Normalise to lowercase string for comparison
  const s =
    rawStatus !== undefined && rawStatus !== null
      ? String(rawStatus).toLowerCase()
      : "";

  if (s === "instock" || s === "0") return "In stock";
  if (s === "lowstock" || s === "1") return "Low stock";
  if (s === "outofstock" || s === "2") return "Out of stock";
  if (s === "expired" || s === "3") return "Expired";

  return "Unknown";
};

// ─── Format a date value to a readable string ────────────────────────────────
const formatExpiry = (raw) => {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d)) return "—";
  // e.g. "2025-12-31"
  return d.toISOString().slice(0, 10);
};

const mapItem = (item = {}) => {
  const quantity = toNumber(item.quantity ?? item.Quantity);
  const price = toNumber(item.price ?? item.Price);
  const discountedPrice = toNumber(
    item.discountedPrice ?? item.DiscountedPrice,
  );
  const hasDiscount = item.hasDiscount ?? item.HasDiscount ?? false;

  // Support all common casing variants the backend might return
  const expiryRaw =
    item.expiryDate ??
    item.ExpiryDate ??
    item.expiry_date ??
    item.Expiry_Date ??
    item.expiry ??
    item.Expiry ??
    null;

  const expiryObj = expiryRaw ? new Date(expiryRaw) : null;
  const expired = expiryObj ? expiryObj < new Date() : false;

  // Support string enum ("InStock") AND numeric enum (0)
  const statusRaw = item.status ?? item.Status;
  const status = mapStatus(statusRaw, expired);

  return {
    id: item.id ?? item.Id,
    name: item.medicineName ?? item.MedicineName,
    category: item.categoryName ?? item.CategoryName,

    qty: quantity,
    price,
    discountedPrice,
    effectivePrice: hasDiscount ? discountedPrice : price,

    expiry: formatExpiry(expiryRaw), // ← now shows the date
    status, // ← now shows correct status
    expired,

    pharmacyId: item.pharmacyID ?? item.PharmacyID,

    raw: item,
  };
};

export default function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // GET ALL (simple)
  // =========================
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInventoryProducts();
      const data = res?.data ?? [];
      setItems(data.map(mapItem));
      setError(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // GET PAGED
  // =========================
  const fetchPaged = useCallback(async (filter) => {
    setLoading(true);
    try {
      const res = await getPagedInventoryItems(filter);
      const data = res?.data?.items ?? [];

      setItems(data.map(mapItem));
      setError(null);

      return res?.data;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================
  // GET BY ID
  // =========================
  const fetchById = async (id) => {
    setLoading(true);
    try {
      const res = await getInventoryItemById(id);
      return mapItem(res?.data);
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CREATE
  // =========================
  const create = async (data) => {
    setLoading(true);
    try {
      const res = await addInventoryItem(data);
      await fetchAll();
      return res?.data;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UPDATE
  // =========================
  const update = async (id, data) => {
    setLoading(true);
    try {
      await updateInventoryItem(id, data);
      await fetchAll();
      setError(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const remove = async (id) => {
    setLoading(true);
    try {
      await deleteInventoryItem(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setError(null);
    } catch (err) {
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
    fetchPaged,
    fetchById,
    create,
    update,
    remove,
  };
}
