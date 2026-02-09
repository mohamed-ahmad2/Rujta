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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const formatCurrency = (value) =>
    value ? `$${value.toLocaleString()}` : "$0";

  return (
    <div className="space-y-10">

      {/* ===== TOP STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SalesCard title="Total Revenue" value={formatCurrency(report.totalRevenue)} positive />
        <SalesCard title="Total Orders" value={report.totalOrders} positive />
        <SalesCard title="Completed Orders" value={report.salesSummary.completedOrders} positive />
        <SalesCard title="Average Order Value" value={formatCurrency(report.salesSummary.averageOrderValue.toFixed(2))} positive />
      </div>

      {/* ===== REVENUE CHART ===== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Revenue (Last 30 Days)</h2>
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

      {/* ===== TOP PRODUCTS ===== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm max-w-md">
        <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
        {report.topProducts.length === 0 && <p className="text-gray-400">No top products</p>}
        {report.topProducts.map((p) => (
          <div key={p.medicineId} className="flex justify-between mb-4">
            <div>
              <p className="font-medium">{p.medicineName}</p>
              <p className="text-xs text-gray-400">Sold: {p.quantitySold}</p>
            </div>
            <p className="font-semibold">{formatCurrency(p.totalRevenue)}</p>
          </div>
        ))}
      </div>

     

    </div>
  );
}
