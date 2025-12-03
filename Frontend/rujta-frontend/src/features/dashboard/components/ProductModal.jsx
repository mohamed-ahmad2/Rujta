import React, { useEffect, useState } from "react";

export default function ProductModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    id: "#"+(Math.floor(Math.random()*900)+100),
    name: "",
    qty: "0 Units",
    price: "$0.00",
    expiry: "",
    status: "In stock",
    category: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        id: "#"+(Math.floor(Math.random()*900)+100),
        name: "",
        qty: "0 Units",
        price: "$0.00",
        expiry: "",
        status: "In stock",
        category: "",
      });
    }
  }, [open]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return alert("Enter product name");
    onSave(form);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold ">Add New Product</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={(e)=>update("name", e.target.value)} placeholder="Product name" className="border px-3 py-2 rounded-lg" />
            <input value={form.qty} onChange={(e)=>update("qty", e.target.value)} placeholder="Quantity (e.g. 120 Units)" className="border px-3 py-2 rounded-lg" />
            <input value={form.price} onChange={(e)=>update("price", e.target.value)} placeholder="Price (e.g. $5.00)" className="border px-3 py-2 rounded-lg" />
            <input value={form.expiry} onChange={(e)=>update("expiry", e.target.value)} placeholder="Expiry (dd-mm-yyyy)" className="border px-3 py-2 rounded-lg" />
          </div>

          <div className="flex items-center gap-3">
            <select value={form.status} onChange={(e)=>update("status", e.target.value)} className="border px-3 py-2 rounded-lg">
              <option>In stock</option>
              <option>Low stock</option>
              <option>Out of stock</option>
            </select>
            <input value={form.category} onChange={(e)=>update("category", e.target.value)} placeholder="Category" className="border px-3 py-2 rounded-lg flex-1" />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-secondary text-white">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
