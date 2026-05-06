// src/features/notification/hook/useNotifications.jsx
import { useEffect, useState, useCallback, useContext, useMemo } from "react";
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  getPharmacyNotifications,
  getPharmacyUnreadCount,
  markPharmacyNotificationAsRead,
} from "../api/notificationsApi";
import { NotificationContext } from "../../../context/NotificationContext";
import { ToastContext } from "../../../context/ToastContext";
import { useAuth } from "../../auth/hooks/useAuth";

export const useNotifications = ({ isPharmacy = false } = {}) => {
  const { user } = useAuth();
  const { connection, notifications, setNotifications } =
    useContext(NotificationContext);
  const { showToast } = useContext(ToastContext);

  const [loading, setLoading] = useState(false);
  const [serverUnreadCount, setServerUnreadCount] = useState(null);

  const apis = useMemo(
    () =>
      isPharmacy
        ? {
            getList: getPharmacyNotifications,
            getCount: getPharmacyUnreadCount,
            markRead: markPharmacyNotificationAsRead,
          }
        : {
            getList: getMyNotifications,
            getCount: getUnreadCount,
            markRead: markNotificationAsRead,
          },
    [isPharmacy]
  );

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apis.getList();
      const fromDb = res.data || [];

      if (fromDb.length > 0) {
        setNotifications(fromDb);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, [user, setNotifications, apis]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apis.getCount();
      setServerUnreadCount(res.data?.unreadCount ?? 0);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }, [user, apis]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (!connection) return;

    const handleReconnected = () => {
      console.log("♻️ SignalR reconnected — re-fetching notifications");
      fetchNotifications();
      fetchUnreadCount();
    };

    connection.onreconnected(handleReconnected);
  }, [connection, fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    if (!connection) return;

    const handleNewNotification = (dto) => {
      console.log("🔔 New notification received:", dto);

      setNotifications((prev) => {
        const alreadyExists = prev.some((n) => n.id === dto.id);
        if (alreadyExists) return prev;
        return [dto, ...prev];
      });

      setServerUnreadCount((c) => (c === null ? null : c + 1));

      showToast({ title: dto.title, message: dto.message });
    };

    connection.off("NewNotification");
    connection.on("NewNotification", handleNewNotification);

    return () => {
      connection.off("NewNotification", handleNewNotification);
    };
  }, [connection, setNotifications, showToast]);

  const markAsRead = useCallback(
    async (id) => {
      try {
        await apis.markRead(id);

        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );

        setServerUnreadCount((c) =>
          c === null ? null : Math.max(0, c - 1)
        );
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    },
    [setNotifications, apis]
  );

  const localUnreadCount = notifications.filter((n) => !n.isRead).length;

  const unreadCount =
    serverUnreadCount !== null ? serverUnreadCount : localUnreadCount;

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
  };
};