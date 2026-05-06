// useAdminNotifications.jsx
import { useEffect, useState, useCallback, useContext, useRef } from "react";
import { NotificationContext } from "../../../../context/NotificationContext"; // ✅ غيرناه
import { ToastContext } from "../../../../context/ToastContext";
import { useAuth } from "../../../auth/hooks/useAuth";
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
} from "../../../notifications/api/notificationsApi";

/**
 * @param {Object} [options]
 * @param {(data: any) => void} [options.onNewDrugRequest]
 * @param {(data: any) => void} [options.onDrugRequestReviewed]
 */
export const useAdminNotifications = ({
  onNewDrugRequest,
  onDrugRequestReviewed,
} = {}) => {
  const { user } = useAuth();

  // ✅ Single SignalR connection — shared with NotificationProvider
  const { connection, notifications, setNotifications } =
    useContext(NotificationContext);
  const { showToast } = useContext(ToastContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverUnreadCount, setServerUnreadCount] = useState(null);

  const isSuperAdmin = user?.role === "SuperAdmin";

  // ─── Stable refs for external callbacks ──────────────────────────
  const onNewDrugRequestRef = useRef(onNewDrugRequest);
  const onDrugRequestReviewedRef = useRef(onDrugRequestReviewed);

  useEffect(() => {
    onNewDrugRequestRef.current = onNewDrugRequest;
    onDrugRequestReviewedRef.current = onDrugRequestReviewed;
  });

  // ─── Fetch notifications from DB ─────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    if (isSuperAdmin) return; // SuperAdmin uses realtime only

    setLoading(true);
    setError(null);
    try {
      const res = await getMyNotifications();
      const fromDb = res.data || [];
      if (fromDb.length > 0) setNotifications(fromDb);
    } catch (err) {
      console.error("Failed to fetch admin notifications", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user, isSuperAdmin, setNotifications]);

  // ─── Fetch unread count ──────────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    if (isSuperAdmin) return;

    try {
      const res = await getUnreadCount();
      setServerUnreadCount(res.data?.unreadCount ?? 0);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }, [user, isSuperAdmin]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // ─── Re-fetch on reconnect ───────────────────────────────────────
  useEffect(() => {
    if (!connection) return;

    const handleReconnected = () => {
      console.log("♻️ Admin SignalR reconnected — re-fetching");
      fetchNotifications();
      fetchUnreadCount();
    };

    connection.onreconnected(handleReconnected);
  }, [connection, fetchNotifications, fetchUnreadCount]);

  // ─── 🔥 NewDrugRequest (SuperAdmin) — REALTIME ──────────────────
  useEffect(() => {
    if (!connection || !isSuperAdmin) return;

    const handleNewDrugRequest = (data) => {
      console.log("💊 New drug request received:", data);

      const dto = {
        id: `drug-${data.requestId}-${Date.now()}`,
        title: "New Drug Request",
        message: `"${data.drugName}" requested by Pharmacy #${data.pharmacyId}`,
        createdAt: data.submittedAt,
        isRead: false,
      };

      setNotifications((prev) => {
        if (prev.some((n) => n.id === dto.id)) return prev;
        return [dto, ...prev];
      });

      setServerUnreadCount((c) => (c === null ? null : c + 1));
      showToast({ title: dto.title, message: dto.message });

      // ✅ Forward to ApprovalQueue (or any subscriber)
      try {
        onNewDrugRequestRef.current?.(data);
      } catch (e) {
        console.error("onNewDrugRequest callback error:", e);
      }
    };

    connection.on("NewDrugRequest", handleNewDrugRequest);
    return () => connection.off("NewDrugRequest", handleNewDrugRequest);
  }, [connection, isSuperAdmin, setNotifications, showToast]);

  // ─── DrugRequestReviewed ─────────────────────────────────────────
  useEffect(() => {
    if (!connection) return;

    const handleReviewed = (data) => {
      console.log("💊 Drug request reviewed:", data);

      // For pharmacist: build a notification DTO
      if (!isSuperAdmin) {
        const isApproved = data.status === "Approved";
        const dto = {
          id: `drug-review-${data.requestId}-${Date.now()}`,
          title: isApproved
            ? "Drug Request Approved ✅"
            : "Drug Request Rejected ❌",
          message: isApproved
            ? `"${data.drugName}" has been approved and added to the database.`
            : `"${data.drugName}" was rejected. Reason: ${
                data.rejectionReason || "No reason provided"
              }`,
          createdAt: new Date().toISOString(),
          isRead: false,
        };

        setNotifications((prev) => {
          if (prev.some((n) => n.id === dto.id)) return prev;
          return [dto, ...prev];
        });

        setServerUnreadCount((c) => (c === null ? null : c + 1));
        showToast({ title: dto.title, message: dto.message });
      }

      // ✅ Forward to subscriber regardless of role
      try {
        onDrugRequestReviewedRef.current?.(data);
      } catch (e) {
        console.error("onDrugRequestReviewed callback error:", e);
      }
    };

    connection.on("DrugRequestReviewed", handleReviewed);
    return () => connection.off("DrugRequestReviewed", handleReviewed);
  }, [connection, isSuperAdmin, setNotifications, showToast]);

  // ─── Generic NewNotification ─────────────────────────────────────
  useEffect(() => {
    if (!connection) return;

    const handleNewNotification = (dto) => {
      console.log("🔔 Admin notification received:", dto);

      setNotifications((prev) => {
        if (prev.some((n) => n.id === dto.id)) return prev;
        return [dto, ...prev];
      });

      setServerUnreadCount((c) => (c === null ? null : c + 1));
      showToast({ title: dto.title, message: dto.message });
    };

    connection.on("NewNotification", handleNewNotification);
    return () => connection.off("NewNotification", handleNewNotification);
  }, [connection, setNotifications, showToast]);

  // ─── Mark As Read (optimistic) ───────────────────────────────────
  const markAsRead = useCallback(
    async (id) => {
      const isClientOnly = typeof id === "string" && id.startsWith("drug-");

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setServerUnreadCount((c) => (c === null ? null : Math.max(0, c - 1)));

      if (isClientOnly) return;

      try {
        await markNotificationAsRead(id);
      } catch (err) {
        console.error("Failed to mark admin notification as read", err);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)),
        );
        setServerUnreadCount((c) => (c === null ? null : c + 1));
      }
    },
    [setNotifications],
  );

  const localUnreadCount = notifications.filter((n) => !n.isRead).length;
  const unreadCount =
    serverUnreadCount !== null ? serverUnreadCount : localUnreadCount;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
  };
};
