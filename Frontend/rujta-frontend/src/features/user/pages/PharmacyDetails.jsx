import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import imge1 from "../../../assets/hero/img1.png";
import {
  getAllPharmacies,
  getPharmacyMedicines,
} from "../../pharmacies/api/pharmaciesApi";

const categoryOptions = [
  { id: "All", name: "All" },
  { id: 1, name: "Pain Relief" },
  { id: 2, name: "Antibiotics" },
  { id: 3, name: "Allergy & Respiratory" },
];

const PharmacyDetails = ({ cart, setCart }) => {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPharmacyData = async () => {
      try {
        setLoading(true);

        const res = await getAllPharmacies();
        const foundPharmacy = res.data.find((ph) => ph.id === Number(id));

        if (!foundPharmacy) {
          setError("Pharmacy not found.");
          setLoading(false);
          return;
        }

        setPharmacy(foundPharmacy);

        const medsRes = await getPharmacyMedicines(foundPharmacy.id);
        setMedicines(medsRes.data || []);
      } catch (err) {
        setError("Failed to load pharmacy data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacyData();
  }, [id]);

  const handleAddToCart = (product) => {
    if (!setCart) return;

    setCart((prevCart = []) => {
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
    (med) =>
      (selectedCategory === "All" || med.categoryId === selectedCategory) &&
      med.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) return <p className="py-20 text-center">Loading...</p>;
  if (error) return <p className="py-20 text-center text-red-500">{error}</p>;
  if (!pharmacy)
    return <p className="py-20 text-center">Pharmacy not found.</p>;

  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      {/* Pharmacy Info */}
      <div className="animate-fadeIn mb-8 flex flex-col items-center sm:mb-10 lg:mb-12">
        <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#E8F3E8] shadow-md transition hover:shadow-lg sm:h-28 sm:w-28 lg:h-32 lg:w-32">
          <img
            src={pharmacy.imageUrl || imge1}
            alt={pharmacy.name || "Pharmacy"}
            className="h-16 w-16 object-contain transition-transform duration-500 hover:scale-110 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
            onError={(e) => (e.currentTarget.src = imge1)}
          />
        </div>

        <h1 className="text-center text-xl font-bold text-secondary sm:text-2xl lg:text-3xl">
          {pharmacy.name}
        </h1>
      </div>

      {/* Search */}
      <div className="mb-5 flex justify-center sm:mb-6">
        <input
          type="text"
          placeholder="Search medicines..."
          className="w-full max-w-md rounded-full border border-gray-300 px-4 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-secondary sm:max-w-lg sm:px-5 sm:text-base lg:max-w-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="mb-6 flex flex-wrap justify-center gap-2 sm:mb-8 sm:gap-3 lg:gap-4">
        {categoryOptions.map((cat) => (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`cursor-pointer rounded-2xl px-4 py-2 text-sm shadow-md transition-all duration-300 sm:px-5 sm:py-2.5 sm:text-base lg:px-6 lg:py-3 ${
              selectedCategory === cat.id
                ? "scale-105 bg-secondary text-white sm:scale-110"
                : "bg-gray-100 text-gray-700 hover:scale-105 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </div>
        ))}
      </div>

      {/* Medicines */}
      {filteredMedicines.length > 0 ? (
        <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-10">
          {filteredMedicines.map((med) => {
            const desc = med.description || "No description available";

            return (
              <div
                key={med.id}
                className="animate-fadeIn w-full max-w-[200px] transform rounded-2xl border bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl sm:max-w-[230px] sm:hover:-translate-y-3 lg:max-w-[270px]"
              >
                {/* Image */}
                <div className="flex h-[140px] items-center justify-center bg-[#E8F3E8] sm:h-[170px] lg:h-[200px]">
                  <img
                    src={med.imageUrl || imge1}
                    alt={med.name}
                    className="w-[90px] cursor-pointer object-contain transition-transform duration-500 hover:scale-110 sm:w-[120px] lg:w-[150px]"
                    onError={(e) => (e.currentTarget.src = imge1)}
                  />
                </div>

                {/* Info */}
                <div className="p-3 text-center sm:p-4 lg:p-5">
                  <h3 className="text-sm font-bold text-secondary transition-colors duration-300 hover:text-[#7bbf5e] sm:text-base lg:text-lg">
                    {med.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    {expanded[med.id]
                      ? desc
                      : desc.length > 70
                        ? desc.slice(0, 70) + "..."
                        : desc}
                  </p>

                  {desc.length > 70 && (
                    <button
                      onClick={() => toggleExpand(med.id)}
                      className="mt-1 text-xs font-semibold text-secondary hover:underline sm:text-sm"
                    >
                      {expanded[med.id] ? "Show Less" : "Show More"}
                    </button>
                  )}

                  <p className="mt-2 text-sm font-semibold text-secondary sm:mt-3 sm:text-base lg:text-lg">
                    {med.price} EGP
                  </p>

                  <button
                    onClick={() => handleAddToCart(med)}
                    className="mt-3 w-full rounded-full bg-secondary px-3 py-1.5 text-xs text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#7bbf5e] hover:shadow-lg active:scale-95 sm:mt-4 sm:px-5 sm:py-2 sm:text-sm lg:text-base"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-gray-500 sm:mt-8 sm:text-base">
          No medicines available in this pharmacy.
        </p>
      )}
    </div>
  );
};

export default PharmacyDetails;
