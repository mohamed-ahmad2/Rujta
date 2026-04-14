// src/context/OrdersProvider.jsx
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

  // Logout listener
  useEffect(() => {
    const unsubscribe = subscribeTokenChange(async (token) => {
      console.log("🔄 Token changed:", token);
      if (!token) {
        await cleanupConnection();
      }
    });

    return unsubscribe;
  }, [cleanupConnection]);

  // ================= START SIGNALR =================
  const startHubConnection = useCallback(async () => {
    if (!user || loading) {
      console.log("⏳ User not loaded yet, skipping SignalR start...");
      return;
    }

    const token = getAccessToken();
    console.log("🔑 Access token:", token);

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

    // ===== Status mapping =====
    const statusMap = {
      0: "Pending",
      1: "Accepted",
      2: "Processing",
      3: "OutForDelivery",
      4: "Delivered",
      5: "CancelledByUser",
      6: "CancelledByPharmacy",
    };

    // ===== Server events =====
    hubConnection.on("NewOrderReceived", async (orderId) => {
      console.log("📦 NewOrderReceived event:", orderId);
      try {
        const res = await getOrderById(orderId);
        setOrders((prev) => [res.data, ...prev]);
      } catch (err) {
        console.error("Failed to fetch new order:", err);
        setOrders((prev) => [...prev, { id: orderId, status: "Pending" }]);
      }
    });

    hubConnection.on("OrderUpdated", async (orderId) => {
      console.log("✏️ OrderUpdated event:", orderId);
      try {
        const res = await getOrderById(orderId);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)));
      } catch (err) {
        console.error("Failed to fetch updated order:", err);
      }
    });
    hubConnection.on("OrderStatusChanged", (orderId, status) => {
      console.log("🔄 OrderStatusChanged event:", orderId, status);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: statusMap[status] || status } // clone للكائن مع تحديث status مباشرة
            : o,
        ),
      );
    });
    hubConnection.on("OrderItemChanged", async (orderId) => {
      console.log("🔄 OrderItemChanged event:", orderId);
      try {
        const res = await getOrderById(orderId);
        if (res.data) {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? res.data : o)),
          );
        } else {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
        }
      } catch (err) {
        console.error("Failed to fetch changed order:", err);
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
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
