import React, { useEffect, useState } from "react";
import { PresenceContext } from "./PresenceContext";
import { getAccessToken } from "../authProvider/authTokenProvider";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "../features/auth/hooks/useAuth";

export const PresenceProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [connection, setConnection] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // إذا لسة البيانات تتحمل أو لا يوجد user لا نفعل الاتصال
    if (loading || !user) {
      // لو في اتصال مفتوح سابق، اغلقه فورًا عند logout
      if (connection) {
        connection
          .stop()
          .catch((err) => console.error("Error stopping SignalR:", err));
        setConnection(null);
        setOnlineUsers([]);
      }
      return;
    }

    const role = user.role;
    if (role !== "Pharmacist" && role !== "PharmacyAdmin") return;

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/presence", {
        accessTokenFactory: () => getAccessToken(),
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    const startHubConnection = async () => {
      try {
        await hubConnection.start();
        console.log("SignalR presence connected");
      } catch (err) {
        if (err.statusCode === 429) {
          console.warn("Too many requests, retrying in 5 seconds...");
          setTimeout(startHubConnection, 5000);
        } else {
          console.error("SignalR presence connection error:", err);
        }
      }
    };

    startHubConnection();

    if (role === "PharmacyAdmin") {
      hubConnection.on("PharmacistOnline", (userId) => {
        setOnlineUsers((prev) => [...prev, userId]);
      });
      hubConnection.on("PharmacistOffline", (userId) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      });
    }

    setConnection(hubConnection);

    // Cleanup عند logout أو تغيير user
    return () => {
      hubConnection
        .stop()
        .catch((err) => console.error("Error stopping SignalR:", err));
      setConnection(null);
      setOnlineUsers([]);
    };
  }, [user, loading]);

  return (
    <PresenceContext.Provider value={{ connection, onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
};
