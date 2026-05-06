// src/features/pharmacies/pages/PharmacyDetails.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import imge1 from "../../../assets/hero/img1.png";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";
import useCampaigns from "../../campaigns/hook/useCampaigns";
import useCategory from "../../category/hook/useCategory";

// ══════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════
const normalizeMedicine = (med = {}) => {
  const price = Number(med.price ?? med.Price ?? 0);
  const discountedPrice = Number(
    med.discountedPrice ?? med.DiscountedPrice ?? 0,
  );
  const discountValue = Number(med.discountValue ?? med.DiscountValue ?? 0);
  const hasDiscount = med.hasDiscount ?? med.HasDiscount ?? false;

  const discountName =
    med.discountName ??
    med.DiscountName ??
    med.discount?.name ??
    med.Discount?.Name ??
    null;

  const rawType = med.discountType ?? med.DiscountType ?? null;
  const discountType =
    rawType === 0 || rawType === "Percentage"
      ? "Percentage"
      : rawType === 1 || rawType === "Fixed"
        ? "Fixed"
        : null;

  return {
    ...med,
    id: med.id ?? med.Id ?? med.medicineId ?? med.MedicineId,
    name: med.name ?? med.Name ?? "Unknown",
    imageUrl: med.imageUrl ?? med.ImageUrl ?? null,
    description: med.description ?? med.Description ?? "",
    categoryId: med.categoryId ?? med.CategoryId ?? null,
    price,
    discountedPrice,
    discountValue,
    hasDiscount,
    discountName,
    discountType,
    effectivePrice: hasDiscount ? discountedPrice : price,
  };
};

// ✅ Currency constant — one place to change
const CURRENCY = "EGP";
const formatPrice = (val) => `${CURRENCY} ${Number(val).toFixed(2)}`;

