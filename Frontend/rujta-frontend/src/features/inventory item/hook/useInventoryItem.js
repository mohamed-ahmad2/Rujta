// src/features/inventory item/hook/useInventoryItem.js
import { useState, useCallback, useRef } from "react";
import {
  getInventoryItemById,
  getInventoryProducts,
  getPagedInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../api/inventoryItem";

const extractErrorMessage = (err) => {
  if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return null;

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

const mapStatus = (rawStatus, expired) => {
  if (expired) return "Expired";
  const s = String(rawStatus ?? "").toLowerCase();
  if (s === "instock" || s === "0") return "In stock";
  if (s === "lowstock" || s === "1") return "Low stock";
  if (s === "outofstock" || s === "2") return "Out of stock";
  if (s === "expired" || s === "3") return "Expired";
  return "Unknown";
};

const formatExpiry = (raw) => {
  if (!raw) return "—";
  const d = new Date(raw);
  return isNaN(d) ? "—" : d.toISOString().slice(0, 10);
};

const mapItem = (item = {}) => {
  const quantity = toNumber(item.quantity ?? item.Quantity);
  const price = toNumber(item.price ?? item.Price);
  const discountedPrice = toNumber(
    item.discountedPrice ?? item.DiscountedPrice,
  );
  const hasDiscount = item.hasDiscount ?? item.HasDiscount ?? false;

  const expiryRaw = item.expiryDate ?? item.ExpiryDate ?? item.expiry ?? null;
  const expiryObj = expiryRaw ? new Date(expiryRaw) : null;
  const expired = expiryObj ? expiryObj < new Date() : false;

  return {
    id: item.id ?? item.Id,
    name: item.medicineName ?? item.MedicineName,
    category: item.categoryName ?? item.CategoryName,

    // ✅ Company Name (مهم جداً)
    companyId: item.companyId ?? item.CompanyId,
    companyName: item.companyName ?? item.CompanyName,

    qty: quantity,
    price,
    discountedPrice,
    effectivePrice: hasDiscount ? discountedPrice : price,
    expiry: formatExpiry(expiryRaw),
    status: mapStatus(item.status ?? item.Status, expired),
    expired,
    pharmacyId: item.pharmacyID ?? item.PharmacyID,
    raw: item,
  };
};

export default function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInventoryProducts();
      setItems((res?.data ?? []).map(mapItem));
      setError(null);
    } catch (err) {
      const msg = extractErrorMessage(err);
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPaged = useCallback(async (filter = {}) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await getPagedInventoryItems(filter, controller.signal);
      if (controller.signal.aborted) return null;

      const data = res?.data?.items ?? [];
      setItems(data.map(mapItem));
      return res?.data;
    } catch (err) {
      if (controller.signal.aborted) return null;
      const msg = extractErrorMessage(err);
      if (msg) setError(msg);
      return null;
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  const fetchById = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await getInventoryItemById(id);
      return mapItem(res?.data);
    } catch (err) {
      const msg = extractErrorMessage(err);
      if (msg) setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data) => {
    setLoading(true);
    try {
      await addInventoryItem(data);
      return true;
    } catch (err) {
      const msg = extractErrorMessage(err);
      if (msg) setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id, data) => {
    setLoading(true);
    try {
      await updateInventoryItem(id, data);
      return true;
    } catch (err) {
      const msg = extractErrorMessage(err);
      if (msg) setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    setLoading(true);
    try {
      await deleteInventoryItem(id);
      return true;
    } catch (err) {
      const msg = extractErrorMessage(err);
      if (msg) setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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
