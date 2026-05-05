// src/features/inventory item/hook/useInventoryItem.js
import { useState, useCallback } from "react";
import {
  getAllInventoryItems,
  getInventoryItemById,
  getInventoryProducts,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../api/inventoryItem";

export const ProductStatus = {
  0: "In stock",
  1: "Low stock",
  2: "Out of stock",
  3: "Expired",
  InStock:     0,
  LowStock:    1,
  OutOfStock:  2,
  Expired:     3,
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const extractErrorMessage = (err) => {
  if (!err) return "An unknown error occurred";

  if (err?.response?.data?.message) return err.response.data.message;

  if (err?.response?.data) {
    if (typeof err.response.data === "string") return err.response.data;
  }

  if (err?.response?.status) {
    const status = err.response.status;
    if (status === 400) return "Invalid inventory item data";
    if (status === 401) return "Unauthorized: Please log in again";
    if (status === 403) return "Forbidden: You don't have permission";
    if (status === 404) return "Inventory item not found";
    if (status === 500) return "Server error: Please contact support";
    return `Request failed with status ${status}`;
  }

  if (err?.message) return err.message;

  return "Failed to load inventory items";
};

const mapItem = (item = {}) => {
  const quantity        = toNumber(item.quantity        ?? item.Quantity);
  const price           = toNumber(item.price           ?? item.Price);
  const discountedPrice = toNumber(item.discountedPrice ?? item.DiscountedPrice);
  const discountValue   = toNumber(item.discountValue   ?? item.DiscountValue);
  const hasDiscount     = item.hasDiscount              ?? item.HasDiscount ?? false;

  const expiryDate = item.expiryDate
    ? new Date(item.expiryDate)
    : item.ExpiryDate
      ? new Date(item.ExpiryDate)
      : null;

  const today   = new Date();
  const expired = expiryDate ? expiryDate < today : false;

  const statusRaw   = item.status ?? item.Status ?? ProductStatus.InStock;
  const statusLabel = expired
    ? "Expired"
    : ProductStatus[statusRaw] ?? "Unknown";

  return {
    id:             item.id             ?? item.Id             ?? "-",
    displayId:      `#${item.id         ?? item.Id             ?? "-"}`,
    pharmacyId:     item.pharmacyID     ?? item.PharmacyID     ?? null,
    medicineId:     item.medicineID     ?? item.MedicineID     ?? null,
    prescriptionId: item.prescriptionID ?? item.PrescriptionID ?? null,
    categoryId:     item.categoryId     ?? item.CategoryId     ?? null,

    name:        item.medicineName ?? item.MedicineName ?? "Unknown",
    category:    item.categoryName ?? item.CategoryName ?? "General",
    qty:         quantity,
    displayQty:  `${quantity} Units`,


    price,
    displayPrice:         `
$${price.toFixed(2)}`,
    discountedPrice,
    displayDiscountedPrice: `
$${discountedPrice.toFixed(2)}`,
    discountValue,
    hasDiscount,
    effectivePrice:        hasDiscount ? discountedPrice : price,
    displayEffectivePrice: hasDiscount
      ? `
$${discountedPrice.toFixed(2)}`
      : `
$${price.toFixed(2)}`,

    expiryDate:    expiryDate ? expiryDate.toLocaleDateString("en-GB") : "-",
    expiryDateRaw: expiryDate,

    statusRaw,
    status: statusLabel,
    expired,

    raw: item,
  };
};


export default function useInventory() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getInventoryProducts();
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setItems(list.map(mapItem));
      setError(null);
    } catch (err) {
      console.error("❌ fetchAll inventory error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllItems = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await getAllInventoryItems();
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setItems(list.map(mapItem));
      setError(null);
    } catch (err) {
      console.error("❌ fetchAllItems inventory error:", err);
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
      console.error("❌ fetchById inventory error:", err);
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
      console.error("❌ create inventory error:", err);
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
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...mapItem({ ...item.raw, ...data }), id }
            : item
        )
      );
      setError(null);
    } catch (err) {
      console.error("❌ update inventory error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      await deleteInventoryItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setError(null);
    } catch (err) {
      console.error("❌ remove inventory error:", err);
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
    fetchAllItems,  
    fetchById,
    create,
    update,
    remove,
  };
}