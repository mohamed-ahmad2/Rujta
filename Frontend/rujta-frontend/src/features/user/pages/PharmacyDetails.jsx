import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchPharmacyData = async () => {
      try {
        setLoading(true);

        // Get pharmacy
        const res = await getAllPharmacies();
        const foundPharmacy = res.data.find((ph) => ph.id === Number(id));
        if (!foundPharmacy) {
          setError("Pharmacy not found.");
          setLoading(false);
          return;
        }
        setPharmacy(foundPharmacy);

        // Get medicines
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
    (med) => selectedCategory === "All" || med.categoryId === selectedCategory
  );

  if (loading) return <p className="text-center py-20">Loading...</p>;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!pharmacy) return <p className="text-center py-20">Pharmacy not found.</p>;

  return (
    <div className="container mx-auto py-20">
      {/* Pharmacy Info */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-32 h-32 rounded-full bg-[#E8F3E8] flex items-center justify-center overflow-hidden mb-4">
          <img
            src={pharmacy.imageUrl || imge1}
            alt={pharmacy.name || "Pharmacy"}
            className="w-24 h-24 object-contain"
            onError={(e) => (e.currentTarget.src = imge1)}
          />
        </div>
        <h1 className="text-3xl font-bold text-secondary">{pharmacy.name}</h1>
      </div>

      {/* Category Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categoryOptions.map((cat) => (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`cursor-pointer px-6 py-3 rounded-2xl shadow-md transition-all duration-300
              ${selectedCategory === cat.id
                ? "bg-secondary text-white scale-110"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {cat.name}
          </div>
        ))}
      </div>

      {/* Medicines Grid */}
      {filteredMedicines.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center">
          {filteredMedicines.map((med) => {
            const desc = med.description || "No description available";

            return (
              <div key={med.id} className="bg-white rounded-2xl shadow-md border w-[270px]">
                <div className="bg-[#E8F3E8] flex justify-center items-center h-[200px]">
                  <img
                    src={med.imageUrl || imge1}
                    alt={med.name}
                    className="w-[150px] object-contain cursor-pointer"
                    onError={(e) => (e.currentTarget.src = imge1)}
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-lg font-bold text-secondary">{med.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {expanded[med.id] ? desc : desc.length > 70 ? desc.slice(0, 70) + "..." : desc}
                  </p>
                  {desc.length > 70 && (
                    <button
                      onClick={() => toggleExpand(med.id)}
                      className="text-secondary text-sm mt-1 font-semibold"
                    >
                      {expanded[med.id] ? "Show Less" : "Show More"}
                    </button>
                  )}
                  <p className="text-lg font-semibold text-secondary mt-3">
                    {med.price} EGP
                  </p>
                  <button
                    onClick={() => handleAddToCart(med)}
                    className="mt-4 bg-secondary text-white py-2 px-5 rounded-full w-full"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">No medicines available in this pharmacy.</p>
      )}
    </div>
  );
};

export default PharmacyDetails;
