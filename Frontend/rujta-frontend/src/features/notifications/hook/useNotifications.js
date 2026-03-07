import { useEffect, useState, useCallback } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
  createTestNotification,
} from "../api/notificationsApi";
import { startNotificationConnection } from "../../../shared/signalr/notificationConnection";
import { useAuth } from "../../auth/hooks/useAuth"; // استيراد useAuth

export const useNotifications = () => {
  const { user } = useAuth(); // هنا بناخد user
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const userId = user?.id || localStorage.getItem("userId"); // fallback للـ localStorage

  // ================= Fetch =================
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getMyNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ================= Mark As Read =================
  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // ================= SignalR Setup =================
  useEffect(() => {
    if (!userId) return;

    let connection;
    const connect = async () => {
      connection = await startNotificationConnection(userId);

      connection.on("ReceiveNotification", (dto) => {
        const newNotification = {
          id: dto.id || Date.now(),
          title: dto.title || dto.message,
          message: dto.message,
          isRead: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);
      });
    };

    connect();

    return () => {
      if (connection) connection.stop();
    };
  }, [userId]);

  // ================= Test Notification =================
  const sendTestNotification = async () => {
    if (!userId) return;
    try {
      await createTestNotification("Test Notification", "This is a test.");
      fetchNotifications();
    } catch (err) {
      console.error("Failed to send test notification", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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