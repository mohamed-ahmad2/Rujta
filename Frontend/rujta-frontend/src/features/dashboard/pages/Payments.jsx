import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  Megaphone,
  CreditCard,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Banknote,
  RotateCcw,
} from "lucide-react";
import { usePayment, usePaymobRedirect } from "../../payment/hooks/usePayment";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n || 0).toLocaleString("en-EG");

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const daysLeft = (endDate) => {
  if (!endDate) return 0;
  const diff = new Date(endDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ─── Payment Result Banner ────────────────────────────────────────────────────
// Shown after Paymob redirects the user back to this page

function PaymentResultBanner({ result, txId, onDismiss }) {
  if (!result) return null;
  const isSuccess = result === "success";
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl px-5 py-4 text-sm font-medium shadow-sm ${
        isSuccess
          ? "border border-green-200 bg-green-50 text-green-800"
          : "border border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <div className="flex items-center gap-3">
        {isSuccess ? (
          <CheckCircle2 size={20} className="flex-shrink-0 text-green-500" />
        ) : (
          <XCircle size={20} className="flex-shrink-0 text-red-500" />
        )}
        <span>
          {isSuccess
            ? `Payment successful! Your order has been created and confirmed.${txId ? ` (Ref: ${txId})` : ""}`
            : `Payment failed or was cancelled.${txId ? ` (Ref: ${txId})` : ""} No order was placed. Please try again.`}
        </span>
      </div>
      <button
        onClick={onDismiss}
        className="ml-4 flex-shrink-0 text-xs underline opacity-70 hover:opacity-100"
      >
        Dismiss
      </button>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
// Maps PaymentStatus enum values from backend

function StatusBadge({ status }) {
  const map = {
    // PaymentStatus enum values from backend
    success: {
      label: "Success",
      cls: "bg-green-100 text-green-700",
      dot: "bg-green-500",
    },
    pending: {
      label: "Pending",
      cls: "bg-yellow-100 text-yellow-700",
      dot: "bg-yellow-400",
    },
    failed: {
      label: "Failed",
      cls: "bg-red-100 text-red-600",
      dot: "bg-red-500",
    },
    refunded: {
      label: "Refunded",
      cls: "bg-purple-100 text-purple-700",
      dot: "bg-purple-500",
    },
    // Legacy / subscription-specific labels
    active: {
      label: "Active",
      cls: "bg-green-100 text-green-700",
      dot: "bg-green-500",
    },
    expired: {
      label: "Expired",
      cls: "bg-gray-100 text-gray-500",
      dot: "bg-gray-400",
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-red-100 text-red-600",
      dot: "bg-red-500",
    },
    paid: {
      label: "Paid",
      cls: "bg-green-100 text-green-700",
      dot: "bg-green-500",
    },
  };
  const s = map[String(status || "").toLowerCase()] || map.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Payment Method Badge ─────────────────────────────────────────────────────
// Maps PaymentMethod enum: 0=Cash, 1=Payment (Paymob)

function MethodBadge({ method }) {
  const m = String(method ?? "").toLowerCase();
  // "cash" string or enum int 0
  if (m === "cash" || m === "0")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
        <Banknote className="h-3 w-3" /> Cash
      </span>
    );
  // "payment" string or enum int 1
  if (m === "payment" || m === "1")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
        <CreditCard className="h-3 w-3" /> Online
      </span>
    );
  return <span className="text-xs text-gray-400">—</span>;
}

// ─── Type Badge ───────────────────────────────────────────────────────────────
// Maps PaymentType enum: Order | Subscription | Ad

function TypeBadge({ type }) {
  const t = String(type || "").toLowerCase();
  if (t === "subscription")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
        <ShieldCheck className="h-3 w-3" /> Sub
      </span>
    );
  if (t === "ad")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <Megaphone className="h-3 w-3" /> Ad
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
      <CreditCard className="h-3 w-3" /> Order
    </span>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct, color = "#9DC873" }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: color,
        }}
      />
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: iconBg }}
      >
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold leading-tight text-gray-800">{value}</p>
        {sub && <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Subscription Card ────────────────────────────────────────────────────────

function SubscriptionCard({ subscriptions }) {
  const sub =
    subscriptions.find(
      (s) => String(s.status || "").toLowerCase() === "active",
    ) ||
    subscriptions[0] ||
    null;

  if (!sub) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-400 shadow-sm">
        No active subscription found.
      </div>
    );
  }

  const endDate = sub.endDate ?? sub.expiresAt ?? sub.renewalDate;
  const left = daysLeft(endDate);
  const total = sub.daysTotal ?? sub.duration ?? 365;
  const used = Math.max(0, total - left);
  const pct = Math.round((used / total) * 100);
  const urgentColor = left < 30 ? "#ef4444" : left < 60 ? "#f59e0b" : "#9DC873";

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
            <ShieldCheck size={22} className="text-green-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800">
              {sub.planName ?? sub.name ?? "Dashboard Access"}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {sub.plan ?? sub.planType ?? "—"} plan
            </p>
          </div>
        </div>
        <StatusBadge status={sub.status} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Amount paid",
            value: `${fmt(sub.amount ?? sub.price)} EGP`,
          },
          {
            label: "Start date",
            value: fmtDate(sub.startDate ?? sub.createdAt),
          },
          { label: "Renewal date", value: fmtDate(endDate) },
          {
            label: "Days remaining",
            value: `${left} days`,
            valueColor: urgentColor,
          },
        ].map((r) => (
          <div key={r.label} className="rounded-xl bg-gray-50 px-3 py-2.5">
            <p className="text-[11px] text-gray-400">{r.label}</p>
            <p
              className="mt-0.5 text-sm font-semibold text-gray-800"
              style={r.valueColor ? { color: r.valueColor } : {}}
            >
              {r.value}
            </p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-1.5 flex justify-between text-xs text-gray-400">
          <span>Time elapsed</span>
          <span>{pct}%</span>
        </div>
        <ProgressBar pct={pct} color={urgentColor} />
      </div>
    </div>
  );
}

