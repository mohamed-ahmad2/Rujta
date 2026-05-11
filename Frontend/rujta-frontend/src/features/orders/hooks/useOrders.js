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

  // ====================== Fetch Orders ======================

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserOrders();
      const groupedOrders = Array.isArray(res.data) ? res.data : [];

      const sorted = [...groupedOrders].sort((groupA, groupB) => {
        const dateA = new Date(groupA[0]?.orderDate || 0);
        const dateB = new Date(groupB[0]?.orderDate || 0);
        return dateB - dateA;
      });

      setLiveOrders(sorted);
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      console.error("Error fetching user orders:", err);
    } finally {
      setLoading(false);
    }
  }, [setLiveOrders]);

  const fetchPharmacy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPharmacyOrders();
      const orders = Array.isArray(res.data) ? res.data : [];

      const sorted = [...orders].sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
      );

      setLiveOrders(sorted.map((order) => [order]));
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      console.error("Error fetching pharmacy orders:", err);
    } finally {
      setLoading(false);
    }
  }, [setLiveOrders]);

  // ====================== Mutation Helper ======================

  const runMutation = useCallback(
    async (fn, id) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fn(id);

        const updatedOrder = res?.data?.data || res?.data;

        if (updatedOrder?.id) {
          setLiveOrders((prevGroups) =>
            prevGroups.map((group) =>
              Array.isArray(group)
                ? group.map((order) =>
                    order.id === updatedOrder.id
                      ? { ...order, ...updatedOrder }
                      : order,
                  )
                : group,
            ),
          );
        }

        return res?.data || res;
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(message);
        console.error("Mutation error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLiveOrders],
  );

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
