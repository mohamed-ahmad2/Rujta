import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export const useOrdersSignalR = (setOrders) => {
  const connectionRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("❌ No JWT token found in localStorage");
      return;
    }

    console.log("🚀 Starting SignalR connection...");
    console.log("🔑 JWT Token:", token); // للتأكد من الـ token

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7065/hubs/orders", {
  accessTokenFactory: () => token
})
      .withAutomaticReconnect([0, 2000, 10000, 30000]) // retry delays
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // ===== Connection lifecycle =====
    connection.onclose(error => {
      console.error("❌ Connection closed:", error);
    });

    connection.onreconnecting(error => {
      console.warn("⚠️ Reconnecting:", error);
    });

    connection.onreconnected(connectionId => {
      console.log("✅ Reconnected. ID:", connectionId);
    });

    // ===== Hub events =====
    connection.on("OrderUpdated", updatedOrder => {
      console.log("🔥 OrderUpdated received:", updatedOrder);

      setOrders(prev => {
        const exists = prev.some(o => o.id === updatedOrder.id);

        if (!exists) {
          return [...prev, updatedOrder].sort((a, b) => b.id - a.id);
        }

        return prev.map(o =>
          o.id === updatedOrder.id ? updatedOrder : o
        );
      });
    });

    connection.on("OrderDeleted", deletedId => {
      console.log("🗑 OrderDeleted received:", deletedId);
      setOrders(prev => prev.filter(o => o.id !== deletedId));
    });

    // ===== Start connection =====
    const startConnection = async () => {
      try {
        await connection.start();
        console.log("✅ Connected to OrdersHub");
        console.log("Connection ID:", connection.connectionId);
      } catch (err) {
        console.error("❌ SignalR start failed:", err);
        // Retry manually after 5 ثواني لو فشل
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    // ===== Cleanup =====
    return () => {
      if (connectionRef.current) {
        console.log("🛑 Stopping SignalR connection");
        connectionRef.current.stop().catch(err =>
          console.error("Stop failed:", err)
        );
      }
    };
  }, [setOrders]);
};