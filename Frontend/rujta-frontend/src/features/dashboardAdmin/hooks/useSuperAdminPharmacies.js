import { useCallback, useState } from "react";
import apiClient from "../../../shared/api/apiClient";

export default function useSuperAdminPharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- GET ALL (مدموجة) ---------------- */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pharmRes, subRes] = await Promise.all([
        apiClient.get("/super-admin/Get_pharmacies"),
        apiClient.get("/admin/subscription/all"),
      ]);

      const subMap = {};
      subRes.data.forEach((s) => {
        subMap[s.pharmacyId] = s;
      });

      const merged = pharmRes.data.map((p) => {
        const sub = subMap[p.id] || {};
        return {
          id: p.id,
          raw: p,
          name: p.name,
          phone: p.contactNumber,
          location: p.location,
          status: p.isActive ? "Active" : "Inactive",
          isActive: p.isActive,
          totalOrders: p.totalOrders,
          logo: null,
          isMain: false,
          subscriptionStatus: sub.subscriptionStatus ?? null,
          plan: sub.plan ?? null,
          daysRemaining: sub.daysRemaining ?? null,
          startDate: sub.startDate ?? null,
          endDate: sub.endDate ?? null,
        };
      });

      setPharmacies(merged);
    } catch (err) {
      console.log("❌ FETCH ERROR:", err);
      setError(err.message || "Failed to fetch pharmacies");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- GET BY ID ---------------- */
  const fetchById = async (id) => {
    try {
      const res = await apiClient.get(`/super-admin/Get_Pharmacy_By_Id/${id}`);
      return res.data;
    } catch (err) {
      console.log("❌ FETCH BY ID ERROR:", err);
      throw err;
    }
  };

  /* ---------------- CREATE ---------------- */
  const create = async (data) => {
    try {
      const res = await apiClient.post("/super-admin/pharmacies", data);
      return res.data;
    } catch (err) {
      console.log("🔥 CREATE ERROR full:", err);
      console.log("🔥 CREATE ERROR response:", err?.response);
      console.log("🔥 CREATE ERROR response data:", err?.response?.data);
      console.log("🔥 CREATE ERROR status:", err?.response?.status);

      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.response?.data ||
        err?.message ||
        "Error creating pharmacy";

      throw new Error(
        typeof serverMessage === "string"
          ? serverMessage
          : JSON.stringify(serverMessage)
      );
    }
  };

  /* ---------------- UPDATE ---------------- */
  const update = async (id, data) => {
    try {
      const res = await apiClient.put(`/super-admin/Update_Pharmacy/${id}`, data);
      return res.data;
    } catch (err) {
      console.log("❌ UPDATE ERROR:", err);
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.response?.data ||
        err?.message ||
        "Error updating pharmacy";
      throw new Error(
        typeof serverMessage === "string"
          ? serverMessage
          : JSON.stringify(serverMessage)
      );
    }
  };

  /* ---------------- RESET PASSWORD ---------------- */
  const resetPassword = async (id) => {
    try {
      const res = await apiClient.post(`/super-admin/pharmacies/${id}/reset-password`);
      return res.data;
    } catch (err) {
      console.log("❌ RESET PASSWORD ERROR:", err);
      throw err;
    }
  };

  /* ---------------- ACTIVATE ---------------- */
  const activate = async (pharmacyId) => {
    try {
      const res = await apiClient.post(`/admin/subscription/activate/${pharmacyId}`);
      return res.data;
    } catch (err) {
      console.log("❌ ACTIVATE ERROR:", err);
      throw err;
    }
  };

  /* ---------------- DEACTIVATE ---------------- */
  const deactivate = async (pharmacyId) => {
    try {
      const res = await apiClient.post(`/admin/subscription/deactivate/${pharmacyId}`);
      return res.data;
    } catch (err) {
      console.log("❌ DEACTIVATE ERROR:", err);
      throw err;
    }
  };

  /* ---------------- GET TOTAL ORDERS ---------------- */
  const fetchTotalOrders = async (id) => {
    try {
      const res = await apiClient.get(`/super-admin/pharmacies/${id}/total-orders`);
      return res.data;
    } catch (err) {
      console.log("❌ TOTAL ORDERS ERROR:", err);
      throw err;
    }
  };

  /* ---------------- TOP PHARMACIES ---------------- */
  const fetchTopPharmacies = async (count = 5) => {
    try {
      const res = await apiClient.get(`/super-admin/top-pharmacies?count=${count}`);
      return res.data;
    } catch (err) {
      console.log("❌ TOP PHARMACIES ERROR:", err);
      throw err;
    }
  };

  return {
    pharmacies,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    resetPassword,
    activate,
    deactivate,
    fetchTotalOrders,
    fetchTopPharmacies,
  };
}