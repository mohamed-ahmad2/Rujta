import { useEffect, useState, useCallback, useContext, useMemo, useRef } from "react";
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  getPharmacyNotifications,
  getPharmacyUnreadCount,
  markPharmacyNotificationAsRead,
} from "../api/notificationsApi";
import { NotificationContext } from "../../../context/NotificationContext";
import { useAuth } from "../../auth/hooks/useAuth";

export const useNotifications = ({ isPharmacy = false } = {}) => {
  const { user } = useAuth();
  const { notifications, setNotifications, lastConnectedAt } =
    useContext(NotificationContext);

  const [loading, setLoading] = useState(false);
  const lastConnectedAtRef = useRef(null);

  const apis = useMemo(
    () =>
      isPharmacy
        ? {
            getList:  getPharmacyNotifications,
            getCount: getPharmacyUnreadCount,
            markRead: markPharmacyNotificationAsRead,
          }
        : {
            getList:  getMyNotifications,
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

      // MERGE: DB is source of truth for existing items,
      // but keep any real-time items not yet persisted to DB
      setNotifications((prev) => {
        const dbIds = new Set(fromDb.map((n) => n.id ?? n.Id));
        // Items only in local state (arrived via SignalR in the race window)
        const realtimeOnly = prev.filter((n) => !dbIds.has(n.id ?? n.Id));
        return [...fromDb, ...realtimeOnly];
      });
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, [user, setNotifications, apis]);

  const fetchUnreadCount = useCallback(async () => {}, []);

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Re-fetch on SignalR reconnect — but skip the very first connect
  // if we already have cached data, to avoid wiping real-time items
  useEffect(() => {
    if (!lastConnectedAt) return;
    if (lastConnectedAtRef.current === null && notifications.length > 0) {
      lastConnectedAtRef.current = lastConnectedAt;
      return;
    }
    lastConnectedAtRef.current = lastConnectedAt;
    fetchNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastConnectedAt]);

  // Re-fetch on tab focus
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (id) => {
      try {
        await apis.markRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    },
    [setNotifications, apis]
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
  };
};