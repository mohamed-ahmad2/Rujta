// AdminNotificationsPage.jsx
import React, { useState, useMemo, useCallback } from "react";
import { useAdminNotifications } from "../hook/useAdminNotifications";

const FILTERS = ["all", "unread", "order", "cancel", "drug"];

const TAG_CLASSES = {
  order: "bg-[#EAF3DE] text-pr",
  cancel: "bg-[#FAECE7] text-[#993C1D]",
  drug: "bg-[#E3F2FD] text-[#1565C0]",
  update: "bg-page text-muted-foreground",
};

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"];

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

function getTag(title = "") {
  const t = title.toLowerCase();
  if (t.includes("cancel")) return "cancel";
  if (t.includes("drug") || t.includes("approved") || t.includes("rejected"))
    return "drug";
  if (t.includes("order") || t.includes("new")) return "order";
  return "update";
}

export default function AdminNotificationsPage() {
  const { notifications, unreadCount, loading, error, markAsRead } =
    useAdminNotifications();
  const [activeFilter, setActiveFilter] = useState("all");

  // ─── Filtering ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread")
      return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => getTag(n.title) === activeFilter);
  }, [notifications, activeFilter]);

  // ─── Single-pass grouping ──────────────────────────────────────────
  const { todayItems, earlierItems } = useMemo(() => {
    const today = [];
    const earlier = [];
    for (const n of filtered) {
      (isToday(n.createdAt) ? today : earlier).push(n);
    }
    return { todayItems: today, earlierItems: earlier };
  }, [filtered]);

  // ─── Mark all (parallel) ───────────────────────────────────────────
  const handleMarkAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    await Promise.all(unread.map((n) => markAsRead(n.id)));
  }, [notifications, markAsRead]);

  // ─── Loading skeleton ──────────────────────────────────────────────
  if (loading && notifications.length === 0) {
    return (
      <div className="h-full w-full space-y-3 px-6 py-8">
        {SKELETON_KEYS.map((key) => (
          <div
            key={key}
            className="h-20 animate-pulse rounded-2xl border border-border bg-white"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full w-full px-6 py-8">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-playfair text-3xl font-bold tracking-tight text-primary">
            Notifications
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

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 font-sans text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
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

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-secondary">
            <BellIcon />
          </div>
          <p className="mb-1 font-sans text-base font-semibold text-primary">
            {activeFilter === "unread"
              ? "No unread notifications"
              : "No notifications yet"}
          </p>
          <p className="font-sans text-sm text-muted-foreground">
            {activeFilter === "unread"
              ? "All notifications have been read."
              : "New orders, cancellations, and drug requests will appear here."}
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
  const tag = getTag(n.title);
  const tagClass = TAG_CLASSES[tag] || TAG_CLASSES.update;

  const handleClick = () => {
    if (!n.isRead) markAsRead(n.id);
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !n.isRead) {
      e.preventDefault();
      markAsRead(n.id);
    }
  };

  const iconBgClass =
    tag === "cancel"
      ? "bg-[#FAECE7]"
      : tag === "drug"
        ? "bg-[#E3F2FD]"
        : "bg-[#EAF3DE]";

  const renderIcon = () => {
    if (tag === "cancel") return <CancelIcon />;
    if (tag === "drug") return <DrugIcon />;
    return <OrderIcon />;
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
      {/* Icon */}
      <div
        className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${iconBgClass}`}
      >
        {renderIcon()}
      </div>

      {/* Body */}
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
          <span
            className={`rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold tracking-wide ${tagClass}`}
          >
            {tag}
          </span>
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

function OrderIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3C623C"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#993C1D"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function DrugIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1565C0"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}
