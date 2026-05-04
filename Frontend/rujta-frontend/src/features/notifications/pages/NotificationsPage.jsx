import React, { useState, useMemo, useCallback } from "react";
import { useNotifications } from "../hook/useNotifications";

const FILTERS = ["all", "unread"];

const TAG_CLASSES = {
  task: "bg-[#EAF3DE] text-pr",
  mention: "bg-[#E1F5EE] text-[#0F6E56]",
  update: "bg-page text-muted-foreground",
  alert: "bg-[#FAECE7] text-[#993C1D]",
};

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"];

function getInitials(title = "") {
  return title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function isToday(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export default function NotificationsPage({ isPharmacy = false }) {
  const { notifications, unreadCount, loading, markAsRead } = useNotifications({
    isPharmacy,
  });

  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = useMemo(() => {
    if (activeFilter === "unread")
      return notifications.filter((n) => !n.isRead);
    if (activeFilter !== "all")
      return notifications.filter((n) => n.tag === activeFilter);
    return notifications;
  }, [notifications, activeFilter]);

  const { todayItems, earlierItems } = useMemo(() => {
    const today = [];
    const earlier = [];
    for (const n of filtered) {
      (isToday(n.createdAt) ? today : earlier).push(n);
    }
    return { todayItems: today, earlierItems: earlier };
  }, [filtered]);

  const handleMarkAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    await Promise.all(unread.map((n) => markAsRead(n.id)));
  }, [notifications, markAsRead]);

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-page">
        <div className="mx-auto max-w-2xl space-y-3 px-6 py-10">
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="h-20 animate-pulse rounded-2xl border border-border bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
        {/* Header */}
        <div className="mb-7 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-playfair text-3xl font-bold tracking-tight text-primary">
              {isPharmacy ? "Pharmacy Notifications" : "Notifications"}
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 font-sans text-xs font-bold text-pr">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="rounded-lg border-2 border-secondary bg-white px-4 py-1.5 font-sans text-xs font-medium text-pr transition-all hover:bg-secondary hover:text-white"
            >
              Mark all as read
            </button>
          )}
        </div>

     
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full border-2 px-4 py-1.5 font-sans text-xs font-medium capitalize transition-all ${
                activeFilter === f
                  ? "border-secondary bg-secondary text-white"
                  : "border-border bg-white text-muted-foreground hover:border-secondary hover:text-pr"
              }`}
            >
              {f}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 font-bold">({unreadCount})</span>
              )}
            </button>
          ))}
        </div>

     
        {filtered.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-secondary">
              <BellIcon />
            </div>
            <p className="mb-1 font-sans text-base font-semibold text-primary">
              {activeFilter === "unread"
                ? "No unread notifications"
                : "You're all caught up"}
            </p>
            <p className="font-sans text-sm text-muted-foreground">
              {activeFilter === "unread"
                ? "All your notifications have been read."
                : "No notifications to show here."}
            </p>
          </div>
        )}


        {todayItems.length > 0 && (
          <Section label="Today" items={todayItems} markAsRead={markAsRead} />
        )}

  
        {earlierItems.length > 0 && (
          <Section
            label="Earlier"
            items={earlierItems}
            markAsRead={markAsRead}
          />
        )}
      </div>
    </div>
  );
}

function Section({ label, items, markAsRead }) {
  return (
    <div className="mb-2">
      <p className="mb-3 mt-6 font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
  const handleClick = () => {
    if (!n.isRead) markAsRead(n.id);
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !n.isRead) {
      e.preventDefault();
      markAsRead(n.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={n.isRead ? undefined : "button"}
      tabIndex={n.isRead ? undefined : 0}
      aria-label={n.isRead ? undefined : `Mark ${n.title} as read`}
      className={`flex animate-fade-up items-start gap-3.5 rounded-2xl border-2 bg-white p-4 transition-all ${
        n.isRead
          ? "cursor-default border-border opacity-60"
          : "cursor-pointer border-l-[3px] border-border border-l-secondary hover:border-secondary hover:shadow-[0_2px_12px_rgba(157,200,115,0.2)]"
      } `}
    >

      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#EAF3DE] font-sans text-xs font-bold text-pr">
        {getInitials(n.title)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="flex-1 truncate font-sans text-sm font-semibold text-primary">
            {n.title}
          </span>
          {!n.isRead && (
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-secondary" />
          )}
        </div>
        <p className="line-clamp-2 font-sans text-[13px] leading-snug text-muted-foreground">
          {n.message}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground">
            {formatTime(n.createdAt)}
          </span>
          {n.tag && (
            <span
              className={`rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold tracking-wide ${
                TAG_CLASSES[n.tag] || TAG_CLASSES.update
              }`}
            >
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
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9DC873"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
