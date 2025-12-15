import { useState, useCallback } from "react";
import {
  getAllOrders,
  getOrderById,
  getOrderDetails,
  getUserOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  acceptOrder,
  processOrder,
  outForDelivery,
  markAsDelivered,
  cancelOrderByUser,
  cancelOrderByPharmacy,
} from "../api/ordersApi";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [details, setDetails] = useState(null);

  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);

  // =================== Fetch All Orders (Admin) ===================
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllOrders();
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // =================== Fetch Orders for Current User ===================
  const fetchUserOrders = useCallback(async () => {
    setOrdersLoading(true);
    setError(null);
    try {
      const res = await getUserOrders();
      setOrders(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      return [];
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // =================== Fetch by ID ===================
  const fetchById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrderById(id);
      setSelectedOrder(res.data);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // =================== Fetch Order Details ===================
  const fetchDetails = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrderDetails(id);
      setDetails(res.data);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // =================== CRUD ===================
  const create = async (data, refreshFn = fetchUserOrders) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createOrder(data);
      if (refreshFn) await refreshFn();
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data, refreshFn = fetchUserOrders) => {
    setLoading(true);
    setError(null);
    try {
      await updateOrder(id, data);
      if (refreshFn) await refreshFn();
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id, refreshFn = fetchUserOrders) => {
    setLoading(true);
    setError(null);
    try {
      await deleteOrder(id);
      if (refreshFn) await refreshFn();
      else setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // =================== Status Actions ===================
  const runAction = async (actionFn, id, refreshFn = fetchUserOrders) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actionFn(id);
      if (refreshFn) await refreshFn();
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    selectedOrder,
    details,
    loading,
    ordersLoading,
    error,

    fetchAll,
    fetchById,
    fetchDetails,
    fetchUserOrders,

    create,
    update,
    remove,

    accept: (id, refreshFn) => runAction(acceptOrder, id, refreshFn),
    process: (id, refreshFn) => runAction(processOrder, id, refreshFn),
    outForDelivery: (id, refreshFn) => runAction(outForDelivery, id, refreshFn),
    deliver: (id, refreshFn) => runAction(markAsDelivered, id, refreshFn),
    cancelByUser: (id, refreshFn) => runAction(cancelOrderByUser, id, refreshFn),
    cancelByPharmacy: (id, refreshFn) => runAction(cancelOrderByPharmacy, id, refreshFn),
  };
};
