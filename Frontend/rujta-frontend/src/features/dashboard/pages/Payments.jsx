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
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { usePayments } from "../../payments/hooks/usePayments";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n).toLocaleString("en-EG");

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

// ─── Normalize helpers ────────────────────────────────────────────────────────

const normalizeSubscription = (raw) => {
  if (!raw) return null;
  const start = raw.startDate  || raw.start_date  || raw.createdAt;
  const end   = raw.endDate    || raw.end_date    || raw.expiryDate || raw.expiry_date;
  const total = raw.daysTotal  || raw.days_total  || raw.durationDays || 365;

  const usedRaw = raw.daysUsed || raw.days_used;
  const used =
    usedRaw != null
      ? usedRaw
      : start
      ? Math.max(0, Math.ceil((new Date() - new Date(start)) / (1000 * 60 * 60 * 24)))
      : 0;

  return {
    plan:      raw.plan      || raw.planName || "Yearly",
    amount:    raw.amount    || raw.price    || 0,
    currency:  raw.currency  || "EGP",
    startDate: start,
    endDate:   end,
    status:    raw.status    || "active",
    daysTotal: total,
    daysUsed:  Math.min(used, total),
  };
};

const normalizeAd = (raw, idx) => {
  const endDate   = raw.endDate   || raw.end_date;
  const startDate = raw.startDate || raw.start_date;
  const daysTotal = raw.daysTotal || raw.days_total || raw.durationDays || 7;

  const usedRaw = raw.daysUsed || raw.days_used;
  const daysUsed =
    usedRaw != null
      ? usedRaw
      : startDate
      ? Math.max(0, Math.ceil((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24)))
      : 0;

  // حساب الـ status الصح بناءً على الـ endDate مش من الـ API
  const computedLeft = daysLeft(endDate);
  const rawStatus    = raw.status || "active";
  const status =
    computedLeft === 0 && rawStatus !== "cancelled" ? "expired" : rawStatus;

  return {
    id:        raw.id        || `ad-${idx}`,
    title:     raw.title     || raw.name       || "Ad Campaign",
    target:    raw.target    || raw.targetName || raw.medicineName || "—",
    plan:      raw.plan      || raw.duration   || "—",
    amount:    raw.amount    || raw.price      || 0,
    startDate,
    endDate,
    daysTotal,
    daysUsed:  Math.min(daysUsed, daysTotal),
    daysLeft:  computedLeft,
    status,
    emoji:     raw.emoji     || "📢",
    color:     raw.color     || "#fef3c7",
  };
};

