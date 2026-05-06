import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  Megaphone,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  Zap,
} from "lucide-react";

// ─── Mock Data (استبدليه بـ API hook) ────────────────────────────────────────

const SUBSCRIPTION = {
  plan: "Yearly",
  amount: 14400,
  currency: "EGP",
  startDate: "2025-01-15",
  endDate: "2026-01-15",
  status: "active", // active | expired | cancelled
  daysTotal: 365,
  daysUsed: 107,
};

const ADS = [
  {
    id: "ad-1",
    title: "Discount Banner",
    target: "Panadol 500mg",
    plan: "14 days",
    amount: 179,
    startDate: "2025-04-28",
    endDate: "2025-05-12",
    daysTotal: 14,
    daysUsed: 4,
    status: "active",
    emoji: "💊",
    color: "#dbeafe",
  },
  {
    id: "ad-2",
    title: "New Arrival",
    target: "Skincare Category",
    plan: "7 days",
    amount: 99,
    startDate: "2025-04-28",
    endDate: "2025-05-05",
    daysTotal: 7,
    daysUsed: 4,
    status: "active",
    emoji: "🧴",
    color: "#ede9fe",
  },
  {
    id: "ad-3",
    title: "Best Seller",
    target: "Antibiotics",
    plan: "30 days",
    amount: 299,
    startDate: "2025-03-10",
    endDate: "2025-04-09",
    daysTotal: 30,
    daysUsed: 30,
    status: "expired",
    emoji: "🧬",
    color: "#dcfce7",
  },
];

const HISTORY = [
  {
    id: "INV-004",
    date: "2025-04-28",
    description: "New Arrival ad — Skincare (7 days)",
    type: "ad",
    amount: 99,
    status: "paid",
  },
  {
    id: "INV-003",
    date: "2025-04-28",
    description: "Discount Banner — Panadol (14 days)",
    type: "ad",
    amount: 179,
    status: "paid",
  },
  {
    id: "INV-002",
    date: "2025-03-10",
    description: "Best Seller ad — Antibiotics (30 days)",
    type: "ad",
    amount: 299,
    status: "paid",
  },
  {
    id: "INV-001",
    date: "2025-01-15",
    description: "Yearly subscription — Dashboard access",
    type: "subscription",
    amount: 14400,
    status: "paid",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => Number(n).toLocaleString("en-EG");

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const daysLeft = (endDate) => {
  const diff = new Date(endDate) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
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
    pending: {
      label: "Pending",
      cls: "bg-yellow-100 text-yellow-700",
      dot: "bg-yellow-400",
    },
  };
  const s = map[status] || map.paid;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  if (type === "subscription")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
        <ShieldCheck className="h-3 w-3" />
        Sub
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
  const pct = Math.min(100, Math.round((used / total) * 100));
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
  const left = daysLeft(sub.endDate);
  const pct = Math.round((sub.daysUsed / sub.daysTotal) * 100);
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
          { label: "Amount paid", value: `${fmt(sub.amount)} EGP` },
          { label: "Start date", value: fmtDate(sub.startDate) },
          { label: "Renewal date", value: fmtDate(sub.endDate) },
          {
            label: "Days remaining",
            value: `${left} days`,
            valueColor: urgentColor,
          },
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
  const left = daysLeft(ad.endDate);
  const pct = Math.round((ad.daysUsed / ad.daysTotal) * 100);
  const isExpired = ad.status === "expired";

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
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {ad.title}
            </p>
            <p className="text-[11px] text-gray-400 truncate">{ad.target}</p>
          </div>
        </div>
        <StatusBadge status={ad.status} />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>{ad.plan} · {fmt(ad.amount)} EGP</span>
        {!isExpired ? (
          <span className="font-medium" style={{ color: left <= 3 ? "#ef4444" : "#f59e0b" }}>
            {left} days left
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

// ─── History Table ────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 5;

function HistoryTable({ data }) {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    if (typeFilter === "all") return data;
    return data.filter((r) => r.type === typeFilter);
  }, [data, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageData = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleExport = () => {
    const rows = [
      ["Invoice", "Date", "Description", "Type", "Amount (EGP)", "Status"],
      ...filtered.map((r) => [
        r.id,
        fmtDate(r.date),
        r.description,
        r.type,
        r.amount,
        r.status,
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
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      {/* Header */}
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
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Invoice", "Date", "Description", "Type", "Amount", "Status"].map((h) => (
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
              pageData.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 transition hover:bg-gray-50/60">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-400">{r.id}</td>
                  <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">
                    {fmtDate(r.date)}
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-700 max-w-[200px] truncate">
                    {r.description}
                  </td>
                  <td className="py-3 pr-4">
                    <TypeBadge type={r.type} />
                  </td>
                  <td className="py-3 pr-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {fmt(r.amount)} EGP
                  </td>
                  <td className="py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Payments() {
  const totalPaid = HISTORY.reduce((s, r) => s + r.amount, 0);
  const activeAds = ADS.filter((a) => a.status === "active").length;
  const subLeft = daysLeft(SUBSCRIPTION.endDate);

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
          value={SUBSCRIPTION.plan}
          sub={`Active · renews ${fmtDate(SUBSCRIPTION.endDate)}`}
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
          sub={`${ADS.length} total campaigns`}
        />
      </div>

      {/* Subscription + Ads */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SubscriptionCard sub={SUBSCRIPTION} />

        {/* Ads column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Megaphone size={16} className="text-secondary" />
            <p className="text-sm font-semibold text-gray-700">Ad Campaigns</p>
            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              {activeAds} active
            </span>
          </div>
          {ADS.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      </div>

      {/* History table */}
      <HistoryTable data={HISTORY} />
    </div>
  );
}