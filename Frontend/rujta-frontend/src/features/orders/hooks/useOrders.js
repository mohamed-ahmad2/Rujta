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

import { useOrdersSignalR } from "./useOrdersSignalR";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔥 Activate SignalR real-time updates
  useOrdersSignalR(setOrders);

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

  const fetchById = useCallback(
    (id) => fetchSingle(getOrderById, id, setSelectedOrder),
    []
  );

  const fetchDetailsById = useCallback(
    (id) => fetchSingle(getOrderDetails, id, setDetails),
    []
  );

  /* ================= MUTATIONS ================= */

  const runMutation = async (fn, data = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = data ? await fn(data) : await fn();
      // ❌ No manual refresh
      // SignalR will update state automatically
      return res?.data || null;
    } catch (err) {
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const create = (data) => runMutation(createOrder, data);
  const update = (id, data) => runMutation(() => updateOrder(id, data));
  const remove = (id) => runMutation(() => deleteOrder(id));

  const accept = (id) => runMutation(() => acceptOrder(id));
  const process = (id) => runMutation(() => processOrder(id));
  const outForDeliveryMutation = (id) =>
    runMutation(() => outForDelivery(id));
  const deliver = (id) => runMutation(() => markAsDelivered(id));

  const cancelByUser = (id) =>
    runMutation(() => cancelOrderByUser(id));

  const cancelByPharmacy = (id) =>
    runMutation(() => cancelOrderByPharmacy(id));

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

    create,
    update,
    remove,

    accept,
    process,
    outForDelivery: outForDeliveryMutation,
    deliver,
    cancelByUser,
    cancelByPharmacy,
  };
};