const normalizePayment = (raw) => {
  const type =
    raw.type         ||
    raw.paymentType  ||
    raw.payment_type ||
    raw.category     ||
    "subscription";

  return {
    id:          raw.id          || raw.invoiceId  || "—",
    date:        raw.date        || raw.createdAt  || raw.paymentDate,
   
    type:        type.toLowerCase(),
    amount:      raw.amount      || raw.price      || 0,
  
  };
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    active:    { label: "Active",    cls: "bg-green-100 text-green-700",   dot: "bg-green-500"  },
    expired:   { label: "Expired",   cls: "bg-gray-100 text-gray-500",     dot: "bg-gray-400"   },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-600",       dot: "bg-red-500"    },
    paid:      { label: "Paid",      cls: "bg-green-100 text-green-700",   dot: "bg-green-500"  },
    pending:   { label: "Pending",   cls: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  };
  const s = map[status?.toLowerCase()] || map.paid;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const t = type?.toLowerCase();
  if (t === "subscription")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
        <ShieldCheck className="h-3 w-3" />
        Sub
      </span>
    );
  if (t === "order")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
        <CreditCard className="h-3 w-3" />
        Order
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
      <Megaphone className="h-3 w-3" />
      Ad
    </span>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ used, total, color = "#9DC873" }) {
  const pct = Math.min(100, Math.round((used / Math.max(total, 1)) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: iconBg }}
      >
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800 leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Subscription Card ────────────────────────────────────────────────────────

function SubscriptionCard({ sub }) {
  if (!sub)
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center justify-center py-12 text-gray-400">
        <p className="text-sm">No active subscription found.</p>
      </div>
    );

  const left        = daysLeft(sub.endDate);
  const pct         = Math.round((sub.daysUsed / Math.max(sub.daysTotal, 1)) * 100);
  const urgentColor = left < 30 ? "#ef4444" : left < 60 ? "#f59e0b" : "#9DC873";

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
            <ShieldCheck size={22} className="text-green-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800">Dashboard Access</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub.plan} plan</p>
          </div>
        </div>
        <StatusBadge status={sub.status} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Amount paid",    value: `${fmt(sub.amount)} EGP` },
          { label: "Start date",     value: fmtDate(sub.startDate) },
          { label: "Renewal date",   value: fmtDate(sub.endDate) },
          { label: "Days remaining", value: `${left} days`, valueColor: urgentColor },
        ].map((r) => (
          <div key={r.label} className="rounded-xl bg-gray-50 px-3 py-2.5">
            <p className="text-[11px] text-gray-400">{r.label}</p>
            <p
              className="text-sm font-semibold text-gray-800 mt-0.5"
              style={r.valueColor ? { color: r.valueColor } : {}}
            >
              {r.value}
            </p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Time elapsed</span>
          <span>{pct}%</span>
        </div>
        <ProgressBar used={sub.daysUsed} total={sub.daysTotal} color={urgentColor} />
      </div>
    </div>
  );
}

// ─── Ad Card ──────────────────────────────────────────────────────────────────

