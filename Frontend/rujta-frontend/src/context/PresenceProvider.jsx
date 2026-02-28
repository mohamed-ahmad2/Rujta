import React, { useEffect, useState, useCallback } from "react";
import { PresenceContext } from "./PresenceContext";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "../features/auth/hooks/useAuth";
import { getAccessToken } from "../authProvider/authTokenProvider";

export const PresenceProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [connection, setConnection] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Function to start SignalR connection
  const startHubConnection = useCallback(async () => {
    if (!user || loading) return;
    const role = user.role;
    if (role !== "Pharmacist" && role !== "PharmacyAdmin") return;

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/presence", {
        accessTokenFactory: () => getAccessToken(),
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // reconnect intervals
      .build();

    // Handlers for online/offline events (for PharmacyAdmin)
    if (role === "PharmacyAdmin") {
      hubConnection.on("PharmacistOnline", (userId) => {
        setOnlineUsers((prev) => [...prev, userId]);
      });
      hubConnection.on("PharmacistOffline", (userId) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });
    }

    // Function to attempt start with retry for 429
    const tryStart = async () => {
      try {
        await hubConnection.start();
        console.log("SignalR presence connected");

        // Notify backend that current user is online
        if (role === "Pharmacist") {
          console.log("Pharmacist SignalR connection established");
        }
      } catch (err) {
        if (err.statusCode === 429) {
          console.warn("Too many requests, retrying in 5s...");
          setTimeout(tryStart, 5000);
        } else {
          console.error("SignalR presence connection error:", err);
        }
      }
    };

    tryStart();
    setConnection(hubConnection);

    return hubConnection;
  }, [user, loading]);

  // Start connection when user logs in
  useEffect(() => {
    if (!user || loading) return;

    let hubConn;
    startHubConnection().then((conn) => {
      hubConn = conn;
    });

    // Cleanup on logout / unmount
    return () => {
      if (hubConn) {
        // Stop connection and remove events
        hubConn.off();
        hubConn
          .stop()
          .then(() => console.log("SignalR presence disconnected"))
          .catch((err) =>
            console.error("Error stopping SignalR connection:", err),
          );
        setConnection(null);
        setOnlineUsers([]);
      }
    };
  }, [user, loading, startHubConnection]);

  return (
    <PresenceContext.Provider value={{ connection, onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
};
