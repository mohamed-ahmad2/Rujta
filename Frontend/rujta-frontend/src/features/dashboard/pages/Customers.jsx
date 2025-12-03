// src/dashboard/pages/Customers.jsx
import React, { useEffect, useMemo, useState } from "react";
import CustomersCard from "../components/CustomersCard";
import {
  MoreVertical,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

/*
  Customers.jsx
  - Single-file page for Customers (stats cards, toolbar, table, add-customer modal, pagination)
  - Uses local uploaded image for decoration: /mnt/data/d79c4d60-31fb-49ec-83d1-7e49b87cab5e.png
  - Tries to fetch from /api/customers (GET/POST/DELETE). Falls back to static data if API not available.
*/

const initialCustomers = [
  { id: "#CUS001", name: "John Smith", email: "john.smith@example.com", phone: "123-456-7890", orders: 15, spend: "$2,500", lastOrder: "27-11-2024" },
  { id: "#CUS002", name: "Emily Davis", email: "emily.davis@example.com", phone: "234-567-8901", orders: 10, spend: "$1,800", lastOrder: "26-11-2024" },
  { id: "#CUS003", name: "Michael Johnson", email: "michael.j@example.com", phone: "345-678-9012", orders: 8, spend: "$2,500", lastOrder: "25-11-2024" },
  { id: "#CUS004", name: "Sarah Lee", email: "sarah.lee@example.com", phone: "456-789-0123", orders: 5, spend: "$600", lastOrder: "24-11-2024" },
  { id: "#CUS005", name: "Andrew Miller", email: "andrew.miller@example.com", phone: "567-890-1234", orders: 12, spend: "$2,100", lastOrder: "23-11-2024" },
  { id: "#CUS006", name: "Sophia Wilson", email: "sophia.wilson@example.com", phone: "678-901-2345", orders: 9, spend: "$1,450", lastOrder: "22-11-2024" },
  { id: "#CUS007", name: "Olivia Taylor", email: "olivia.taylor@example.com", phone: "890-123-4567", orders: 15, spend: "$3,200", lastOrder: "20-11-2024" },
  { id: "#CUS008", name: "Ethan White", email: "ethan.white@example.com", phone: "123-456-7890", orders: 5, spend: "$750", lastOrder: "17-11-2024" },
  { id: "#CUS009", name: "Mia Harris", email: "mia.harris@example.com", phone: "123-456-7890", orders: 15, spend: "$2,500", lastOrder: "18-11-2024" },
];

function AddCustomerModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    id: "#CUS" + String(Math.floor(100 + Math.random() * 899)).padStart(3, "0"),
    name: "",
    email: "",
    phone: "",
    orders: "",
    spend: "",
    lastOrder: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  });

  useEffect(() => {
    if (open) {
      setForm({
        id: "#CUS" + String(Math.floor(100 + Math.random() * 899)).padStart(3, "0"),
        name: "",
        email: "",
        phone: "",
        orders: "",
        spend: "",
        lastOrder: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
      });
    }
  }, [open]);

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return alert("Please fill name and email.");
    onSave({
      ...form,
      orders: Number(form.orders) || 0,
      spend: form.spend || "$0",
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add New Customer</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" className="border px-3 py-2 rounded-lg w-full" />
            <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Email" className="border px-3 py-2 rounded-lg w-full" />
            <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone" className="border px-3 py-2 rounded-lg w-full" />
            <input value={form.orders} onChange={(e) => update("orders", e.target.value)} placeholder="Orders placed (number)" className="border px-3 py-2 rounded-lg w-full" />
            <input value={form.spend} onChange={(e) => update("spend", e.target.value)} placeholder="Total spend (e.g. $2,500)" className="border px-3 py-2 rounded-lg w-full" />
            <input value={form.lastOrder} onChange={(e) => update("lastOrder", e.target.value)} placeholder="dd-mm-yyyy" className="border px-3 py-2 rounded-lg w-full" />
            <input value={form.id} readOnly className="border px-3 py-2 rounded-lg w-full bg-gray-50 col-span-1 sm:col-span-2" />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-secondary text-white">Save Customer</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Customers() {
  // data + UI state
  const [customers, setCustomers] = useState(initialCustomers);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 9;

  const [openModal, setOpenModal] = useState(false);

  // Try load from API
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) throw new Error("no api");
        const data = await res.json();
        if (mounted) setCustomers(data);
      } catch (e) {
        // fallback to initialCustomers already set
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // Derived data (search + paginate)
  const filtered = useMemo(() => {
    let list = [...customers];
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(s) ||
          c.id?.toLowerCase().includes(s) ||
          c.email?.toLowerCase().includes(s) ||
          c.phone?.toLowerCase().includes(s)
      );
    }
    return list;
  }, [customers, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  // handlers
  const handleAdd = async (newCustomer) => {
    // try POST to API else fallback to local state
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      if (res.ok) {
        const saved = await res.json();
        setCustomers((p) => [saved, ...p]);
      } else {
        setCustomers((p) => [newCustomer, ...p]);
      }
    } catch {
      setCustomers((p) => [newCustomer, ...p]);
    }
    setOpenModal(false);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer?")) return;
    try {
      const res = await fetch(`/api/customers/${id.replace("#CUS", "")}`, { method: "DELETE" });
      if (res.ok) setCustomers((p) => p.filter((c) => c.id !== id));
      else setCustomers((p) => p.filter((c) => c.id !== id));
    } catch {
      setCustomers((p) => p.filter((c) => c.id !== id));
    }
  };

  const handleExport = () => {
    const rows = [
      ["Customer ID", "Name", "Email", "Phone", "Orders", "Total Spend", "Last Order Date"],
      ...filtered.map((c) => [c.id, c.name, c.email, c.phone, c.orders, c.spend, c.lastOrder]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Stats (cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <CustomersCard
          title="Total Customers"
          value="12,500"
          sub="Since last week"
          percent="+ 8%"
          variant="green"
        />
        <CustomersCard
          title="New Customers"
          value="120"
          sub="Since last week"
          percent="+ 5.4%"
        />
        <CustomersCard
          title="Returning Customers"
          value="65%"
          sub="Since last week"
          percent="+ 2.4%"
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-full w-full md:w-1/3">
          <Search size={16} className="text-gray-400" />
          <input
            className="bg-transparent outline-none w-full text-sm"
            placeholder="Search customers..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setOpenModal(true)} className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full font-medium text-white">
            <Plus size={16} /> Add New Customer
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <button className="px-3 py-2 rounded-full border flex items-center gap-2 text-sm" onClick={() => { /* optional filters */ }}>
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
              <th className="py-3 px-2">Customer ID</th>
              <th className="py-3 px-2">Customer Name</th>
              <th className="py-3 px-2">Email</th>
              <th className="py-3 px-2">Phone</th>
              <th className="py-3 px-2">Orders Placed</th>
              <th className="py-3 px-2">Total Spend</th>
              <th className="py-3 px-2">Last Order Date</th>
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
                <td colSpan={8} className="p-4 text-center">No customers found</td>
              </tr>
            ) : (
              pageData.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-secondary">{c.id}</td>
                  <td className="py-3 px-2">{c.name}</td>
                  <td className="py-3 px-2 text-blue-600">{c.email}</td>
                  <td className="py-3 px-2">{c.phone}</td>
                  <td className="py-3 px-2">{c.orders}</td>
                  <td className="py-3 px-2">{c.spend}</td>
                  <td className="py-3 px-2">{c.lastOrder}</td>
                  <td className="py-3 px-2 text-gray-600">
                    <div className="flex items-center gap-3">
                      <Eye size={18} className="cursor-pointer hover:text-green-600" />
                      <Edit size={18} className="cursor-pointer hover:text-blue-600" />
                      <button onClick={() => handleDelete(c.id)}><Trash2 size={18} className="cursor-pointer hover:text-red-600" /></button>
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

      {/* Decorative image (uses uploaded file path) */}
      <div className="hidden lg:block">
        <img src={"/mnt/data/d79c4d60-31fb-49ec-83d1-7e49b87cab5e.png"} alt="customers-hero" className="w-full rounded-2xl shadow mt-2" />
      </div>

      {/* Modal */}
      <AddCustomerModal open={openModal} onClose={() => setOpenModal(false)} onSave={handleAdd} />
    </div>
  );
}
