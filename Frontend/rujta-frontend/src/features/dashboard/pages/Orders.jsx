// src/dashbord/pages/Orders.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useOrders } from "../../orders/hooks/useOrders";
import StatCard from "../components/OrderCard";
import { Search, Plus, Filter, Download, Edit } from "lucide-react";

export default function Orders() {

  const { orders, loading, fetchPharmacy } = useOrders();

  const [q, setQ] = useState("");
  const [filterStatus] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchPharmacy();
  }, [fetchPharmacy]);

  const filtered = useMemo(() => {
    let list = [...orders];

    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (o) =>
          o.userName?.toLowerCase().includes(s) ||
          o.pharmacyName?.toLowerCase().includes(s) ||
          o.id?.toString().includes(s)
      );
    }

    if (filterStatus !== "All") {
      list = list.filter((o) => o.status === filterStatus);
    }

    return list;
  }, [orders, q, filterStatus]);


  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);


  const statusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Pending":
      case "Processing":
        return "bg-yellow-100 text-yellow-700";
      case "CancelledByUser":
      case "CancelledByPharmacy":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleExport = () => {
    const rows = [
      ["Order ID", "User", "Pharmacy", "Date", "Total", "Status"],
      ...filtered.map((o) => [
        o.id,
        o.userName,
        o.pharmacyName,
        new Date(o.orderDate).toLocaleDateString(),
        o.totalPrice,
        o.status,
      ]),
    ];

    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value={orders.length} />
        <StatCard
          title="Completed Orders"
          value={orders.filter((o) => o.status === "Delivered").length}
        />
        <StatCard
          title="Pending Orders"
          value={orders.filter((o) => o.status === "Pending").length}
        />
        <StatCard
          title="Cancelled Orders"
          value={orders.filter((o) => o.status?.startsWith("Cancelled")).length}
        />
      </div>

      <div className="bg-white p-4 rounded-2xl shadow border flex flex-col md:flex-row justify-between gap-4">
        {/* Search */}
        <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full w-full md:w-1/3">
          <Search size={16} className="text-gray-400" />
          <input
            className="bg-transparent outline-none w-full text-sm"
            placeholder="Search orders..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-full font-medium">
            <Plus size={16} /> Add Order
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm">
            <Filter size={16} /> Filter
          </button>

          <button
            onClick={handleExport}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow border overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-4 text-left">Order</th>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Pharmacy</th>
              <th className="px-6 py-4 text-center">Date</th>
              <th className="px-6 py-4 text-left">Items</th>
              <th className="px-6 py-4 text-center">Total</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              pageData.map((o) => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-secondary">
                    #{o.id}
                  </td>
                  <td className="px-6 py-4">{o.userName}</td>
                  <td className="px-6 py-4">{o.pharmacyName}</td>
                  <td className="px-6 py-4 text-center">
                    {new Date(o.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    {o.orderItems.map((i, idx) => (
                      <div key={idx}>
                        • {i.medicineName} × {i.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {o.totalPrice.toFixed(2)} EGP
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Edit
                      size={18}
                      className="inline cursor-pointer hover:text-secondary"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-6 py-4 border-t">
          <span className="text-sm text-gray-500">
            Showing {pageData.length} of {total}
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  page === i + 1
                    ? "bg-secondary text-white"
                    : "border"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
