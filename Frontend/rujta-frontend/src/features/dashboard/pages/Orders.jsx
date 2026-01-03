import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, Download, Edit } from "lucide-react";
import StatCard from "../components/OrderCard";
import { useOrders } from "../../orders/hooks/useOrders";

export default function Orders() {
  const { orders, loading, fetchPharmacy } = useOrders();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const [showFilters, setShowFilters] = useState(false);
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterDate, setFilterDate] = useState("");

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

    if (filterOrderId)
      list = list.filter((o) =>
        o.id?.toString().includes(filterOrderId)
      );

    if (filterCustomer)
      list = list.filter((o) =>
        o.userName?.toLowerCase().includes(filterCustomer.toLowerCase())
      );

    if (filterDate)
      list = list.filter(
        (o) =>
          new Date(o.orderDate).toLocaleDateString("en-CA") === filterDate
      );

    return list;
  }, [orders, q, filterOrderId, filterCustomer, filterDate]);

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
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value={orders.length} />
        <StatCard title="Completed Orders" value={orders.filter(o => o.status === "Delivered").length} />
        <StatCard title="Pending Orders" value={orders.filter(o => o.status === "Pending").length} />
        <StatCard title="Cancelled Orders" value={orders.filter(o => o.status?.startsWith("Cancelled")).length} />
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow border flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full w-full md:w-1/3">
          <Search size={16} className="text-gray-400" />
          <input
            className="bg-transparent outline-none w-full text-sm"
            placeholder="Search orders..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
        </div>

        <div className="flex gap-2 relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-full border text-sm flex items-center gap-2"
          >
            <Filter size={16} /> Filters
          </button>

          {showFilters && (
            <div className="absolute right-0 top-full mt-2 bg-white border shadow-lg rounded-xl p-4 w-64 z-50 space-y-2">
              <input
                placeholder="Order ID"
                value={filterOrderId}
                onChange={(e) => setFilterOrderId(e.target.value)}
                className="border px-3 py-2 rounded-lg w-full text-sm"
              />
              <input
                placeholder="Customer name"
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                className="border px-3 py-2 rounded-lg w-full text-sm"
              />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border px-3 py-2 rounded-lg w-full text-sm"
              />
              <button
                onClick={() => setShowFilters(false)}
                className="w-full bg-secondary text-white rounded-lg py-2 text-sm"
              >
                Apply
              </button>
            </div>
          )}

          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-full border text-sm flex items-center gap-2"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-4 text-left">Order</th>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Pharmacy</th>
              <th className="px-6 py-4 text-center">Date</th>
              <th className="px-6 py-4 text-center">Total</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
            ) : pageData.map(o => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 text-secondary font-medium">#{o.id}</td>
                <td className="px-6 py-4">{o.userName}</td>
                <td className="px-6 py-4">{o.pharmacyName}</td>
                <td className="px-6 py-4 text-center">{new Date(o.orderDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-center">{o.totalPrice} EGP</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs ${statusStyle(o.status)}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <Edit size={16} className="cursor-pointer hover:text-secondary" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
