import React, { useEffect, useState, useCallback, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { OrdersContext } from "./OrdersContext";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  getAccessToken,
  subscribeTokenChange,
} from "../authProvider/authTokenProvider";
import { getOrderById } from "../features/orders/api/ordersApi";

export const OrdersProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [connection, setConnection] = useState(null);
  const [orders, setOrders] = useState([]);
  const connectionRef = useRef(null);

  useEffect(() => {
    connectionRef.current = connection;
  }, [connection]);

  // ================= CLEANUP =================
  const cleanupConnection = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;
    try {
      conn.off();
      await conn.stop();
    } catch (err) {
      console.error("❌ SignalR stop error:", err);
    }
    setConnection(null);
    setOrders([]);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeTokenChange(async (token) => {
      if (!token) await cleanupConnection();
    });
    return unsubscribe;
  }, [cleanupConnection]);

  // ================= START SIGNALR =================
  const startHubConnection = useCallback(async () => {
    if (!user || loading) return;

    const hubUrl =
      import.meta.env.MODE === "development"
        ? "/hubs/orders"
        : "https://rujta.runasp.net/hubs/orders";

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getAccessToken(),
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    const statusMap = {
      0: "Pending",
      1: "Accepted",
      2: "Processing",
      3: "OutForDelivery",
      4: "Delivered",
      5: "CancelledByUser",
      6: "CancelledByPharmacy",
    };

    // Safe map helper — guards against any flat order accidentally in state
    const safeMapGroups = (prevGroups, orderId, mapFn) =>
      prevGroups.map((group) => {
        if (!Array.isArray(group)) return group;
        return group.map((order) =>
          order.id === orderId ? mapFn(order) : order
        );
      });

    hubConnection.on("NewOrderReceived", async (orderId) => {
      console.log("📦 NewOrderReceived:", orderId);
      try {
        const res = await getOrderById(orderId);
        setOrders((prev) => [[res.data], ...prev]);
      } catch (err) {
        console.error("Failed to fetch new order:", err);
        setOrders((prev) => [[{ id: orderId, status: "Pending" }], ...prev]);
      }
    });

    hubConnection.on("OrderUpdated", async (orderId) => {
      console.log("✏️ OrderUpdated:", orderId);
      try {
        const res = await getOrderById(orderId);
        setOrders((prev) => safeMapGroups(prev, orderId, () => res.data));
      } catch (err) {
        console.error("Failed to fetch updated order:", err);
      }
    });

    hubConnection.on("OrderStatusChanged", (orderId, status) => {
      console.log("🔄 OrderStatusChanged:", orderId, status);
      const mappedStatus = statusMap[status] ?? status;
      setOrders((prev) =>
        safeMapGroups(prev, orderId, (order) => ({
          ...order,
          status: mappedStatus,
        }))
      );
    });

    hubConnection.on("OrderItemChanged", async (orderId) => {
      console.log("🔄 OrderItemChanged:", orderId);
      try {
        const res = await getOrderById(orderId);
        if (res.data) {
          setOrders((prev) => safeMapGroups(prev, orderId, () => res.data));
        } else {
          setOrders((prev) =>
            prev
              .map((group) =>
                Array.isArray(group)
                  ? group.filter((o) => o.id !== orderId)
                  : group
              )
              .filter((group) => Array.isArray(group) && group.length > 0)
          );
        }
      } catch (err) {
        console.error("Failed to fetch changed order:", err);
        setOrders((prev) =>
          prev
            .map((group) =>
              Array.isArray(group)
                ? group.filter((o) => o.id !== orderId)
                : group
            )
            .filter((group) => Array.isArray(group) && group.length > 0)
        );
      }
    });

    hubConnection.onclose((err) => {
      console.log("🔴 Orders connection closed:", err);
    });

    try {
      await hubConnection.start();
      console.log("✅ SignalR orders connected");
      setConnection(hubConnection);
    } catch (err) {
      console.error("❌ Orders SignalR start failed:", err);
    }
  }, [user, loading]);

  useEffect(() => {
    startHubConnection();
    return cleanupConnection;
  }, [startHubConnection, cleanupConnection]);

  return (
    <OrdersContext.Provider value={{ connection, orders, setOrders }}>
      {children}
    </OrdersContext.Provider>
  );
};