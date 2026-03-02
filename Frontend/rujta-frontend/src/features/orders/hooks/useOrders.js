import { useState, useCallback } from "react";
import {
  getAllOrders,
  getOrderById,
  getOrderDetails,
  getUserOrders,
  getPharmacyOrders,
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
  const [error, setError] = useState(null);

  /* ================= FETCH ================= */

  const fetchOrders = async (fetchFn) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setOrders(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchSingle = async (fetchFn, id, setStateFn) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn(id);
      setStateFn(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = useCallback(() => fetchOrders(getAllOrders), []);
  const fetchUser = useCallback(() => fetchOrders(getUserOrders), []);
  const fetchPharmacy = useCallback(() => fetchOrders(getPharmacyOrders), []);
  const fetchById = useCallback((id) => fetchSingle(getOrderById, id, setSelectedOrder), []);
  const fetchDetailsById = useCallback((id) => fetchSingle(getOrderDetails, id, setDetails), []);

  /* ================= MUTATIONS ================= */

  const runMutation = async (fn, data = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = data ? await fn(data) : await fn();
      return res?.data || null;
    } catch (err) {
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* ================= RETURN ================= */

  return {
    orders,
    selectedOrder,
    details,
    loading,
    error,

    fetchAll,
    fetchUser,
    fetchPharmacy,
    fetchById,
    fetchDetailsById,

    create: (data) => runMutation(createOrder, data),
    update: (id, data) => runMutation(() => updateOrder(id, data)),
    remove: (id) => runMutation(() => deleteOrder(id)),

    accept: (id) => runMutation(() => acceptOrder(id)),
    process: (id) => runMutation(() => processOrder(id)),
    outForDelivery: (id) => runMutation(() => outForDelivery(id)),
    deliver: (id) => runMutation(() => markAsDelivered(id)),
    cancelByUser: (id) => runMutation(() => cancelOrderByUser(id)),
    cancelByPharmacy: (id) => runMutation(() => cancelOrderByPharmacy(id)),
  };
};