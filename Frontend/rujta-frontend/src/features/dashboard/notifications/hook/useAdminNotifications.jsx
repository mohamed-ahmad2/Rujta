import { useEffect, useCallback, useContext } from "react";
import { AdminNotificationContext } from "../../../../context/AdminNotificationContext";
import { ToastContext } from "../../../../context/ToastContext";
import { useAuth } from "../../../auth/hooks/useAuth";
import {
    getAdminNotifications,
    markAdminNotificationAsRead,
} from "../api/adminNotificationsApi";

export const useAdminNotifications = () => {
    const { user } = useAuth();
    const { connection, notifications, setNotifications } = useContext(AdminNotificationContext);
    const { showToast } = useContext(ToastContext);

    // ================= Fetch from DB =================
    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await getAdminNotifications();
            const fromDb = res.data || [];
            if (fromDb.length > 0) {
                setNotifications(fromDb);
            }
        } catch (err) {
            console.error("Failed to fetch admin notifications", err);
        }
    }, [user, setNotifications]);

    // ================= Initial fetch =================
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // ================= Re-fetch on reconnect =================
    useEffect(() => {
        if (!connection) return;
        connection.onreconnected(() => {
            console.log("♻️ Admin SignalR reconnected — re-fetching");
            fetchNotifications();
        });
    }, [connection, fetchNotifications]);

    // ================= Listen for real-time notifications =================
    useEffect(() => {
        if (!connection) return;

        const handleNewNotification = (dto) => {
            console.log("🔔 Admin notification received:", dto);

            setNotifications((prev) => {
                const alreadyExists = prev.some((n) => n.id === dto.id);
                if (alreadyExists) return prev;
                return [dto, ...prev];
            });

            showToast({ title: dto.title, message: dto.message });
        };

        connection.off("NewNotification");
        connection.on("NewNotification", handleNewNotification);

        return () => {
            connection.off("NewNotification", handleNewNotification);
        };
    }, [connection, setNotifications, showToast]);

    // ================= Mark As Read =================
    const markAsRead = useCallback(async (id) => {
        try {
            await markAdminNotificationAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (err) {
            console.error("Failed to mark admin notification as read", err);
        }
    }, [setNotifications]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
    };
};