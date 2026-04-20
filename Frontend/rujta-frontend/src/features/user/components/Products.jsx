import React, { useEffect, useState } from "react";
import imge1 from "../../../assets/hero/img1.png";
import useMedicine from "../../medicines/hook/useMedicines";
import { useNavigate } from "react-router-dom";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";

// ========== Categories ==========
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

  useEffect(() => {
    fetchAll();
    fetchAllPharmacies();
  }, [fetchAll]);

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMedicines = medicines.filter(
    (med) => selectedCategory === "All" || med.categoryId === selectedCategory,
  );

  if (loading) return <p className="text-center">Loading medicines...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (pharmaciesLoading)
    return <p className="text-center">Loading pharmacies...</p>;
  if (pharmaciesError)
    return <p className="text-center text-red-500">{pharmaciesError}</p>;

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        {/* ========== MODERN PHARMACY SECTION ========== */}
        <div className="mb-12 w-full">
          <h3 className="mb-6 text-center text-xl font-semibold text-secondary">
            Choose Your Pharmacy
          </h3>

          <div className="relative">
            <div
              id="pharmacy-carousel"
              className="flex gap-6 overflow-x-auto scroll-smooth px-2 py-4 transition-all duration-500"
              style={{ scrollbarWidth: "none" }}
            >
              <style>
                {`
                  #pharmacy-carousel::-webkit-scrollbar { display: none; }
                `}
              </style>

              {pharmacies.map((ph) => (
                <div
                  key={ph.id}
                  onClick={() => navigate(`/user/pharmacy/${ph.id}`)}
                  className="w-44 flex-shrink-0 cursor-pointer rounded-3xl border border-gray-200 bg-white p-4 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#E8F3E8]">
                    <img
                      src={imge1}
                      alt={ph.name}
                      className="h-20 w-20 transform object-contain transition-all duration-500 hover:scale-110"
                    />
                  </div>
                  <p className="mb-2 text-center text-lg font-semibold text-secondary">
                    {ph.name}
                  </p>
                </div>
              ))}
            </div>

            {/* Carousel Buttons */}
            <button
              onClick={() =>
                document
                  .getElementById("pharmacy-carousel")
                  .scrollBy({ left: -300, behavior: "smooth" })
              }
              className="absolute -left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 transform items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 hover:bg-gray-100"
            >
              &#8592;
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("pharmacy-carousel")
                  .scrollBy({ left: 300, behavior: "smooth" })
              }
              className="absolute -right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 transform items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 hover:bg-gray-100"
            >
              &#8594;
            </button>
          </div>
        </div>

        {/* ========== TITLE ========== */}
        <div className="mb-14 text-center">
          <h2 className="animate-slide-fade mb-3 text-4xl font-extrabold text-secondary">
            Top Rated Medicines
          </h2>
          <p className="animate-slide-fade mx-auto max-w-[600px] text-sm text-gray-600 delay-100">
            Discover our most trusted medicines and healthcare products.
          </p>
        </div>

        {/* ========== CATEGORY BUTTONS ========== */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          {categoryOptions.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`cursor-pointer rounded-2xl px-6 py-3 shadow-md transition-all duration-300 ${
                selectedCategory === cat.id
                  ? "scale-110 bg-secondary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </div>
          ))}
        </div>

        {/* ========== PRODUCTS GRID ========== */}
        <div className="grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMedicines.map((data) => {
            const desc = data.description || "No description available";

            return (
              <div
                key={data.id}
                className="animate-slide-up w-[270px] transform rounded-2xl border bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
              >
                <div className="flex h-[200px] items-center justify-center bg-[#E8F3E8]">
                  <img
                    src={data.imageUrl || imge1}
                    alt={data.name}
                    onClick={() => navigate(`/medicines/${data.id}`)}
                    className="w-[150px] transform cursor-pointer object-contain transition-all duration-500 hover:scale-110"
                    onError={(e) => (e.currentTarget.src = imge1)}
                  />
                </div>

                <div className="p-5 text-center">
                  <h3 className="text-lg font-bold text-secondary">
                    {data.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {expanded[data.id]
                      ? desc
                      : desc.length > 70
                        ? desc.slice(0, 70) + "..."
                        : desc}
                  </p>

                  {desc.length > 70 && (
                    <button
                      onClick={() => toggleExpand(data.id)}
                      className="mt-1 text-sm font-semibold text-secondary hover:underline"
                    >
                      {expanded[data.id] ? "Show Less" : "Show More"}
                    </button>
                  )}

                  <button
                    onClick={() => handleAddToCart(data)}
                    className="hover:bg-secondary-dark mt-4 w-full transform rounded-full bg-secondary px-5 py-2 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Animations ===== */}
      <style>
        {`
          .animate-slide-up {
            opacity: 0;
            transform: translateY(20px);
            animation: slide-up 0.6s forwards;
          }
          .animate-slide-fade {
            opacity: 0;
            transform: translateY(10px);
            animation: slide-up 0.6s forwards;
          }
          @keyframes slide-up {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Products;
