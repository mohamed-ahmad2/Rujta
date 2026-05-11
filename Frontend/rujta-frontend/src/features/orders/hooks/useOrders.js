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
  updateOrder,
} from "../api/ordersApi";

/**
 * useOrders
 *
 * Manages order list state and all order mutations.
 *
 * ── Shape of `orders` ────────────────────────────────────────────────────────
 * Always OrderDto[][] (array of groups).
 *   - User view:    backend returns grouped (orders within 1 min → same group)
 *   - Pharmacy view: backend returns flat list → we wrap each in [order]
 *
 * ── PaymentStatus in OrderDto ────────────────────────────────────────────────
 *   Cash orders:    Pending → Success (set by backend on Delivered)
 *   Online orders:  Success from creation (set by backend after Paymob callback)
 *   Cancelled (after online payment): Refunded (set by backend + refund issued)
 */
export const useOrders = () => {
  const { orders: liveOrders, setOrders: setLiveOrders } =
    useContext(OrdersContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch User Orders (grouped) ────────────────────────────────────────────
  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserOrders();
      // Backend returns OrderDto[][] — sort groups by most-recent first
      const groups = Array.isArray(res.data) ? res.data : [];
      const sorted = [...groups].sort((a, b) => {
        const dateA = a[0]?.orderDate ? new Date(a[0].orderDate) : 0;
        const dateB = b[0]?.orderDate ? new Date(b[0].orderDate) : 0;
        return dateB - dateA;
      });
      setLiveOrders(sorted);
      return sorted;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLiveOrders]);

  // ── Fetch Pharmacy Orders (flat → grouped) ─────────────────────────────────
  const fetchPharmacy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPharmacyOrders();
      const orders = Array.isArray(res.data) ? res.data : [];
      const sorted = [...orders].sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
      );
      // Wrap each order in an array to keep consistent OrderDto[][] shape
      setLiveOrders(sorted.map((o) => [o]));
      return sorted;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLiveOrders]);

  // ── Optimistic update helper ───────────────────────────────────────────────
  const applyOptimisticUpdate = useCallback(
    (id, patch) => {
      setLiveOrders((prevGroups) =>
        prevGroups.map((group) =>
          group.map((order) =>
            order.id === id ? { ...order, ...patch } : order,
          ),
        ),
      );
    },
    [setLiveOrders],
  );

  // ── Generic mutation ───────────────────────────────────────────────────────
  const runMutation = useCallback(
    async (apiFn, id, { optimisticPatch, onSuccess } = {}) => {
      setLoading(true);
      setError(null);
      try {
        // Apply optimistic update before the request
        if (optimisticPatch) applyOptimisticUpdate(id, optimisticPatch);

        const res = await apiFn(id);

        // Sync with server response if data returned
        if (res?.data) {
          // Backend returns { success, message } or an OrderDto
          const patch =
            typeof res.data === "object" && "success" in res.data
              ? {} // result-only response; don't overwrite
              : res.data;
          if (Object.keys(patch).length > 0) {
            applyOptimisticUpdate(id, patch);
          }
        }

        onSuccess?.(res);
        return res;
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applyOptimisticUpdate],
  );

  return {
    /** OrderDto[][] — flat with .flat() if you need a plain list */
    orders: liveOrders,
    loading,
    error,

    // Fetch
    fetchUser,
    fetchPharmacy,

    // Status transitions (pharmacy)
    // Pending → Accepted
    accept: (id) =>
      runMutation(acceptOrder, id, { optimisticPatch: { status: "Accepted" } }),

    // Accepted → Processing
    process: (id) =>
      runMutation(processOrder, id, {
        optimisticPatch: { status: "Processing" },
      }),

    // Processing → OutForDelivery
    outForDelivery: (id) =>
      runMutation(outForDelivery, id, {
        optimisticPatch: { status: "OutForDelivery" },
      }),

    // OutForDelivery → Delivered
    // Cash orders: backend sets paymentStatus = "Success" here
    // Online orders: paymentStatus was already "Success"
    deliver: (id) =>
      runMutation(markAsDelivered, id, {
        optimisticPatch: { status: "Delivered" },
      }),

    // Cancel by pharmacy (Pending | Accepted only)
    // If online order already paid → backend issues refund automatically
    cancelByPharmacy: (id) =>
      runMutation(cancelOrderByPharmacy, id, {
        optimisticPatch: { status: "CancelledByPharmacy" },
      }),

    // Cancel by user (Pending | Accepted only)
    // If online order already paid → backend issues refund automatically
    cancelByUser: (id) =>
      runMutation(cancelOrderByUser, id, {
        optimisticPatch: { status: "CancelledByUser" },
      }),

    // Generic update (used by admin)
    updateOrder: (id, data) => runMutation((id) => updateOrder(id, data), id),
  };
};
