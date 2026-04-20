import React, { useEffect, useState } from "react";
import imge1 from "../../../assets/hero/img1.png";
import useMedicine from "../../medicines/hook/useMedicines";
import { useNavigate } from "react-router-dom";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";
import clickSound from "../../../assets/audio.wav";

const audio = new Audio(clickSound);
audio.volume = 0.4;

const playSound = () => {
  audio.currentTime = 0;
  audio.play();
};

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
    <div className="bg-white py-10 sm:py-14 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========== PHARMACY SECTION ========== */}
        <div className="mb-10 w-full sm:mb-12">
          <h3 className="mb-4 text-center text-lg font-semibold text-secondary sm:mb-6 sm:text-xl">
            Choose Your Pharmacy
          </h3>

          <div className="relative">
            <div
              id="pharmacy-carousel"
              className="flex gap-3 overflow-x-auto scroll-smooth px-2 py-3 sm:gap-4 sm:py-4 lg:gap-6"
            >
              {pharmacies.map((ph, i) => (
                <div
                  key={ph.id}
                  onClick={() => navigate(`/user/pharmacy/${ph.id}`)}
                  className="animate-slide-up w-32 flex-shrink-0 cursor-pointer rounded-2xl border border-gray-200 bg-white p-3 shadow-md transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl sm:w-40 sm:rounded-3xl sm:p-4 sm:shadow-lg lg:w-44"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#E8F3E8] sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                    <img
                      src={imge1}
                      alt={ph.name}
                      className="h-14 w-14 object-contain transition-transform duration-300 hover:scale-110 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
                    />
                  </div>

                  <p className="text-center text-sm font-semibold text-secondary sm:text-base lg:text-lg">
                    {ph.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========== TITLE ========== */}
        <div className="animate-fade-in mb-10 text-center sm:mb-12 lg:mb-14">
          <h2 className="mb-2 text-2xl font-extrabold text-secondary sm:text-3xl lg:text-4xl">
            Top Rated Medicines
          </h2>
          <p className="mx-auto max-w-[600px] text-xs text-gray-600 sm:text-sm">
            Discover our most trusted medicines and healthcare products.
          </p>
        </div>

        {/* ========== PRODUCTS GRID ========== */}
        <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-3 lg:gap-10 xl:grid-cols-4">
          {filteredMedicines.map((data, i) => {
            const desc = data.description || "No description available";

            return (
              <div
                key={data.id}
                className="animate-slide-up w-full max-w-[200px] rounded-2xl border bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl sm:max-w-[230px] lg:max-w-[270px]"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Image */}
                <div className="flex h-[140px] items-center justify-center bg-[#E8F3E8] sm:h-[170px] lg:h-[200px]">
                  <img
                    src={data.imageUrl || imge1}
                    alt={data.name}
                    onClick={() => navigate(`/medicines/${data.id}`)}
                    className="w-[90px] cursor-pointer object-contain transition-transform duration-300 hover:scale-110 sm:w-[120px] lg:w-[150px]"
                    onError={(e) => (e.currentTarget.src = imge1)}
                  />
                </div>

                {/* Info */}
                <div className="p-3 text-center sm:p-4 lg:p-5">
                  <h3 className="text-sm font-bold text-secondary sm:text-base lg:text-lg">
                    {data.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    {expanded[data.id]
                      ? desc
                      : desc.length > 70
                        ? desc.slice(0, 70) + "..."
                        : desc}
                  </p>

                  {desc.length > 70 && (
                    <button
                      onClick={() => toggleExpand(data.id)}
                      className="mt-1 text-xs font-semibold text-secondary hover:underline sm:text-sm"
                    >
                      {expanded[data.id] ? "Show Less" : "Show More"}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleAddToCart(data);
                      playSound();
                    }}
                    className="hover:bg-secondary-dark mt-3 w-full rounded-full bg-secondary px-3 py-1.5 text-xs text-white transition-all duration-300 hover:scale-105 hover:shadow-lg sm:mt-4 sm:px-4 sm:py-2 sm:text-sm lg:px-5 lg:text-base"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Products;
