import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import imge1 from "../../../assets/hero/img1.png";
import { getAllPharmacies, getPharmacyMedicines } from "../../pharmacies/api/pharmaciesApi";

const categoryOptions = [
  { id: "All", name: "All" },
  { id: 1, name: "Pain Relief" },
  { id: 2, name: "Antibiotics" },
  { id: 3, name: "Allergy & Respiratory" },
];

const PharmacyDetails = ({ cart, setCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const goToDetails = (medId) => {
    navigate(`/user/medicine/${medId}`);
  };

  const handleAddToCart = (product) => {
    if (!setCart) return;

    setCart((prevCart = []) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.pharmacyId === pharmacy.id
      );

      let updatedCart;

      if (existingItem) {
        updatedCart = prevCart.map((item) =>
          item.id === product.id && item.pharmacyId === pharmacy.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [
          ...prevCart,
          { ...product, pharmacyId: pharmacy.id, quantity: 1 },
        ];
      }

      // ✅ Log cart to console after every add
      console.log("🛒 Cart updated:", updatedCart);
      return updatedCart;
    });
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMedicines = medicines.filter(
    (med) =>
      (selectedCategory === "All" || med.categoryId === selectedCategory) &&
      med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p className="text-center py-20">Loading...</p>;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!pharmacy) return <p className="text-center py-20">Pharmacy not found.</p>;

  return (
    <div className="container mx-auto py-20">

      {/* Pharmacy Info */}
      <div className="flex flex-col items-center mb-12 animate-fadeIn">
        <div className="w-32 h-32 rounded-full bg-[#E8F3E8] flex items-center justify-center overflow-hidden mb-4 shadow-md hover:shadow-lg transition">
          <img
            src={pharmacy.imageUrl || imge1}
            alt={pharmacy.name || "Pharmacy"}
            className="w-24 h-24 object-contain transition-transform duration-500 hover:scale-110"
            onError={(e) => (e.currentTarget.src = imge1)}
          />
        </div>
        <h1 className="text-3xl font-bold text-secondary">
          {pharmacy.name}
        </h1>
      </div>

      {/* Search */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search medicines..."
          className="w-full max-w-xl rounded-full border border-gray-300 px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm transition"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categoryOptions.map((cat) => (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`cursor-pointer px-6 py-3 rounded-2xl shadow-md transition-all duration-300
              ${
                selectedCategory === cat.id
                  ? "bg-secondary text-white scale-110"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
          >
            {cat.name}
          </div>
        ))}
      </div>

      {/* Medicines */}
      {filteredMedicines.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center">
          {filteredMedicines.map((med) => {
            const desc = med.description || "No description available";

            return (
              <div
                key={med.id}
                onClick={() => goToDetails(med.id)}
                className="cursor-pointer bg-white rounded-2xl shadow-md border w-[270px]
                transform transition-all duration-500
                hover:-translate-y-3 hover:shadow-2xl hover:scale-[1.03]
                animate-fadeIn"
              >
                {/* Image */}
                <div className="bg-[#E8F3E8] flex justify-center items-center h-[200px]">
                  <img
                    src={med.imageUrl || imge1}
                    alt={med.name}
                    className="w-[150px] object-contain transition-transform duration-500 hover:scale-110"
                    onError={(e) => (e.currentTarget.src = imge1)}
                  />
                </div>

                {/* Info */}
                <div className="p-5 text-center">
                  <h3 className="text-lg font-bold text-secondary">
                    {med.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {expanded[med.id]
                      ? desc
                      : desc.length > 70
                      ? desc.slice(0, 70) + "..."
                      : desc}
                  </p>

                  {desc.length > 70 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(med.id);
                      }}
                      className="text-secondary text-sm mt-1 font-semibold hover:underline"
                    >
                      {expanded[med.id] ? "Show Less" : "Show More"}
                    </button>
                  )}

                  <p className="text-lg font-semibold text-secondary mt-3">
                    {med.price} EGP
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(med);
                    }}
                    className="mt-4 bg-secondary text-white py-2 px-5 rounded-full w-full
                    transition-all duration-300
                    hover:bg-[#7bbf5e] hover:shadow-lg hover:-translate-y-1
                    active:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">
          No medicines available in this pharmacy.
        </p>
      )}
    </div>
  );A
};

export default PharmacyDetails;