// src/dashbord/pages/Orders.jsx
import React, { useEffect, useMemo, useState } from "react";
import StatCard from "../components/OrderCard";
import {
  MoreVertical,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  UploadCloud,
} from "lucide-react";

/*
  Orders.jsx
  - Single-file page for Orders (stats cards, toolbar, table, add-order modal, pagination)
  - Uses local uploaded image for decoration: /mnt/data/8c84c4f0-6441-4631-90aa-ff217d7a7d50.png
  - Tries to fetch from /api/orders (GET/POST/DELETE). Falls back to static data if API not available.
*/

const initialOrders = [
  { id: "#ORD001", customer: "John Smith", date: "28-11-2024", items: "Paracetamol (2), Ibuprofen (1)", total: "$25.50", payment: "Paid", status: "Completed" },
  { id: "#ORD002", customer: "Emily Davis", date: "27-11-2024", items: "Amoxicillin (3), Cetirizine (2)", total: "$42.00", payment: "Pending", status: "In progress" },
  { id: "#ORD003", customer: "Michael Johnson", date: "26-11-2024", items: "Loratadine (1), Omeprazole (1)", total: "$15.00", payment: "Paid", status: "Pending" },
  { id: "#ORD004", customer: "Sarah Lee", date: "25-11-2024", items: "Aspirin (4), Hydrocodone (1)", total: "$48.00", payment: "Paid", status: "Completed" },
  { id: "#ORD005", customer: "David Brown", date: "25-11-2024", items: "Albuterol Inhaler (1), Warfarin (2)", total: "$55.00", payment: "Failed", status: "Cancelled" },
  { id: "#ORD006", customer: "Lisa Williams", date: "24-11-2024", items: "Simvastatin (3), Levothyroxine (2)", total: "$22.50", payment: "Paid", status: "Completed" },
  { id: "#ORD007", customer: "Paul Martinez", date: "23-11-2024", items: "Doxycycline (5), Omeprazole (3)", total: "$45.00", payment: "Paid", status: "Completed" },
  { id: "#ORD008", customer: "Anna Taylor", date: "22-11-2024", items: "Cetirizine (2), Albuterol Inhaler (1)", total: "$30.00", payment: "Pending", status: "In progress" },
  { id: "#ORD009", customer: "Chris Moore", date: "21-11-2024", items: "Paracetamol (3), Ibuprofen (4)", total: "$35.00", payment: "Paid", status: "Completed" },
];



function AddOrderModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    id: "#ORD" + String(Math.floor(100 + Math.random() * 899)).padStart(3, "0"),
    customer: "",
    date: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
    items: "",
    total: "",
    payment: "Paid",
    status: "Completed",
  });

  useEffect(() => {
    if (open) {
      setForm((f) => ({
        id: "#ORD" + String(Math.floor(100 + Math.random() * 899)).padStart(3, "0"),
        customer: "",
        date: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
        items: "",
        total: "",
        payment: "Paid",
        status: "Completed",
      }));
    }
  }, [open]);

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.customer || !form.items || !form.total) return alert("Please fill customer, items and total.");
    onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add New Order</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.customer} onChange={(e) => update("customer", e.target.value)} placeholder="Customer name" className="border px-3 py-2 rounded-lg w-full" />
            <input value={form.date} onChange={(e) => update("date", e.target.value)} placeholder="dd-mm-yyyy" className="border px-3 py-2 rounded-lg w-full" />
            <input value={form.total} onChange={(e) => update("total", e.target.value)} placeholder="Total (e.g. $25.50)" className="border px-3 py-2 rounded-lg w-full" />
            <select value={form.payment} onChange={(e) => update("payment", e.target.value)} className="border px-3 py-2 rounded-lg w-full">
              <option>Paid</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
            <select value={form.status} onChange={(e) => update("status", e.target.value)} className="border px-3 py-2 rounded-lg w-full">
              <option>Completed</option>
              <option>In progress</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
            <input value={form.id} readOnly className="border px-3 py-2 rounded-lg w-full bg-gray-50" />
          </div>

          <textarea value={form.items} onChange={(e) => update("items", e.target.value)} placeholder="Products ordered (e.g. Paracetamol (2), Ibuprofen (1))" className="border px-3 py-2 rounded-lg w-full min-h-[80px]" />

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-secondary text-white">Save Order</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Orders() {
  // data + UI state
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 9;

  const [openModal, setOpenModal] = useState(false);

  // Try load from API
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("no api");
        const data = await res.json();
        if (mounted) setOrders(data);
      } catch (e) {
        // fallback to initialOrders already set
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // Derived data (filter, search, paginate)
  const filtered = useMemo(() => {
    let list = [...orders];
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (o) =>
          o.customer?.toLowerCase().includes(s) ||
          o.id?.toLowerCase().includes(s) ||
          o.items?.toLowerCase().includes(s)
      );
    }
    if (filterPayment !== "All") list = list.filter((o) => o.payment === filterPayment);
    if (filterStatus !== "All") list = list.filter((o) => o.status === filterStatus);
    return list;
  }, [orders, q, filterPayment, filterStatus]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  // handlers
  const handleAdd = async (newOrder) => {
    // try POST to API else fallback to local state
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const saved = await res.json();
        setOrders((p) => [saved, ...p]);
      } else {
        setOrders((p) => [newOrder, ...p]);
      }
    } catch {
      setOrders((p) => [newOrder, ...p]);
    }
    setOpenModal(false);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this order?")) return;
    try {
      const res = await fetch(`/api/orders/${id.replace("#ORD", "")}`, { method: "DELETE" });
      if (res.ok) setOrders((p) => p.filter((o) => o.id !== id));
      else setOrders((p) => p.filter((o) => o.id !== id)); // fallback remove
    } catch {
      setOrders((p) => p.filter((o) => o.id !== id));
    }
  };

  const handleExport = () => {
    // simple CSV export from filtered data
    const rows = [
      ["Order ID", "Customer", "Date", "Items", "Total", "Payment", "Status"],
      ...filtered.map((o) => [o.id, o.customer, o.date, o.items, o.total, o.payment, o.status]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // small helper for tag classes
  const paymentTag = (p) => (p === "Paid" ? "bg-green-100 text-green-700" : p === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600");
  const statusTag = (s) =>
    s === "Completed" ? "bg-green-100 text-green-700" : s === "In progress" ? "bg-yellow-100 text-yellow-700" : s === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600";

  return (
    <div className="space-y-6">
     {/* Top stats (cards) */}
<div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
  <StatCard 
    title="Total Orders"
    value="1,256"
    sub="Revenue Generated: $15,500"
    percent="+ 2.7% Since last week"
    variant="green"
  />

  <StatCard
    title="Completed Orders"
    value="875"
    sub="Revenue Generated: $8,500"
    percent="+ 2.7% Since last week"
  />

  <StatCard
    title="Pending Orders"
    value="235"
    sub="Approx Revenue: $2,500"
    percent="+ 3.7% Since last week"
  />

  <StatCard
    title="Cancelled Orders"
    value="5"
    sub="Lost Revenue $1,000"
    percent="- 0.2% Since last week"
  />
</div>


      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-full w-full md:w-1/3">
          <Search size={16} className="text-gray-400" />
          <input
            className="bg-transparent outline-none w-full text-sm"
            placeholder="Search..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setOpenModal(true)} className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-full font-medium">
            <Plus size={16} /> Add New Order
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <button className="px-3 py-2 rounded-full border flex items-center gap-2 text-sm" onClick={() => { /* open filters drawer if you want */ }}>
              <Filter size={16} /> Filters
            </button>
            <button className="px-3 py-2 rounded-full border flex items-center gap-2 text-sm" onClick={handleExport}>
              <Download size={16} /> Export
            </button>
            <div className="px-3 py-2 rounded-full border text-sm">This Month <MoreVertical size={14} /></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-2xl shadow border overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="py-3 px-2">Order ID</th>
              <th className="py-3 px-2">Customer Name</th>
              <th className="py-3 px-2">Order Date</th>
              <th className="py-3 px-2">Products Ordered</th>
              <th className="py-3 px-2">Total Amount</th>
              <th className="py-3 px-2">Payment Status</th>
              <th className="py-3 px-2">Order Status</th>
              <th className="py-3 px-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">Loading...</td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">No orders found</td>
              </tr>
            ) : (
              pageData.map((o) => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-secondary">{o.id}</td>
                  <td className="py-3 px-2">{o.customer}</td>
                  <td className="py-3 px-2">{o.date}</td>
                  <td className="py-3 px-2 text-sm text-gray-700">{o.items}</td>
                  <td className="py-3 px-2">{o.total}</td>
                  <td className="py-3 px-2">
                    <span className={`px-3 py-1 rounded-lg text-xs ${paymentTag(o.payment)}`}>{o.payment}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-3 py-1 rounded-lg text-xs ${statusTag(o.status)}`}>{o.status}</span>
                  </td>
                  <td className="py-3 px-2 text-gray-600">
                    <div className="flex items-center gap-3">
                      <Eye size={18} className="cursor-pointer hover:text-green-600" />
                      <Edit size={18} className="cursor-pointer hover:text-blue-600" />
                      <button onClick={() => handleDelete(o.id)}><Trash2 size={18} className="cursor-pointer hover:text-red-600" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* pagination footer */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">Showing {pageData.length} of {total}</div>

          <div className="flex items-center gap-2">
            <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1 rounded-md bg-white border text-sm">First</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded-md text-sm ${page === i + 1 ? "bg-secondary text-white" : "bg-white border"}`}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1 rounded-md bg-white border text-sm">Last</button>
          </div>
        </div>
      </div>

      {/* Decorative image row (to match the big design card on right in original) */}
      <div className="hidden lg:block">
        <img src={"/mnt/data/8c84c4f0-6441-4631-90aa-ff217d7a7d50.png"} alt="dashboard-hero" className="w-full rounded-2xl shadow mt-2" />
      </div>

      {/* Modal */}
      <AddOrderModal open={openModal} onClose={() => setOpenModal(false)} onSave={handleAdd} />
    </div>
  );
}
