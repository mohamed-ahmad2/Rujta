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
        if (user?.role === "SuperAdmin") return;
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

    // ================= Listen for NewDrugRequest (SuperAdmin only) =================
    useEffect(() => {
        if (!connection) return;
        if (user?.role !== "SuperAdmin") return;

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
                const alreadyExists = prev.some((n) => n.id === dto.id);
                if (alreadyExists) return prev;
                return [dto, ...prev];
            });
            showToast({ title: dto.title, message: dto.message });
        };

        connection.off("NewDrugRequest");
        connection.on("NewDrugRequest", handleNewDrugRequest);

        return () => connection.off("NewDrugRequest", handleNewDrugRequest);
    }, [connection, user, setNotifications, showToast]);

    // ================= Listen for drug review result (Pharmacist only) =================
    // ✅ Use `connection` (admin hub) NOT pharmacistConnection (user hub)
    // ✅ Backend sends raw data — build the dto manually
    useEffect(() => {
        if (!connection) return;
        if (user?.role === "SuperAdmin") return; // SuperAdmin reviews, doesn't receive review results

        const handleReviewed = (data) => {
            console.log("💊 Drug request reviewed:", data);

            const isApproved = data.status === "Approved";
            const dto = {
                id: `drug-review-${data.requestId}-${Date.now()}`,
                title: isApproved ? "Drug Request Approved ✅" : "Drug Request Rejected ❌",
                message: isApproved
                    ? `"${data.drugName}" has been approved and added to the database.`
                    : `"${data.drugName}" was rejected. Reason: ${data.rejectionReason || "No reason provided"}`,
                createdAt: new Date().toISOString(),
                isRead: false,
            };

            setNotifications((prev) => {
                const alreadyExists = prev.some((n) => n.id === dto.id);
                if (alreadyExists) return prev;
                return [dto, ...prev];
            });

            showToast({ title: dto.title, message: dto.message });
        };

        connection.off("DrugRequestReviewed");
        connection.on("DrugRequestReviewed", handleReviewed);

        return () => connection.off("DrugRequestReviewed", handleReviewed);
    }, [connection, user, setNotifications, showToast]);

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

        return () => connection.off("NewNotification", handleNewNotification);
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