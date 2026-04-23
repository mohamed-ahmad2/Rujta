// src/features/campaigns/hook/useCampaigns.js
import { useState, useCallback } from "react";
import {
  getAllAds,
  getAdById,
  getActiveAds,
  getAdsByPharmacy,
  createAd,
  updateAd,
  deleteAd,
  toggleAdStatus,
} from "../api/campaignsApi";

export default function useCampaigns() {
  const [ads,     setAds]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllAds();
      setAds(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load ads");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = async (id) => {
    try {
      setLoading(true);
      const res = await getAdById(id);
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to fetch ad");
    } finally {
      setLoading(false);
    }
  };

  const fetchActive = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getActiveAds();
      setAds(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load active ads");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByPharmacy = useCallback(async (pharmacyId) => {
    try {
      setLoading(true);
      const res = await getAdsByPharmacy(pharmacyId);
      setAds(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load pharmacy ads");
    } finally {
      setLoading(false);
    }
  }, []);

  const create = async (data) => {
    console.group("🚀 [useCampaigns] create()");
    console.log("📦 Payload being sent:", data);
    console.log("📏 imageDataUrl length:", data?.imageDataUrl?.length ?? "none");
    console.log("🎨 colorFrom:", data?.colorFrom, "| colorTo:", data?.colorTo);
    console.log("💊 medicineId:", data?.medicineId, "| medicineName:", data?.medicineName);
    console.log("📝 headline:", data?.headline, "| subtext:", data?.subtext);

    try {
      setLoading(true);
      console.log("📡 Calling POST /ads ...");
      const res = await createAd(data);
      console.log("✅ POST /ads success! Response:", res);
      console.log("🆔 Created ad ID:", res?.data?.id);
      await fetchAll();
      console.groupEnd();
      return res.data;
    } catch (err) {
      console.error("❌ POST /ads FAILED");
      console.error("📛 Error message:", err.message);
      console.error("📛 HTTP status:", err?.response?.status);
      console.error("📛 Server response body:", err?.response?.data);
      console.error("📛 Full error object:", err);
      console.groupEnd();
      setError(err.message || "Failed to create ad");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    try {
      setLoading(true);
      await updateAd(id, data);
      await fetchAll();
    } catch (err) {
      setError(err.message || "Failed to update ad");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      setLoading(true);
      await deleteAd(id);
      await fetchAll();
    } catch (err) {
      setError(err.message || "Failed to delete ad");
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id, isActive) => {
    try {
      setLoading(true);
      await toggleAdStatus(id, isActive);
      await fetchAll();
    } catch (err) {
      setError(err.message || "Failed to toggle ad status");
    } finally {
      setLoading(false);
    }
  };

  return {
    ads, loading, error,
    fetchAll, fetchById, fetchActive, fetchByPharmacy,
    create, update, remove, toggle,
  };
}