import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  PlusCircle,
  ChevronDown,
  Package,
} from "lucide-react";
import StatCard from "../components/OrderCard";
import { useOrders } from "../../orders/hooks/useOrders";
import useMedicines from "../../medicines/hook/useMedicines";
import { toast } from "react-toastify";

// ─── Order Details Modal ──────────────────────────────────────────────────────
function OrderDetailsModal({ order, onClose, getMedicineName, statusStyle }) {
  if (!order) return null;

  const items = order.items || order.orderItems || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50">
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

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Customer
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {order.userName || "—"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Pharmacy
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {order.pharmacyName || "—"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Date
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Total
              </p>
              <p className="text-sm font-bold text-secondary">
                {order.totalPrice} EGP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">Status:</p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(order.status)}`}
            >
              {order.status}
            </span>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Package className="h-3.5 w-3.5" />
              Items ({items.length})
            </p>
            {items.length > 0 ? (
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {items.map((item, i) => {
                  const name =
                    item.name ||
                    item.medicineName ||
                    (item.medicineID
                      ? getMedicineName(item.medicineID)
                      : `Item #${i + 1}`);
                  const qty = item.qty || item.quantity || 0;
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
                <Package className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">No items data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-end">
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

// ─── Add Order Modal ──────────────────────────────────────────────────────────
function AddOrderModal({ open, onClose, onAdd }) {
  const [form, setForm] = useState({
    userName: "",
    
    orderDate: new Date().toISOString().split("T")[0],
    totalPrice: "",
    status: "Pending",
    items: [{ name: "", qty: 1, price: "" }],
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const updateItem = (idx, k, v) =>
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [k]: v };
      return { ...f, items };
    });

  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { name: "", qty: 1, price: "" }],
    }));

  const removeItem = (idx) =>
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx),
    }));

  const calcTotal = () =>
    form.items
      .reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1),
        0
      )
      .toFixed(2);

  const handleSubmit = () => {
    if (!form.userName.trim()) return toast.error("Customer name is required.");
    if (!form.pharmacyName.trim())
      return toast.error("Pharmacy name is required.");
    if (form.items.some((it) => !it.name.trim()))
      return toast.error("All items must have a name.");

    const newOrder = {
      id: Date.now(),
      userName: form.userName,
      
      orderDate: form.orderDate,
      totalPrice: form.totalPrice || calcTotal(),
      status: form.status,
      items: form.items,
    };

    onAdd(newOrder);
    toast.success("Order added successfully!");
    onClose();
    setForm({
      userName: "",
      pharmacyName: "",
      orderDate: new Date().toISOString().split("T")[0],
      totalPrice: "",
      status: "Pending",
      items: [{ name: "", qty: 1, price: "" }],
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-h-[90vh] sm:w-[90%] sm:rounded-2xl md:w-[75%] lg:w-[60%] xl:max-w-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
            Add New Order
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.userName}
                onChange={(e) => update("userName", e.target.value)}
                placeholder="e.g. Ahmed Mohamed"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <div>
              
             
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Order Date
              </label>
              <input
                type="date"
                value={form.orderDate}
                onChange={(e) => update("orderDate", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 pr-8 text-sm text-gray-700 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Processing">Processing</option>
                  <option value="OutForDelivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Order Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary transition hover:bg-secondary/20"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium text-gray-400">
                <span className="col-span-6">Item Name</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-center">Price (EGP)</span>
                <span className="col-span-1" />
              </div>

              {form.items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-2"
                >
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                    placeholder="Medicine name"
                    className="col-span-6 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) => updateItem(idx, "qty", e.target.value)}
                    className="col-span-2 rounded-lg border border-gray-200 bg-white px-2 py-2 text-center text-xs focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(idx, "price", e.target.value)}
                    placeholder="0.00"
                    className="col-span-3 rounded-lg border border-gray-200 bg-white px-2 py-2 text-center text-xs focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={form.items.length === 1}
                    className="col-span-1 flex justify-center text-gray-300 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Total Price (EGP)
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                — auto-calculated from items, or override manually
              </span>
            </label>
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20">
              <span className="mr-2 text-sm text-gray-400">EGP</span>
              <input
                type="number"
                step="0.01"
                value={form.totalPrice}
                onChange={(e) => update("totalPrice", e.target.value)}
                placeholder={calcTotal()}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-full bg-secondary px-6 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              <PlusCircle className="h-4 w-4" />
              Add Order
            </button>
          </div>
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

  // ✅ Added — needed for OrderDetailsModal
  const { medicines, fetchAll } = useMedicines();

  // rawOrders is order[][] — flatten to order[] for the pharmacy table
  const apiOrders = useMemo(() => rawOrders.flat(), [rawOrders]);

  const [localOrders, setLocalOrders] = useState([]);
  const orders = useMemo(
    () => [...localOrders, ...apiOrders],
    [localOrders, apiOrders]
  );

  const [openModal, setOpenModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
    fetchAll(); // ✅ Added — load medicines for the details modal
  }, [fetchPharmacy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (error) {
      toast.error(
        error?.message ||
          (typeof error === "string" ? error : "An unexpected error occurred")
      );
    }
  }, [error]);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setShowFilters(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ✅ Added — resolves a medicine ID to its name for the details modal
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
          o.id?.toString().includes(s)
      );
    }
    if (filterOrderId)
      list = list.filter((o) => o.id?.toString().includes(filterOrderId));
    if (filterCustomer)
      list = list.filter((o) =>
        o.userName?.toLowerCase().includes(filterCustomer.toLowerCase())
      );
    if (filterDate)
      list = list.filter(
        (o) => new Date(o.orderDate).toLocaleDateString("en-CA") === filterDate
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

  const isLocal = (id) => localOrders.some((o) => o.id === id);

  const statsData = [
    { title: "Total Orders", value: orders.length },
    {
      title: "Completed",
      value: orders.filter((o) => o.status === "Delivered").length,
    },
    {
      title: "Pending",
      value: orders.filter((o) =>
        ["Pending", "Accepted", "Processing"].includes(o.status)
      ).length,
    },
    {
      title: "Cancelled",
      value: orders.filter((o) => o.status?.startsWith("Cancelled")).length,
    },
  ];

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
          <button
            onClick={() => setOpenModal(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-medium text-white transition hover:opacity-90 sm:flex-none sm:px-4 sm:text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Add New Order
          </button>

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
          <table className="w-full min-w-[700px] text-xs sm:text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {["Order", "User", "Pharmacy", "Date", "Total", "Status", "Action"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-3 py-3 font-semibold sm:px-4 sm:py-4 md:px-6 ${i >= 3 ? "text-center" : "text-left"}`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                      <span className="text-xs sm:text-sm">Loading orders...</span>
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
                  <tr key={o.id} className="border-t transition hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-3 sm:px-4 sm:py-4 md:px-6">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="font-bold text-secondary hover:underline underline-offset-2 transition"
                      >
                        #{o.id}
                      </button>
                      {isLocal(o.id) && (
                        <span className="ml-1.5 rounded-full bg-secondary/10 px-1.5 py-0.5 text-[10px] text-secondary">
                          new
                        </span>
                      )}
                    </td>
                    <td className="max-w-[100px] truncate px-3 py-3 sm:max-w-[140px] sm:px-4 sm:py-4 md:px-6">
                      {o.userName}
                    </td>
                    <td className="max-w-[100px] truncate px-3 py-3 sm:max-w-[140px] sm:px-4 sm:py-4 md:px-6">
                      {o.pharmacyName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-center sm:px-4 sm:py-4 md:px-6">
                      {new Date(o.orderDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-center font-medium sm:px-4 sm:py-4 md:px-6">
                      {o.totalPrice} EGP
                    </td>
                    <td className="px-3 py-3 text-center sm:px-4 sm:py-4 md:px-6">
                      <span
                        className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs sm:px-3 sm:py-1 ${statusStyle(o.status)}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center sm:px-4 sm:py-4 md:px-6">
                      {isLocal(o.id) ? (
                        <span className="text-xs italic text-gray-400">
                          Pending API
                        </span>
                      ) : (
                        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                          {o.status === "Pending" && (
                            <button
                              disabled={loading}
                              onClick={() => handleMutation(accept, o.id, "Order accepted")}
                              className="whitespace-nowrap rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 transition hover:bg-green-200 disabled:opacity-50 sm:px-3 sm:py-1"
                            >
                              Accept
                            </button>
                          )}
                          {o.status === "Accepted" && (
                            <button
                              disabled={loading}
                              onClick={() => handleMutation(process, o.id, "Order processed")}
                              className="whitespace-nowrap rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700 transition hover:bg-yellow-200 disabled:opacity-50 sm:px-3 sm:py-1"
                            >
                              Process
                            </button>
                          )}
                          {o.status === "Processing" && (
                            <button
                              disabled={loading}
                              onClick={() => handleMutation(outForDelivery, o.id, "Order out for delivery")}
                              className="whitespace-nowrap rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 transition hover:bg-blue-200 disabled:opacity-50 sm:px-3 sm:py-1"
                            >
                              Out For Delivery
                            </button>
                          )}
                          {o.status === "OutForDelivery" && (
                            <button
                              disabled={loading}
                              onClick={() => handleMutation(deliver, o.id, "Order delivered")}
                              className="whitespace-nowrap rounded-full bg-green-200 px-2 py-0.5 text-xs text-green-800 transition hover:bg-green-300 disabled:opacity-50 sm:px-3 sm:py-1"
                            >
                              Delivered
                            </button>
                          )}
                          {!["Delivered", "OutForDelivery"].includes(o.status) &&
                            !o.status?.startsWith("Cancelled") && (
                              <button
                                disabled={loading}
                                onClick={() => handleMutation(cancelByPharmacy, o.id, "Order cancelled")}
                                className="whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 transition hover:bg-red-200 disabled:opacity-50 sm:px-3 sm:py-1"
                              >
                                Cancel
                              </button>
                            )}
                        </div>
                      )}
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
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`rounded-full px-2 py-1 text-xs transition sm:px-3 sm:text-sm ${
                page === p ? "bg-secondary text-white" : "border hover:bg-gray-50"
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

      {/* Add Order Modal */}
      <AddOrderModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onAdd={(newOrder) => {
          setLocalOrders((prev) => [newOrder, ...prev]);
          setPage(1);
        }}
      />

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