import { useState, useCallback } from "react";
import {
  getAllAddresses,
  getAddressById,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../api/address";

export default function useAddress() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAddresses();
      setAddresses(res.data || []);
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserAddresses();
      setAddresses(res.data || []);
      setError(null);
    } catch (err) {
      setError(err?.message || "Failed to load user addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = async (id) => {
    setLoading(true);
    try {
      const res = await getAddressById(id);
      return res.data;
    } catch (err) {
      setError(err?.message || "Failed to fetch address");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = async (data) => {
    setLoading(true);
    try {
      const res = await addAddress(data);
      await fetchUserAddresses();
      return res.data;
    } catch (err) {
      setError(err?.message || "Failed to add address");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    setLoading(true);
    try {
      await updateAddress(id, data);
      await fetchUserAddresses();
    } catch (err) {
      setError(err?.message || "Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      await deleteAddress(id);
      await fetchUserAddresses();
    } catch (err) {
      setError(err?.message || "Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  return {
    addresses,
    loading,
    error,
    fetchAll,
    fetchUserAddresses,
    fetchById,
    create,
    update,
    remove,
  };
}
