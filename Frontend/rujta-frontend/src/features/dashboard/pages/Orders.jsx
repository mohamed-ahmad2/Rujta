import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  Package,
  CreditCard,
  Banknote,
  RotateCcw,
} from "lucide-react";
import StatCard from "../components/OrderCard";
import { useOrders } from "../../orders/hooks/useOrders";
import useMedicines from "../../medicines/hook/useMedicines";
import { toast } from "react-toastify";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

// ─── Payment Method Badge ─────────────────────────────────────────────────────
// Maps PaymentMethod enum: 0=Cash | 1=Payment (Paymob)

function PaymentMethodBadge({ method }) {
  const m = String(method ?? "").toLowerCase();
  if (m === "cash" || m === "0")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
        <Banknote className="h-3 w-3" /> Cash
      </span>
    );
  if (m === "payment" || m === "1")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
        <CreditCard className="h-3 w-3" /> Online
      </span>
    );
  return null;
}

// ─── Payment Status Badge ─────────────────────────────────────────────────────
// Maps PaymentStatus enum: Pending | Success | Failed | Refunded

function PaymentStatusBadge({ status }) {
  const s = String(status ?? "").toLowerCase();
  const map = {
    success: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-600",
    refunded: "bg-purple-100 text-purple-700",
  };
  const label = {
    success: "Paid",
    pending: "Pending",
    failed: "Failed",
    refunded: "Refunded",
  };
  if (!map[s]) return null;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[s]}`}
    >
      {label[s] ?? status}
    </span>
  );
}

// ─── Order Details Modal ──────────────────────────────────────────────────────

function OrderDetailsModal({ order, onClose, getMedicineName, statusStyle }) {
  if (!order) return null;
  const items = order.orderItems || order.items || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Order Details
            </p>
            <h3 className="text-lg font-bold text-gray-800">#{order.id}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Customer", value: order.userName || "—" },
              { label: "Pharmacy", value: order.pharmacyName || "—" },
              { label: "Date", value: fmtDate(order.orderDate) },
              { label: "Total", value: `${order.totalPrice} EGP`, bold: true },
              {
                label: "Address",
                value: order.deliveryAddress || "—",
                full: true,
              },
            ].map((f) => (
              <div
                key={f.label}
                className={`rounded-xl bg-gray-50 p-3 ${f.full ? "col-span-2" : ""}`}
              >
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {f.label}
                </p>
                <p
                  className={`text-sm ${f.bold ? "font-bold text-secondary" : "font-semibold text-gray-800"}`}
                >
                  {f.value}
                </p>
              </div>
            ))}
          </div>

          {/* Status + Payment */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">Status:</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(order.status)}`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">Payment:</p>
              <PaymentMethodBadge method={order.paymentMethod} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>

          {/* Refund notice */}
          {String(order.paymentStatus ?? "").toLowerCase() === "refunded" && (
            <div className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-xs text-purple-700">
              <RotateCcw className="h-4 w-4 flex-shrink-0" />
              Refund has been initiated for this order.
            </div>
          )}

          {/* Items */}
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Package className="h-3.5 w-3.5" />
              Items ({items.length})
            </p>
            {items.length > 0 ? (
              <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {items.map((item, i) => {
                  // OrderItemDto: { medicineID, medicineName, quantity }
                  const name =
                    item.medicineName ||
                    item.name ||
                    (item.medicineID
                      ? getMedicineName(item.medicineID)
                      : `Item #${i + 1}`);
                  const qty = item.quantity || item.qty || 0;
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">💊</span>
                        <span className="text-sm font-medium text-gray-700">
                          {name}
                        </span>
                      </div>
                      <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">
                        ×{qty}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Package className="mb-2 h-8 w-8 opacity-30" />
                <p className="text-sm">No items data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Orders Page ─────────────────────────────────────────────────────────

export default function Orders() {
  const {
    orders: rawOrders,
    loading,
    error,
    fetchPharmacy,
    accept,
    process,
    outForDelivery,
    deliver,
    cancelByPharmacy,
  } = useOrders();

  const { medicines, fetchAll } = useMedicines();

  // rawOrders is OrderDto[][] — flatten for the pharmacy table
  const orders = useMemo(() => rawOrders.flat(), [rawOrders]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [showFilters, setShowFilters] = useState(false);
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayMethod, setFilterPayMethod] = useState("");
  const filterRef = useRef(null);

  useEffect(() => {
    fetchPharmacy();
    fetchAll();
  }, [fetchPharmacy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (error)
      toast.error(
        typeof error === "string" ? error : "An unexpected error occurred",
      );
  }, [error]);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setShowFilters(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getMedicineName = (id) => {
    const med = medicines.find((m) => m.id === id);
    return med ? med.name : `Medicine #${id}`;
  };

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
    if (filterStatus)
      list = list.filter(
        (o) =>
          String(o.status ?? "").toLowerCase() === filterStatus.toLowerCase(),
      );
    if (filterPayMethod)
      list = list.filter(
        (o) =>
          String(o.paymentMethod ?? "").toLowerCase() ===
          filterPayMethod.toLowerCase(),
      );
    return list;
  }, [
    orders,
    q,
    filterOrderId,
    filterCustomer,
    filterDate,
    filterStatus,
    filterPayMethod,
  ]);

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
      [
        "Order ID",
        "User",
        "Pharmacy",
        "Date",
        "Total",
        "Status",
        "Payment Method",
        "Payment Status",
      ],
      ...filtered.map((o) => [
        o.id,
        o.userName,
        o.pharmacyName,
        new Date(o.orderDate).toLocaleDateString(),
        o.totalPrice,
        o.status,
        o.paymentMethod,
        o.paymentStatus,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","),
      )
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
    setFilterStatus("");
    setFilterPayMethod("");
    setShowFilters(false);
  };

  /**
   * Wraps a mutation, shows toast, and re-fetches on success.
   * Mutations return { success, message } from backend.
   */
  const handleMutation = async (mutationFn, id, successMsg) => {
    try {
      await mutationFn(id);
      toast.success(successMsg);
      await fetchPharmacy();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Operation failed";
      toast.error(msg);
    }
  };

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

  const hasActiveFilters =
    filterOrderId ||
    filterCustomer ||
    filterDate ||
    filterStatus ||
    filterPayMethod;

  return (
    <div className="space-y-4 p-3 sm:space-y-5 sm:p-4 md:space-y-6 md:p-0">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        {statsData.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border bg-white p-3 shadow sm:p-4 md:flex-row md:items-center">
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition sm:px-4 sm:text-sm ${
                showFilters ? "border-gray-400 bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-secondary" />
              )}
            </button>

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
                {/* Order Status filter */}
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setPage(1);
                    }}
                    className="w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                  >
                    <option value="">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Processing">Processing</option>
                    <option value="OutForDelivery">Out For Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="CancelledByUser">Cancelled by User</option>
                    <option value="CancelledByPharmacy">
                      Cancelled by Pharmacy
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                {/* Payment Method filter */}
                <div className="relative">
                  <select
                    value={filterPayMethod}
                    onChange={(e) => {
                      setFilterPayMethod(e.target.value);
                      setPage(1);
                    }}
                    className="w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                  >
                    <option value="">All payment methods</option>
                    <option value="Cash">Cash</option>
                    <option value="Payment">Online (Paymob)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={clearFilters}
                  className="w-full py-1 text-center text-xs text-red-500 transition hover:text-red-700 sm:text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition hover:bg-gray-50 sm:px-4 sm:text-sm"
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-xs sm:text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {[
                  "Order",
                  "Customer",
                  "Pharmacy",
                  "Date",
                  "Total",
                  "Payment",
                  "Status",
                  "Action",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-3 font-semibold sm:px-4 sm:py-4 md:px-5 ${
                      i >= 3 ? "text-center" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
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
                    colSpan={8}
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
                    <td className="whitespace-nowrap px-3 py-3 sm:px-4 sm:py-4 md:px-5">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="font-bold text-secondary underline-offset-2 transition hover:underline"
                      >
                        #{o.id}
                      </button>
                    </td>
                    {/* Customer */}
                    <td className="max-w-[100px] truncate px-3 py-3 sm:max-w-[130px] sm:px-4 sm:py-4 md:px-5">
                      {o.userName}
                    </td>
                    {/* Pharmacy */}
                    <td className="max-w-[100px] truncate px-3 py-3 sm:max-w-[130px] sm:px-4 sm:py-4 md:px-5">
                      {o.pharmacyName}
                    </td>
                    {/* Date */}
                    <td className="whitespace-nowrap px-3 py-3 text-center sm:px-4 sm:py-4 md:px-5">
                      {new Date(o.orderDate).toLocaleDateString()}
                    </td>
                    {/* Total */}
                    <td className="whitespace-nowrap px-3 py-3 text-center font-medium sm:px-4 sm:py-4 md:px-5">
                      {o.totalPrice} EGP
                    </td>
                    {/* Payment Method + Status */}
                    <td className="px-3 py-3 text-center sm:px-4 sm:py-4 md:px-5">
                      <div className="flex flex-col items-center gap-1">
                        <PaymentMethodBadge method={o.paymentMethod} />
                        <PaymentStatusBadge status={o.paymentStatus} />
                      </div>
                    </td>
                    {/* Order Status */}
                    <td className="px-3 py-3 text-center sm:px-4 sm:py-4 md:px-5">
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs sm:px-3 sm:py-1 ${statusStyle(o.status)}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    {/* Action buttons — driven by order status transitions */}
                    <td className="px-3 py-3 text-center sm:px-4 sm:py-4 md:px-5">
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
                              handleMutation(
                                process,
                                o.id,
                                "Order is now processing",
                              )
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
                        {/* Cancel — only allowed on Pending or Accepted */}
                        {(o.status === "Pending" ||
                          o.status === "Accepted") && (
                          <button
                            disabled={loading}
                            onClick={() =>
                              handleMutation(
                                cancelByPharmacy,
                                o.id,
                                String(o.paymentMethod ?? "").toLowerCase() ===
                                  "payment" ||
                                  String(o.paymentMethod ?? "") === "1"
                                  ? "Order cancelled — refund initiated"
                                  : "Order cancelled",
                              )
                            }
                            className="whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 transition hover:bg-red-200 disabled:opacity-50 sm:px-3 sm:py-1"
                          >
                            Cancel
                          </button>
                        )}
                        {/* No actions for Delivered or already-Cancelled */}
                        {(o.status === "Delivered" ||
                          o.status === "CancelledByUser" ||
                          o.status === "CancelledByPharmacy") && (
                          <span className="text-xs italic text-gray-400">
                            —
                          </span>
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

      {/* Pagination */}
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
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" /> Prev
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
            Next <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
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

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        getMedicineName={getMedicineName}
        statusStyle={statusStyle}
      />
    </div>
  );
}
