import React, { useEffect, useState, useCallback, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { OrdersContext } from "./OrdersContext";
import { useAuth } from "../features/auth/hooks/useAuth";
import { getAccessToken, subscribeTokenChange } from "../authProvider/authTokenProvider";

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
      console.log("🔹 Stopping SignalR orders connection...");
      conn.off();
      await conn.stop();
      console.log("✅ Orders SignalR disconnected");
    } catch (err) {
      console.error("❌ SignalR stop error:", err);
    }

    setConnection(null);
    setOrders([]);
  }, []);

  // logout listener
  useEffect(() => {
    const unsubscribe = subscribeTokenChange(async (token) => {
      console.log("🔄 Token changed:", token);
      if (!token) {
        await cleanupConnection();
      }
    });

    return unsubscribe;
  }, [cleanupConnection]);

  // ================= START =================
  const startHubConnection = useCallback(async () => {
    if (!user || loading) {
      console.log("⏳ User not loaded yet, skipping SignalR start...");
      return;
    }

    const token = getAccessToken();
    console.log("🔑 Access token:", token);

    if (!token) {
      console.warn("⚠️ No access token found, SignalR will fail!");
    }

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/orders", {
        accessTokenFactory: () => {
          const t = getAccessToken();
          console.log("📡 SignalR accessTokenFactory called:", t);
          return t;
        },
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    // 🔥 Server Events
    hubConnection.on("OrderCreated", (order) => {
      console.log("📦 OrderCreated event:", order);
      setOrders((prev) => [order, ...prev]);
    });

   hubConnection.on("OrderCreated", (order) => {
  if (!order?.id) return; // ignore invalid orders
  console.log("📦 OrderCreated event:", order);
  setOrders((prev) => [order, ...prev]);
});

hubConnection.on("OrderUpdated", (updatedOrder) => {
  if (!updatedOrder?.id) return; // ignore invalid orders
  console.log("✏️ OrderUpdated event:", updatedOrder);
  setOrders((prev) =>
    prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
  );
});

hubConnection.on("OrderDeleted", (orderId) => {
  if (!orderId) return;
  console.log("🗑 OrderDeleted event:", orderId);
  setOrders((prev) => prev.filter((o) => o.id !== orderId));
});
    hubConnection.onclose((err) => {
      console.log("🔴 Orders connection closed:", err);
    });

    try {
      console.log("🚀 Starting SignalR orders connection...");
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