function AdCard({ ad }) {
  const left      = ad.daysLeft; // ✅ محسوب من endDate مش من الـ API
  const isExpired = ad.status?.toLowerCase() === "expired";

  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${
        isExpired
          ? "bg-gray-50 border-gray-100 opacity-70"
          : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base"
            style={{ background: ad.color }}
          >
            {ad.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{ad.title}</p>
            <p className="text-[11px] text-gray-400 truncate">{ad.target}</p>
          </div>
        </div>
        <StatusBadge status={ad.status} />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>{ad.plan} · {fmt(ad.amount)} EGP</span>
        {!isExpired ? (
          <span
            className="font-medium"
            style={{ color: left <= 3 ? "#ef4444" : left <= 7 ? "#f59e0b" : "#6b7280" }}
          >
            {left} {left === 1 ? "day" : "days"} left
          </span>
        ) : (
          <span className="text-gray-400">Ended {fmtDate(ad.endDate)}</span>
        )}
      </div>

      <ProgressBar
        used={ad.daysUsed}
        total={ad.daysTotal}
        color={isExpired ? "#d1d5db" : "#f59e0b"}
      />
    </div>
  );
}

// ─── Ads Section with Show More ───────────────────────────────────────────────

const ADS_INITIAL_LIMIT = 3;

function AdsSection({ ads, activeCount }) {
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? ads : ads.slice(0, ADS_INITIAL_LIMIT);
  const hasMore = ads.length > ADS_INITIAL_LIMIT;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Megaphone size={16} className="text-secondary" />
        <p className="text-sm font-semibold text-gray-700">Ad Campaigns</p>
        <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
          {activeCount} active
        </span>
      </div>

      {ads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-12 text-gray-400">
          <Megaphone className="mb-2 h-8 w-8 opacity-30" />
          <p className="text-sm">No ad campaigns found.</p>
        </div>
      ) : (
        <>
          {visible.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
          {hasMore && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-gray-200 bg-white py-2.5 text-xs font-medium text-gray-500 transition hover:bg-gray-50"
            >
              {showAll ? (
                <><ChevronUp size={14} /> Show less</>
              ) : (
                <><ChevronDown size={14} /> Show all {ads.length} campaigns</>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── History Table ────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 5;

function HistoryTable({ data }) {
  const [page, setPage]             = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    if (typeFilter === "all") return data;
    return data.filter((r) => r.type?.toLowerCase() === typeFilter);
  }, [data, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageData   = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [typeFilter]);

  const handleExport = () => {
    const rows = [
      ["Invoice", "Date",  "Type", "Amount (EGP)"],
      ...filtered.map((r) => [
        r.id, fmtDate(r.date), r.type, r.amount,
      ]),
    ];
    const csv  = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "payment-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2)
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-secondary" />
          <p className="font-bold text-gray-800">Payment History</p>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="all">All types</option>
            <option value="subscription">Subscription</option>
            <option value="ad">Ad</option>
            
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50"
          >
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Invoice", "Date", "Type", "Amount"].map((h) => (
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
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  No records found.
                </td>
              </tr>
            ) : (
              pageData.map((r, i) => (
                <tr key={r.id || i} className="border-b border-gray-50 transition hover:bg-gray-50/60">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-400">{r.id}</td>
                  <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.date)}</td>
                  
                  <td className="py-3 pr-4"><TypeBadge type={r.type} /></td>
                  <td className="py-3 pr-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {fmt(r.amount)} EGP
                  </td>
                 
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            {getPageNumbers().map((p) => (
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

function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Payments() {
  const {
    payments: rawPayments,
    subscription: subData,
    ads: adsData,
    loading,
    error,
    fetchAll,
  } = usePayments();

  useEffect(() => {
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const normalizedSub = normalizeSubscription(subData);

  const normalizedAds = useMemo(
    () => (adsData || []).map((a, i) => normalizeAd(a, i)),
    [adsData]
  );

  const normalizedPayments = useMemo(
    () => (rawPayments || []).map(normalizePayment),
    [rawPayments]
  );

  const totalPaid = normalizedPayments.reduce((s, r) => s + Number(r.amount || 0), 0);
  const activeAds = normalizedAds.filter((a) => a.status?.toLowerCase() === "active").length;
  const subLeft   = normalizedSub ? daysLeft(normalizedSub.endDate) : 0;

  if (loading) {
    return (
      <div className="space-y-5 p-3 sm:p-4 md:p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-sm font-medium text-red-500">{error}</p>
        <button
          onClick={fetchAll}
          className="rounded-full bg-secondary px-5 py-2 text-sm text-white transition hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-3 sm:p-4 md:p-6 max-w-6xl mx-auto">

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          iconBg="#dcfce7"
          iconColor="#16a34a"
          label="Total paid"
          value={`${fmt(totalPaid)} EGP`}
          sub="All time"
        />
        <MetricCard
          icon={ShieldCheck}
          iconBg="#dbeafe"
          iconColor="#2563eb"
          label="Subscription"
          value={normalizedSub?.plan || "—"}
          sub={
            normalizedSub
              ? `Active · renews ${fmtDate(normalizedSub.endDate)}`
              : "No active plan"
          }
        />
        <MetricCard
          icon={Clock}
          iconBg={subLeft < 30 ? "#fee2e2" : "#fef3c7"}
          iconColor={subLeft < 30 ? "#dc2626" : "#d97706"}
          label="Days left on plan"
          value={subLeft}
          sub={subLeft < 30 ? "Renew soon!" : "Subscription active"}
        />
        <MetricCard
          icon={Zap}
          iconBg="#fef3c7"
          iconColor="#d97706"
          label="Active ads"
          value={activeAds}
          sub={`${normalizedAds.length} total campaigns`}
        />
      </div>

      {/* Subscription + Ads */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SubscriptionCard sub={normalizedSub} />
        <AdsSection ads={normalizedAds} activeCount={activeAds} />
      </div>

      {/* History table */}
      <HistoryTable data={normalizedPayments} />
    </div>
  );
}