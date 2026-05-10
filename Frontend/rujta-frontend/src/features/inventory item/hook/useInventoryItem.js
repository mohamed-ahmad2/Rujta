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
  const res = err?.response;
  if (res?.data?.message) return res.data.message;
  if (typeof res?.data === "string") return res.data;
  switch (res?.status) {
    case 400: return "Invalid request data";
    case 401: return "Unauthorized";
    case 403: return "Forbidden";
    case 404: return "Not found";
    case 500: return "Server error";
    default:  return err?.message || "Unexpected error";
  }
};

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const mapStatus = (rawStatus, expired) => {
  if (expired) return "Expired";
  const s =
    rawStatus !== undefined && rawStatus !== null
      ? String(rawStatus).toLowerCase()
      : "";
  if (s === "instock"    || s === "0") return "In stock";
  if (s === "lowstock"   || s === "1") return "Low stock";
  if (s === "outofstock" || s === "2") return "Out of stock";
  if (s === "expired"    || s === "3") return "Expired";
  return "Unknown";
};

const formatExpiry = (raw) => {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d)) return "—";
  return d.toISOString().slice(0, 10);
};

const mapItem = (item = {}) => {
  const quantity        = toNumber(item.quantity ?? item.Quantity);
  const price           = toNumber(item.price    ?? item.Price);
  const discountedPrice = toNumber(item.discountedPrice ?? item.DiscountedPrice);
  const hasDiscount     = item.hasDiscount ?? item.HasDiscount ?? false;

  const expiryRaw =
    item.expiryDate  ?? item.ExpiryDate  ??
    item.expiry_date ?? item.Expiry_Date ??
    item.expiry      ?? item.Expiry      ?? null;

  const expiryObj = expiryRaw ? new Date(expiryRaw) : null;
  const expired   = expiryObj ? expiryObj < new Date() : false;
  const statusRaw = item.status ?? item.Status;
  const status    = mapStatus(statusRaw, expired);

  return {
    id:             item.id           ?? item.Id,
    name:           item.medicineName ?? item.MedicineName,
    category:       item.categoryName ?? item.CategoryName,
    qty:            quantity,
    price,
    discountedPrice,
    effectivePrice: hasDiscount ? discountedPrice : price,
    expiry:         formatExpiry(expiryRaw),
    status,
    expired,
    pharmacyId:     item.pharmacyID   ?? item.PharmacyID,
    raw:            item,
  };
};

export default function useInventory() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Remembers the last filter so create/update/remove can refresh the same page
  const lastFilterRef = useRef(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getInventoryProducts();
      const data = res?.data ?? [];
      setItems(data.map(mapItem));
      setError(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // fetchPaged: filter is passed straight through to the API file.
  // Supports: PageNumber, PageSize, CategoryId, Status, SearchTerm
  const fetchPaged = useCallback(async (filter) => {
    setLoading(true);
    lastFilterRef.current = filter;
    try {
      const res  = await getPagedInventoryItems(filter);
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

  const fetchById = useCallback(async (id) => {
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
  }, []);

  const create = useCallback(async (data) => {
    setLoading(true);
    try {
      await addInventoryItem(data);
      setError(null);
      if (lastFilterRef.current) {
        const refreshed = await getPagedInventoryItems(lastFilterRef.current);
        setItems((refreshed?.data?.items ?? []).map(mapItem));
        return refreshed?.data;
      }
      return null;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id, data) => {
    setLoading(true);
    try {
      await updateInventoryItem(id, data);
      setError(null);
      if (lastFilterRef.current) {
        const refreshed = await getPagedInventoryItems(lastFilterRef.current);
        setItems((refreshed?.data?.items ?? []).map(mapItem));
        return refreshed?.data;
      }
      return null;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    setLoading(true);
    try {
      await deleteInventoryItem(id);
      // Optimistic removal before refresh
      setItems((prev) => prev.filter((x) => String(x.id) !== String(id)));
      setError(null);
      if (lastFilterRef.current) {
        const refreshed = await getPagedInventoryItems(lastFilterRef.current);
        setItems((refreshed?.data?.items ?? []).map(mapItem));
        return refreshed?.data;
      }
      return null;
    } catch (err) {
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items, loading, error,
    fetchAll, fetchPaged, fetchById,
    create, update, remove,
  };
}
