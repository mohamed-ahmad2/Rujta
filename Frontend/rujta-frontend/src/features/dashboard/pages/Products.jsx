// src/dashboard/pages/Products.jsx
import React, { useEffect, useRef, useState } from "react";
import ProductsCard from "../components/ProductsCard";
import {
  Package,
  AlertTriangle,
  XCircle,
  Search,
  PlusCircle,
  Trash2,
  Edit,
  UploadCloud,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import ProductModal from "../components/ProductModal";
import useInventory from "../../inventory item/hook/useInventoryItem";
import useCategory from "../../category/hook/useCategory";
import useMedicines from "../../medicines/hook/useMedicines";

const statusColor = {
  "In stock": "bg-green-100 text-green-700",
  "Low stock": "bg-yellow-100 text-yellow-700",
  "Out of stock": "bg-red-100 text-red-600",
};

export default function Products() {
  const { items, loading, error, fetchAll, remove, create, update } =
    useInventory();
  const {
    categories,
    fetchAll: fetchCategories,
    loading: loadingCategories,
  } = useCategory();
  const {
    medicines,
    fetchAll: fetchMedicines,
    loading: loadingMedicines,
  } = useMedicines();

  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const filterRef = useRef(null);

  useEffect(() => {
    fetchAll();
    fetchCategories();
    fetchMedicines();
  }, [fetchAll, fetchCategories, fetchMedicines]);

  // Close filter panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);



  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  const totalProducts = items.length;
  const lowStockCount = items.filter((p) => p.status === "Low stock").length;
  const outOfStockCount = items.filter(
    (p) => p.status === "Out of stock",
  ).length;
  const hasActiveFilters = filterCategory !== "All" || filterStatus !== "All";

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await remove(id.replace("#", ""));
    setPage(1);
  };

  const handleAddOrUpdate = async (data) => {
    if (editingProduct) await update(editingProduct.raw.id, data);
    else await create(data);
    setOpenModal(false);
    setEditingProduct(null);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterCategory("All");
    setFilterStatus("All");
    setPage(1);
  };

  // Export CSV
  const handleExport = () => {
    const rows = [
      ["ID", "Name", "Category", "Qty", "Price", "Expiry", "Status"],
      ...filtered.map((p) => [
        p.id,
        p.name,
        p.category,
        p.qty,
        p.price,
        p.expiry,
        p.status,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 p-3 sm:space-y-5 sm:p-4 md:space-y-6 md:p-0">
      {/* ===== Stats ===== */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-6">
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

      {/* ===== Action Bar ===== */}
      <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border bg-white p-3 shadow sm:p-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="flex w-full items-center gap-2 rounded-full bg-gray-100 px-3 py-2 md:w-1/3">
          <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or ID..."
            className="w-full bg-transparent text-xs outline-none sm:text-sm"
          />
          {q && (
            <button
              onClick={() => {
                setQ("");
                setPage(1);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add */}
          <button
            onClick={() => {
              setEditingProduct(null);
              setOpenModal(true);
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-medium text-white transition hover:opacity-90 sm:flex-none sm:px-4 sm:text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Add Product
          </button>

          {/* Filter */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition sm:text-sm ${
                filterOpen || hasActiveFilters
                  ? "border-gray-400 bg-gray-100"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-secondary" />
              )}
            </button>

            {/* Filter Dropdown */}
            {filterOpen && (
              <div className="absolute right-0 z-50 mt-2 w-64 space-y-3 rounded-2xl border bg-white p-3 shadow-xl sm:w-72 sm:p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-700 sm:text-sm">
                    Filter Products
                  </p>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border bg-white p-2 text-xs focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                  >
                    <option>All</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg border bg-white p-2 text-xs focus:outline-none focus:ring-2 focus:ring-secondary sm:text-sm"
                  >
                    <option>All</option>
                    <option>In stock</option>
                    <option>Low stock</option>
                    <option>Out of stock</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-1 text-center text-xs text-red-500 transition hover:text-red-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-2 text-xs transition hover:bg-gray-50 sm:text-sm"
          >
            <UploadCloud className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Export
          </button>
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 sm:py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-secondary border-t-transparent sm:h-8 sm:w-8" />
            <p className="text-xs text-gray-500 sm:text-sm">
              Loading products...
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center px-4 py-10">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs text-red-500 sm:text-sm">
              {error}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-center">
              <thead>
                <tr className="border-b bg-gray-50 text-xs text-gray-500 sm:text-sm">
                  {[
                    "Product ID",
                    "Product Name",
                    "Category",
                    "Quantity",
                    "Price",
                    "Expiry Date",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-2 py-3 font-semibold sm:px-3 md:px-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-xs text-gray-500 sm:text-sm"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  pageData.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-t transition hover:bg-gray-50 ${p.expired ? "bg-red-50" : ""}`}
                    >
                      <td className="whitespace-nowrap px-2 py-3 text-xs font-medium sm:px-3 sm:text-sm md:px-4">
                        {p.id}
                      </td>
                      <td className="max-w-[120px] truncate px-2 py-3 text-xs sm:px-3 sm:text-sm md:px-4">
                        {p.name}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-xs sm:px-3 sm:text-sm md:px-4">
                        {p.category}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-xs sm:px-3 sm:text-sm md:px-4">
                        {p.qty}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-xs sm:px-3 sm:text-sm md:px-4">
                        {p.price}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 text-xs sm:px-3 sm:text-sm md:px-4">
                        {p.expiry}
                      </td>
                      <td className="px-2 py-3 sm:px-3 md:px-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs sm:px-3 sm:py-1 ${statusColor[p.status]}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-2 py-3 sm:px-3 md:px-4">
                        <div className="flex justify-center gap-2 text-gray-500 sm:gap-3">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setOpenModal(true);
                            }}
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

      {/* ===== Pagination ===== */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition hover:bg-gray-50 disabled:opacity-50 sm:px-3 sm:text-sm"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      )}

      {/* ===== Modal ===== */}
      <ProductModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingProduct(null);
        }}
        onSave={handleAddOrUpdate}
        categories={categories}
        loadingCategories={loadingCategories}
        medicines={medicines}
        loadingMedicines={loadingMedicines}
        initialData={editingProduct?.raw || null}
      />
    </div>
  );
}