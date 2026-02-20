// src/features/orders/hook/useOrders.js
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

  const fetchAll = useCallback(async () => fetchOrders(getAllOrders), []);
  const fetchUser = useCallback(async () => fetchOrders(getUserOrders), []);
  const fetchPharmacy = useCallback(
    async () => fetchOrders(getPharmacyOrders),
    []
  );

  const fetchById = useCallback(
    async (id) => fetchSingle(getOrderById, id, setSelectedOrder),
    []
  );
  const fetchDetailsById = useCallback(
    async (id) => fetchSingle(getOrderDetails, id, setDetails),
    []
  );

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

  const create = async (data, refreshFn = fetchUser) =>
    runMutation(createOrder, data, refreshFn);
  const update = async (id, data, refreshFn = fetchUser) =>
    runMutation(() => updateOrder(id, data), null, refreshFn);
  const remove = async (id, refreshFn = fetchUser) =>
    runMutation(() => deleteOrder(id), null, refreshFn);

  const accept = (id, refreshFn = fetchUser) =>
    runMutation(() => acceptOrder(id), null, refreshFn);
  const process = (id, refreshFn = fetchUser) =>
    runMutation(() => processOrder(id), null, refreshFn);
  const _outForDelivery = (id, refreshFn = fetchUser) =>
    runMutation(() => outForDelivery(id), null, refreshFn);
  const deliver = (id, refreshFn = fetchUser) =>
    runMutation(() => markAsDelivered(id), null, refreshFn);
  const cancelByUser = (id, refreshFn = fetchUser) =>
    runMutation(() => cancelOrderByUser(id), null, refreshFn);
  const cancelByPharmacy = (id, refreshFn = fetchPharmacy) =>
    runMutation(() => cancelOrderByPharmacy(id), null, refreshFn);

  const runMutation = async (fn, data = null, refreshFn) => {
    setLoading(true);
    setError(null);
    try {
      const res = data ? await fn(data) : await fn();
      if (refreshFn) await refreshFn();
      return res?.data || null;
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
    outForDelivery: _outForDelivery,
    deliver,
    cancelByUser,
    cancelByPharmacy,
  };
};