import { useState, useCallback } from "react";
import {
  getAllAds, getAdById, getActiveAds, getAdsByPharmacy,
  createAd, updateAd, deleteAd, toggleAdStatus,
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
    try {
      setLoading(true);
      const res = await createAd(data);
       console.log("✅ createAd response:", JSON.stringify(res.data, null, 2));
      const created = res.data; // ✅ grab BEFORE fetchAll
      await fetchAll();
      return created;           // ✅ return actual ad object with id
    } catch (err) {
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