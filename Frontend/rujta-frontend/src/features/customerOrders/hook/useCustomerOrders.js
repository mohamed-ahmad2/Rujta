import { useEffect, useState } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  checkCustomerByPhone,
} from "../api/customerOrdersApi";

export const useCustomers = (pharmacyId) => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    returningCustomers: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error("Fetch customers error:", err.response?.data || err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getCustomerStats();
      setStats(res.data);
    } catch (err) {
      console.error("Fetch stats error:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  const refetch = async () => {
    await Promise.all([fetchCustomers(), fetchStats()]);
  };

  const addCustomer = async (data) => {
    const res = await createCustomer(data);
    const newCustomer = res.data;

    setCustomers((prev) => [...prev, newCustomer]);
    setStats((prev) => ({
      ...prev,
      totalCustomers: prev.totalCustomers + 1,
      newCustomers: prev.newCustomers + 1,
    }));

    return newCustomer;
  };

  const editCustomer = async (id, data) => {
    const payload = {
      Name: data.Name || data.name || "",
      PhoneNumber: data.PhoneNumber || data.phoneNumber || "",
      Email: data.Email || data.email || "",
      PharmacyId: pharmacyId,
    };
    if (id) payload.Id = id;

    const res = await updateCustomer(id, payload);
    const updatedCustomer = res.data;

    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedCustomer } : c)),
    );

    return updatedCustomer;
  };

  const removeCustomer = async (id) => {
    await deleteCustomer(id);

    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setStats((prev) => ({
      ...prev,
      totalCustomers: prev.totalCustomers - 1,
    }));
  };

  const searchByPhone = async (phone) => checkCustomerByPhone(phone);

  return {
    customers,
    stats,
    loading,
    refetch,
    addCustomer,
    editCustomer,
    removeCustomer,
    searchByPhone,
  };
};
