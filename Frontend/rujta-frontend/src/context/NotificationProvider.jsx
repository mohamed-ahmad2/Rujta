import React, { useEffect, useState, useCallback, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { NotificationContext } from "./NotificationContext";
import { toastEmitter } from "./toastEmitter";
import { useAuth } from "../features/auth/hooks/useAuth";
import { getAccessToken, subscribeTokenChange } from "../authProvider/authTokenProvider";

function getUserIdFromToken() {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.domainPersonId || payload.sub || null;
  } catch {
    return null;
  }
}

function getStorageKey(userId) {
  return userId ? `notifications_${userId}` : null;
}

function persistNotifications(items) {
  try {
    const userId = getUserIdFromToken();
    const key = getStorageKey(userId);
    if (key) localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

export const NotificationProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const connectionRef = useRef(null);
  const startingRef = useRef(false);

  const [connection, setConnection] = useState(null);
  const [lastConnectedAt, setLastConnectedAt] = useState(null);

  const [notifications, setNotificationsState] = useState(() => {
    try {
      const userId = getUserIdFromToken();
      const key = getStorageKey(userId);
      if (!key) return [];
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Public setter — used by useNotifications for DB fetch merging and markAsRead
  const setNotifications = useCallback((updater) => {
    setNotificationsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persistNotifications(next);
      return next;
    });
  }, []); // no deps — persistNotifications reads userId itself at call time

  // Re-hydrate from localStorage when user changes
  useEffect(() => {
    if (!user) return;
    try {
      const userId =
        user.domainPersonId || user.id || user.userId || user.sub ||
        getUserIdFromToken();
      const key = getStorageKey(userId);
      if (!key) return;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) setNotificationsState(parsed);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    connectionRef.current = connection;
  }, [connection]);

  // SignalR message handler — deps: [connection] ONLY
  // toastEmitter.emit is a plain function on window.__toastEmitter,
  // immune to React render timing and HMR module replacement
  useEffect(() => {
    if (!connection) return;

    const handleNewNotification = (dto) => {
      console.log("🔔 NewNotification RAW:", JSON.stringify(dto));

      // Normalize: SignalR may send Id or id depending on server config
      const normalizedDto = {
        id:        dto.id        ?? dto.Id,
        title:     dto.title     ?? dto.Title,
        message:   dto.message   ?? dto.Message,
        payload:   dto.payload   ?? dto.Payload,
        createdAt: dto.createdAt ?? dto.CreatedAt,
        isRead:    dto.isRead    ?? dto.IsRead ?? false,
      };

      console.log("🔔 Normalized dto:", normalizedDto);

      setNotificationsState((prev) => {
        if (prev.some((n) => n.id === normalizedDto.id)) {
          console.log("🔔 Duplicate, skipping");
          return prev;
        }
        const next = [normalizedDto, ...prev];
        persistNotifications(next);
        return next;
      });

      toastEmitter.emit({ title: normalizedDto.title, message: normalizedDto.message });
    };

    connection.on("NewNotification", handleNewNotification);
    console.log("✅ NewNotification handler registered on connection", connection.connectionId);

    return () => {
      connection.off("NewNotification", handleNewNotification);
      console.log("🧹 NewNotification handler removed");
    };
  }, [connection]);

  const cleanupConnection = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;
    try {
      conn.off();
      await conn.stop();
    } catch (err) {
      console.error("❌ SignalR stop error:", err);
    } finally {
      connectionRef.current = null;
      setConnection(null);
    }
  }, []);

  const startHubConnection = useCallback(async () => {
    if (startingRef.current) return;
    if (!user || loading) return;
    const token = getAccessToken();
    if (!token) return;

    startingRef.current = true;

    const hubUrl =
      import.meta.env.MODE === "development"
        ? "/hubs/notifications"
        : "https://rujta.runasp.net/hubs/notifications";

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getAccessToken(),
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    hubConnection.on("Error", (msg) => console.error("⚠️ Server error:", msg));

    hubConnection.onclose((err) => {
      console.warn("🔴 Connection closed:", err);
      connectionRef.current = null;
      setConnection(null);
    });

    hubConnection.onreconnected(() => {
      console.log("✅ SignalR reconnected");
      setConnection(hubConnection);
      setLastConnectedAt(Date.now());
    });

    try {
      await hubConnection.start();
      console.log("✅ SignalR connected:", hubConnection.connectionId);
      connectionRef.current = hubConnection;
      setConnection(hubConnection);
      setLastConnectedAt(Date.now());
    } catch (err) {
      console.error("❌ SignalR start failed:", err);
    } finally {
      startingRef.current = false;
    }
  }, [user, loading]);

  useEffect(() => {
    const unsubscribe = subscribeTokenChange(async (token) => {
      if (!token) {
        await cleanupConnection();
        setNotificationsState([]);
      } else {
        await cleanupConnection();
        await startHubConnection();
      }
    });
    return unsubscribe;
  }, [cleanupConnection, startHubConnection]);

  useEffect(() => {
    startHubConnection();
  }, [startHubConnection]);

  return (
    <NotificationContext.Provider
      value={{ connection, notifications, setNotifications, lastConnectedAt }}
    >
      {children}
    </NotificationContext.Provider>
  );
};