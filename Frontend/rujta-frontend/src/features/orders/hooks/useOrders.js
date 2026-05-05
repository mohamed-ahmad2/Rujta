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

  // ── fetchUser ─────────────────────────────────────────────────────────────
  // API returns array-of-arrays (groups). Sort groups by first order's date.
  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserOrders();
      const sorted = [...res.data].sort(
        (a, b) => new Date(b[0].orderDate) - new Date(a[0].orderDate)
      );
      setLiveOrders(sorted); // already array-of-arrays ✅
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [setLiveOrders]);

  // ── fetchPharmacy ─────────────────────────────────────────────────────────
  // API returns flat or grouped. Normalize to array-of-arrays so the shape
  // always matches what SignalR handlers expect.
  const fetchPharmacy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPharmacyOrders();
      const flattened = res.data.flat();
      const sorted = flattened.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      );
      // Wrap each order in its own single-item group ✅
      setLiveOrders(sorted.map((order) => [order]));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [setLiveOrders]);

  // ── runMutation ───────────────────────────────────────────────────────────
  // Optimistic update: replace the matching order inside its group.
  // SignalR will confirm/override with the real server state.
  const runMutation = async (fn, id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(id);
      if (res?.data?.id) {
        setLiveOrders((prevGroups) =>
          prevGroups.map((group) =>
            Array.isArray(group)
              ? group.map((o) => (o.id === res.data.id ? res.data : o))
              : group
          )
        );
      }
      return res;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
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