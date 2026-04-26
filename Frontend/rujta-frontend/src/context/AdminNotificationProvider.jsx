import React, { useEffect, useState, useCallback, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { AdminNotificationContext } from "./AdminNotificationContext";
import { useAuth } from "../features/auth/hooks/useAuth";
import { getAccessToken, subscribeTokenChange } from "../authProvider/authTokenProvider";

function getStorageKey() {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        const pharmacyId = payload.PharmacyId || payload.pharmacyId || null;
        return pharmacyId ? `admin_notifications_${pharmacyId}` : null;
    } catch {
        return null;
    }
}

export const AdminNotificationProvider = ({ children }) => {
    const { user, loading } = useAuth();
    const connectionRef = useRef(null);
    const startingRef = useRef(false);
    const [connection, setConnection] = useState(null);

    const isPharmacyAdmin = user?.role === "Pharmacy" ||
                            user?.role === "Admin" ||
                            user?.role === "PharmacyAdmin";

    // ✅ Load from localStorage immediately on first render
    const [notifications, setNotificationsState] = useState(() => {
        try {
            const key = getStorageKey();
            if (!key) return [];
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // ✅ Wrapped setter — always saves to localStorage
    const setNotifications = useCallback((updater) => {
        setNotificationsState((prev) => {
            const next = typeof updater === "function" ? updater(prev) : updater;
            try {
                const key = getStorageKey();
                if (key) localStorage.setItem(key, JSON.stringify(next));
            } catch {}
            return next;
        });
    }, []);

    useEffect(() => {
        connectionRef.current = connection;
    }, [connection]);

    const cleanupConnection = useCallback(async () => {
        const conn = connectionRef.current;
        if (!conn) return;
        try {
            conn.off();
            await conn.stop();
        } catch (err) {
            console.error("❌ Admin SignalR stop error:", err);
        } finally {
            connectionRef.current = null;
            setConnection(null);
        }
    }, []);

    const startHubConnection = useCallback(async () => {
        if (startingRef.current) return;
        if (!user || loading) return;
        if (!isPharmacyAdmin) return; // ✅ only connect for pharmacy admin
        if (connectionRef.current) return;

        const token = getAccessToken();
        if (!token) return;

        startingRef.current = true;

        const hubUrl =
            import.meta.env.MODE === "development"
                ? "/hubs/notifications"
                : "https://rujta.runasp.net/hubs/notifications";

        const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => getAccessToken(),
                withCredentials: true,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000])
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        hubConnection.on("Error", (msg) => {
            console.error("⚠️ Admin SignalR error:", msg);
        });

        hubConnection.onclose((err) => {
            console.warn("🔴 Admin connection closed:", err);
            connectionRef.current = null;
            setConnection(null);
        });

        hubConnection.onreconnected(() => {
            console.log("✅ Admin SignalR reconnected");
            setConnection(hubConnection);
        });

        try {
            await hubConnection.start();
            console.log("✅ Admin SignalR connected");
            connectionRef.current = hubConnection;
            setConnection(hubConnection);
        } catch (err) {
            console.error("❌ Admin SignalR start failed:", err);
        } finally {
            startingRef.current = false;
        }
    }, [user, loading, isPharmacyAdmin]);

    useEffect(() => {
        const unsubscribe = subscribeTokenChange(async (token) => {
            if (!token) {
                await cleanupConnection();
                setNotificationsState([]);
            } else {
                await startHubConnection();
            }
        });
        return unsubscribe;
    }, [cleanupConnection, startHubConnection]);

    useEffect(() => {
        startHubConnection();
    }, [startHubConnection]);

    return (
        <AdminNotificationContext.Provider value={{ connection, notifications, setNotifications }}>
            {children}
        </AdminNotificationContext.Provider>
    );
};