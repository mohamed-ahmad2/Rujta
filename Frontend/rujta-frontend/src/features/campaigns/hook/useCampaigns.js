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

  // create now receives durationDays + price in the payload — no changes needed here,
  // the payload is built in Ads.jsx and passed straight through to the API
  const create = async (data) => {
    try {
      setLoading(true);
      const res = await createAd(data);
      await fetchAll();
      return res.data; // ← returns created ad so caller gets the id
    } catch (err) {
      setError(err.message || "Failed to create ad");
      throw err; // re-throw so Ads.jsx can catch and show error
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
