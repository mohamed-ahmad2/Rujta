// src/features/pharmacies/hooks/usePharmacies.js
import { useState } from "react";
import { getTopPharmacies } from "../api/pharmaciesApi";

export const usePharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPharmacies = async (cartItems) => {
    setLoading(true);
    setError(null);

    try {
      const dtoItems = cartItems.map((item) => ({
        medicineId: item.id,
        quantity: item.quantity,
      }));

   
      const payload = { items: dtoItems };

      const res = await getTopPharmacies(dtoItems); 

      setPharmacies(res.data);
    } catch (err) {
      const errorMessage =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data ||
        "An error occurred while fetching pharmacies.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { pharmacies, loading, error, fetchPharmacies };
};
