import { useCallback, useState } from "react";
import apiClient from "../../../shared/api/apiClient";

export default function useSuperAdminPharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------------- GET ALL ---------------- */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/super-admin/Get_pharmacies");

      const mapped = res.data.map((p) => ({
        id: p.id,
        raw: p,
        name: p.name,
        phone: p.contactNumber,          // ✅ كان غلط phoneNumber → contactNumber
        location: p.location,
        email: p.adminEmail || "-",      // مش موجود في GET response، هيبقى "-"
        status: p.isActive ? "Active" : "Inactive",
        isActive: p.isActive,
        totalOrders: p.totalOrders,
        logo: null,
        isMain: false,
      }));

      setPharmacies(mapped);
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
  // الـ API بتاخد: pharmacyName, pharmacyLocation, latitude, longitude,
  //                 adminName, adminEmail, adminPhone
  const create = async (data) => {
    try {
      const res = await apiClient.post("/super-admin/pharmacies", data);
      return res.data; // { pharmacyId, adminEmail, generatedPassword }
    } catch (err) {
      console.log("🔥 CREATE ERROR:", err);
      throw err;
    }
  };

  /* ---------------- UPDATE ---------------- */
  // الـ API بتاخد: name, location, contactNumber, latitude, longitude
  const update = async (id, data) => {
    try {
      const res = await apiClient.put(`/super-admin/Update_Pharmacy/${id}`, data);
      return res.data;
    } catch (err) {
      console.log("❌ UPDATE ERROR:", err);
      throw err;
    }
  };

  /* ---------------- RESET PASSWORD ---------------- */
  const resetPassword = async (id) => {
    try {
      const res = await apiClient.post(`/super-admin/pharmacies/${id}/reset-password`);
      return res.data; // { newPassword }
    } catch (err) {
      console.log("❌ RESET PASSWORD ERROR:", err);
      throw err;
    }
  };

  /* ---------------- GET TOTAL ORDERS ---------------- */
  const fetchTotalOrders = async (id) => {
    try {
      const res = await apiClient.get(`/super-admin/pharmacies/${id}/total-orders`);
      return res.data; // { totalOrders }
    } catch (err) {
      console.log("❌ TOTAL ORDERS ERROR:", err);
      throw err;
    }
  };

  /* ---------------- TOP PHARMACIES ---------------- */
  const fetchTopPharmacies = async (count = 5) => {
    try {
      const res = await apiClient.get(`/super-admin/top-pharmacies?count=${count}`);
      return res.data; // [{ pharmacyId, name, totalOrders }]
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
    fetchTotalOrders,
    fetchTopPharmacies,
  };
}
