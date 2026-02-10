import React, { useEffect, useState } from "react";
import imge1 from "../../../assets/hero/img1.png";
import useMedicine from "../../medicines/hook/useMedicines";
import { useNavigate } from "react-router-dom";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";

// ========== Categories ==========
// (لم أغيّر أي شيء هنا)
const categoryOptions = [
  { id: "All", name: "All" },
  { id: 1, name: "Pain Relief" },
  { id: 2, name: "Antibiotics" },
  { id: 3, name: "Allergy & Respiratory" },
];

// ❌ حذفنا pharmacyOptions بالكامل لأننا سنجلب الصيدليات من الـ API

const Products = ({ cart, setCart }) => {
  const { medicines, fetchAll, loading, error } = useMedicine();
  const navigate = useNavigate();

  // ✅ جديد — جلب الصيدليات من الـ API
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
    fetchAllPharmacies();   // ✅ تشغيل جلب الصيدليات
  }, [fetchAll]);

  if (loading) return <p className="text-center">Loading medicines...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  if (pharmaciesLoading)
    return <p className="text-center">Loading pharmacies...</p>;

  if (pharmaciesError)
    return (
      <p className="text-center text-red-500">
        {pharmaciesError}
      </p>
    );

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMedicines = medicines.filter(
    (med) =>
      selectedCategory === "All" ||
      med.categoryId === selectedCategory
  );

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">

    {/* ========== MODERN PHARMACY SECTION ========== */}
<div className="w-full mb-12">
  <h3 className="text-center text-xl font-semibold text-secondary mb-6">
    Choose Your Pharmacy
  </h3>

  <div className="relative">
    {/* Scrollable container */}
    <div
      id="pharmacy-carousel"
      className="flex gap-6 overflow-x-auto py-4 px-2 scroll-smooth"
      style={{
        scrollbarWidth: "none", // Firefox
      }}
    >
      {/* Hide scrollbar for Chrome, Edge, Safari */}
      <style>
        {`
          #pharmacy-carousel::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      {pharmacies.map((ph) => (
        <div
          key={ph.id}
          onClick={() => navigate(`/user/pharmacy/${ph.id}`)}

          className="
            flex-shrink-0
            w-44
            bg-white rounded-3xl p-4
            shadow-lg hover:shadow-2xl
            transition-all duration-300
            cursor-pointer
            border border-gray-200
            hover:-translate-y-2
          "
        >
          <div className="
            w-28 h-28 rounded-full 
            bg-[#E8F3E8] 
            flex items-center justify-center 
            overflow-hidden mx-auto mb-4
          ">
            <img
              src={imge1} // default pharmacy image
              alt={ph.name}
              className="w-20 h-20 object-contain"
            />
          </div>

          <p className="text-center font-semibold text-lg text-secondary mb-2">
            {ph.name}
          </p>
        </div>
      ))}
    </div>

    {/* Left Button */}
    <button
      onClick={() => {
        const container = document.getElementById("pharmacy-carousel");
        container.scrollBy({ left: -300, behavior: "smooth" });
      }}
      className="absolute top-1/2 -left-2 transform -translate-y-1/2 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100"
    >
      &#8592;
    </button>

    {/* Right Button */}
    <button
      onClick={() => {
        const container = document.getElementById("pharmacy-carousel");
        container.scrollBy({ left: 300, behavior: "smooth" });
      }}
      className="absolute top-1/2 -right-2 transform -translate-y-1/2 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100"
    >
      &#8594;
    </button>
  </div>
</div>


        {/* ========== TITLE ========== */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-secondary mb-3">
            Top Rated Medicines
          </h2>
          <p className="text-gray-600 max-w-[600px] mx-auto text-sm">
            Discover our most trusted medicines and healthcare products.
          </p>
        </div>

        {/* ========== CATEGORY BUTTONS ========== */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categoryOptions.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`cursor-pointer px-6 py-3 rounded-2xl shadow-md transition-all duration-300
                ${
                  selectedCategory === cat.id
                    ? "bg-secondary text-white scale-110"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {cat.name}
            </div>
          ))}
        </div>

        {/* ========== PRODUCTS GRID ========== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center">
          {filteredMedicines.map((data) => {
            const desc = data.description || "No description available";

            return (
              <div
                key={data.id}
                className="bg-white rounded-2xl shadow-md border w-[270px]"
              >
                <div className="bg-[#E8F3E8] flex justify-center items-center h-[200px]">
                  <img
                    src={data.imageUrl || imge1}
                    alt={data.name}
                    onClick={() => navigate(`/medicines/${data.id}`)}
                    className="w-[150px] object-contain cursor-pointer"
                    onError={(e) => (e.currentTarget.src = imge1)}
                  />
                </div>

                <div className="p-5 text-center">
                  <h3 className="text-lg font-bold text-secondary">
                    {data.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {expanded[data.id]
                      ? desc
                      : desc.length > 70
                      ? desc.slice(0, 70) + "..."
                      : desc}
                  </p>

                  {desc.length > 70 && (
                    <button
                      onClick={() => toggleExpand(data.id)}
                      className="text-secondary text-sm mt-1 font-semibold"
                    >
                      {expanded[data.id] ? "Show Less" : "Show More"}
                    </button>
                  )}

                  <p className="text-lg font-semibold text-secondary mt-3">
                    {data.price} EGP
                  </p>

                  <button
                    onClick={() => handleAddToCart(data)}
                    className="mt-4 bg-secondary text-white py-2 px-5 rounded-full w-full"
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
