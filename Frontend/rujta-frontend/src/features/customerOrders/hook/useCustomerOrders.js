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

  // Fetch all customers
  const fetchCustomers = async () => {
    if (!pharmacyId) return;
    setLoading(true);
    try {
      const res = await getCustomers(pharmacyId);
      setCustomers(res.data);
    } catch (err) {
      console.error("Fetch customers error:", err.response?.data || err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    if (!pharmacyId) return;
    try {
      const res = await getCustomerStats(pharmacyId);
      setStats(res.data);
    } catch (err) {
      console.error("Fetch stats error:", err.response?.data || err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [pharmacyId]);

  // Refetch both customers and stats
  const refetch = async () => {
    await Promise.all([fetchCustomers(), fetchStats()]);
  };

  // Add a new customer and update state dynamically
  const addCustomer = async (data) => {
    if (!pharmacyId) throw new Error("No pharmacy ID set");
    const res = await createCustomer(pharmacyId, data);
    const newCustomer = res.data;

    // Update customers list
    setCustomers((prev) => [...prev, newCustomer]);

    // Update stats dynamically
    setStats((prev) => ({
      ...prev,
      totalCustomers: prev.totalCustomers + 1,
      newCustomers: prev.newCustomers + 1,
    }));

    return newCustomer;
  };

  // Edit a customer and update state dynamically
  const editCustomer = async (id, data) => {
    const payload = {
      Name: data.Name || data.name || "",
      PhoneNumber: data.PhoneNumber || data.phoneNumber || "",
      Email: data.Email || data.email || "",
      PharmacyId: data.PharmacyId || pharmacyId,
    };
    if (id) payload.Id = id;

    const res = await updateCustomer(pharmacyId, id, payload);
    const updatedCustomer = res.data;

    // Update customer in local state
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedCustomer } : c))
    );

    return updatedCustomer;
  };

  // Delete a customer and update state dynamically
  const removeCustomer = async (id) => {
    await deleteCustomer(pharmacyId, id);

    // Remove customer from local state
    setCustomers((prev) => prev.filter((c) => c.id !== id));

    // Update stats dynamically
    setStats((prev) => ({
      ...prev,
      totalCustomers: prev.totalCustomers - 1,
    }));
  };

  // Search customer by phone
  const searchByPhone = async (phone) => checkCustomerByPhone(pharmacyId, phone);

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