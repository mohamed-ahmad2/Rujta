// src/dashboard/pages/Products.jsx
import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

import ProductModal from "../components/ProductModal";
import useInventory from "../../inventory item/hook/useInventoryItem";
import useCategory from "../../category/hook/useCategory";
import useMedicines from "../../medicines/hook/useMedicines"; // Assuming the path is correct

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

  // fetch products, categories, and medicines on mount
  useEffect(() => {
    fetchAll();
    fetchCategories();
    fetchMedicines();
  }, [fetchAll, fetchCategories, fetchMedicines]);

  // filter products
  const filtered = useMemo(() => {
    return items.filter((p) => {
      const search = q.trim().toLowerCase();

      if (filterStatus !== "All" && p.status !== filterStatus) return false;

      if (filterCategory !== "All" && p.category !== filterCategory)
        return false;

      if (search) {
        const matchName = p.name.toLowerCase().includes(search);
        const matchId = String(p.raw?.id ?? "").includes(search);
        if (!matchName && !matchId) return false;
      }

      return true;
    });
  }, [items, q, filterCategory, filterStatus, categories]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  const totalProducts = items.length;
  const lowStockCount = items.filter((p) => p.status === "Low stock").length;
  const outOfStockCount = items.filter(
    (p) => p.status === "Out of stock"
  ).length;

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await remove(id.replace("#", ""));
    setPage(1);
  };

  const handleAddOrUpdate = async (data) => {
    if (editingProduct) {
      await update(editingProduct.raw.id, data);
    } else {
      await create(data);
    }

    setOpenModal(false);
    setEditingProduct(null);
    setPage(1);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setOpenModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setOpenModal(true);
  };

  const clearFilters = () => {
    setFilterCategory("All");
    setFilterStatus("All");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* stats */}
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

      {/* action bar */}
      <div className="bg-white p-4 rounded-2xl shadow border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-full w-full md:w-1/3">
          <Search size={16} className="text-gray-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or ID..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <div className="flex items-center gap-3 relative">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-full font-medium"
          >
            <PlusCircle size={16} /> Add New Product
          </button>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 bg-white border px-3 py-2 rounded-full text-sm"
          >
            <Filter size={16} /> Filters
          </button>

          <button className="flex items-center gap-2 bg-white border px-3 py-2 rounded-full text-sm">
            <UploadCloud size={16} /> Export
          </button>
        </div>
      </div>

      {/* filter panel */}
      {filterOpen && (
        <div className="bg-white p-4 rounded-2xl shadow border flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPage(1);
            }}
            className="border p-2 rounded w-full md:w-auto"
          >
            <option>All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="border p-2 rounded w-full md:w-auto"
          >
            <option>All</option>
            <option>In stock</option>
            <option>Low stock</option>
            <option>Out of stock</option>
          </select>

          <button
            onClick={clearFilters}
            className="flex items-center gap-2 bg-white border px-3 py-2 rounded-full text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* table */}
      <div className="bg-white p-4 rounded-2xl shadow border overflow-x-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading products...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <table className="w-full text-center">
            <thead>
              <tr className="text-sm text-gray-500">
                <th className="py-3 px-2">Product ID</th>
                <th className="py-3 px-2">Product Name</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Quantity</th>
                <th className="py-3 px-2">Price</th>
                <th className="py-3 px-2">Expiry Date</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((p) => (
                <tr
                  key={p.id}
                  className={`border-t hover:bg-gray-50 ${
                    p.expired ? "bg-red-50" : ""
                  }`}
                >
                  <td className="py-3 px-2 font-medium">{p.id}</td>
                  <td className="py-3 px-2">{p.name}</td>
                  <td className="py-3 px-2">{p.category}</td>
                  <td className="py-3 px-2">{p.qty}</td>
                  <td className="py-3 px-2">{p.price}</td>
                  <td className="py-3 px-2">{p.expiry}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        statusColor[p.status]
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex justify-center gap-3 text-gray-600">
                      <Edit
                        size={18}
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => openEditModal(p)}
                      />
                      <Trash2
                        size={18}
                        className="cursor-pointer hover:text-red-600"
                        onClick={() => handleDelete(p.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Product modal with dynamic categories and medicines */}
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