// ══════════════════════════════════════════════════
// Category Strip
// ══════════════════════════════════════════════════
function CategoryStrip({ categories, selected, onSelect }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [categories.length]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left:
        direction === "left" ? -(el.clientWidth * 0.7) : el.clientWidth * 0.7,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative flex-1" style={{ minWidth: 0 }}>
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-50"
          style={{ border: "1px solid #e8eee2" }}
          aria-label="Scroll left"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5a8a1f"
            strokeWidth="2.5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-50"
          style={{ border: "1px solid #e8eee2" }}
          aria-label="Scroll right"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#5a8a1f"
            strokeWidth="2.5"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {canScrollLeft && (
        <div
          className="pointer-events-none absolute left-0 top-0 z-[5] h-full w-12"
          style={{
            background: "linear-gradient(to right, #f5f8f2, transparent)",
          }}
        />
      )}
      {canScrollRight && (
        <div
          className="pointer-events-none absolute right-0 top-0 z-[5] h-full w-12"
          style={{
            background: "linear-gradient(to left, #f5f8f2, transparent)",
          }}
        />
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-1 py-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {categories.map((cat) => {
          const active = String(selected) === String(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="flex-shrink-0 text-sm font-medium transition-all duration-200"
              style={{
                borderRadius: 999,
                border: `1.5px solid ${active ? "#5a8a1f" : "#e8eee2"}`,
                background: active ? "#5a8a1f" : "#fff",
                color: active ? "#fff" : "#7a8472",
                padding: "8px 18px",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: active ? "0 4px 12px rgba(90,138,31,0.25)" : "none",
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
  );
}

// ══════════════════════════════════════════════════
// Discount Badge
// ══════════════════════════════════════════════════
function DiscountBadge({ discountValue, discountType }) {
  const isPercentage = discountType === "Percentage";
  // ✅ consistent currency symbol
  const label = isPercentage
    ? `SAVE ${Number(discountValue).toFixed(0)}%`
    : `SAVE ${CURRENCY} ${Number(discountValue).toFixed(2)}`;

  return (
    <div
      className="absolute left-0 top-3 flex items-center"
      style={{ zIndex: 2 }}
    >
      <div
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-extrabold text-white"
        style={{
          background: "linear-gradient(135deg, #84cc16 0%, #5a8a1f 100%)",
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          boxShadow: "0 4px 14px rgba(132,204,22,0.4)",
          letterSpacing: "0.04em",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        {label}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// Discount Name Banner
// ══════════════════════════════════════════════════
function DiscountNameBanner({ discountName }) {
  if (!discountName) return null;
  return (
    <div
      className="mb-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
      style={{
        background: "linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%)",
        border: "1px dashed #a3e635",
      }}
    >
      <span style={{ fontSize: 13 }}>🎁</span>
      <span
        className="flex-1 truncate text-[11px] font-bold uppercase"
        style={{ color: "#3e6013", letterSpacing: "0.04em" }}
        title={discountName}
      >
        {discountName}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════
// Ad Banner
// ══════════════════════════════════════════════════
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
      {/* Decorative circles */}
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

      {/* Medicine image */}
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

// ══════════════════════════════════════════════════
// Constants
// ══════════════════════════════════════════════════
const ITEMS_PER_PAGE = 16; // 4 columns × 4 rows

// ══════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════
const PharmacyDetails = ({ cart, setCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    pharmacies,
    loading, // ✅ used only for initial pharmacy fetch spinner
    medicinesLoading, // ✅ used only for medicines grid spinner
    error,
    fetchAllPharmacies,
    pagedPharmacyMedicines,
    fetchPagedPharmacyMedicines,
    clearPharmacyMedicinesCache,
  } = usePharmacies();

  const { ads, fetchByPharmacy } = useCampaigns();
  const { pharmacyCategories, fetchCategoriesByPharmacy } = useCategory();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addedIds, setAddedIds] = useState({});
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Track previous pharmacy id to flush cache on switch
  const prevPharmacyIdRef = useRef(null);

  // ── Fetch all pharmacies on mount
  useEffect(() => {
    fetchAllPharmacies();
  }, [fetchAllPharmacies]);

  // ── Find current pharmacy
  const pharmacy = useMemo(
    () => pharmacies?.find((ph) => ph.id === Number(id)) ?? null,
    [pharmacies, id],
  );

  // ✅ Clear paged cache when navigating between pharmacies
  useEffect(() => {
    if (
      prevPharmacyIdRef.current !== null &&
      prevPharmacyIdRef.current !== pharmacy?.id
    ) {
      clearPharmacyMedicinesCache();
    }
    prevPharmacyIdRef.current = pharmacy?.id ?? null;
  }, [pharmacy?.id, clearPharmacyMedicinesCache]);

  // ── Fetch pharmacy-specific data (campaigns, categories) once
  useEffect(() => {
    if (pharmacy?.id) {
      fetchByPharmacy(pharmacy.id);
      fetchCategoriesByPharmacy(pharmacy.id);
    }
  }, [pharmacy?.id, fetchByPharmacy, fetchCategoriesByPharmacy]);

  // 🔍 Debounce search (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 🔄 Reset page on category change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // 🚀 Fetch paged medicines whenever filter/page changes
  useEffect(() => {
    if (!pharmacy?.id) return;
    fetchPagedPharmacyMedicines(pharmacy.id, {
      pageNumber: currentPage,
      pageSize: ITEMS_PER_PAGE,
      searchTerm: debouncedSearch || undefined,
      categoryId:
        selectedCategory !== "All" ? Number(selectedCategory) : undefined,
    });
  }, [
    pharmacy?.id,
    currentPage,
    debouncedSearch,
    selectedCategory,
    fetchPagedPharmacyMedicines,
  ]);

  // 🗺️ Normalize medicines from server response
  const medicines = useMemo(
    () => (pagedPharmacyMedicines.items || []).map(normalizeMedicine),
    [pagedPharmacyMedicines.items],
  );

  const totalPages = pagedPharmacyMedicines.totalPages || 1;
  const totalCount = pagedPharmacyMedicines.totalCount || 0;

  // ── Categories
  const categoryOptions = useMemo(
    () => [
      { id: "All", name: "All" },
      ...(pharmacyCategories || []).map((c) => ({ id: c.id, name: c.name })),
    ],
    [pharmacyCategories],
  );

  // ── Reset selected category if it no longer exists
  useEffect(() => {
    if (
      selectedCategory !== "All" &&
      !(pharmacyCategories || []).some((c) => c.id === selectedCategory)
    ) {
      setSelectedCategory("All");
    }
  }, [pharmacyCategories, selectedCategory]);

  // ── Ads carousel auto-rotate
  useEffect(() => {
    if (ads.length > 1) {
      const timer = setInterval(
        () => setCurrentAdIndex((prev) => (prev + 1) % ads.length),
        5000,
      );
      return () => clearInterval(timer);
    }
  }, [ads]);

  useEffect(() => {
    setCurrentAdIndex(0);
  }, [ads.length]);

  // ── Add to cart
  const handleAddToCart = (product) => {
    if (!setCart || !pharmacy) return;
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

  // 📄 Smart pagination buttons (with …)
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  // ── Loading / Error / Not-found states ──
  if (loading && !pharmacy)
    return (
      <div className="flex items-center justify-center py-32">
        <div
          className="h-9 w-9 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "#5a8a1f", borderTopColor: "transparent" }}
        />
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
        {/* ══ Pharmacy Header ══ */}
        <div
          className="mb-8 flex items-center gap-5 overflow-hidden rounded-3xl bg-white p-7"
          style={{
            border: "1.5px solid #e8eee2",
            boxShadow: "0 2px 16px rgba(90,138,31,0.07)",
            position: "relative",
          }}
        >
          {/* Decorative radial */}
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(90,138,31,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Logo */}
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

          {/* Name + address */}
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

            {/*
              ✅ FIXED: pharmacy.location is always a plain string
                 (computed in PharmacyDto on the backend).
                 No more "Objects are not valid as a React child" crash.
            */}
            {pharmacy.location && (
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
                {pharmacy.location}
              </p>
            )}
          </div>

          {/* Verified badge */}
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

        {/* ══ Ads Carousel ══ */}
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

        {/* ══ Search ══ */}
        <div className="mb-4">
          <div className="relative">
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
              className="w-full py-2.5 pl-10 pr-10 text-sm text-gray-700 outline-none transition"
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

            {/* ✅ Uses medicinesLoading — won't flicker with pharmacy fetch */}
            {medicinesLoading && searchQuery && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div
                  className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
                  style={{
                    borderColor: "#5a8a1f",
                    borderTopColor: "transparent",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ══ Categories ══ */}
        <div className="mb-7">
          <CategoryStrip
            categories={categoryOptions}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* ══ Medicines Grid ══ */}
        {/* ✅ Uses medicinesLoading — independent from pharmacy fetch */}
        {medicinesLoading && medicines.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: "#5a8a1f", borderTopColor: "transparent" }}
            />
          </div>
        ) : medicines.length > 0 ? (
          <>
            <div
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-5"
              style={{
                opacity: medicinesLoading ? 0.5 : 1, // ✅
                transition: "opacity 0.2s",
              }}
            >
              {medicines.map((med) => {
                const desc = med.description || "No description available";
                const isLong = desc.length > 70;
                const isExpanded = expanded[med.id];
                const isAdded = addedIds[med.id];
                const {
                  hasDiscount,
                  discountValue,
                  discountName,
                  discountType,
                  price,
                  effectivePrice,
                } = med;
                const showDiscount = hasDiscount && discountValue > 0;

                return (
                  <div
                    key={med.id}
                    onClick={() => navigate(`/user/medicine/${med.id}`)}
                    className="group flex cursor-pointer flex-col overflow-hidden bg-white transition-all duration-300"
                    style={{
                      borderRadius: 20,
                      border: showDiscount
                        ? "1.5px solid rgba(132,204,22,0.35)"
                        : "1.5px solid #e8eee2",
                      boxShadow: showDiscount
                        ? "0 2px 12px rgba(132,204,22,0.1)"
                        : "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = showDiscount
                        ? "0 12px 40px rgba(132,204,22,0.22)"
                        : "0 12px 40px rgba(90,138,31,0.13)";
                      e.currentTarget.style.borderColor = showDiscount
                        ? "rgba(132,204,22,0.55)"
                        : "rgba(90,138,31,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = showDiscount
                        ? "0 2px 12px rgba(132,204,22,0.1)"
                        : "0 1px 4px rgba(0,0,0,0.04)";
                      e.currentTarget.style.borderColor = showDiscount
                        ? "rgba(132,204,22,0.35)"
                        : "#e8eee2";
                    }}
                  >
                    {/* ── Image ── */}
                    <div
                      className="relative flex h-44 items-center justify-center overflow-hidden"
                      style={{ background: "#EAF3DE" }}
                    >
                      <img
                        src={med.imageUrl || imge1}
                        alt={med.name}
                        className="h-28 w-28 object-contain transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => (e.currentTarget.src = imge1)}
                      />
                      <div
                        className="pointer-events-none absolute bottom-0 left-0 right-0 h-8"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(234,243,222,0.6), transparent)",
                        }}
                      />
                      {showDiscount && (
                        <DiscountBadge
                          discountValue={discountValue}
                          discountType={discountType}
                        />
                      )}
                    </div>

                    {/* ── Content ── */}
                    <div className="flex flex-1 flex-col p-4">
                      {showDiscount && (
                        <DiscountNameBanner discountName={discountName} />
                      )}

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
                            setExpanded((p) => ({
                              ...p,
                              [med.id]: !p[med.id],
                            }));
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

                      {/* ── Price + Add button ── */}
                      <div
                        className="mt-4 flex items-center justify-between pt-3"
                        style={{ borderTop: "1px solid #e8eee2" }}
                      >
                        <div className="flex flex-col">
                          {/* ✅ consistent EGP currency */}
                          {showDiscount && price > 0 && (
                            <span className="text-[11px] text-gray-400 line-through">
                              {formatPrice(price)}
                            </span>
                          )}
                          <span
                            className="text-base font-extrabold"
                            style={{
                              color: showDiscount ? "#5a8a1f" : "#3e6013",
                            }}
                          >
                            {formatPrice(effectivePrice)}
                          </span>
                        </div>

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

            {/* ══ Smart Pagination ══ */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {/* Prev */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || medicinesLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: currentPage === 1 ? "#f0f0f0" : "#fff",
                    border: "1.5px solid #e8eee2",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    color: currentPage === 1 ? "#bbb" : "#5a8a1f",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                {/* Page numbers */}
                {pageNumbers.map((page, idx) =>
                  page === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      disabled={medicinesLoading}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200"
                      style={{
                        background: page === currentPage ? "#5a8a1f" : "#fff",
                        border: `1.5px solid ${
                          page === currentPage ? "#5a8a1f" : "#e8eee2"
                        }`,
                        color: page === currentPage ? "#fff" : "#7a8472",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        boxShadow:
                          page === currentPage
                            ? "0 4px 12px rgba(90,138,31,0.25)"
                            : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (page !== currentPage) {
                          e.currentTarget.style.borderColor = "#5a8a1f";
                          e.currentTarget.style.color = "#5a8a1f";
                          e.currentTarget.style.background = "#EAF3DE";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (page !== currentPage) {
                          e.currentTarget.style.borderColor = "#e8eee2";
                          e.currentTarget.style.color = "#7a8472";
                          e.currentTarget.style.background = "#fff";
                        }
                      }}
                    >
                      {page}
                    </button>
                  ),
                )}

                {/* Next */}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || medicinesLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: currentPage === totalPages ? "#f0f0f0" : "#fff",
                    border: "1.5px solid #e8eee2",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                    color: currentPage === totalPages ? "#bbb" : "#5a8a1f",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}

            {/* Page counter */}
            <p
              className="mt-3 text-center text-[12px]"
              style={{ color: "#7a8472" }}
            >
              Page {currentPage} of {totalPages} · {totalCount} results
            </p>
          </>
        ) : (
          /* ══ Empty state ══ */
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
