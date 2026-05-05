import React, { useEffect, useState, useCallback, useRef } from "react";
import { PresenceContext } from "./PresenceContext";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "../features/auth/hooks/useAuth";
import {
  getAccessToken,
  subscribeTokenChange,
} from "../authProvider/authTokenProvider";

export const PresenceProvider = ({ children }) => {
  const { user, loading } = useAuth();

  const [connection, setConnection] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const connectionRef = useRef(null);

  useEffect(() => {
    connectionRef.current = connection;
  }, [connection]);

  // ================= CLEANUP =================
  const cleanupConnection = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;

    try {
      console.log("Stopping SignalR presence connection...");
      conn.off();
      await conn.stop();

      console.log("✅ SignalR presence disconnected");
    } catch (err) {
      console.error("SignalR stop error:", err);
    }

    setConnection(null);
    setOnlineUsers([]);
  }, []);

  // logout listener
  useEffect(() => {
    const unsubscribe = subscribeTokenChange(async (token) => {
      if (token === null) {
        await cleanupConnection();
      }
    });

    return unsubscribe;
  }, [cleanupConnection]);

  // ================= START =================
  const startHubConnection = useCallback(async () => {
    if (!user || loading) return;

    const role = user.role;
    if (role !== "Pharmacist" && role !== "PharmacyAdmin") return;

    const hubUrl =
      import.meta.env.MODE === "development"
        ? "/hubs/presence"
        : "https://rujta.runasp.net/hubs/presence";

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getAccessToken(),
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    if (role === "PharmacyAdmin") {
      hubConnection.on("PharmacistOnline", (userId) =>
        setOnlineUsers((prev) =>
          prev.includes(userId) ? prev : [...prev, userId],
        ),
      );

      hubConnection.on("PharmacistOffline", (userId) =>
        setOnlineUsers((prev) => prev.filter((id) => id !== userId)),
      );
    }

    await hubConnection.start();

    console.log("✅ SignalR presence connected");

    setConnection(hubConnection);
  }, [user, loading]);

  useEffect(() => {
    startHubConnection();
    return cleanupConnection;
  }, [startHubConnection, cleanupConnection]);

  return (
    <PresenceContext.Provider value={{ connection, onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
};
