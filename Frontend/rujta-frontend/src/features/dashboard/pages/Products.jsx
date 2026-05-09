// Products.jsx
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import ProductsCard from "../components/ProductsCard";
import {
  Package, AlertTriangle, XCircle, Search, PlusCircle,
  Trash2, Edit, UploadCloud, Filter, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import ProductModal from "../components/ProductModal";
import useInventory from "../../inventory item/hook/useInventoryItem";
import useCategory from "../../category/hook/useCategory";
import useMedicines from "../../medicines/hook/useMedicines";
import useDrugRequest from "../../drugRequests/hook/useDrugRequest";

const statusColor = {
  "In stock":     "bg-green-100 text-green-700",
  "Low stock":    "bg-yellow-100 text-yellow-700",
  "Out of stock": "bg-red-100 text-red-600",
  Expired:        "bg-gray-100 text-gray-500",
};

const perPage = 6;

const STATUS_TO_API = {
  "In stock":     "InStock",
  "Low stock":    "LowStock",
  "Out of stock": "OutOfStock",
};

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-3
        rounded-2xl px-5 py-3.5 shadow-xl
        ${type === "success" ? "bg-green-600" : "bg-red-600"} text-white`}>
      <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function Products() {
  const { items, loading, error, fetchPaged, remove, create, update } = useInventory();
  const { categories, fetchAll: fetchCategories, loading: loadingCategories } = useCategory();
  const { medicines, fetchAll: fetchMedicines, loading: loadingMedicines }    = useMedicines();
  const { submit } = useDrugRequest();

  const [openModal,      setOpenModal]      = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [q,              setQ]              = useState("");
  const [page,           setPage]           = useState(1);
  const [totalCount,     setTotalCount]     = useState(0);
  const [totalPages,     setTotalPages]     = useState(1);
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus,   setFilterStatus]   = useState("All");
  const [toast,          setToast]          = useState(null);
  const filterRef = useRef(null);
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0 });

  // ── Frontend-only search — never triggers a backend call ──────────────────
  const filteredItems = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter(
      (p) =>
        (p.name     ?? "").toLowerCase().includes(s) ||
        (p.id       ?? "").toString().includes(s)    ||
        (p.category ?? "").toLowerCase().includes(s)
    );
  }, [items, q]);

  const buildFilter = useCallback(
    (pageNumber, category, status) => {
      const filter = { pageNumber, pageSize: perPage };
      if (category !== "All") {
        const cat = categories.find((c) => c.name === category);
        if (cat) filter.categoryId = cat.id;
      }
      if (status !== "All" && STATUS_TO_API[status])
        filter.status = STATUS_TO_API[status];
      return filter;
    },
    [categories],
  );

  const loadPage = useCallback(
    async (pageNumber, category, status) => {
      const result = await fetchPaged(buildFilter(pageNumber, category, status));
      if (result) {
        setTotalCount(result.totalCount ?? 0);
        setTotalPages(Math.max(1, Math.ceil((result.totalCount ?? 0) / perPage)));
      }
    },
    [fetchPaged, buildFilter],
  );

  const loadStats = useCallback(async () => {
    try {
      const [allRes, lowRes, outRes] = await Promise.all([
        fetchPaged({ pageNumber: 1, pageSize: 1 }),
        fetchPaged({ pageNumber: 1, pageSize: 1, status: "LowStock" }),
        fetchPaged({ pageNumber: 1, pageSize: 1, status: "OutOfStock" }),
      ]);
      setStats({
        total:      allRes?.totalCount ?? 0,
        lowStock:   lowRes?.totalCount ?? 0,
        outOfStock: outRes?.totalCount ?? 0,
      });
    } catch (_) {}
  }, [fetchPaged]);

  useEffect(() => {
    fetchCategories();
    fetchMedicines();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear local search whenever we navigate to a new page or change filters
  useEffect(() => {
    setQ("");
    loadPage(page, filterCategory, filterStatus);
  }, [page, filterCategory, filterStatus]);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasActiveFilters = filterCategory !== "All" || filterStatus !== "All";
  const pageRange        = buildPageRange(page, totalPages);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    const result = await remove(String(id).replace("#", ""));
    if (result) {
      setTotalCount(result.totalCount ?? 0);
      setTotalPages(Math.max(1, Math.ceil((result.totalCount ?? 0) / perPage)));
    }
    loadStats();
    setToast({ type: "success", message: "Product deleted successfully." });
  };

  // ── Add / Update ───────────────────────────────────────────────────────────
  const handleAddOrUpdate = async (data) => {
    // Snapshot BEFORE any state mutation so we don't lose it mid-async
    const isEdit  = !!editingProduct;
    const editId  = editingProduct?.raw?.id;

    try {
      const result = isEdit
        ? await update(editId, data)
        : await create(data);

      setOpenModal(false);
      setEditingProduct(null);

      if (result) {
        setTotalCount(result.totalCount ?? 0);
        setTotalPages(Math.max(1, Math.ceil((result.totalCount ?? 0) / perPage)));
      }

      loadStats();
      setToast({
        type:    "success",
        message: isEdit ? "Product updated successfully!" : "Product added successfully!",
      });
    } catch {
      setToast({ type: "error", message: "Something went wrong. Please try again." });
    }
  };

  const clearFilters = () => {
    setFilterCategory("All");
    setFilterStatus("All");
    setPage(1);
  };

  const handleExport = () => {
    const rows = [
      ["ID", "Name", "Category", "Qty", "Price", "Expiry", "Status"],
      ...filteredItems.map((p) => [p.id, p.name, p.category, p.qty, p.price, p.expiry, p.status]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "products-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 p-3 sm:space-y-5 sm:p-4 md:space-y-6 md:p-0">

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-6">
        <ProductsCard title="Total Products"  value={stats.total.toLocaleString()} icon={<Package size={18} />}       color="bg-secondary"  />
        <ProductsCard title="Low Stock Items" value={stats.lowStock}               icon={<AlertTriangle size={18} />} color="bg-yellow-500" />
        <ProductsCard title="Out of Stock"    value={stats.outOfStock}             icon={<XCircle size={18} />}       color="bg-red-500"    />
      </div>

      <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border bg-white p-3 shadow sm:p-4 md:flex-row md:items-center">
        {/* ── Search — purely frontend, no setPage ── */}
        <div className="flex w-full items-center gap-2 rounded-full bg-gray-100 px-3 py-2 md:w-1/3">
          <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, ID or category..."
            className="w-full bg-transparent text-xs outline-none sm:text-sm"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setEditingProduct(null); setOpenModal(true); }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-medium text-white transition hover:opacity-90 sm:flex-none sm:px-4 sm:text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Add Product
          </button>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition sm:text-sm ${
                filterOpen || hasActiveFilters ? "border-gray-400 bg-gray-100" : "bg-white hover:bg-gray-50"
              }`}
            >
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Filters
              {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-secondary" />}
            </button>

            {filterOpen && (
              <div className="absolute right-0 z-50 mt-2 w-64 space-y-3 rounded-2xl border bg-white p-3 shadow-xl sm:w-72 sm:p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-700 sm:text-sm">Filter Products</p>
                  <button onClick={() => setFilterOpen(false)} className="p-0.5 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                    className="w-full rounded-lg border bg-white p-2 text-xs focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                  >
                    <option>All</option>
                    {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                    className="w-full rounded-lg border bg-white p-2 text-xs focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                  >
                    <option>All</option>
                    <option>In stock</option>
                    <option>Low stock</option>
                    <option>Out of stock</option>
                  </select>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="w-full py-1 text-center text-xs text-red-500 transition hover:text-red-700">
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-2 text-xs transition hover:bg-gray-50 sm:text-sm"
          >
            <UploadCloud className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 sm:py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-secondary border-t-transparent sm:h-8 sm:w-8" />
            <p className="text-xs text-gray-500 sm:text-sm">Loading products...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center px-4 py-10">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-500 sm:text-sm">{error}</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-center">
              <thead>
                <tr className="border-b bg-gray-50 text-xs text-gray-500 sm:text-sm">
                  {["Product ID","Product Name","Category","Quantity","Price","Expiry Date","Status","Actions"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-2 py-3 font-semibold sm:px-3 md:px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-xs text-gray-500 sm:text-sm">
                      {q ? `No products match "${q}".` : "No products found."}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((p) => (
                    <tr key={p.id} className={`border-t transition hover:bg-gray-50 ${p.expired ? "bg-red-50" : ""}`}>
                      <td className="whitespace-nowrap px-2 py-3 text-xs font-medium sm:px-3 sm:text-sm md:px-4">{p.id}</td>
                      <td className="max-w-[120px] truncate px-2 py-3 text-xs sm:px-3 sm:text-sm md:px-4">{p.name}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-xs sm:px-3 sm:text-sm md:px-4">{p.category ?? "—"}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-xs sm:px-3 sm:text-sm md:px-4">{p.qty}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-xs sm:px-3 sm:text-sm md:px-4">{p.price}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-xs sm:px-3 sm:text-sm md:px-4">{p.expiry}</td>
                      <td className="px-2 py-3 sm:px-3 md:px-4">
                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs sm:px-3 sm:py-1 ${statusColor[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-2 py-3 sm:px-3 md:px-4">
                        <div className="flex justify-center gap-2 text-gray-500 sm:gap-3">
                          <button
                            onClick={() => { setEditingProduct(p); setOpenModal(true); }}
                            className="rounded p-1 transition hover:bg-blue-50 hover:text-blue-600"
                            aria-label="Edit"
                          >
                            <Edit className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="rounded p-1 transition hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:text-sm"
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Prev
            </button>
            {pageRange.map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-1 text-xs text-gray-400 sm:text-sm">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-full px-2 py-1 text-xs transition sm:px-3 sm:text-sm ${
                    page === p ? "bg-secondary text-white" : "border hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:text-sm"
            >
              Next <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 sm:text-sm">
            Page {page} of {totalPages} · {totalCount.toLocaleString()} results
          </p>
        </div>
      )}

      <ProductModal
        open={openModal}
        onClose={() => { setOpenModal(false); setEditingProduct(null); }}
        onSave={handleAddOrUpdate}
        onSubmitRequest={submit}
        categories={categories}
        loadingCategories={loadingCategories}
        medicines={medicines}
        loadingMedicines={loadingMedicines}
        initialData={editingProduct?.raw || null}
      />
    </div>
  );
}
