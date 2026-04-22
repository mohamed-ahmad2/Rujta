import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import StatCard from "../components/OrderCard";
import { useOrders } from "../../orders/hooks/useOrders";
import { toast } from "react-toastify";

export default function Orders() {
  const {
    orders,
    loading,
    error,
    fetchPharmacy,
    accept,
    process,
    outForDelivery,
    deliver,
    cancelByPharmacy,
  } = useOrders();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const [showFilters, setShowFilters] = useState(false);
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const filterRef = useRef(null);

  useEffect(() => {
    fetchPharmacy();
  }, [fetchPharmacy]);

  useEffect(() => {
    if (error) {
      toast.error(
        error?.message ||
          (typeof error === "string" ? error : "An unexpected error occurred"),
      );
    }
  }, [error]);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setShowFilters(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (o) =>
          o.userName?.toLowerCase().includes(s) ||
          o.pharmacyName?.toLowerCase().includes(s) ||
          o.id?.toString().includes(s),
      );
    }
    if (filterOrderId)
      list = list.filter((o) => o.id?.toString().includes(filterOrderId));
    if (filterCustomer)
      list = list.filter((o) =>
        o.userName?.toLowerCase().includes(filterCustomer.toLowerCase()),
      );
    if (filterDate)
      list = list.filter(
        (o) => new Date(o.orderDate).toLocaleDateString("en-CA") === filterDate,
      );
    return list;
  }, [orders, q, filterOrderId, filterCustomer, filterDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  const statusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Pending":
      case "Accepted":
      case "Processing":
        return "bg-yellow-100 text-yellow-700";
      case "OutForDelivery":
        return "bg-blue-100 text-blue-700";
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

  const clearFilters = () => {
    setFilterOrderId("");
    setFilterCustomer("");
    setFilterDate("");
    setShowFilters(false);
  };

  const handleMutation = async (mutationFn, id, successMessagePrefix) => {
    try {
      const res = await mutationFn(id);
      if (res?.success) {
        toast.success(res.message || `${successMessagePrefix} successfully`);
        await fetchPharmacy();
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch {
      toast.error("Operation failed");
    }
  };

  // Stats data
  const statsData = [
    { title: "Total Orders", value: orders.length },
    {
      title: "Completed",
      value: orders.filter((o) => o.status === "Delivered").length,
    },
    {
      title: "Pending",
      value: orders.filter((o) =>
        ["Pending", "Accepted", "Processing"].includes(o.status),
      ).length,
    },
    {
      title: "Cancelled",
      value: orders.filter((o) => o.status?.startsWith("Cancelled")).length,
    },
  ];

  return (
    <div className="space-y-4 p-3 sm:space-y-5 sm:p-4 md:space-y-6 md:p-0">
      {/* ===== Stats ===== */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        {statsData.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} />
        ))}
      </div>

      {/* ===== Toolbar ===== */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border bg-white p-3 shadow sm:p-4 md:flex-row">
        {/* Search */}
        <div className="flex w-full items-center gap-2 rounded-full bg-gray-100 px-3 py-2 md:w-1/3">
          <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <input
            className="w-full bg-transparent text-xs outline-none sm:text-sm"
            placeholder="Search orders..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Button + Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition sm:px-4 sm:text-sm ${showFilters ? "border-gray-400 bg-gray-100" : "hover:bg-gray-50"}`}
            >
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Filters
              {(filterOrderId || filterCustomer || filterDate) && (
                <span className="h-2 w-2 rounded-full bg-secondary" />
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilters && (
              <div className="absolute right-0 z-50 mt-2 w-64 space-y-2 rounded-xl border bg-white p-3 shadow-xl sm:w-72 sm:space-y-3 sm:p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-700 sm:text-sm">
                    Filters
                  </p>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <input
                  placeholder="Order ID"
                  value={filterOrderId}
                  onChange={(e) => {
                    setFilterOrderId(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                />
                <input
                  placeholder="Customer name"
                  value={filterCustomer}
                  onChange={(e) => {
                    setFilterCustomer(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                />
                <button
                  onClick={clearFilters}
                  className="w-full py-1 text-center text-xs text-red-500 transition hover:text-red-700 sm:text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition hover:bg-gray-50 sm:px-4 sm:text-sm"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Export
          </button>
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs sm:text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {[
                  "Order",
                  "User",
                  "Pharmacy",
                  "Date",
                  "Total",
                  "Status",
                  "Action",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-3 font-semibold sm:px-4 sm:py-4 md:px-6 ${i >= 3 ? "text-center" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                      <span className="text-xs sm:text-sm">
                        Loading orders...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-xs text-gray-500 sm:text-sm"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                pageData.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t transition hover:bg-gray-50"
                  >
                    {/* Order ID */}
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-secondary sm:px-4 sm:py-4 md:px-6">
                      #{o.id}
                    </td>

                    {/* User */}
                    <td className="max-w-[100px] truncate px-3 py-3 sm:max-w-[140px] sm:px-4 sm:py-4 md:px-6">
                      {o.userName}
                    </td>

                    {/* Pharmacy */}
                    <td className="max-w-[100px] truncate px-3 py-3 sm:max-w-[140px] sm:px-4 sm:py-4 md:px-6">
                      {o.pharmacyName}
                    </td>

                    {/* Date */}
                    <td className="whitespace-nowrap px-3 py-3 text-center sm:px-4 sm:py-4 md:px-6">
                      {new Date(o.orderDate).toLocaleDateString()}
                    </td>

                    {/* Total */}
                    <td className="whitespace-nowrap px-3 py-3 text-center font-medium sm:px-4 sm:py-4 md:px-6">
                      {o.totalPrice} EGP
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3 text-center sm:px-4 sm:py-4 md:px-6">
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs sm:px-3 sm:py-1 ${statusStyle(o.status)}`}
                      >
                        {o.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 text-center sm:px-4 sm:py-4 md:px-6">
                      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                        {o.status === "Pending" && (
                          <button
                            disabled={loading}
                            onClick={() =>
                              handleMutation(accept, o.id, "Order accepted")
                            }
                            className="whitespace-nowrap rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 transition hover:bg-green-200 disabled:opacity-50 sm:px-3 sm:py-1"
                          >
                            Accept
                          </button>
                        )}
                        {o.status === "Accepted" && (
                          <button
                            disabled={loading}
                            onClick={() =>
                              handleMutation(process, o.id, "Order processed")
                            }
                            className="whitespace-nowrap rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700 transition hover:bg-yellow-200 disabled:opacity-50 sm:px-3 sm:py-1"
                          >
                            Process
                          </button>
                        )}
                        {o.status === "Processing" && (
                          <button
                            disabled={loading}
                            onClick={() =>
                              handleMutation(
                                outForDelivery,
                                o.id,
                                "Order out for delivery",
                              )
                            }
                            className="whitespace-nowrap rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 transition hover:bg-blue-200 disabled:opacity-50 sm:px-3 sm:py-1"
                          >
                            Out For Delivery
                          </button>
                        )}
                        {o.status === "OutForDelivery" && (
                          <button
                            disabled={loading}
                            onClick={() =>
                              handleMutation(deliver, o.id, "Order delivered")
                            }
                            className="whitespace-nowrap rounded-full bg-green-200 px-2 py-0.5 text-xs text-green-800 transition hover:bg-green-300 disabled:opacity-50 sm:px-3 sm:py-1"
                          >
                            Delivered
                          </button>
                        )}
                        {!["Delivered", "OutForDelivery"].includes(o.status) &&
                          !o.status?.startsWith("Cancelled") && (
                            <button
                              disabled={loading}
                              onClick={() =>
                                handleMutation(
                                  cancelByPharmacy,
                                  o.id,
                                  "Order cancelled",
                                )
                              }
                              className="whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 transition hover:bg-red-200 disabled:opacity-50 sm:px-3 sm:py-1"
                            >
                              Cancel
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Pagination ===== */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:text-sm"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <ChevronLeft className="-ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </button>

          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:text-sm"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`rounded-full px-2 py-1 text-xs transition sm:px-3 sm:text-sm ${
                page === p
                  ? "bg-secondary text-white"
                  : "border hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:text-sm"
          >
            Next
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>

          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="flex items-center rounded-full border px-2 py-1 text-xs transition hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:text-sm"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            <ChevronRight className="-ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
