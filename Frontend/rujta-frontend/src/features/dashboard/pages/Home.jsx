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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const formatCurrency = (value) =>
    value ? `$${value.toLocaleString()}` : "$0";

  return (
    <div className="space-y-8">

      {/* ===== TOP STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SalesCard title="Total Revenue" value={formatCurrency(report.totalRevenue)} positive />
        <SalesCard title="Total Orders" value={report.totalOrders} positive />
        <SalesCard title="Low Stock Items" value={report.inventorySummary.lowStockCount} positive={false} />
        <SalesCard title="Expired Items" value={report.expiredItems.length} positive={false} />
      </div>

      {/* ===== ALERTS ===== */}
      {report.alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.alerts.map((alert, i) => (
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
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.dailySales}>
                  <CartesianGrid stroke="#f3f3f3" vertical={false} />
                  <XAxis dataKey="dateLabel" />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="totalSales" fill="#9DC873" radius={[10, 10, 10, 10]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ===== ORDERS SUMMARY ===== */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="font-semibold mb-4">Orders Summary</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td>Completed Orders</td>
                  <td>{report.salesSummary.completedOrders}</td>
                </tr>
                <tr>
                  <td>Pending Orders</td>
                  <td>{report.salesSummary.pendingOrders}</td>
                </tr>
                <tr>
                  <td>Canceled Orders</td>
                  <td>{report.salesSummary.canceledOrders}</td>
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
            {report.topProducts.length === 0 && <p className="text-gray-400">No top products</p>}
            {report.topProducts.map((p) => (
              <div key={p.medicineId} className="flex justify-between mb-3">
                <div>
                  <p className="font-medium">{p.medicineName}</p>
                  <p className="text-xs text-gray-400">Sold: {p.quantitySold}</p>
                </div>
                <p className="font-semibold">{formatCurrency(p.totalRevenue)}</p>
              </div>
            ))}
          </div>

          {/* ===== LOW STOCK ITEMS ===== */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Low Stock Items</h3>
            {report.lowStockItems.length === 0 && <p className="text-gray-400">All items are in stock</p>}
            {report.lowStockItems.map((item) => (
              <div key={item.medicineId} className="flex justify-between mb-3">
                <div>
                  <p className="font-medium">{item.medicineName}</p>
                  <p className="text-xs text-gray-400">Reorder Level: {item.reorderLevel}</p>
                </div>
                <p className="font-semibold">{item.currentStock}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
