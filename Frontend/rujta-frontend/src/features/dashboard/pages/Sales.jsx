// src/features/sales/pages/SalesPage.jsx
import React from "react";
import SalesCard from "../components/SalesCard";
import { usePharmacyReport } from "../../Report/hook/usePharmacyReport";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function SalesPage() {
  const { report, loading, error } = usePharmacyReport();

  // Loading
  if (loading)
    return (
      <div className="flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent sm:h-10 sm:w-10" />
          <p className="text-sm text-gray-500 sm:text-base">Loading...</p>
        </div>
      </div>
    );

  // Error
  if (error)
    return (
      <div className="flex items-center justify-center p-8 sm:p-12">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600 sm:px-6 sm:py-4 sm:text-base">
          {error}
        </div>
      </div>
    );

  const formatCurrency = (value) =>
    value
      ? `
$$
{value.toLocaleString()}`
      : "$0";

  return (
    <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 md:space-y-8 md:p-0 lg:space-y-10">
      {/* ===== TOP STATS ===== */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        <SalesCard
          title="Total Revenue"
          value={formatCurrency(report.totalRevenue)}
          positive
        />
        <SalesCard title="Total Orders" value={report.totalOrders} positive />
        <SalesCard
          title="Completed Orders"
          value={report.salesSummary.completedOrders}
          positive
        />
        <SalesCard
          title="Avg Order Value"
          value={formatCurrency(
            report.salesSummary.averageOrderValue.toFixed(2),
          )}
          positive
        />
      </div>

      {/* ===== REVENUE CHART ===== */}
      <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-4 md:p-5 lg:p-6">
        <h2 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base md:text-lg">
          Revenue (Last 30 Days)
        </h2>
        <div className="h-44 sm:h-56 md:h-64 lg:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={report.dailySales}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid stroke="#f3f3f3" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <Tooltip
                formatter={(value) => `
$$
{value.toLocaleString()}`}
                contentStyle={{ fontSize: "12px" }}
              />
              <Bar dataKey="totalSales" fill="#9DC873" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== BOTTOM SECTION ===== */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
        {/* Top Selling Products */}
        <div className="w-full rounded-2xl bg-white p-3 shadow-sm sm:p-4 md:p-5 lg:p-6">
          <h2 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base md:text-lg">
            Top Selling Products
          </h2>

          {report.topProducts.length === 0 && (
            <p className="text-xs text-gray-400 sm:text-sm">No top products</p>
          )}

          <div className="space-y-2 sm:space-y-3">
            {report.topProducts.map((p) => (
              <div
                key={p.medicineId}
                className="flex items-start justify-between gap-3 border-b border-gray-100 pb-2 last:border-0 sm:pb-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium sm:text-sm">
                    {p.medicineName}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Sold: {p.quantitySold}
                  </p>
                </div>
                <p className="flex-shrink-0 text-xs font-semibold text-secondary sm:text-sm">
                  {formatCurrency(p.totalRevenue)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Summary */}
        <div className="w-full rounded-2xl bg-white p-3 shadow-sm sm:p-4 md:p-5 lg:p-6">
          <h2 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base md:text-lg">
            Sales Summary
          </h2>

          <div className="space-y-0 divide-y divide-gray-100">
            {[
              {
                label: "Completed Orders",
                value: report.salesSummary.completedOrders,
                color: "text-green-600",
              },
              {
                label: "Pending Orders",
                value: report.salesSummary.pendingOrders,
                color: "text-yellow-600",
              },
              {
                label: "Cancelled Orders",
                value: report.salesSummary.canceledOrders,
                color: "text-red-500",
              },
              {
                label: "Average Order Value",
                value: formatCurrency(
                  report.salesSummary.averageOrderValue.toFixed(2),
                ),
                color: "text-blue-600",
              },
              {
                label: "Total Revenue",
                value: formatCurrency(report.totalRevenue),
                color: "text-secondary",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 py-2 sm:py-3"
              >
                <p className="truncate text-xs text-gray-500 sm:text-sm">
                  {row.label}
                </p>
                <p
                  className={`flex-shrink-0 text-xs font-semibold sm:text-sm ${row.color}`}
                >
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
