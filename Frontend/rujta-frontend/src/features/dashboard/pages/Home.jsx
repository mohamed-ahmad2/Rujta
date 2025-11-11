import React from "react";
import { BarChart3, Package, AlertTriangle, FolderOpen, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-blue-600 text-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Loki (●'◡'●)</h1>
        <p className="text-blue-100">
          Manage your pharmacy efficiently — track stock, orders, and analytics in one place.
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <h2 className="text-2xl font-bold text-blue-600">120</h2>
            </div>
            <Package className="text-blue-500" size={30} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock</p>
              <h2 className="text-2xl font-bold text-red-600">8</h2>
            </div>
            <AlertTriangle className="text-red-500" size={30} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Categories</p>
              <h2 className="text-2xl font-bold text-green-600">12</h2>
            </div>
            <FolderOpen className="text-green-500" size={30} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today’s Sales</p>
              <h2 className="text-2xl font-bold text-purple-600">EGP 2,540</h2>
            </div>
            <ShoppingBag className="text-purple-500" size={30} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h2>
        <ul className="space-y-3">
          <li className="flex items-center justify-between border-b pb-2">
            <span>💊 New product added: <b>Panadol Extra</b></span>
            <span className="text-sm text-gray-500">2 mins ago</span>
          </li>
          <li className="flex items-center justify-between border-b pb-2">
            <span>📦 Stock updated for <b>Vitamin D</b></span>
            <span className="text-sm text-gray-500">10 mins ago</span>
          </li>
          <li className="flex items-center justify-between">
            <span>🧾 New order processed: <b>#ORD-239</b></span>
            <span className="text-sm text-gray-500">20 mins ago</span>
          </li>
        </ul>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-blue-600" size={22} />
          <h2 className="text-xl font-semibold text-gray-700">Sales Overview</h2>
        </div>
        <div className="text-gray-500 text-sm">
          📊 Sales chart will appear here (you can integrate Recharts or Chart.js later)
        </div>
      </div>
    </div>
  );
}
