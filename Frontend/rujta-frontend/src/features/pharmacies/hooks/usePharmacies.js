// src/features/pharmacies/hooks/usePharmacies.js
import { useState, useCallback } from "react";
import {
  getTopPharmacies,
  getAllPharmacies,
  getNearestPharmacies,
  getPharmacyMedicines,
  getMedicineStockInPharmacy,
} from "../api/pharmaciesApi";

//Error Parser 
const parseError = (err) => {
  if (err?.response?.status === 401)
    return "Unauthorized. Please log in first.";

  if (err?.response?.status === 404)
    return err?.response?.data?.message ?? "Resource not found.";

  if (err?.response?.status === 400) {
    const errors = err?.response?.data?.errors;
    if (errors) {
      return Object.values(errors).flat().join(" ");
    }
    return err?.response?.data?.message ?? "Invalid request.";
  }

  if (err?.response?.status >= 500)
    return "Server error. Please try again later.";

  if (!err?.response)
    return "Network error. Please check your connection.";

  return (
    err?.response?.data?.message ??
    err?.message ??
    "An unexpected error occurred."
  );
};


export const usePharmacies = () => {
  const [pharmacies,     setPharmacies]     = useState([]);
  const [medicines,      setMedicines]      = useState([]);
  const [stock,          setStock]          = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [stockNotFound,  setStockNotFound]  = useState(false); 

  const startLoading = () => {
    setLoading(true);
    setError(null);
  };

  const stopLoading = () => setLoading(false);

  // Top K Pharmacies (Priority)
  const fetchPharmacies = useCallback(async (
    cartItems,
    addressId,
    topK = 5,
    maxShortageRange = null
  ) => {
    startLoading();
    try {
      const dtoItems = cartItems.map((item) => ({
        medicineId: item.id,
        quantity:   item.quantity,
        pharmacyId: item.pharmacyId ?? null,
      }));

      const res = await getTopPharmacies(dtoItems, addressId, topK, maxShortageRange);
      setPharmacies(res.data);
    } catch (err) {
      setError(parseError(err));
      setPharmacies([]);
    } finally {
      stopLoading();
    }
  }, []);

  //All Pharmacies 
  const fetchAllPharmacies = useCallback(async () => {
    startLoading();
    try {
      const res = await getAllPharmacies();
      setPharmacies(res.data);
    } catch (err) {
      setError(parseError(err)); 
      setPharmacies([]);
    } finally {
      stopLoading();
    }
  }, []);


  const fetchNearestPharmacies = useCallback(async (
    userLat,
    userLon,
    mode = "car",
    topK = 5
  ) => {
    startLoading();
    try {
      const res = await getNearestPharmacies(userLat, userLon, mode, topK);
      setPharmacies(res.data);
    } catch (err) {
      setError(parseError(err));
      setPharmacies([]);
    } finally {
      stopLoading();
    }
  }, []);

  const fetchPharmacyMedicines = useCallback(async (pharmacyId) => {
    startLoading();
    try {
      const res = await getPharmacyMedicines(pharmacyId);
      setMedicines(res.data);
    } catch (err) {
      setError(parseError(err)); 
      setMedicines([]);
    } finally {
      stopLoading(); 
    }
  }, []);

  // ─── Medicine Stock ───────────────────────────────────────────────────────────
  const fetchMedicineStock = useCallback(async (pharmacyId, medicineId) => {
    startLoading();
    setStockNotFound(false);
    try {
      const res = await getMedicineStockInPharmacy(pharmacyId, medicineId);
      setStock(res.data.stock); 
    } catch (err) {
      if (err?.response?.status === 404) {
        setStockNotFound(true); 
        setStock(null);
      } else {
        setError(parseError(err)); 
      }
    } finally {
      stopLoading(); 
    }
  }, []);

  return {
    pharmacies,
    medicines,
    stock,
    loading,
    error,
    stockNotFound,         
    fetchPharmacies,
    fetchAllPharmacies,
    fetchNearestPharmacies,   
    fetchPharmacyMedicines,
    fetchMedicineStock,
  };
};