// src/features/dashboard/pages/Ads.jsx
import React, { useState } from "react";
import { MdCampaign } from "react-icons/md";
import { FiCheckCircle } from "react-icons/fi";

const adTemplates = [
  {
    id: 1,
    name: "Discount Banner",
    description: "Highlight discounts and offers",
    badge: "SALE",
  },
  {
    id: 2,
    name: "New Arrival",
    description: "Promote new products",
    badge: "NEW",
  },
  {
    id: 3,
    name: "Best Seller",
    description: "Show top selling medicines",
    badge: "HOT",
  },
];

const productsMock = [
  { id: 101, name: "Panadol Extra" },
  { id: 102, name: "Brufen 400mg" },
  { id: 103, name: "Augmentin 625" },
];

export default function Ads() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");

  return (
    <div className="p-6 space-y-10">

      {/* ================= Header ================= */}
      <div className="flex items-center gap-3">
        <MdCampaign className="text-primary" size={28} />
        <h1 className="text-2xl font-bold">Ads Management</h1>
      </div>

      {/* ================= Templates ================= */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Choose Ad Template
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adTemplates.map((template) => {
            const isActive = selectedTemplate?.id === template.id;

            return (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`relative cursor-pointer rounded-2xl p-5 border transition-all duration-300
                  ${
                    isActive
                      ? "border-primary bg-primary/10 shadow-lg scale-[1.02]"
                      : "hover:border-primary/50 hover:shadow"
                  }`}
              >
                {/* Badge */}
                <span className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full bg-primary text-white">
                  {template.badge}
                </span>

                <h3 className="font-semibold text-lg mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {template.description}
                </p>

                {isActive && (
                  <FiCheckCircle
                    className="absolute bottom-4 right-4 text-primary"
                    size={22}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= Product ================= */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          Choose Product
        </h2>

        <select
          className="w-full md:w-1/2 p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">Select a product</option>
          {productsMock.map((product) => (
            <option key={product.id} value={product.name}>
              {product.name}
            </option>
          ))}
        </select>
      </section>

      {/* ================= Preview ================= */}
      {selectedTemplate && selectedProduct && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Live Preview</h2>

          <div className="rounded-2xl p-6 bg-gradient-to-r from-primary to-primary/70 text-white shadow-xl">
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
              {selectedTemplate.badge}
            </span>

            <h3 className="text-2xl font-bold mt-4">
              {selectedTemplate.name}
            </h3>

            <p className="mt-2 text-white/90">
              Now promoting
              <span className="font-semibold">
                {" "}
                {selectedProduct}
              </span>
            </p>

            <button className="mt-6 px-5 py-2 bg-white text-primary font-semibold rounded-xl hover:scale-105 transition">
              View Product
            </button>
          </div>
        </section>
      )}

      {/* ================= Actions ================= */}
      <div className="flex gap-4 pt-4">
        <button
          disabled={!selectedTemplate || !selectedProduct}
          className="px-8 py-3 rounded-xl bg-primary text-white font-semibold shadow
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:scale-105 transition"
        >
          Create Ad
        </button>

        <button className="px-8 py-3 rounded-xl border border-primary text-primary font-semibold hover:bg-primary/10 transition">
          Save as Draft
        </button>
      </div>

    </div>
  );
}