// ─── Ad Card ──────────────────────────────────────────────────────────────────

function AdCard({ ad }) {
  const endDate = ad.endDate ?? ad.expiresAt;
  const left = daysLeft(endDate);
  const total = ad.daysTotal ?? ad.duration ?? 30;
  const used = Math.max(0, total - left);
  const isExpired =
    String(ad.status || "").toLowerCase() === "expired" || left === 0;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        isExpired
          ? "border-gray-100 bg-gray-50 opacity-70"
          : "border-gray-100 bg-white shadow-sm"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base"
            style={{ background: ad.color ?? "#fef3c7" }}
          >
            {ad.emoji ?? "📢"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight text-gray-800">
              {ad.title ?? ad.adTitle ?? ad.name ?? "Ad Campaign"}
            </p>
            <p className="truncate text-[11px] text-gray-400">
              {ad.target ?? ad.targetProduct ?? ad.category ?? ""}
            </p>
          </div>
        </div>
        <StatusBadge status={ad.status} />
      </div>

      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
        <span>
          {ad.plan ?? `${total} days`} · {fmt(ad.amount ?? ad.price)} EGP
        </span>
        {!isExpired ? (
          <span
            className="font-medium"
            style={{ color: left <= 3 ? "#ef4444" : "#f59e0b" }}
          >
            {left} days left
          </span>
        ) : (
          <span className="text-gray-400">Ended {fmtDate(endDate)}</span>
        )}
      </div>

      <ProgressBar
        pct={Math.round((used / total) * 100)}
        color={isExpired ? "#d1d5db" : "#f59e0b"}
      />
    </div>
  );
}

// ─── History Table ────────────────────────────────────────────────────────────
// Displays PaymentSummaryDto[] from GET /api/payments/my

const ITEMS_PER_PAGE = 5;

