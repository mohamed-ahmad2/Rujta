
import React, { useEffect, useState, useCallback, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { OrdersContext } from "./OrdersContext";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  getAccessToken,
  subscribeTokenChange,
} from "../authProvider/authTokenProvider";

export const OrdersProvider = ({ children }) => {
  const { user, loading } = useAuth();

  const [connection, setConnection] = useState(null);
  const [orders, setOrders] = useState([]);

  const connectionRef = useRef(null);

  useEffect(() => {
    connectionRef.current = connection;
  }, [connection]);

  /* ================= CLEANUP ================= */

  const cleanupConnection = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;

    try {
      console.log("Stopping SignalR orders connection...");
      conn.off();
      await conn.stop();
      console.log("✅ Orders SignalR disconnected");
    } catch (err) {
      console.error("SignalR stop error:", err);
    }

    setConnection(null);
  }, []);

  // logout listener
  useEffect(() => {
    const unsubscribe = subscribeTokenChange(async (token) => {
      if (token === null) {
        await cleanupConnection();
        setOrders([]);
      }
    });

    return unsubscribe;
  }, [cleanupConnection]);

  /* ================= START ================= */

  const startHubConnection = useCallback(async () => {
    if (!user || loading) return;

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/orders", {
        accessTokenFactory: () => getAccessToken(),
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    /* 🔥 Listen for server events */

    hubConnection.on("OrderCreated", (order) => {
      setOrders((prev) => [order, ...prev]);
    });

    hubConnection.on("OrderUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === updatedOrder.id ? updatedOrder : o
        )
      );
    });

    hubConnection.on("OrderDeleted", (orderId) => {
      setOrders((prev) =>
        prev.filter((o) => o.id !== orderId)
      );
    });

    await hubConnection.start();
    console.log("✅ Orders SignalR connected");

    setConnection(hubConnection);
  }, [user, loading]);

  useEffect(() => {
    startHubConnection();
    return cleanupConnection;
  }, [startHubConnection, cleanupConnection]);

  return (
    <OrdersContext.Provider
      value={{
        connection,
        orders,
        setOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};