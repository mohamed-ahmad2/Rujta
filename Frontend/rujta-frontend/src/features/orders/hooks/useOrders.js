import { useContext, useState, useCallback } from "react";
import { OrdersContext } from "../../../context/OrdersContext"; // path to OrdersProvider
import {
  getPharmacyOrders,
  acceptOrder,
  processOrder,
  outForDelivery,
  markAsDelivered,
  cancelOrderByPharmacy,
} from "../api/ordersApi";

export const useOrders = () => {
  const { orders: liveOrders, setOrders: setLiveOrders } = useContext(OrdersContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPharmacy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPharmacyOrders();
      const flattened = res.data.flat();
      setLiveOrders(flattened); // update SignalR live orders
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [setLiveOrders]);

  const runMutation = async (fn, id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(id);
      // ✅ Optional: update live orders immediately for instant feedback
      if (res?.data?.id) {
        setLiveOrders((prev) =>
          prev.map((o) => (o.id === res.data.id ? res.data : o))
        );
      }
      return res?.data || null;
    } catch (err) {
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    orders: liveOrders,
    loading,
    error,
    fetchPharmacy,
    accept: (id) => runMutation(acceptOrder, id),
    process: (id) => runMutation(processOrder, id),
    outForDelivery: (id) => runMutation(outForDelivery, id),
    deliver: (id) => runMutation(markAsDelivered, id),
    cancelByPharmacy: (id) => runMutation(cancelOrderByPharmacy, id),
  };
};