function HistoryTable({ data }) {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = data;
    if (typeFilter !== "all")
      list = list.filter(
        (r) => String(r.type ?? "").toLowerCase() === typeFilter,
      );
    if (statusFilter !== "all")
      list = list.filter(
        (r) => String(r.status ?? "").toLowerCase() === statusFilter,
      );
    return list;
  }, [data, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageData = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleExport = () => {
    const rows = [
      [
        "ID",
        "Date",
        "Type",
        "Amount (EGP)",
        "Currency",
        "Status",
        "Order ID",
        "Subscription ID",
        "Ad ID",
        "Paymob Tx ID",
      ],
      ...filtered.map((r) => [
        r.id ?? "—",
        fmtDate(r.createdAt),
        r.type ?? "—",
        r.amount ?? 0,
        r.currency ?? "EGP",
        r.status ?? "—",
        r.orderId ?? "—",
        r.subscriptionId ?? "—",
        r.adId ?? "—",
        r.paymobTransactionId ?? "—",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payment-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-secondary" />
          <p className="font-bold text-gray-800">Payment History</p>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {filtered.length}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Type filter — matches PaymentType enum */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="all">All types</option>
            <option value="order">Order</option>
            <option value="subscription">Subscription</option>
            <option value="ad">Ad</option>
          </select>
          {/* Status filter — matches PaymentStatus enum */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50"
          >
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Table — columns match PaymentSummaryDto */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                "ID",
                "Date",
                "Type",
                "Amount",
                "Currency",
                "Status",
                "Reference",
              ].map((h) => (
                <th
                  key={h}
                  className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              pageData.map((r, idx) => {
                // PaymentSummaryDto fields from backend
                const ref = r.orderId
                  ? `Order #${r.orderId}`
                  : r.subscriptionId
                    ? `Sub #${r.subscriptionId}`
                    : r.adId
                      ? `Ad #${r.adId}`
                      : r.paymobTransactionId
                        ? r.paymobTransactionId
                        : "—";

                return (
                  <tr
                    key={r.id ?? idx}
                    className="border-b border-gray-50 transition hover:bg-gray-50/60"
                  >
                    <td className="py-3 pr-4 font-mono text-xs text-gray-400">
                      #{r.id}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-xs text-gray-500">
                      {fmtDate(r.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <TypeBadge type={r.type} />
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-sm font-semibold text-gray-800">
                      {fmt(r.amount)} EGP
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-500">
                      {r.currency ?? "EGP"}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td
                      className="max-w-[140px] truncate py-3 font-mono text-[11px] text-gray-400"
                      title={ref}
                    >
                      {ref}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-lg px-2.5 py-1 text-xs transition ${
                  page === p
                    ? "bg-secondary text-white"
                    : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />
  );
}

// ─── Main Payments Page ───────────────────────────────────────────────────────

export default function Payments() {
  const allPayments = usePayment();
  const subPayments = usePayment();
  const adPayments = usePayment();

  const refetchAll = () => {
    allPayments.fetchMyPayments();
    subPayments.fetchSubscriptionPayments();
    adPayments.fetchAdPayments();
  };

  useEffect(() => {
    refetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Paymob redirect handling ──────────────────────────────────────────────
  // After user pays (or fails), Paymob redirects to UserRedirectUrl with
  // ?success=true|false&id=<paymobOrderId> query params.
  // The server has already handled the webhook by this point.
  const {
    result: callbackResult,
    txId: callbackTxId,
    dismiss,
  } = usePaymobRedirect({ onSuccess: refetchAll });

  const isLoading =
    allPayments.loading || subPayments.loading || adPayments.loading;
  const hasError = allPayments.error || subPayments.error || adPayments.error;

  // ── Derived values from PaymentSummaryDto[] ──
  const allList = allPayments.payments ?? [];

  // Total confirmed payments (PaymentStatus.Success)
  const totalPaid = allList
    .filter((r) => String(r.status ?? "").toLowerCase() === "success")
    .reduce((s, r) => s + (r.amount ?? 0), 0);

  // Total refunded (PaymentStatus.Refunded — cancelled after Paymob payment)
  const totalRefunded = allList
    .filter((r) => String(r.status ?? "").toLowerCase() === "refunded")
    .reduce((s, r) => s + (r.amount ?? 0), 0);

  const activeAds = (adPayments.payments ?? []).filter(
    (a) => String(a.status || "").toLowerCase() === "active",
  ).length;

  const activeSub = (subPayments.payments ?? []).find(
    (s) => String(s.status || "").toLowerCase() === "active",
  );
  const subLeft = activeSub
    ? daysLeft(
        activeSub.endDate ?? activeSub.expiresAt ?? activeSub.renewalDate,
      )
    : 0;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-5 p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={15} className="animate-spin" /> Loading your payment
          data…
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (hasError) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 p-3 py-20 sm:p-4 md:p-6">
        <AlertTriangle size={32} className="text-red-400" />
        <p className="text-center text-sm text-gray-600">
          {allPayments.error ?? subPayments.error ?? adPayments.error}
        </p>
        <button
          onClick={refetchAll}
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-3 sm:p-4 md:p-6">
      {/* Paymob redirect result banner */}
      <PaymentResultBanner
        result={callbackResult}
        txId={callbackTxId}
        onDismiss={dismiss}
      />

      {/* Refresh */}
      <div className="flex justify-end">
        <button
          onClick={refetchAll}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          iconBg="#dcfce7"
          iconColor="#16a34a"
          label="Total paid (confirmed)"
          value={`${fmt(totalPaid)} EGP`}
          sub={
            totalRefunded > 0
              ? `${fmt(totalRefunded)} EGP refunded`
              : "All time"
          }
        />
        <MetricCard
          icon={ShieldCheck}
          iconBg="#dbeafe"
          iconColor="#2563eb"
          label="Subscription"
          value={
            activeSub?.planName ??
            activeSub?.plan ??
            (activeSub ? "Active" : "—")
          }
          sub={
            activeSub
              ? `Renews ${fmtDate(activeSub.endDate ?? activeSub.expiresAt)}`
              : "No active plan"
          }
        />
        <MetricCard
          icon={Clock}
          iconBg={subLeft < 30 ? "#fee2e2" : "#fef3c7"}
          iconColor={subLeft < 30 ? "#dc2626" : "#d97706"}
          label="Days left on plan"
          value={activeSub ? subLeft : "—"}
          sub={
            !activeSub
              ? "No active plan"
              : subLeft < 30
                ? "Renew soon!"
                : "Subscription active"
          }
        />
        <MetricCard
          icon={Zap}
          iconBg="#fef3c7"
          iconColor="#d97706"
          label="Active ads"
          value={activeAds}
          sub={`${(adPayments.payments ?? []).length} total campaigns`}
        />
      </div>

      {/* Refund notice — only shown when there are refunded payments */}
      {totalRefunded > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm text-purple-700">
          <RotateCcw size={16} className="flex-shrink-0" />
          <span>
            <strong>{fmt(totalRefunded)} EGP</strong> in refunds have been
            initiated for cancelled online orders. Refunds typically appear
            within 3–5 business days.
          </span>
        </div>
      )}

      {/* Subscription + Ads */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SubscriptionCard subscriptions={subPayments.payments ?? []} />

        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Megaphone size={16} className="text-secondary" />
            <p className="text-sm font-semibold text-gray-700">Ad Campaigns</p>
            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              {activeAds} active
            </span>
          </div>
          {(adPayments.payments ?? []).length === 0 ? (
            <p className="px-1 text-sm text-gray-400">No ad campaigns yet.</p>
          ) : (
            (adPayments.payments ?? []).map((ad, i) => (
              <AdCard key={ad.id ?? i} ad={ad} />
            ))
          )}
        </div>
      </div>

      {/* Full history */}
      <HistoryTable data={allList} />
    </div>
  );
}
