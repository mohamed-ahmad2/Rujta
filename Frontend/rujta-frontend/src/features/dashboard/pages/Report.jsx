import React from "react";
import {
  TrendingUp,
  Package,
  AlertTriangle,
  ShoppingBag,
  BarChart3,
} from "lucide-react";

export default function Report() {
  const sales = [
    { month: "January", totalSales: 2500, topProduct: "Paracetamol" },
    { month: "February", totalSales: 3100, topProduct: "Amoxicillin" },
  ];

  const lowStock = [
    { name: "Cough Syrup", stock: 5 },
    { name: "Vitamin C", stock: 8 },
    { name: "Pain Relief Gel", stock: 3 },
  ];

  const totalSales = sales.reduce((sum, s) => sum + s.totalSales, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-2 flex items-center gap-2">
        <BarChart3 size={28} className="text-blue-600" />
        Monthly Reports
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Total Sales</p>
            <h2 className="text-2xl font-bold">EGP {totalSales.toLocaleString()}</h2>
          </div>
          <TrendingUp size={36} />
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Top Product</p>
            <h2 className="text-2xl font-bold">
              {sales[1].topProduct || "N/A"}
            </h2>
          </div>
          <Package size={36} />
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Low Stock Items</p>
            <h2 className="text-2xl font-bold">{lowStock.length}</h2>
          </div>
          <AlertTriangle size={36} />
        </div>
      </div>

      {/* Sales Details */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ShoppingBag size={20} className="text-blue-600" />
          Sales Summary
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {sales.map((s, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 hover:shadow-md transition flex justify-between items-center"
            >
              <div>
                <p className="text-gray-600 font-semibold">{s.month}</p>
                <p className="text-gray-500 text-sm">
                  Top Product: <b>{s.topProduct}</b>
                </p>
              </div>
              <p className="text-blue-600 font-bold text-lg">
                EGP {s.totalSales.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-600" />
          Low Stock Alerts
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {lowStock.map((item, i) => (
            <div
              key={i}
              className="border-l-4 border-red-500 bg-red-50 p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <p className="font-semibold text-gray-700">{item.name}</p>
              <p className="text-sm text-red-600 font-bold">
                {item.stock} items remaining
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
