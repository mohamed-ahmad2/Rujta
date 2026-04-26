// src/features/notification/hook/useNotifications.jsx
import { useEffect, useState, useCallback, useContext } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../api/notificationsApi";
import { NotificationContext } from "../../../context/NotificationContext";
import { ToastContext } from "../../../context/ToastContext";   // 🆕 line 1
import { useAuth } from "../../auth/hooks/useAuth";

export const useNotifications = () => {
  const { user } = useAuth();
  const { connection, notifications, setNotifications } = useContext(NotificationContext);
  const { showToast } = useContext(ToastContext);   // 🆕 line 2
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false); // ✅ prevent double fetch

  // ================= Fetch from DB (called on mount and after reconnect) =================
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
        const res = await getMyNotifications();
        const fromDb = res.data || [];

        // ✅ Only update if DB actually returned something
        // Never wipe existing notifications with an empty response
        if (fromDb.length > 0) {
            setNotifications(fromDb);
        }
        // If DB returns empty, keep what's in localStorage/state
    } catch (err) {
        console.error("Failed to fetch notifications", err);
        // ✅ On error, keep existing notifications — don't clear them
    } finally {
        setLoading(false);
    }
  }, [user, setNotifications]);

  // ================= Initial fetch on mount =================
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ================= Re-fetch when SignalR reconnects =================
  useEffect(() => {
    if (!connection) return;

    // When connection is established/reconnected, re-fetch to sync with DB
    const handleReconnected = () => {
      console.log("♻️ SignalR reconnected — re-fetching notifications");
      fetchNotifications();
    };

    connection.onreconnected(handleReconnected);

    // No cleanup needed for onreconnected — SignalR handles it
  }, [connection, fetchNotifications]);

  // ================= Listen for new real-time notifications =================
  useEffect(() => {
    if (!connection) return;

    const handleNewNotification = (dto) => {
      console.log("🔔 New notification received:", dto);

      // ✅ Only add if not already in the list (avoid duplicates on reconnect)
      setNotifications((prev) => {
        const alreadyExists = prev.some((n) => n.id === dto.id);
        if (alreadyExists) return prev;
        return [dto, ...prev];
      });

      showToast({ title: dto.title, message: dto.message });  // 🆕 line 3
    };

    connection.off("NewNotification");
    connection.on("NewNotification", handleNewNotification);

    return () => {
      connection.off("NewNotification", handleNewNotification);
    };
  }, [connection, setNotifications, showToast]);  // 🆕 added showToast to deps

  // ================= Mark As Read =================
  const markAsRead = useCallback(async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  }, [setNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
  };
};