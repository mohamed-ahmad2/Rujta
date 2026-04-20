// src/features/home/pages/HomePage.jsx
import React from "react";
import SalesCard from "../components/SalesCard";
import AlertCard from "../components/AlertCard";
import { usePharmacyReport } from "../../Report/hook/usePharmacyReport";
import {
  BarChart, Bar, XAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

export default function HomePage() {
  const { report, loading, error } = usePharmacyReport();

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3">
      <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading report…</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  // report itself is null/undefined (API returned nothing yet)
  if (!report) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400 text-sm">No report data available.</p>
    </div>
  );

  // ── Safe defaults so nested properties never crash ────────────────────────
  const safe = {
    totalRevenue:     report.totalRevenue     ?? 0,
    totalOrders:      report.totalOrders      ?? 0,
    dailySales:       report.dailySales       ?? [],
    alerts:           report.alerts           ?? [],
    topProducts:      report.topProducts      ?? [],
    lowStockItems:    report.lowStockItems     ?? [],
    expiredItems:     report.expiredItems      ?? [],
    inventorySummary: report.inventorySummary  ?? { lowStockCount: 0 },
    salesSummary:     report.salesSummary      ?? {
      completedOrders: 0,
      pendingOrders:   0,
      canceledOrders:  0,
    },
  };

  const formatCurrency = (value) =>
    value ? `$${Number(value).toLocaleString()}` : "$0";

  return (
    <div className="space-y-8">

      {/* ===== TOP STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SalesCard title="Total Revenue"   value={formatCurrency(safe.totalRevenue)}              positive />
        <SalesCard title="Total Orders"    value={safe.totalOrders}                               positive />
        <SalesCard title="Low Stock Items" value={safe.inventorySummary.lowStockCount}            positive={false} />
        <SalesCard title="Expired Items"   value={safe.expiredItems.length}                       positive={false} />
      </div>

      {/* ===== ALERTS ===== */}
      {safe.alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safe.alerts.map((alert, i) => (
            <AlertCard key={i} message={alert} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">

        {/* ===== LEFT COLUMN ===== */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* ===== SALES CHART ===== */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-semibold mb-4">Revenue (Last 30 Days)</h3>
            {safe.dailySales.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-300 text-sm">
                No sales data yet
              </div>
            ) : (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safe.dailySales}>
                    <CartesianGrid stroke="#f3f3f3" vertical={false} />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    <Bar dataKey="totalSales" fill="#9DC873" radius={[10, 10, 10, 10]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ===== ORDERS SUMMARY ===== */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-semibold mb-4">Orders Summary</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Completed Orders</td>
                  <td className="py-2 font-semibold text-right">{safe.salesSummary.completedOrders}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Pending Orders</td>
                  <td className="py-2 font-semibold text-right">{safe.salesSummary.pendingOrders}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-500">Canceled Orders</td>
                  <td className="py-2 font-semibold text-right">{safe.salesSummary.canceledOrders}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* ===== TOP PRODUCTS ===== */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Top Selling Products</h3>
            {safe.topProducts.length === 0
              ? <p className="text-gray-400 text-sm">No top products yet</p>
              : safe.topProducts.map((p) => (
                  <div key={p.medicineId} className="flex justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{p.medicineName}</p>
                      <p className="text-xs text-gray-400">Sold: {p.quantitySold}</p>
                    </div>
                    <p className="font-semibold text-sm">{formatCurrency(p.totalRevenue)}</p>
                  </div>
                ))
            }
          </div>

          {/* ===== LOW STOCK ITEMS ===== */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Low Stock Items</h3>
            {safe.lowStockItems.length === 0
              ? <p className="text-gray-400 text-sm">All items are in stock</p>
              : safe.lowStockItems.map((item) => (
                  <div key={item.medicineId} className="flex justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{item.medicineName}</p>
                      <p className="text-xs text-gray-400">Reorder Level: {item.reorderLevel}</p>
                    </div>
                    <p className="font-semibold text-sm">{item.currentStock}</p>
                  </div>
                ))
            }
          </div>

        </div>
      </div>
    </div>
  );
}
