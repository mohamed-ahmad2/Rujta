// src/features/discounts/hook/useDiscounts.js
import { useState, useCallback } from "react";
import {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  deactivateDiscount,
  deleteDiscount,
} from "../api/discountsApi";

export const DiscountType = {
  0: "Percentage",
  1: "Fixed",
  Percentage: 0,
  Fixed: 1,
};

export const DiscountScope = {
  0: "Medicine",
  1: "Category",
  2: "Company",
  Medicine: 0,
  Category: 1,
  Company: 2,
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const extractErrorMessage = (err) => {
  if (!err) return "An unknown error occurred";

  const data = err?.response?.data;

  if (data?.message) return data.message;

  if (data?.detail) return data.detail;

  if (data?.title && typeof data.title === "string" && data.title.length < 200)
    return data.title;

  if (data?.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat().filter(Boolean);
    if (messages.length > 0) return messages.join(" • ");
  }

  if (typeof data === "string" && data.trim().length > 0) return data;

  if (err?.response?.status) {
    const status = err.response.status;
    if (status === 400)
      return "Invalid discount data. Please check your input.";
    if (status === 401) return "Unauthorized: Please log in again";
    if (status === 403) return "Forbidden: You don't have permission";
    if (status === 404) return "Discount not found";
    if (status === 409)
      return "Conflict: An active discount already exists for this target.";
    if (status === 422) return "Validation failed. Please review your inputs.";
    if (status === 500) return "Server error: Please contact support";
    return `Request failed with status ${status}`;
  }

  if (err?.message) return err.message;

  return "Failed to process discount";
};

const mapDiscount = (discount = {}) => {
  const value = toNumber(discount.value ?? discount.Value);
  const typeRaw = discount.type ?? discount.Type ?? 0;
  const scopeRaw = discount.scope ?? discount.Scope ?? 0;
  const isActive = discount.isActive ?? discount.IsActive ?? false;

  const startDate = discount.startDate ? new Date(discount.startDate) : null;
  const endDate = discount.endDate ? new Date(discount.endDate) : null;
  const today = new Date();

  const isExpired = endDate ? endDate < today : false;

  let status;
  if (!isActive) status = "Inactive";
  else if (isExpired) status = "Expired";
  else if (startDate && startDate > today) status = "Upcoming";
  else status = "Active";

  const typeLabel = DiscountType[typeRaw] ?? "Unknown";
  const scopeLabel = DiscountScope[scopeRaw] ?? "Unknown";

  return {
    id: discount.id ?? discount.Id ?? "-",
    displayId: `#${discount.id ?? discount.Id ?? "-"}`,
    pharmacyId: discount.pharmacyId ?? discount.PharmacyId ?? null,
    medicineId: discount.medicineId ?? discount.MedicineId ?? null,
    categoryId: discount.categoryId ?? discount.CategoryId ?? null,
    companyId: discount.companyId ?? discount.CompanyId ?? null,

    name: discount.name ?? discount.Name ?? "Unnamed Discount",
    value,
    displayValue:
      typeRaw === DiscountType.Percentage
        ? `${value.toFixed(0)}%`
        : `
$${value.toFixed(2)}`,

    type: typeRaw,
    typeLabel,
    scope: scopeRaw,
    scopeLabel,

    startDate: startDate ? startDate.toLocaleString("en-GB") : "-",
    endDate: endDate ? endDate.toLocaleString("en-GB") : "-",
    startDateRaw: startDate,
    endDateRaw: endDate,

    isActive,
    isExpired,
    status,

    raw: discount,
  };
};

export default function useDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllDiscounts();
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setDiscounts(list.map(mapDiscount));
      setError(null);
    } catch (err) {
      console.error("❌ fetchAll discounts error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = async (id) => {
    setLoading(true);
    try {
      const res = await getDiscountById(id);
      return mapDiscount(res?.data ?? res);
    } catch (err) {
      console.error("❌ fetchById discount error:", err);
      setError(extractErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = async (data) => {
    setLoading(true);
    try {
      const res = await createDiscount(data);
      await fetchAll();
      setError(null);
      return { ok: true, data: mapDiscount(res?.data ?? res) };
    } catch (err) {
      console.error("❌ create discount error:", err);
      const message = extractErrorMessage(err);
      setError(message);
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const deactivate = async (id) => {
    setLoading(true);
    try {
      await deactivateDiscount(id);
      setDiscounts((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, isActive: false, status: "Inactive" } : d,
        ),
      );
      setError(null);
    } catch (err) {
      console.error("❌ deactivate discount error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      await deleteDiscount(id);
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
      setError(null);
    } catch (err) {
      console.error("❌ remove discount error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    discounts,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    deactivate,
    remove,
  };
}
