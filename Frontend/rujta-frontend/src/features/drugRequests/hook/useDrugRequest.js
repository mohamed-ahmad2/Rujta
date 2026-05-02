import { useState, useCallback } from "react";
import {
  getMyDrugRequests,
  getAllDrugRequests,
  submitDrugRequest,
  reviewDrugRequest,
} from "../api/drugRequestApi";

// ✅ Same error extractor as useInventory
const extractErrorMessage = (err) => {
  if (!err) return "An unknown error occurred";
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data) {
    if (typeof err.response.data === "string") return err.response.data;
  }
  if (err?.response?.status) {
    const status = err.response.status;
    if (status === 401) return "Unauthorized: Please log in again";
    if (status === 403) return "Forbidden: You don't have permission";
    if (status === 500) return "Server error: Please contact support";
    return `Request failed with status ${status}`;
  }
  if (err?.message) return err.message;
  return "Failed to load drug requests";
};

// ✅ Same mapItem pattern as useInventory
const mapRequest = (r = {}) => ({
  id:              r.id ?? "-",
  drugName:        r.drugName        || r.DrugName        || "Unknown",
  category:        r.category        || r.Category        || "General",
  manufacturer:    r.manufacturer    || r.Manufacturer    || "-",
  supplier:        r.supplier        || r.Supplier        || "-",
  price:           `$${Number(r.price  ?? 0).toFixed(2)}`,
  quantity:        `${Number(r.quantity ?? 0)} Units`,
  expiryDate:      r.expiryDate      ? new Date(r.expiryDate).toLocaleDateString("en-GB") : "-",
  status:          r.status          || r.Status          || "Pending",
  pharmacyId:      r.pharmacyId      ?? "-",
  rejectionReason: r.rejectionReason || null,
  createdAt:       r.createdAt       ? new Date(r.createdAt).toLocaleDateString("en-GB") : "-",
  reviewedAt:      r.reviewedAt      ? new Date(r.reviewedAt).toLocaleDateString("en-GB") : null,
  raw:             r,
});

export default function useDrugRequest() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  // PharmacyAdmin — fetch own requests
  const fetchMy = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyDrugRequests();
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setRequests(list.map(mapRequest));
      setError(null);
    } catch (err) {
      console.error("❌ fetchMy drugRequest error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // SuperAdmin — fetch all with optional filters
  const fetchAll = useCallback(async (status = null, pharmacyId = null) => {
    setLoading(true);
    try {
      const res = await getAllDrugRequests(status, pharmacyId);
      const data = res?.data ?? res ?? [];
      const list = Array.isArray(data) ? data : [];
      setRequests(list.map(mapRequest));
      setError(null);
    } catch (err) {
      console.error("❌ fetchAll drugRequest error:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // PharmacyAdmin — submit new request
  const submit = async (data) => {
    setLoading(true);
    try {
      const res = await submitDrugRequest(data);
      setError(null);
      return mapRequest(res?.data ?? res);
    } catch (err) {
      console.error("❌ submit drugRequest error:", err);
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // SuperAdmin — approve or reject
  const review = async (id, approved, rejectionReason = null) => {
    setLoading(true);
    try {
      const payload = { approved, ...(rejectionReason && { rejectionReason }) };
      const res = await reviewDrugRequest(id, payload);
      setError(null);
      return mapRequest(res?.data ?? res);
    } catch (err) {
      console.error("❌ review drugRequest error:", err);
      setError(extractErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    requests,
    loading,
    error,
    fetchMy,
    fetchAll,
    submit,
    review,
  };
}