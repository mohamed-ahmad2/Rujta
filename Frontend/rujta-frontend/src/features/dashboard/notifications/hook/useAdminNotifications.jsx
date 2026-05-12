import { useEffect, useState, useCallback, useContext, useRef } from "react";
import { NotificationContext } from "../../../../context/NotificationContext";
import { useAuth } from "../../../auth/hooks/useAuth";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../../../notifications/api/notificationsApi";

export const useAdminNotifications = ({
  onNewDrugRequest,
  onDrugRequestReviewed,
} = {}) => {
  const { user } = useAuth();

  const { connection, notifications, setNotifications, lastConnectedAt } =
    useContext(NotificationContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Refs so handlers always see the latest values without re-registering ──
  const isSuperAdminRef          = useRef(false);
  const setNotificationsRef      = useRef(setNotifications);
  const onNewDrugRequestRef      = useRef(onNewDrugRequest);
  const onDrugRequestReviewedRef = useRef(onDrugRequestReviewed);

  useEffect(() => {
    isSuperAdminRef.current          = user?.role === "SuperAdmin";
    setNotificationsRef.current      = setNotifications;
    onNewDrugRequestRef.current      = onNewDrugRequest;
    onDrugRequestReviewedRef.current = onDrugRequestReviewed;
  });

  const isSuperAdmin = user?.role === "SuperAdmin";

  // ─── Fetch from DB ────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user || isSuperAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const res    = await getMyNotifications();
      const fromDb = res.data || [];
      setNotifications((prev) => {
        const dbIds        = new Set(fromDb.map((n) => n.id ?? n.Id));
        const realtimeOnly = prev.filter((n) => !dbIds.has(n.id ?? n.Id));
        return [...fromDb, ...realtimeOnly];
      });
    } catch (err) {
      console.error("Failed to fetch admin notifications", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user, isSuperAdmin, setNotifications]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    if (!lastConnectedAt) return;
    fetchNotifications();
  }, [lastConnectedAt, fetchNotifications]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [fetchNotifications]);

  // ─── SignalR handlers — deps = [connection] ONLY ──────────────────────────
  //
  // Previously deps included `isSuperAdmin` and `setNotifications`.
  // Every time those changed, the effect tore down and re-registered the handler.
  // Combined with `Date.now()` in the DTO id (always unique), the duplicate
  // guard `prev.some(n => n.id === dto.id)` never fired → same notification
  // appeared once per registration = 3 times in your screenshot.
  //
  // Fix:
  //   1. deps = [connection] only — handler registered exactly once per connection
  //   2. Stable IDs (no Date.now()) — duplicate guard works correctly
  //   3. Read isSuperAdmin and setNotifications via refs inside the handler

  useEffect(() => {
    if (!connection) return;

    // ── NewDrugRequest (SuperAdmin only) ──
    const handleNewDrugRequest = (data) => {
      if (!isSuperAdminRef.current) return;
      console.log("💊 NewDrugRequest received:", data);

      const dto = {
        // Stable ID — no Date.now()
        id:        `drug-${data.requestId}`,
        title:     "New Drug Request",
        message:   `"${data.drugName}" requested by Pharmacy #${data.pharmacyId}`,
        createdAt: data.submittedAt,
        isRead:    false,
      };

      setNotificationsRef.current((prev) => {
        if (prev.some((n) => n.id === dto.id)) return prev; // duplicate guard works now
        return [dto, ...prev];
      });

      try { onNewDrugRequestRef.current?.(data); } catch (e) { console.error(e); }
    };

    // ── DrugRequestReviewed ──
    const handleDrugRequestReviewed = (data) => {
      console.log("💊 DrugRequestReviewed received:", data);

      if (!isSuperAdminRef.current) {
        const isApproved = data.status === "Approved";
        const dto = {
          // Stable ID — no Date.now()
          id:        `drug-review-${data.requestId}`,
          title:     isApproved ? "Drug Request Approved ✅" : "Drug Request Rejected ❌",
          message:   isApproved
            ? `"${data.drugName}" has been approved and added to the database.`
            : `"${data.drugName}" was rejected. Reason: ${data.rejectionReason || "No reason provided"}`,
          createdAt: new Date().toISOString(),
          isRead:    false,
        };

        setNotificationsRef.current((prev) => {
          if (prev.some((n) => n.id === dto.id)) return prev; // duplicate guard works now
          return [dto, ...prev];
        });
      }

      try { onDrugRequestReviewedRef.current?.(data); } catch (e) { console.error(e); }
    };

    connection.on("NewDrugRequest",       handleNewDrugRequest);
    connection.on("DrugRequestReviewed",  handleDrugRequestReviewed);

    return () => {
      connection.off("NewDrugRequest",      handleNewDrugRequest);
      connection.off("DrugRequestReviewed", handleDrugRequestReviewed);
    };
  }, [connection]); // ← only connection; everything else accessed via refs

  // ─── Mark As Read ─────────────────────────────────────────────────────────
  const markAsRead = useCallback(
    async (id) => {
      const isClientOnly = typeof id === "string" && id.startsWith("drug-");

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );

      if (isClientOnly) return;

      try {
        await markNotificationAsRead(id);
      } catch (err) {
        console.error("Failed to mark admin notification as read", err);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
        );
      }
    },
    [setNotifications]
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
  };
};