// src/features/notification/hook/useNotifications.jsx
import { useEffect, useState, useCallback, useContext } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
  createTestNotification,
} from "../api/notificationsApi";
import { NotificationContext } from "../../../context/NotificationContext";
import { useAuth } from "../../auth/hooks/useAuth";

export const useNotifications = () => {
  const { user } = useAuth();
  const { connection, notifications, setNotifications } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);

  const userId = user?.id || localStorage.getItem("userId");

  // ================= Fetch =================
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getMyNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, [userId, setNotifications]);

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

  // ================= SignalR Event =================
  useEffect(() => {
    if (!connection) return;

    const handleNewNotification = (dto) => {
      const newNotification = {
        id: dto.id || Date.now(),
        title: dto.title || dto.message,
        message: dto.message,
        isRead: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    };

    const handleUpdatedNotification = (dto) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === dto.id ? { ...n, ...dto } : n))
      );
    };

    // إزالة أي handlers قديمة قبل إضافة جديدة
    connection.off("NewNotification");
    connection.off("NotificationUpdated");

    connection.on("NewNotification", handleNewNotification);
    connection.on("NotificationUpdated", handleUpdatedNotification);

    return () => {
      connection.off("NewNotification", handleNewNotification);
      connection.off("NotificationUpdated", handleUpdatedNotification);
    };
  }, [connection, setNotifications]);

  // ================= Test Notification =================
  const sendTestNotification = useCallback(async () => {
    if (!userId) return;
    try {
      await createTestNotification("Test Notification", "This is a test.");
      fetchNotifications();
    } catch (err) {
      console.error("Failed to send test notification", err);
    }
  }, [userId, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ================= INITIAL FETCH =================
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    sendTestNotification,
  };
};