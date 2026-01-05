// src/dashboard/components/layouts/ProductModal.jsx
import React, { useEffect, useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold ">
            {initialData ? "Update Product" : "Add New Product"}
          </h3>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Product Name</label>
              <input
                list="medicines-list"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Search or select medicine"
                className="border px-3 py-2 rounded-lg w-full focus:border-blue-500 focus:outline-none"
              />
              <datalist id="medicines-list">
                {loadingMedicines ? (
                  <option>Loading...</option>
                ) : (
                  medicines.map((m) => <option key={m.id} value={m.name} />)
                )}
              </datalist>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                placeholder="Quantity"
                className="border px-3 py-2 rounded-lg w-full focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Price</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="Price"
                className="border px-3 py-2 rounded-lg w-full focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Expiry Date</label>
              <input
                value={form.expiry}
                onChange={(e) => update("expiry", e.target.value)}
                placeholder="dd/mm/yyyy"
                className="border px-3 py-2 rounded-lg w-full focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Category</label>
            <input
              list="categories-list"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="Search or select category"
              className="border px-3 py-2 rounded-lg w-full focus:border-blue-500 focus:outline-none"
            />
            <datalist id="categories-list">
              {loadingCategories ? (
                <option>Loading...</option>
              ) : (
                categories.map((c) => <option key={c.id} value={c.name} />)
              )}
            </datalist>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-secondary text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
