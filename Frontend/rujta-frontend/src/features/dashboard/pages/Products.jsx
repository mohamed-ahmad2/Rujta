// Products.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
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
import useDrugRequest from "../../drugRequests/hook/useDrugRequest";
import { getPagedInventoryItems } from "../../inventory item/api/inventoryItem";

const statusColor = {
  "In stock": "bg-green-100 text-green-700",
  "Low stock": "bg-yellow-100 text-yellow-700",
  "Out of stock": "bg-red-100 text-red-600",
  Expired: "bg-gray-100 text-gray-500",
};

const perPage = 6;

const STATUS_TO_API = {
  "In stock": "InStock",
  "Low stock": "LowStock",
  "Out of stock": "OutOfStock",
  Expired: "Expired",
};

const INITIAL_FILTER = {
  page: 1,
  categoryName: "All",
  categoryId: null,
  status: "All",
  searchTerm: "",
};

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
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
    <div
      className={`fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      } text-white`}
    >
      <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function Products() {
  const { items, loading, error, fetchPaged, remove, create, update } =
    useInventory();
  const { pharmacyCategories, fetchPharmacyCategories } = useCategory();
  const { submit } = useDrugRequest();

  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [toast, setToast] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0 });

  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [rawSearch, setRawSearch] = useState("");

  const filterRef = useRef(null);
  const statsFetched = useRef(false);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter((prev) => ({ ...prev, page: 1, searchTerm: rawSearch }));
    }, 400);
    return () => clearTimeout(timer);
  }, [rawSearch]);

  const loadStats = useCallback(async () => {
    if (statsFetched.current) return;
    statsFetched.current = true;
    try {
      const [allRes, lowRes, outRes] = await Promise.all([
        getPagedInventoryItems({ PageNumber: 1, PageSize: 1 }),
        getPagedInventoryItems({
          PageNumber: 1,
          PageSize: 1,
          Status: "LowStock",
        }),
        getPagedInventoryItems({
          PageNumber: 1,
          PageSize: 1,
          Status: "OutOfStock",
        }),
      ]);
      setStats({
        total: allRes?.data?.totalCount ?? 0,
        lowStock: lowRes?.data?.totalCount ?? 0,
        outOfStock: outRes?.data?.totalCount ?? 0,
      });
    } catch (_) {}
  }, []);

  // Initial Data Loading
  useEffect(() => {
    const init = async () => {
      await fetchPharmacyCategories();
      setDataReady(true);
      loadStats();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main Fetch Effect
  useEffect(() => {
    if (!dataReady) return;

    const apiFilter = { PageNumber: filter.page, PageSize: perPage };

    if (filter.categoryId != null) apiFilter.CategoryId = filter.categoryId;
    if (filter.status !== "All" && STATUS_TO_API[filter.status]) {
      apiFilter.Status = STATUS_TO_API[filter.status];
    }
    if (filter.searchTerm?.trim()) {
      apiFilter.SearchTerm = filter.searchTerm.trim();
    }

    fetchPaged(apiFilter).then((result) => {
      if (result) {
        setTotalCount(result.totalCount ?? 0);
        setTotalPages(
          Math.max(1, Math.ceil((result.totalCount ?? 0) / perPage)),
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady, filter]);

  const handleCategoryChange = (name) => {
    const cat = pharmacyCategories.find((c) => c.name === name);
    setFilter((prev) => ({
      ...prev,
      page: 1,
      categoryName: name,
      categoryId: name === "All" ? null : (cat?.id ?? null),
      searchTerm: "",
    }));
    setRawSearch("");
  };

  const handleStatusChange = (status) => {
    setFilter((prev) => ({
      ...prev,
      page: 1,
      status,
      searchTerm: "",
    }));
    setRawSearch("");
  };

  const handlePageChange = (newPage) => {
    setFilter((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilter(INITIAL_FILTER);
    setRawSearch("");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasActiveFilters =
    filter.categoryName !== "All" || filter.status !== "All";

  const pageRange = buildPageRange(filter.page, totalPages);

  const reloadCurrentPage = useCallback(() => {
    setFilter((prev) => ({ ...prev }));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    const success = await remove(String(id).replace("#", ""));
    if (success) {
      reloadCurrentPage();
      setToast({ type: "success", message: "Product deleted successfully." });
    }
  };

  const handleAddOrUpdate = async (data) => {
    const isEdit = !!editingProduct;
    const editId = editingProduct?.raw?.id ?? editingProduct?.raw?.Id;

    const success = isEdit ? await update(editId, data) : await create(data);

    if (success) {
      setOpenModal(false);
      setEditingProduct(null);
      reloadCurrentPage();
      setToast({
        type: "success",
        message: isEdit
          ? "Product updated successfully!"
          : "Product added successfully!",
      });
    } else {
      setToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const handleExport = () => {
    const rows = [
      ["ID", "Name", "Company", "Category", "Qty", "Price", "Expiry", "Status"],
      ...items.map((p) => [
        p.id,
        p.name,
        p.companyName || "—",
        p.category,
        p.qty,
        p.price,
        p.expiry,
        p.status,
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
    a.download = "products-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 p-3 sm:space-y-5 sm:p-4 md:space-y-6 md:p-0">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-6">
        <ProductsCard
          title="Total Products"
          value={stats.total.toLocaleString()}
          icon={<Package size={18} />}
          color="bg-secondary"
        />
        <ProductsCard
          title="Low Stock Items"
          value={stats.lowStock}
          icon={<AlertTriangle size={18} />}
          color="bg-yellow-500"
        />
        <ProductsCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={<XCircle size={18} />}
          color="bg-red-500"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border bg-white p-3 shadow sm:p-4 md:flex-row md:items-center">
        <div className="flex w-full items-center gap-2 rounded-full bg-gray-100 px-3 py-2 md:w-1/3">
          <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <input
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            placeholder="Search by drug name..."
            className="w-full bg-transparent text-xs outline-none sm:text-sm"
          />
          {rawSearch && (
            <button
              onClick={() => {
                setRawSearch("");
                setFilter((prev) => ({ ...prev, searchTerm: "" }));
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          {/* Filters */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition sm:text-sm ${
                filterOpen || hasActiveFilters
                  ? "border-gray-400 bg-gray-100"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-secondary" />
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 z-50 mt-2 w-72 space-y-3 rounded-2xl border bg-white p-4 shadow-xl sm:w-80">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-700">Filter Products</p>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Category
                  </label>
                  <select
                    value={filter.categoryName}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full rounded-lg border bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="All">All Categories</option>
                    {pharmacyCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Status
                  </label>
                  <select
                    value={filter.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full rounded-lg border bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="All">All Status</option>
                    <option value="In stock">In stock</option>
                    <option value="Low stock">Low stock</option>
                    <option value="Out of stock">Out of stock</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2 text-sm font-medium text-red-500 hover:text-red-600"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-2 text-xs transition hover:bg-gray-50 sm:text-sm"
          >
            <UploadCloud className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table with Company Name Column */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
            <p className="text-sm text-gray-500">Loading products...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-center">
              <thead>
                <tr className="border-b bg-gray-50 text-xs text-gray-500 sm:text-sm">
                  {[
                    "Product ID",
                    "Product Name",
                    "Company",
                    "Category",
                    "Quantity",
                    "Price",
                    "Expiry Date",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-3 py-4 font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-gray-500">
                      {rawSearch
                        ? `No products match "${rawSearch}".`
                        : "No products found."}
                    </td>
                  </tr>
                ) : (
                  items.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-t hover:bg-gray-50 ${p.expired ? "bg-red-50" : ""}`}
                    >
                      <td className="px-3 py-4 text-sm font-medium">{p.id}</td>
                      <td className="max-w-[160px] truncate px-3 py-4 text-left text-sm">
                        {p.name}
                      </td>

                      {/* Company Name Column */}
                      <td className="max-w-[150px] truncate px-3 py-4 text-left text-sm text-gray-700">
                        {p.companyName || "—"}
                      </td>

                      <td className="px-3 py-4 text-sm">{p.category ?? "—"}</td>
                      <td className="px-3 py-4 text-sm">{p.qty}</td>
                      <td className="px-3 py-4 text-sm">{p.price}</td>
                      <td className="px-3 py-4 text-sm">{p.expiry}</td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs ${statusColor[p.status] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setOpenModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, filter.page - 1))}
              disabled={filter.page === 1}
              className="flex items-center gap-1 rounded-full border px-4 py-2 text-sm disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>

            {pageRange.map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-3 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    filter.page === p
                      ? "bg-secondary text-white"
                      : "border hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, filter.page + 1))
              }
              disabled={filter.page === totalPages}
              className="flex items-center gap-1 rounded-full border px-4 py-2 text-sm disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Page {filter.page} of {totalPages} • {totalCount.toLocaleString()}{" "}
            results
          </p>
        </div>
      )}

      <ProductModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingProduct(null);
        }}
        onSave={handleAddOrUpdate}
        onSubmitRequest={submit}
        categories={pharmacyCategories}
        loadingCategories={false}
        initialData={editingProduct?.raw || null}
      />
    </div>
  );
}
