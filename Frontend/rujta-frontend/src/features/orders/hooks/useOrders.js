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
  cancelByUser,
  cancelByPharmacy,
} from "../api/ordersApi";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [details, setDetails] = useState(null);

  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ================= User Orders ================= */
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


  /* ================= Admin / All Orders ================= */
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

  /* ================= CRUD ================= */
  const create = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createOrder(data);
      await fetchUserOrders(); // ✅ مهم
      return res.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      await updateOrder(id, data);
      await fetchUserOrders(); // ✅ مش fetchAll
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= Status Actions ================= */
  const runAction = async (actionFn, id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actionFn(id);
      await fetchUserOrders(); // ✅
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

    accept: (id) => runAction(acceptOrder, id),
    process: (id) => runAction(processOrder, id),
    outForDelivery: (id) => runAction(outForDelivery, id),
    deliver: (id) => runAction(markAsDelivered, id),
    cancelByUser: (id) => runAction(cancelByUser, id),
    cancelByPharmacy: (id) => runAction(cancelByPharmacy, id),
  };
};
