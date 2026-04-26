// src/features/pharmacies/hooks/usePharmacies.js
import { useState } from "react";
import {
  getTopPharmacies,
  getAllPharmacies,
  getPharmacyMedicines,
  getMedicineStockInPharmacy,
} from "../api/pharmaciesApi";

export const usePharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [stock, setStock] = useState(null);

  const fetchPharmacies = async (
    cartItems,
    addressId,
    topK = 5,
    maxShortageRange = null,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const dtoItems = cartItems.map((item) => ({
        medicineId: item.id,
        quantity: item.quantity,
        pharmacyId: item.pharmacyId ?? null,
      }));

      const res = await getTopPharmacies(
        dtoItems,
        addressId,
        topK,
        maxShortageRange,
      );
      setPharmacies(res.data);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "An error occurred while fetching pharmacies.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPharmacies = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getAllPharmacies();
      setPharmacies(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacyMedicines = async (pharmacyId) => {
    setLoading(true);
    try {
      const res = await getPharmacyMedicines(pharmacyId);
      setMedicines(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicineStock = async (pharmacyId, medicineId) => {
    setLoading(true);
    try {
      const res = await getMedicineStockInPharmacy(pharmacyId, medicineId);
      setStock(res.data.stock);
    } finally {
      setLoading(false);
    }
  };

  return {
    pharmacies,
    medicines,
    stock,
    loading,
    error,
    fetchPharmacies,
    fetchAllPharmacies,
    fetchPharmacyMedicines,
    fetchMedicineStock,
  };
};
