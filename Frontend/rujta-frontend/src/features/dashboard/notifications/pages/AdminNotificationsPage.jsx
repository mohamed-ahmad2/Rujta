import React, { useState, useMemo } from "react";
import { useAdminNotifications } from "../hook/useAdminNotifications";

const FILTERS = ["all", "unread", "order", "cancel"];

const TAG_CLASSES = {
    order:  "bg-[#EAF3DE] text-pr",
    cancel: "bg-[#FAECE7] text-[#993C1D]",
    update: "bg-page text-muted-foreground",
};

function formatTime(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return "Yesterday";
}

function isToday(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr).toDateString() === new Date().toDateString();
}

function getTag(title = "") {
    const t = title.toLowerCase();
    if (t.includes("cancel")) return "cancel";
    if (t.includes("order") || t.includes("new")) return "order";
    return "update";
}

export default function AdminNotificationsPage() {
    const { notifications, markAsRead } = useAdminNotifications();
    const [activeFilter, setActiveFilter] = useState("all");

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const filtered = useMemo(() => {
        if (activeFilter === "unread") return notifications.filter((n) => !n.isRead);
        if (activeFilter === "order") return notifications.filter((n) => getTag(n.title) === "order");
        if (activeFilter === "cancel") return notifications.filter((n) => getTag(n.title) === "cancel");
        return notifications;
    }, [notifications, activeFilter]);

    const todayItems = filtered.filter((n) => isToday(n.createdAt));
    const earlierItems = filtered.filter((n) => !isToday(n.createdAt));

    const handleMarkAllRead = () =>
        notifications.filter((n) => !n.isRead).forEach((n) => markAsRead(n.id));

return (
    <div className="w-full h-full px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-7">
            <div className="flex items-center gap-3">
                <h1 className="font-playfair text-3xl font-bold text-primary tracking-tight">
                    Notifications
                </h1>
                {unreadCount > 0 && (
                    <span className="bg-secondary text-pr text-xs font-bold px-2.5 py-0.5 rounded-full font-sans">
                        {unreadCount}
                    </span>
                )}
            </div>
            {unreadCount > 0 && (
                <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-medium text-pr bg-white border-2 border-secondary rounded-lg px-4 py-1.5 hover:bg-secondary hover:text-white transition-all font-sans"
                >
                    Mark all as read
                </button>
            )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-8">
            {FILTERS.map((f) => (
                <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`text-xs font-medium font-sans px-4 py-1.5 rounded-full border-2 transition-all capitalize
                        ${activeFilter === f
                            ? "bg-secondary border-secondary text-white"
                            : "bg-white border-border text-muted-foreground hover:border-secondary hover:text-pr"
                        }`}
                >
                    {f}
                </button>
            ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-24">
                <div className="w-14 h-14 rounded-full border-2 border-secondary flex items-center justify-center mb-4">
                    <BellIcon />
                </div>
                <p className="font-sans font-semibold text-base text-primary mb-1">
                    No notifications yet
                </p>
                <p className="font-sans text-sm text-muted-foreground">
                    New orders and cancellations will appear here.
                </p>
            </div>
        )}

        {/* Today */}
        {todayItems.length > 0 && (
            <Section label="Today" items={todayItems} markAsRead={markAsRead} />
        )}

        {/* Earlier */}
        {earlierItems.length > 0 && (
            <Section label="Earlier" items={earlierItems} markAsRead={markAsRead} />
        )}

    </div>
);
}

function Section({ label, items, markAsRead }) {
    return (
        <div className="mb-2">
            <p className="font-sans text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3 mt-6">
                {label}
            </p>
            <div className="flex flex-col gap-2">
                {items.map((n) => (
                    <NotifCard key={n.id} n={n} markAsRead={markAsRead} />
                ))}
            </div>
        </div>
    );
}

function NotifCard({ n, markAsRead }) {
    const tag = getTag(n.title);
    const tagClass = TAG_CLASSES[tag] || TAG_CLASSES.update;

    return (
        <div
            onClick={() => !n.isRead && markAsRead(n.id)}
            className={`
                flex gap-3.5 items-start p-4 bg-white rounded-2xl border-2 transition-all animate-fade-up
                ${n.isRead
                    ? "border-border opacity-60 cursor-default"
                    : "border-l-[3px] border-l-secondary border-border cursor-pointer hover:border-secondary hover:shadow-[0_2px_12px_rgba(157,200,115,0.2)]"
                }
            `}
        >
            {/* Icon */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                ${tag === "cancel" ? "bg-[#FAECE7]" : "bg-[#EAF3DE]"}`}
            >
                {tag === "cancel" ? <CancelIcon /> : <OrderIcon />}
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans text-sm font-semibold text-primary truncate flex-1">
                        {n.title}
                    </span>
                    {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                    )}
                </div>
                <p className="font-sans text-[13px] text-muted-foreground leading-snug line-clamp-2">
                    {n.message}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                    <span className="font-mono text-[11px] text-muted-foreground">
                        {formatTime(n.createdAt)}
                    </span>
                    <span className={`font-sans text-[10px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide ${tagClass}`}>
                        {tag}
                    </span>
                </div>
            </div>
        </div>
    );
}

function BellIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9DC873" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function OrderIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3C623C" strokeWidth="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    );
}

function CancelIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#993C1D" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    );
}