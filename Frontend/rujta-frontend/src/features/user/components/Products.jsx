import React, { useEffect, useState, useMemo } from "react";
import imge1 from "../../../assets/hero/img1.png";
import useMedicine from "../../medicines/hook/useMedicines";
import { useNavigate } from "react-router-dom";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";
import useCategory from "../../category/hook/useCategory";

const ITEMS_PER_PAGE = 16;

const Products = ({ cart, setCart }) => {
  const { pagedData, loading, error, fetchPaged } = useMedicine();
  const navigate = useNavigate();

  const {
    pharmacies,
    loading: pharmaciesLoading,
    error: pharmaciesError,
    fetchAllPharmacies,
  } = usePharmacies();

  const { categories, fetchAll: fetchAllCategories } = useCategory();

  const [expanded, setExpanded] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addedIds, setAddedIds] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);
  useEffect(() => {
    fetchAllPharmacies();
  }, [fetchAllPharmacies]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);


  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    fetchPaged({
      pageNumber: currentPage,
      pageSize: ITEMS_PER_PAGE,
      searchTerm: debouncedSearch || undefined,
      categoryIds:
        selectedCategory !== "All" ? [Number(selectedCategory)] : undefined,
    });
  }, [currentPage, debouncedSearch, selectedCategory, fetchPaged]);

  const medicines = pagedData.items || [];
  const totalPages = pagedData.totalPages || 1;
  const totalCount = pagedData.totalCount || 0;

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem)
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(
      () => setAddedIds((prev) => ({ ...prev, [product.id]: false })),
      1200,
    );
  };

  const categoryOptions = useMemo(() => {
    if (!categories.length) return [{ id: "All", name: "All" }];
    return [{ id: "All", name: "All" }, ...categories];
  }, [categories]);

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

  const initialLoading = loading && medicines.length === 0;

  if (initialLoading || pharmaciesLoading)
    return (
      <div
        className="flex items-center justify-center py-32"
        style={{ background: "#f5f8f2" }}
      >
        <div
          className="h-9 w-9 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "#5a8a1f", borderTopColor: "transparent" }}
        />
      </div>
    );

  if (error || pharmaciesError)
    return (
      <p className="py-20 text-center text-red-500">
        {error || pharmaciesError}
      </p>
    );

  return (
    <div
      className="min-h-screen px-4 py-12"
      style={{ background: "#f5f8f2", fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="mx-auto max-w-5xl">
    
        <div className="mb-3 flex items-center justify-between">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "#7a8472" }}
          >
            Choose Your Pharmacy
          </p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                document
                  .getElementById("pharmacy-scroll")
                  .scrollBy({ left: -320, behavior: "smooth" })
              }
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
              style={{
                background: "#fff",
                border: "1.5px solid #e8eee2",
                cursor: "pointer",
                color: "#5a8a1f",
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
            <button
              onClick={() =>
                document
                  .getElementById("pharmacy-scroll")
                  .scrollBy({ left: 320, behavior: "smooth" })
              }
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
              style={{
                background: "#fff",
                border: "1.5px solid #e8eee2",
                cursor: "pointer",
                color: "#5a8a1f",
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
        </div>

    
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
            >
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full sm:h-24 sm:w-24"
                style={{
                  background: "#EAF3DE",
                  border: "2px solid rgba(90,138,31,0.12)",
                }}
              >
                <img
                  src={ph.imageUrl || imge1}
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

  
        <div className="mb-10 text-center sm:mb-12">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest"
            style={{
              background: "#EAF3DE",
              color: "#5a8a1f",
              border: "1px solid rgba(90,138,31,0.2)",
            }}
          >
            Our Products
          </span>
          <h2
            className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl"
            style={{
              color: "#3e6013",
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "-0.4px",
            }}
          >
            Top Rated Medicines
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-sm leading-relaxed text-gray-400 sm:text-base">
            Discover our most trusted medicines and healthcare products.
          </p>
        </div>

    
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
       
            {loading && searchQuery && (
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

          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => {
              const active = String(selectedCategory) === String(cat.id);
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
                    cursor: "pointer",
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

      
        {medicines.length === 0 && !loading ? (
          <div className="py-20 text-center">
            <div className="mb-3 text-5xl">🔍</div>
            <p className="text-gray-400">No medicines found.</p>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-6"
              style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.2s" }}
            >
              {medicines.map((med) => {
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
                  >
                    <div
                      className="flex items-center justify-center overflow-hidden"
                      style={{
                        background: "#EAF3DE",
                        position: "relative",
                        height: 170,
                      }}
                    >
                      <img
                        src={med.imageUrl || imge1}
                        alt={med.name}
                        className="object-contain transition-transform duration-500 group-hover:scale-110"
                        style={{ height: 120, width: 120 }}
                        loading="lazy"
                        onError={(e) => (e.currentTarget.src = imge1)}
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <h3
                        className="font-semibold"
                        style={{ color: "#3e6013", fontSize: 16 }}
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
                            setExpanded((p) => ({
                              ...p,
                              [med.id]: !p[med.id],
                            }));
                          }}
                          className="mt-1 text-left text-[13px] font-semibold hover:underline"
                          style={{
                            color: "#5a8a1f",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {isExpanded ? "↑ Show Less" : "↓ Show More"}
                        </button>
                      )}

                      <div
                        className="mt-5 flex items-center justify-between pt-4"
                        style={{ borderTop: "1px solid #e8eee2" }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(med);
                          }}
                          className="flex items-center gap-1.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95"
                          style={{
                            background: isAdded ? "#3e6013" : "#5a8a1f",
                            padding: "10px 20px",
                            border: "none",
                            cursor: "pointer",
                            marginLeft: "auto",
                          }}
                        >
                          {isAdded ? (
                            "✓ Added"
                          ) : (
                            <>
                              <svg
                                width="12"
                                height="12"
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

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all"
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

                {pageNumbers.map((page, idx) =>
                  page === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all"
                      style={{
                        background: page === currentPage ? "#5a8a1f" : "#fff",
                        border: `1.5px solid ${page === currentPage ? "#5a8a1f" : "#e8eee2"}`,
                        color: page === currentPage ? "#fff" : "#7a8472",
                        cursor: "pointer",
                        boxShadow:
                          page === currentPage
                            ? "0 4px 12px rgba(90,138,31,0.25)"
                            : "none",
                      }}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all"
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

            <p
              className="mt-3 text-center text-[12px]"
              style={{ color: "#7a8472" }}
            >
              Page {currentPage} of {totalPages} · {totalCount} results
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
