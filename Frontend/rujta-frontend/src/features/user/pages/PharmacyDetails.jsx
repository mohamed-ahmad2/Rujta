import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import imge1 from "../../../assets/hero/img1.png";
import {
  getAllPharmacies,
  getPharmacyMedicines,
} from "../../pharmacies/api/pharmaciesApi";
import useCampaigns from "../../campaigns/hook/useCampaigns";

const categoryOptions = [
  { id: "All", name: "All" },
  { id: 1, name: "Pain Relief" },
  { id: 2, name: "Antibiotics" },
  { id: 3, name: "Allergy & Respiratory" },
];

function AdBanner({ ad }) {
  return (
    <div
      className="relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        background: `linear-gradient(135deg, ${ad.colorFrom}, ${ad.colorTo})`,
        fontFamily: ad.fontValue || "sans-serif",
        minHeight: 280,
        padding: "2.5rem 3rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      }}
    >
      {/* Background Decorative Circles */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rounded-full"
        style={{ background: "rgba(255,255,255,0.15)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -left-5 h-40 w-40 rounded-full"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[-40px] right-20 h-28 w-28 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />

      {/* ── Updated Image Section ── */}
      {ad.adMode === "medicine" && ad.medicineImage && (
        <div
          className="absolute right-10 top-1/2 flex -translate-y-1/2 items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-105"
          style={{
            width: 200,
            height: 200,
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(4px)",
            borderRadius: "24% 76% 70% 30% / 30% 30% 70% 70%",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          }}
        >
          <img
            src={ad.medicineImage}
            alt={ad.medicineName}
            className="h-32 w-32 object-contain drop-shadow-2xl"
          />
        </div>
      )}

      <span
        className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white"
        style={{
          background: "rgba(255,255,255,0.22)",
          letterSpacing: "0.06em",
        }}
      >
        {ad.badge}
      </span>

      <h3
        className="font-semibold leading-snug text-white"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          maxWidth: "58%",
        }}
      >
        {ad.headline}
      </h3>

      <p
        className="mt-2 leading-relaxed text-white/75"
        style={{ maxWidth: "58%", fontSize: "0.95rem" }}
      >
        {ad.subtext}
      </p>

      <button
        className="mt-6 rounded-xl font-semibold transition hover:opacity-90"
        style={{
          background: "rgba(255,255,255,0.95)",
          color: ad.colorFrom,
          padding: "10px 28px",
          fontSize: "0.9rem",
          border: "none",
          cursor: "pointer",
        }}
      >
        {ad.ctaLabel} →
      </button>

      <span className="pointer-events-none absolute bottom-3 right-4 text-xs text-white/20">
        Rujta™
      </span>
    </div>
  );
}

/* ─────────────────────────── Main Page ─────────────────────────── */
const PharmacyDetails = ({ cart, setCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ads, fetchByPharmacy } = useCampaigns();

  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [addedIds, setAddedIds] = useState({});

  // Slide State
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getAllPharmacies();
        const found = res.data.find((ph) => ph.id === Number(id));
        if (!found) {
          setError("Pharmacy not found.");
          return;
        }
        setPharmacy(found);
        const [medsRes] = await Promise.all([
          getPharmacyMedicines(found.id),
          fetchByPharmacy(found.id),
        ]);
        setMedicines(medsRes.data || []);
      } catch (err) {
        setError("Failed to load pharmacy data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, fetchByPharmacy]);

  useEffect(() => {
    if (ads.length > 1) {
      const timer = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [ads]);

  const handleAddToCart = (product) => {
    if (!setCart) return;
    setCart((prev) => {
      const exists = (prev || []).find(
        (i) => i.id === product.id && i.pharmacyId === pharmacy.id,
      );
      if (exists)
        return prev.map((i) =>
          i.id === product.id && i.pharmacyId === pharmacy.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      return [
        ...(prev || []),
        { ...product, pharmacyId: pharmacy.id, quantity: 1 },
      ];
    });

    setAddedIds((p) => ({ ...p, [product.id]: true }));
    setTimeout(() => setAddedIds((p) => ({ ...p, [product.id]: false })), 1200);
  };

  const filteredMedicines = medicines.filter(
    (med) =>
      (selectedCategory === "All" || med.categoryId === selectedCategory) &&
      med.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  if (error) return <p className="py-24 text-center text-red-500">{error}</p>;
  if (!pharmacy)
    return (
      <p className="py-24 text-center text-gray-400">Pharmacy not found.</p>
    );

  return (
    <div
      className="min-h-screen px-4 py-12"
      style={{ background: "#f5f8f2", fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="mx-auto max-w-5xl">
        {/* ── Pharmacy Hero ── */}
        <div
          className="mb-8 flex items-center gap-5 overflow-hidden rounded-3xl bg-white p-7"
          style={{
            border: "1.5px solid #e8eee2",
            boxShadow: "0 2px 16px rgba(90,138,31,0.07)",
            position: "relative",
          }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(90,138,31,0.08) 0%, transparent 70%)",
            }}
          />
          <div
            className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl"
            style={{
              background: "#EAF3DE",
              border: "2px solid rgba(90,138,31,0.15)",
              boxShadow: "0 4px 16px rgba(90,138,31,0.12)",
            }}
          >
            <img
              src={pharmacy.imageUrl || imge1}
              alt={pharmacy.name}
              className="h-12 w-12 object-contain"
              onError={(e) => (e.currentTarget.src = imge1)}
            />
          </div>
          <div className="flex-1">
            <h1
              className="text-2xl font-semibold"
              style={{
                color: "#3e6013",
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "-0.3px",
              }}
            >
              {pharmacy.name}
            </h1>
            {pharmacy.address && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {pharmacy.address}
              </p>
            )}
          </div>
          <span
            className="rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest"
            style={{
              background: "#EAF3DE",
              color: "#5a8a1f",
              border: "1px solid rgba(90,138,31,0.2)",
            }}
          >
            ✓ Verified
          </span>
        </div>

        {/* ── Dynamic Ad Slider ── */}
        {ads.length > 0 && (
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <p
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "#7a8472" }}
              >
                Pharmacy Offers ({currentAdIndex + 1}/{ads.length})
              </p>
              {ads.length > 1 && (
                <div className="flex gap-1">
                  {ads.map((_, idx) => (
                    <div
                      key={idx}
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: idx === currentAdIndex ? "20px" : "6px",
                        background:
                          idx === currentAdIndex ? "#5a8a1f" : "#e8eee2",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="transition-all duration-500 ease-in-out">
              <AdBanner ad={ads[currentAdIndex]} />
            </div>
          </div>
        )}

        {/* ── Search + Categories ── */}
        <div className="mb-7 flex flex-wrap items-center gap-3">
          <div className="relative flex-1" style={{ minWidth: 200 }}>
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
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
        {filteredMedicines.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMedicines.map((med) => {
              const desc = med.description || "No description available";
              const isLong = desc.length > 70;
              const isExpanded = expanded[med.id];
              const isAdded = addedIds[med.id];

              return (
                <div
                  key={med.id}
                  onClick={() => navigate(`/user/medicine/${med.id}`)}
                  className="group flex cursor-pointer flex-col overflow-hidden bg-white transition-all duration-300"
                  style={{
                    borderRadius: 20,
                    border: "1.5px solid #e8eee2",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 40px rgba(90,138,31,0.13)";
                    e.currentTarget.style.borderColor = "rgba(90,138,31,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 1px 4px rgba(0,0,0,0.04)";
                    e.currentTarget.style.borderColor = "#e8eee2";
                  }}
                >
                  <div
                    className="flex h-44 items-center justify-center overflow-hidden"
                    style={{ background: "#EAF3DE", position: "relative" }}
                  >
                    <img
                      src={med.imageUrl || imge1}
                      alt={med.name}
                      className="h-28 w-28 object-contain transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => (e.currentTarget.src = imge1)}
                    />
                    <div
                      className="pointer-events-none absolute bottom-0 left-0 right-0 h-8"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(234,243,222,0.6), transparent)",
                      }}
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3
                      className="font-semibold"
                      style={{
                        color: "#3e6013",
                        fontSize: 15,
                        letterSpacing: "-0.1px",
                      }}
                    >
                      {med.name}
                    </h3>
                    <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-gray-400">
                      {isExpanded || !isLong ? desc : desc.slice(0, 70) + "…"}
                    </p>
                    {isLong && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded((p) => ({ ...p, [med.id]: !p[med.id] }));
                        }}
                        className="mt-1 text-left text-[12px] font-semibold hover:underline"
                        style={{
                          color: "#5a8a1f",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {isExpanded ? "↑ Show Less" : "↓ Show More"}
                      </button>
                    )}

                    <div
                      className="mt-4 flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid #e8eee2" }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(med);
                        }}
                        className="flex items-center gap-1.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 active:scale-95"
                        style={{
                          background: isAdded ? "#3e6013" : "#5a8a1f",
                          padding: "8px 16px",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {isAdded ? (
                          "✓ Added"
                        ) : (
                          <>
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
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
        ) : (
          <div className="py-20 text-center">
            <div className="mb-3 text-5xl">🔍</div>
            <p className="text-gray-400">No medicines found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { PharmacyDetails as default };