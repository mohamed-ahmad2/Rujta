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
  const { connection, notifications, setNotifications, lastConnectedAt } =
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
      // ✅ always set, even if empty — so page clears stale data
      setNotifications(fromDb);
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

  // ✅ Initial fetch on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // ✅ Re-fetch every time SignalR connects or reconnects with fresh token
  useEffect(() => {
    if (!lastConnectedAt) return;
    fetchNotifications();
    fetchUnreadCount();
  }, [lastConnectedAt]);

  // ✅ Re-fetch when user returns to the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
        fetchUnreadCount();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchNotifications, fetchUnreadCount]);

  // ✅ Listen for real-time notifications
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
  }, [connection]);
  

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
useEffect(() => {
    console.log("🔌 connection changed:", connection?.state);
}, [connection]);

useEffect(() => {
    console.log("⏰ lastConnectedAt changed:", lastConnectedAt);
}, [lastConnectedAt]);
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