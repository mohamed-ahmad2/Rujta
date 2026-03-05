// src/features/orders/hooks/useOrders.js
import { useContext, useState, useCallback } from "react";
import { OrdersContext } from "../../../context/OrdersContext";
import {
  getUserOrders,
  getPharmacyOrders,
  acceptOrder,
  processOrder,
  outForDelivery,
  markAsDelivered,
  cancelOrderByPharmacy,
  cancelOrderByUser,
} from "../api/ordersApi";

export const useOrders = () => {
  const { orders: liveOrders, setOrders: setLiveOrders } =
    useContext(OrdersContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserOrders();
      // res.data is array of arrays (groups)
      const groups = res.data;
      // Sort groups by the orderDate of the first order in each group, descending
      const sortedGroups = groups.sort(
        (a, b) => new Date(b[0].orderDate) - new Date(a[0].orderDate),
      );
      setLiveOrders(sortedGroups);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [setLiveOrders]);

  const fetchPharmacy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPharmacyOrders();
      const flattened = res.data.flat(); // Assuming pharmacy returns flat list
      const sorted = flattened.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
      );
      setLiveOrders(sorted);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [setLiveOrders]);

  const runMutation = async (fn, id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(id);
      // Optimistic update; SignalR will confirm
      if (res?.data?.id) {
        setLiveOrders((prev) =>
          prev.map((o) => (o.id === res.data.id ? res.data : o)),
        );
      } else if (res?.data?.success) {
        // For status change endpoints that return { success: true, message }
        setLiveOrders((prevGroups) =>
          prevGroups.map((group) =>
            group.map(
              (o) => (o.id === id ? { ...o, status: "CancelledByUser" } : o), // Hardcode for cancel
            ),
          ),
        );
      }
      return res;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err; // Rethrow to handle in component
    } finally {
      setLoading(false);
    }
  };

  return {
    orders: liveOrders,
    loading,
    error,
    fetchUser,
    fetchPharmacy,
    accept: (id) => runMutation(acceptOrder, id),
    process: (id) => runMutation(processOrder, id),
    outForDelivery: (id) => runMutation(outForDelivery, id),
    deliver: (id) => runMutation(markAsDelivered, id),
    cancelByPharmacy: (id) => runMutation(cancelOrderByPharmacy, id),
    cancelByUser: (id) => runMutation(cancelOrderByUser, id),
  };
};
