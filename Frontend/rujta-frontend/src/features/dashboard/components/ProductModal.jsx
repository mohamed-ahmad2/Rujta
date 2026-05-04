// src/features/dashboard/components/ProductModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { X, Search, Minus, Plus, Upload, ChevronDown } from "lucide-react";

function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl transition-all
      ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      <span className="text-lg">{type === "success" ? "✅" : "❌"}</span>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

// ─── Tab: Add Existing Drug ───────────────────────────────────────────────────
function AddExistingTab({
  categories = [],
  loadingCategories,
  medicines = [],
  loadingMedicines,
  initialData,
  onSave,
  onClose,
}) {
  const [search, setSearch] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setSearch(initialData.medicineName || "");
      setCategory(initialData.categoryName || "");
      setQuantity(initialData.quantity || 100);
      setSelectedMedicine(
        initialData.medicineId
          ? { id: initialData.medicineId, name: initialData.medicineName }
          : null,
      );
    } else {
      setSearch("");
      setCategory("");
      setQuantity(100);
      setSelectedMedicine(null);
    }
  }, [initialData]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedCategory =
    categories.find((c) => c.name === category) || null;

  const handleSubmit = () => {
    if (!selectedMedicine) return alert("Please select a valid medicine.");

    const parsed = {
      medicineId: selectedMedicine.id,
      prescriptionId: initialData ? initialData.prescriptionId : null,
      categoryId: selectedCategory ? selectedCategory.id : null,
      medicineName: selectedMedicine.name,
      categoryName: category || null,
      quantity: toNumber(quantity),
      price: initialData ? toNumber(initialData.price) : 0,
      status: initialData ? initialData.status : 0,
      expiryDate: initialData ? initialData.expiryDate : null,
    };

    if (initialData) {
      parsed.id = initialData.id;
      parsed.pharmacyId = initialData.pharmacyId;
    }

    onSave(parsed);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Search Drug Database
        </label>
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20">
            <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedMedicine(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Start typing drug name, SKU or NDC..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          {showDropdown && search && (
            <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
              {loadingMedicines ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No medicines found.
                </div>
              ) : (
                filtered.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMedicine(m);
                      setSearch(m.name);
                      setShowDropdown(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                      💊
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{m.name}</p>
                      {m.sku && (
                        <p className="text-xs text-gray-400">SKU: {m.sku}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
          <span className="inline-block h-3.5 w-3.5 rounded-full border border-gray-300 text-center leading-3 text-[10px]">
            i
          </span>
          Only drugs already approved in the master database will appear here.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Quantity to Add
          </label>
          <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(0, q - 1))}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-gray-500 transition hover:bg-gray-100"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-transparent text-center text-sm font-medium outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-gray-500 transition hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedMedicine && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
            💊
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800">{selectedMedicine.name}</p>
            {selectedMedicine.sku && (
              <p className="text-xs text-gray-400">SKU: {selectedMedicine.sku}</p>
            )}
          </div>
          {initialData && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Current Stock</p>
              <p className="font-bold text-secondary">
                {initialData.quantity} Units
              </p>
            </div>
          )}
        </div>
      )}

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
          className="rounded-full bg-secondary px-6 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          {initialData ? "Update" : "Confirm Add"}
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Request New Drug ────────────────────────────────────────────────────
function RequestNewDrugTab({
  categories = [],
  loadingCategories,
  onClose,
  onSubmitRequest,
}) {
  const [form, setForm] = useState({
    drugName: "",
    description: "",
    category: "",
    manufacturer: "",
    supplier: "",
    price: "",
    quantity: "",
    expiryDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.drugName)     return setToast({ type: "error", message: "Drug name is required." });
    if (!form.category)     return setToast({ type: "error", message: "Category is required." });
    if (!form.manufacturer) return setToast({ type: "error", message: "Manufacturer is required." });
    if (!form.price)        return setToast({ type: "error", message: "Price is required." });
    if (!form.quantity)     return setToast({ type: "error", message: "Quantity is required." });
    if (!form.expiryDate)   return setToast({ type: "error", message: "Expiry date is required." });

    setSaving(true);
    try {
      await onSubmitRequest({
        drugName:     form.drugName,
        description:  form.description,
        category:     form.category,
        manufacturer: form.manufacturer,
        supplier:     form.supplier,
        price:        parseFloat(form.price),
        quantity:     parseInt(form.quantity),
        expiryDate:   new Date(form.expiryDate).toISOString(),
      });
      setToast({ type: "success", message: "Drug request submitted successfully!" });
      setTimeout(onClose, 1800);
    } catch {
      setToast({ type: "error", message: "Failed to submit drug request. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="space-y-4">
        <div>
          <h4 className="text-base font-semibold text-gray-800">
            New Drug Request
          </h4>
          <p className="mt-0.5 text-xs text-gray-400">
            Fill in the details to submit a new pharmaceutical item for approval.
          </p>
        </div>

        {/* Row 1 — Drug Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Drug Name <span className="text-red-500">*</span>
          </label>
          <input
            value={form.drugName}
            onChange={(e) => update("drugName", e.target.value)}
            placeholder="e.g. Paracetamol Extra Strength"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </div>

        {/* Row 2 — Category + Manufacturer */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 pr-8 text-sm text-gray-700 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              >
                <option value="">Select category</option>
                {loadingCategories ? (
                  <option>Loading...</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Manufacturer <span className="text-red-500">*</span>
            </label>
            <input
              value={form.manufacturer}
              onChange={(e) => update("manufacturer", e.target.value)}
              placeholder="e.g. Pharco"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
            />
          </div>
        </div>

        {/* Row 3 — Supplier + Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Supplier
            </label>
            <input
              value={form.supplier}
              onChange={(e) => update("supplier", e.target.value)}
              placeholder="e.g. El Ezaby"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Price / Unit <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20">
              <span className="mr-1.5 text-gray-400">EGP</span>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* Row 4 — Quantity + Expiry */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              placeholder="e.g. 100"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => update("expiryDate", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Include dosage guidelines, contraindications, or storage requirements..."
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </div>

        {/* Actions */}
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
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-secondary px-6 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit for Approval"}
            {!saving && <span>→</span>}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ProductModal({
  open,
  onClose,
  onSave,
  onSubmitRequest,
  categories = [],
  loadingCategories = false,
  medicines = [],
  loadingMedicines = false,
  initialData = null,
}) {
  const [activeTab, setActiveTab] = useState("existing");

  useEffect(() => {
    if (open) setActiveTab("existing");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-h-[90vh] sm:w-[90%] sm:rounded-2xl md:w-[75%] lg:w-[60%] xl:max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
            Inventory Management
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("existing")}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === "existing"
                ? "border-b-2 border-secondary text-secondary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Add Existing Drug
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === "new"
                ? "border-b-2 border-secondary text-secondary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Request New Drug
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === "existing" ? (
            <AddExistingTab
              categories={categories}
              loadingCategories={loadingCategories}
              medicines={medicines}
              loadingMedicines={loadingMedicines}
              initialData={initialData}
              onSave={onSave}
              onClose={onClose}
            />
          ) : (
            <RequestNewDrugTab
              categories={categories}
              loadingCategories={loadingCategories}
              onClose={onClose}
              onSubmitRequest={onSubmitRequest}
            />
          )}
        </div>
      </div>
    </div>
  );
}
