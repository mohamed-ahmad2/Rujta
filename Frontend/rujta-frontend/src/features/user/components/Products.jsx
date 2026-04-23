import React, { useEffect, useState } from "react";
import imge1 from "../../../assets/hero/img1.png";
import useMedicine from "../../medicines/hook/useMedicines";
import { useNavigate } from "react-router-dom";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";

const categoryOptions = [
  { id: "All", name: "All" },
  { id: 1, name: "Pain Relief" },
  { id: 2, name: "Antibiotics" },
  { id: 3, name: "Allergy & Respiratory" },
];

const Products = ({ cart, setCart }) => {
  const { medicines, fetchAll, loading, error } = useMedicine();
  const navigate = useNavigate();

  const {
    pharmacies,
    loading: pharmaciesLoading,
    error: pharmaciesError,
    fetchAllPharmacies,
  } = usePharmacies();

  const [expanded, setExpanded] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    fetchAll();
    fetchAllPharmacies();
  }, [fetchAll]);

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem)
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedIds((prev) => ({ ...prev, [product.id]: false })), 1200);
  };

  const filteredMedicines = medicines.filter(
    (med) =>
      (selectedCategory === "All" || med.categoryId === selectedCategory) &&
      med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── States ── */
  if (loading || pharmaciesLoading)
    return (
      <div className="flex items-center justify-center py-32" style={{ background: "#f5f8f2" }}>
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "#5a8a1f", borderTopColor: "transparent" }} />
      </div>
    );

  if (error || pharmaciesError)
    return <p className="py-20 text-center text-red-500">{error || pharmaciesError}</p>;

  return (
    <div
      className="min-h-screen px-4 py-12"
      style={{ background: "#f5f8f2", fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="mx-auto max-w-5xl">

        {/* ── Section Label ── */}
        <div className="mb-3 flex items-center justify-between">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "#7a8472" }}
          >
            Choose Your Pharmacy
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                document.getElementById("pharmacy-scroll").scrollBy({ left: -320, behavior: "smooth" });
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
              style={{ background: "#fff", border: "1.5px solid #e8eee2", cursor: "pointer", color: "#5a8a1f" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#EAF3DE"; e.currentTarget.style.borderColor = "#5a8a1f"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e8eee2"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => {
                document.getElementById("pharmacy-scroll").scrollBy({ left: 320, behavior: "smooth" });
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
              style={{ background: "#fff", border: "1.5px solid #e8eee2", cursor: "pointer", color: "#5a8a1f" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#EAF3DE"; e.currentTarget.style.borderColor = "#5a8a1f"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e8eee2"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Pharmacies Horizontal Scroll ── */}
        <div
          id="pharmacy-scroll"
          className="mb-10 flex gap-4 overflow-x-auto pb-3 sm:gap-5 lg:gap-6"
          style={{ scrollbarWidth: "none" }}
        >
          {pharmacies.map((ph) => (
            <div
              key={ph.id}
              onClick={() => navigate(`/user/pharmacy/${ph.id}`)}
              className="flex flex-shrink-0 cursor-pointer flex-col items-center gap-3 overflow-hidden bg-white transition-all duration-300"
              style={{
                borderRadius: 24,
                border: "1.5px solid #e8eee2",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                width: 148,
                padding: "18px 14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(90,138,31,0.15)";
                e.currentTarget.style.borderColor = "rgba(90,138,31,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                e.currentTarget.style.borderColor = "#e8eee2";
              }}
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24"
                style={{ background: "#EAF3DE", border: "2px solid rgba(90,138,31,0.12)" }}
              >
                <img
                src={ph.imageUrl || ph.ImageUrl || imge1}
                  alt={ph.name}
                  className="h-12 w-12 object-contain sm:h-14 sm:w-14"
                  onError={(e) => (e.currentTarget.src = imge1)}
                />
              </div>
              <p
                className="text-center text-sm font-semibold leading-tight sm:text-base"
                style={{ color: "#3e6013" }}
              >
                {ph.name}
              </p>
              <span
                className="rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{ background: "#EAF3DE", color: "#5a8a1f" }}
              >
                Visit →
              </span>
            </div>
          ))}
        </div>

        {/* ── Page Title ── */}
        <div className="mb-10 text-center sm:mb-12">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest"
            style={{ background: "#EAF3DE", color: "#5a8a1f", border: "1px solid rgba(90,138,31,0.2)" }}
          >
            Our Products
          </span>
          <h2
            className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
            style={{ color: "#3e6013", fontFamily: "'Playfair Display', serif", letterSpacing: "-0.4px" }}
          >
            Top Rated Medicines
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-sm leading-relaxed text-gray-400 sm:text-base">
            Discover our most trusted medicines and healthcare products,
            carefully selected for your wellbeing.
          </p>
        </div>

        {/* ── Search + Category Filter ── */}
        <div className="mb-7 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1" style={{ minWidth: 200 }}>
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search medicines…"
              className="w-full py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition"
              style={{
                background: "#fff",
                border: "1.5px solid #e8eee2",
                borderRadius: 14,
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#5a8a1f";
                e.target.style.boxShadow = "0 0 0 3px rgba(90,138,31,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e8eee2";
                e.target.style.boxShadow = "none";
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="text-sm font-medium transition-all duration-200"
                  style={{
                    borderRadius: 12,
                    border: `1.5px solid ${active ? "#5a8a1f" : "#e8eee2"}`,
                    background: active ? "#5a8a1f" : "#fff",
                    color: active ? "#fff" : "#7a8472",
                    padding: "8px 18px",
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = "#5a8a1f";
                      e.currentTarget.style.color = "#5a8a1f";
                      e.currentTarget.style.background = "#EAF3DE";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = "#e8eee2";
                      e.currentTarget.style.color = "#7a8472";
                      e.currentTarget.style.background = "#fff";
                    }
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Medicines Grid ── */}
        {filteredMedicines.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mb-3 text-5xl">🔍</div>
            <p className="text-gray-400">No medicines found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:gap-8 xl:grid-cols-4">
            {filteredMedicines.map((med) => {
              const desc = med.description || "No description available";
              const isLong = desc.length > 70;
              const isExpanded = expanded[med.id];
              const isAdded = addedIds[med.id];

              return (
                <div
                  key={med.id}
                  onClick={() => navigate(`/medicines/${med.id}`)}
                  className="group flex cursor-pointer flex-col overflow-hidden bg-white transition-all duration-300"
                  style={{
                    borderRadius: 24,
                    border: "1.5px solid #e8eee2",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 20px 50px rgba(90,138,31,0.15)";
                    e.currentTarget.style.borderColor = "rgba(90,138,31,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                    e.currentTarget.style.borderColor = "#e8eee2";
                  }}
                >
                  {/* Image zone */}
                  <div
                    className="flex items-center justify-center overflow-hidden"
                    style={{ background: "#EAF3DE", position: "relative", height: 170 }}
                  >
                    <img
                      src={med.imageUrl || imge1}
                      alt={med.name}
                      className="object-contain transition-transform duration-500 group-hover:scale-110"
                      style={{ height: 120, width: 120 }}
                      onError={(e) => (e.currentTarget.src = imge1)}
                    />
                    <div
                      className="pointer-events-none absolute bottom-0 left-0 right-0 h-8"
                      style={{ background: "linear-gradient(to top, rgba(234,243,222,0.6), transparent)" }}
                    />
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <h3
                      className="font-semibold"
                      style={{ color: "#3e6013", fontSize: 16, letterSpacing: "-0.1px" }}
                    >
                      {med.name}
                    </h3>
                    <p className="mt-2 flex-1 text-[13px] leading-relaxed text-gray-400">
                      {isExpanded || !isLong ? desc : desc.slice(0, 70) + "…"}
                    </p>
                    {isLong && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded((p) => ({ ...p, [med.id]: !p[med.id] }));
                        }}
                        className="mt-1 text-left text-[13px] font-semibold hover:underline"
                        style={{ color: "#5a8a1f", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {isExpanded ? "↑ Show Less" : "↓ Show More"}
                      </button>
                    )}

                    {/* Footer */}
                    <div
                      className="mt-5 flex items-center justify-between pt-4"
                      style={{ borderTop: "1px solid #e8eee2" }}
                    >
                    
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(med); }}
                        className="flex items-center gap-1.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95"
                        style={{
                          background: isAdded ? "#3e6013" : "#5a8a1f",
                          padding: "10px 20px",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          marginLeft: "auto",
                        }}
                      >
                        {isAdded ? (
                          "✓ Added"
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
