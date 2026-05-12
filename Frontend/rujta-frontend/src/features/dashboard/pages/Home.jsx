// src/features/home/pages/HomePage.jsx
import React from "react";
import SalesCard from "../components/SalesCard";
import AlertCard from "../components/AlertCard";
import { usePharmacyReport } from "../../Report/hook/usePharmacyReport";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function HomePage() {
  const { report, loading, error } = usePharmacyReport();

  if (loading)
    return (
      <div className="flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent sm:h-10 sm:w-10" />
          <p className="text-sm text-gray-500 sm:text-base">Loading report…</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center p-8 sm:p-12">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600 sm:px-6 sm:py-4 sm:text-base">
          {error}
        </div>
      </div>
    );

  if (!report)
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-sm text-gray-400">No report data available.</p>
      </div>
    );

  const safe = {
    totalRevenue: report.totalRevenue ?? 0,
    totalOrders: report.totalOrders ?? 0,
    dailySales: report.dailySales ?? [],
    alerts: report.alerts ?? [],
    topProducts: report.topProducts ?? [],
    lowStockItems: report.lowStockItems ?? [],
    expiredItems: report.expiredItems ?? [],
    inventorySummary: report.inventorySummary ?? { lowStockCount: 0 },
    salesSummary: report.salesSummary ?? {
      completedOrders: 0,
      pendingOrders: 0,
      canceledOrders: 0,
    },
  };

  const formatCurrency = (value) =>
    value ? `${Number(value).toLocaleString()}` : "0";

  // compute urgency level for stock badge
  const stockLevel = (current, reorder) => {
    if (current === 0) return { label: "Out", bg: "bg-red-100", text: "text-red-600", bar: "bg-red-500", pct: 0 };
    if (current <= reorder * 0.5) return { label: "Critical", bg: "bg-orange-100", text: "text-orange-600", bar: "bg-orange-500", pct: 25 };
    return { label: "Low", bg: "bg-yellow-100", text: "text-yellow-600", bar: "bg-yellow-400", pct: 55 };
  };

  return (
    <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 md:space-y-8 md:p-0">
      {/* ===== TOP STATS ===== */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        <SalesCard title="Total Revenue" value={formatCurrency(safe.totalRevenue)} positive />
        <SalesCard title="Total Orders" value={safe.totalOrders} positive />
        <SalesCard title="Low Stock Items" value={safe.inventorySummary.lowStockCount} positive={false} />
        <SalesCard title="Expired Items" value={safe.expiredItems.length} positive={false} />
      </div>

      {/* ===== ALERTS ===== */}
      {safe.alerts.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {safe.alerts.map((alert, i) => (
            <AlertCard key={i} message={alert} />
          ))}
        </div>
      )}

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-12">

        {/* ===== LEFT COLUMN ===== */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:col-span-8">

          {/* Sales Chart */}
          <div className="rounded-2xl bg-white p-3 shadow sm:p-4 md:p-5 lg:p-6">
            <h3 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base md:text-lg">
              Revenue (Last 30 Days)
            </h3>
            {safe.dailySales.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-gray-300 sm:h-56 md:h-64 lg:h-[300px]">
                No sales data yet
              </div>
            ) : (
              <div className="h-48 sm:h-56 md:h-64 lg:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safe.dailySales} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid stroke="#f3f3f3" vertical={false} />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <Tooltip
                      formatter={(value) => `${Number(value).toLocaleString()}`}
                      contentStyle={{ fontSize: "12px" }}
                    />
                    <Bar dataKey="totalSales" fill="#9DC873" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Orders Summary */}
          <div className="rounded-2xl bg-white p-3 shadow sm:p-4 md:p-5 lg:p-6">
            <h3 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base md:text-lg">
              Orders Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-xs sm:text-sm md:text-base">
                <tbody className="divide-y divide-gray-100">
                  {[
                    { label: "Completed Orders", value: safe.salesSummary.completedOrders, color: "text-green-600" },
                    { label: "Pending Orders",   value: safe.salesSummary.pendingOrders,   color: "text-yellow-600" },
                    { label: "Canceled Orders",  value: safe.salesSummary.canceledOrders,  color: "text-red-500" },
                  ].map((row) => (
                    <tr key={row.label} className="transition hover:bg-gray-50">
                      <td className="py-2 pr-4 text-gray-500 sm:py-3">{row.label}</td>
                      <td className={`py-2 font-semibold sm:py-3 ${row.color}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:col-span-4 lg:grid-cols-1">

          {/* ── Top Selling Products ── */}
          <div className="rounded-2xl bg-white p-4 shadow-sm md:p-5 lg:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold sm:text-base">Top Selling Products</h3>
              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-semibold text-secondary">
                {safe.topProducts.length} items
              </span>
            </div>

            {safe.topProducts.length === 0 ? (
              <p className="text-xs text-gray-400 sm:text-sm">No top products yet</p>
            ) : (
              <div className="space-y-3">
                {safe.topProducts.map((p, i) => (
                  <div key={p.medicineId} className="flex items-center gap-3">
                    {/* rank badge */}
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-500">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-xs font-semibold text-gray-800 sm:text-sm">{p.medicineName}</p>
                        <p className="flex-shrink-0 text-xs font-bold text-secondary sm:text-sm">
                          {formatCurrency(p.totalRevenue)}
                        </p>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        {/* progress bar based on quantity sold relative to top item */}
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-secondary transition-all duration-700"
                            style={{
                              width: `${Math.round(
                                (p.quantitySold / Math.max(...safe.topProducts.map((x) => x.quantitySold), 1)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="flex-shrink-0 text-[11px] text-gray-400">{p.quantitySold} sold</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Low Stock Items ── */}
          <div className="rounded-2xl bg-white p-4 shadow-sm md:p-5 lg:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold sm:text-base">Low Stock</h3>
              {safe.lowStockItems.length > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                  {safe.lowStockItems.length} alerts
                </span>
              )}
            </div>

            {safe.lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">✓</div>
                <p className="text-xs font-medium text-green-600">All items in stock</p>
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {safe.lowStockItems.map((item) => {
                  const level = stockLevel(item.currentStock, item.reorderLevel);
                  return (
                    <div key={item.medicineId} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-800 sm:text-sm">
                          {item.medicineName}
                        </p>
                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${level.bg} ${level.text}`}>
                          {level.label}
                        </span>
                      </div>

                      {/* stock bar */}
                      <div className="mt-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${level.bar}`}
                            style={{ width: `${level.pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Reorder at <span className="font-semibold text-gray-600">{item.reorderLevel}</span></span>
                        <span>
                          In stock:{" "}
                          <span className={`font-bold ${level.text}`}>{item.currentStock}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
