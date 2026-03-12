import React, { useEffect, useState, useCallback, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { NotificationContext } from "./NotificationContext";
import { useAuth } from "../features/auth/hooks/useAuth";
import { getAccessToken, subscribeTokenChange } from "../authProvider/authTokenProvider";

export const NotificationProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [connection, setConnection] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const connectionRef = useRef(null);
  const startingRef = useRef(false);

  useEffect(() => {
    connectionRef.current = connection;
  }, [connection]);

  const cleanupConnection = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;

    try {
      console.log("🔹 Stopping SignalR notifications connection...");
      conn.off();
      await conn.stop();
      console.log("✅ Notifications SignalR disconnected");
    } catch (err) {
      console.error("❌ SignalR stop error:", err);
    } finally {
      connectionRef.current = null;
      setConnection(null);
      setNotifications([]);
    }
  }, []);

  const startHubConnection = useCallback(async () => {
    if (startingRef.current) return;
    if (!user || loading) return;
    if (connectionRef.current) return;

    const token = getAccessToken();
    if (!token) return;

    startingRef.current = true;

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7065/hubs/notifications", {
        accessTokenFactory: () => getAccessToken(),
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // ===== Server events =====
    hubConnection.on("NewNotification", (notification) => {
      console.log("🔔 NewNotification event:", notification);
      setNotifications((prev) => [notification, ...prev]);
    });

    hubConnection.on("Error", (msg) => {
      console.error("⚠️ Server error message:", msg);
    });

    hubConnection.onclose(async (err) => {
      console.warn("🔴 Notifications connection closed:", err);
      setTimeout(async () => {
        console.log("♻️ Attempting to reconnect notifications SignalR...");
        try {
          await hubConnection.start();
          console.log("✅ Reconnected to notifications SignalR Hub");
        } catch (e) {
          console.error("❌ Reconnect failed:", e);
        }
      }, 2000);
    });

    try {
      console.log("🚀 Starting SignalR notifications connection...");
      await hubConnection.start();
      console.log("✅ SignalR notifications connected");
      setConnection(hubConnection);
    } catch (err) {
      console.error("❌ Notifications SignalR start failed:", err);
    } finally {
      startingRef.current = false;
    }
  }, [user, loading]);

  useEffect(() => {
    const unsubscribe = subscribeTokenChange(async (token) => {
      if (!token) {
        await cleanupConnection();
      } else {
        await startHubConnection();
      }
    });

    return unsubscribe;
  }, [cleanupConnection, startHubConnection]);

  useEffect(() => {
    startHubConnection();
    return cleanupConnection;
  }, [startHubConnection, cleanupConnection]);

  return (
    <NotificationContext.Provider value={{ connection, notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};