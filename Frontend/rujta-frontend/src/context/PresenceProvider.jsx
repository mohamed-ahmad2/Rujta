import React, { useEffect, useState } from "react";
import { PresenceContext } from "./PresenceContext";  // Adjust path if needed
import { getAccessToken } from "../authProvider/authTokenProvider";
import * as signalR from "@microsoft/signalr";

export const PresenceProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl("/hubs/presence", {
        accessTokenFactory: () => getAccessToken(),
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    hubConnection
      .start()
      .then(() => console.log("SignalR presence connected"))
      .catch((err) => console.error("SignalR presence connection error:", err));

    // Events from backend
    hubConnection.on("PharmacistOnline", (userId) => {
      setOnlineUsers((prev) => [...prev, userId]);
    });

    hubConnection.on("PharmacistOffline", (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    setConnection(hubConnection);

    return () => {
      hubConnection.stop();
    };
  }, []);

  return (
    <PresenceContext.Provider value={{ connection, onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
};