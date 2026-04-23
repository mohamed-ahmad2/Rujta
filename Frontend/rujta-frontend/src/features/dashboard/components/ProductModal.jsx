// src/dashboard/components/layouts/ProductModal.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export default function ProductModal({
  open,
  onClose,
  onSave,
  categories = [],
  loadingCategories = false,
  medicines = [],
  loadingMedicines = false,
  initialData = null,
}) {
  const [form, setForm] = useState({
    name: "",
    quantity: 0,
    price: 0.0,
    expiry: "",
    category: "",
  });

  useEffect(() => {
    if (open && initialData) {
      setForm({
        name: initialData.medicineName || "",
        quantity: initialData.quantity || 0,
        price: initialData.price?.toFixed(2) || 0.0,
        expiry: initialData.expiryDate
          ? new Date(initialData.expiryDate).toLocaleDateString("en-GB")
          : "",
        category: initialData.categoryName || "",
      });
    } else if (open) {
      setForm({
        name: "",
        quantity: 0,
        price: 0.0,
        expiry: "",
        category: "",
      });
    }
  }, [open, initialData]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return alert("Enter product name");

    const selectedMedicine = medicines.find((m) => m.name === form.name);
    if (!selectedMedicine)
      return alert("Please select a valid medicine from the list.");

    const selectedCategory = form.category
      ? categories.find((c) => c.name === form.category)
      : null;
    if (form.category && !selectedCategory)
      return alert("Please select a valid category from the list.");

    const parsed = {
      medicineId: selectedMedicine.id,
      prescriptionId: initialData ? initialData.prescriptionId : null,
      categoryId: selectedCategory ? selectedCategory.id : null,
      medicineName: form.name,
      categoryName: form.category || null,
      quantity: toNumber(form.quantity),
      price: toNumber(form.price),
      status: initialData ? initialData.status : 0,
      expiryDate: form.expiry
        ? form.expiry.split("/").reverse().join("-")
        : null,
    };

    if (initialData) {
      parsed.id = initialData.id;
      parsed.pharmacyId = initialData.pharmacyId;
    }

    onSave(parsed);
  };

  if (!open) return null;

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal Box */}
      <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-lg sm:max-h-[90vh] sm:w-[90%] sm:rounded-2xl sm:p-5 md:w-[75%] md:p-6 lg:w-[60%] xl:max-w-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between sm:mb-5">
          <h3 className="text-base font-semibold sm:text-lg md:text-xl">
            {initialData ? "Update Product" : "Add New Product"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 sm:p-2"
            aria-label="Close"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3 sm:space-y-4">
          {/* Grid: 1 col on mobile, 2 cols on sm+ */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {/* Product Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 sm:text-sm">
                Product Name
              </label>
              <input
                list="medicines-list"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Search or select medicine"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 sm:py-2.5"
              />
              <datalist id="medicines-list">
                {loadingMedicines ? (
                  <option>Loading...</option>
                ) : (
                  medicines.map((m) => <option key={m.id} value={m.name} />)
                )}
              </datalist>
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 sm:text-sm">
                Quantity
              </label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                placeholder="Quantity"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 sm:py-2.5"
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 sm:text-sm">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="Price"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 sm:py-2.5"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 sm:text-sm">
                Expiry Date
              </label>
              <input
                value={form.expiry}
                onChange={(e) => update("expiry", e.target.value)}
                placeholder="dd/mm/yyyy"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 sm:py-2.5"
              />
            </div>
          </div>

          {/* Category — Full Width */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 sm:text-sm">
              Category
            </label>
            <input
              list="categories-list"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="Search or select category"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 sm:py-2.5"
            />
            <datalist id="categories-list">
              {loadingCategories ? (
                <option>Loading...</option>
              ) : (
                categories.map((c) => <option key={c.id} value={c.name} />)
              )}
            </datalist>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1 sm:gap-3 sm:pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border px-3 py-2 text-xs text-gray-600 transition hover:bg-gray-50 sm:w-auto sm:px-4 sm:py-2.5 sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full rounded-lg bg-secondary px-3 py-2 text-xs text-white transition hover:opacity-90 sm:w-auto sm:px-4 sm:py-2.5 sm:text-sm"
            >
              {initialData ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
