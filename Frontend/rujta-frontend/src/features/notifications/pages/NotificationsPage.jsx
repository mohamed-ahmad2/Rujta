import React, { useState, useMemo } from "react";
import { useNotifications } from "../hook/useNotifications";

const FILTERS = ["all", "unread"];

const TAG_CLASSES = {
  task:    "bg-[#EAF3DE] text-pr",
  mention: "bg-[#E1F5EE] text-[#0F6E56]",
  update:  "bg-page text-muted-foreground",
  alert:   "bg-[#FAECE7] text-[#993C1D]",
};

function getInitials(title = "") {
  return title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

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

export default function NotificationsPage() {
  const { notifications, loading, markAsRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = useMemo(() => {
    if (activeFilter === "unread") return notifications.filter((n) => !n.isRead);
    if (activeFilter !== "all") return notifications.filter((n) => n.tag === activeFilter);
    return notifications;
  }, [notifications, activeFilter]);

  const todayItems = filtered.filter((n) => isToday(n.createdAt));
  const earlierItems = filtered.filter((n) => !isToday(n.createdAt));

  const handleMarkAllRead = () =>
    notifications.filter((n) => !n.isRead).forEach((n) => markAsRead(n.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-page">
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white border border-border animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col min-h-screen">

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
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <div className="w-14 h-14 rounded-full border-2 border-secondary flex items-center justify-center mb-4">
              <BellIcon />
            </div>
            <p className="font-sans font-semibold text-base text-primary mb-1">You're all caught up</p>
            <p className="font-sans text-sm text-muted-foreground">No notifications to show here.</p>
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
        {items.map((n) => <NotifCard key={n.id} n={n} markAsRead={markAsRead} />)}
      </div>
    </div>
  );
}

function NotifCard({ n, markAsRead }) {
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
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-[#EAF3DE] text-pr flex items-center justify-center text-xs font-bold font-sans flex-shrink-0 mt-0.5">
        {getInitials(n.title)}
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
          {n.tag && (
            <span className={`font-sans text-[10px] font-semibold px-2.5 py-0.5 rounded-full tracking-wide ${TAG_CLASSES[n.tag] || TAG_CLASSES.update}`}>
              {n.tag}
            </span>
          )}
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