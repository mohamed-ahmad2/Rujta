import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import useMedicines from "../hook/useMedicines";
import Navbar from "../../user/components/Navbar";
import imge1 from "../../../assets/hero/img1.png";

const MedicineDetails = ({ cart, setCart, onCartClick }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { medicines, fetchAll, loading, error } = useMedicines();
  const [added, setAdded] = useState(false);
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const isUserRoute = location.pathname.startsWith("/user");
  const hasNavbar = !isUserRoute;

  const product = medicines.find((m) => String(m.id) === String(id));

  // Related medicines: same category, exclude current
  const related = product
    ? medicines.filter(
        (m) => m.categoryId === product.categoryId && String(m.id) !== String(id)
      ).slice(0, 8)
    : [];

  const addToCart = () => {
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [...prev, { ...product, quantity: 1 }];
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const handleAddRelated = (med) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === med.id);
      if (existing)
        return prev.map((i) =>
          i.id === med.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [...prev, { ...med, quantity: 1 }];
    });
    setAddedIds((p) => ({ ...p, [med.id]: true }));
    setTimeout(() => setAddedIds((p) => ({ ...p, [med.id]: false })), 1200);
  };

  /* ── States ── */
  if (loading)
    return (
      <div className="flex items-center justify-center py-32" style={{ background: "#f5f8f2" }}>
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "#5a8a1f", borderTopColor: "transparent" }} />
      </div>
    );

  if (error)
    return <p className="py-24 text-center text-red-500">{error}</p>;

  if (!product)
    return (
      <div className="flex items-center justify-center py-32" style={{ background: "#f5f8f2" }}>
        <div className="text-center">
          <div className="mb-3 text-5xl">🔍</div>
          <p style={{ color: "#7a8472" }}>Product not found.</p>
        </div>
      </div>
    );

  return (
    <>
      {hasNavbar && <Navbar cart={cart} onCartClick={onCartClick} />}

      <div
        className="min-h-screen px-4 py-12"
        style={{
          background: "#f5f8f2",
          fontFamily: "'DM Sans', sans-serif",
          paddingTop: hasNavbar ? "6rem" : "3rem",
        }}
      >
        <div className="mx-auto max-w-5xl">


          {/* ── Main Card ── */}
          <div
            className="mb-10 overflow-hidden rounded-3xl bg-white"
            style={{
              border: "1.5px solid #e8eee2",
              boxShadow: "0 2px 24px rgba(90,138,31,0.09)",
            }}
          >
            <div className="grid md:grid-cols-2">

              {/* Image panel */}
              <div
                className="relative flex items-center justify-center p-10"
                style={{ background: "#EAF3DE", minHeight: 320 }}
              >
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full"
                  style={{ background: "rgba(90,138,31,0.08)" }} />
                <div className="pointer-events-none absolute -bottom-6 -left-5 h-28 w-28 rounded-full"
                  style={{ background: "rgba(90,138,31,0.05)" }} />

                <img
                  src={product.imageUrl || imge1}
                  alt={product.name}
                  className="relative z-10 h-56 w-56 object-contain transition-transform duration-500 hover:scale-105"
                  onError={(e) => (e.currentTarget.src = imge1)}
                />
              </div>

              {/* Info panel */}
              <div className="flex flex-col justify-between p-8 sm:p-10">
                {/* Badge */}
                <div>
                  <span
                    className="mb-4 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest"
                    style={{ background: "#EAF3DE", color: "#5a8a1f", border: "1px solid rgba(90,138,31,0.2)" }}
                  >
                    ✓ Available
                  </span>

                  <h1
                    className="mb-3 text-3xl font-semibold leading-tight"
                    style={{ color: "#3e6013", fontFamily: "'Playfair Display', serif", letterSpacing: "-0.4px" }}
                  >
                    {product.name}
                  </h1>

                  <p className="leading-relaxed text-gray-500" style={{ fontSize: 14 }}>
                    {product.description || "No description available."}
                  </p>
                </div>

                {/* Price + CTA */}
                <div className="mt-8">
                  

                  <button
                    onClick={addToCart}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition-all duration-200 active:scale-95"
                    style={{
                      background: added ? "#3e6013" : "#5a8a1f",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: "0 4px 16px rgba(90,138,31,0.25)",
                    }}
                  >
                    {added ? (
                      "✓ Added to Cart"
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Related Medicines ── */}
          {related.length > 0 && (
            <section>
              <div className="mb-5 flex items-center gap-3">
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "#7a8472" }}
                >
                  Same Category
                </span>
                <span className="flex-1" style={{ height: 1, background: "#e8eee2" }} />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {related.map((med) => {
                  const isAdded = addedIds[med.id];
                  const desc = med.description || "No description available";

                  return (
                    <div
                      key={med.id}
                      onClick={() => navigate(`/medicines/${med.id}`)}
                      className="group flex cursor-pointer flex-col overflow-hidden bg-white transition-all duration-300"
                      style={{
                        borderRadius: 20,
                        border: "1.5px solid #e8eee2",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 12px 40px rgba(90,138,31,0.13)";
                        e.currentTarget.style.borderColor = "rgba(90,138,31,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                        e.currentTarget.style.borderColor = "#e8eee2";
                      }}
                    >
                      {/* Image */}
                      <div
                        className="flex h-36 items-center justify-center overflow-hidden"
                        style={{ background: "#EAF3DE", position: "relative" }}
                      >
                        <img
                          src={med.imageUrl || imge1}
                          alt={med.name}
                          className="h-24 w-24 object-contain transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => (e.currentTarget.src = imge1)}
                        />
                        <div
                          className="pointer-events-none absolute bottom-0 left-0 right-0 h-8"
                          style={{ background: "linear-gradient(to top, rgba(234,243,222,0.6), transparent)" }}
                        />
                      </div>

                      {/* Body */}
                      <div className="flex flex-1 flex-col p-3">
                        <h3
                          className="mb-1 font-semibold"
                          style={{ color: "#3e6013", fontSize: 13, letterSpacing: "-0.1px" }}
                        >
                          {med.name}
                        </h3>
                        <p className="flex-1 text-[11px] leading-relaxed text-gray-400">
                          {desc.length > 60 ? desc.slice(0, 60) + "…" : desc}
                        </p>

                        <div className="mt-3 pt-3" style={{ borderTop: "1px solid #e8eee2" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAddRelated(med); }}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white transition-all duration-200 active:scale-95"
                            style={{
                              background: isAdded ? "#3e6013" : "#5a8a1f",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {isAdded ? "✓ Added" : (
                              <>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
            </section>
          )}

        </div>
      </div>
    </>
  );
};

export default MedicineDetails;
