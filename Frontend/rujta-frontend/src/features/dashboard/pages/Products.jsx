import React, { useEffect, useMemo, useState } from "react";
import ProductsCard from "../components/ProductsCard";
import {
  Package,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Search,
  PlusCircle,
  Eye,
  Trash2,
  Edit,
  UploadCloud,
} from "lucide-react";

import StatCard from "../components/StatCard";
import ProductModal from "../components/ProductModal";



const initialProducts = [
  { id: "#001", name: "Paracetamol 500mg", qty: "120 Units", price: "$5.00", expiry: "15-03-2025", status: "In stock", category: "Antibiotics" },
  { id: "#002", name: "Amoxicillin 250mg", qty: "45 Units", price: "$7.50", expiry: "01-12-2024", status: "Low stock", category: "Antibiotics" },
  { id: "#003", name: "Ibuprofen 200mg", qty: "0 Units", price: "$6.00", expiry: "15-11-2023", status: "Out of stock", category: "Pain Relievers" },
  { id: "#004", name: "Cetirizine 10mg", qty: "150 Units", price: "$3.50", expiry: "30-06-2026", status: "In stock", category: "Allergy Medication" },
];

const categoriesList = [
  "Antibiotics","Pain Relievers","Vitamins & Supplements","Antiviral Drugs",
  "Diabetes Care","Cardiovascular","Allergy Medication","Respiratory Medicines"
];

const statusColor = {
  "In stock": "bg-green-100 text-green-700",
  "Low stock": "bg-yellow-100 text-yellow-700",
  "Out of stock": "bg-red-100 text-red-600",
};

export default function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [openModal, setOpenModal] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 6;

  // filter
  const filtered = useMemo(() => {
    return products.filter(p => {
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.id.includes(q)) return false;
      return true;
    });
  }, [products, q, statusFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  // stats
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.status === "Low stock").length;
  const outOfStockCount = products.filter(p => p.status === "Out of stock").length;

  const handleDelete = (id) => {
    if (!confirm("Delete this product?")) return;
    setProducts(p => p.filter(x => x.id !== id));
  };

  const handleAdd = (newProduct) => {
    setProducts(p => [newProduct, ...p]);
    setOpenModal(false);
    setPage(1);
  };

  return (
    <div className="space-y-6">

     {/* stats row */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

  <ProductsCard
    title="Total Products"
    value={totalProducts.toLocaleString()}
    icon={<Package size={18} />}
    color="bg-secondary"
  />

  <ProductsCard
    title="Low Stock Items"
    value={lowStockCount}
    icon={<AlertTriangle size={18} />}
    color="bg-yellow-500"
  />

  <ProductsCard
    title="Out of Stock"
    value={outOfStockCount}
    icon={<XCircle size={18} />}
    color="bg-red-500"
  />

</div>


      {/* categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoriesList.map((cat, idx) => {
          const isFirst = idx === 0;
          const count = products.filter(p => p.category === cat).length || (isFirst ? 120 : Math.floor(20 + Math.random()*90));
          const change = isFirst ? "+ 2%" : (idx % 3 === 0 ? "+ 0.6%" : "+ 2%");
          const positive = !String(change).startsWith("-");
          return (
            <div key={cat} className={`${isFirst ? "bg-gradient-to-br from-secondary to-secondary text-white" : "bg-white"} rounded-2xl p-5 shadow border`}>
              <div className="flex justify-between items-start">
                <p className={`${isFirst ? "text-white/90 text-sm" : "text-gray-500 text-sm"}`}>{cat}</p>
                <MoreVertical size={18} className={isFirst ? "text-white/70" : "text-gray-400"} />
              </div>

              <div className="flex items-center justify-between mt-4">
                <h3 className={`${isFirst ? "text-3xl font-bold" : "text-2xl font-bold"}`}>{count}</h3>
                <div className={`${isFirst ? "bg-white/10 text-white p-2 rounded-full" : "bg-gray-100 p-2 rounded-full"}`}>
                  <Package size={18} />
                </div>
              </div>

              <p className={`mt-3 text-sm ${positive ? (isFirst ? "text-white/80" : "text-green-600") : "text-red-500"}`}>
                {positive ? "▲" : "▼"} {change} <span className={`${isFirst ? "text-white/80" : "text-gray-500"} ml-2`}>Since last week</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* action bar */}
      <div className="bg-white p-4 rounded-2xl shadow border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-full w-full md:w-1/3">
          <Search size={16} className="text-gray-400" />
          <input value={q} onChange={(e)=>{ setQ(e.target.value); setPage(1); }} placeholder="Search..." className="bg-transparent outline-none w-full text-sm" />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={()=>setOpenModal(true)} className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-full font-medium">
            <PlusCircle size={16} /> Add New Product
          </button>

          <button className="flex items-center gap-2 bg-white border px-3 py-2 rounded-full text-sm">
            <MoreVertical size={16} /> Filters
          </button>

          <button className="flex items-center gap-2 bg-white border px-3 py-2 rounded-full text-sm">
            <UploadCloud size={16} /> Export
          </button>

          <div className="flex items-center gap-1 bg-white border px-3 py-2 rounded-full text-sm">
            This Month <MoreVertical size={14} />
          </div>
        </div>
      </div>

      {/* table */}
      <div className="bg-white p-4 rounded-2xl shadow border overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-500">
              <th className="py-3 px-2">Product ID</th>
              <th className="py-3 px-2">Product Name</th>
              <th className="py-3 px-2">Quantity</th>
              <th className="py-3 px-2">Price</th>
              <th className="py-3 px-2">Expiry Date</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {pageData.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center">No products</td></tr>
            ) : (
              pageData.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{p.id}</td>
                  <td className="py-3 px-2">{p.name}</td>
                  <td className="py-3 px-2">{p.qty}</td>
                  <td className="py-3 px-2">{p.price}</td>
                  <td className="py-3 px-2">{p.expiry}</td>
                  <td className="py-3 px-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${statusColor[p.status] || "bg-gray-100 text-gray-700"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Eye size={18} className="cursor-pointer hover:text-green-600" />
                      <Edit size={18} className="cursor-pointer hover:text-blue-600" />
                      <button onClick={() => handleDelete(p.id)}><Trash2 size={18} className="cursor-pointer hover:text-red-600" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* footer pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">Showing {pageData.length} of {total} products</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1 rounded-md bg-white border">First</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={()=>setPage(i+1)} className={`px-3 py-1 rounded-md ${page === i+1 ? "bg-[#0B6B55] text-white" : "bg-white border"}`}>{i+1}</button>
            ))}
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1 rounded-md bg-white border">Last</button>
          </div>
        </div>
      </div>

      <ProductModal open={openModal} onClose={()=>setOpenModal(false)} onSave={handleAdd} />
    </div>
  );
}
