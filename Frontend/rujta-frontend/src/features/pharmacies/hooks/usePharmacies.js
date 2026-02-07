// src/features/pharmacies/hooks/usePharmacies.js
import { useState } from "react";
import { getTopPharmacies } from "../api/pharmaciesApi";

export const usePharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch top pharmacies for cart using selected address
   * @param {Array} cartItems - UI cart items
   * @param {number} addressId - Selected address ID
   * @param {number} topK - Number of pharmacies
   */
  const fetchPharmacies = async (cartItems, addressId, topK = 5) => {
    setLoading(true);
    setError(null);

    try {
      // Map UI items -> API DTO
      const dtoItems = cartItems.map((item) => ({
        medicineId: item.id,
        quantity: item.quantity,
      }));

      const res = await getTopPharmacies(dtoItems, addressId, topK);
// هنا اطبع الـ response كله
console.log("Full Response from API:", res);

// اطبع الـ data فقط عشان تشوف الـ DTO
console.log("Response Data (DTO):", res.data);
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

  return {
    pharmacies,
    loading,
    error,
    fetchPharmacies,
  };
};
