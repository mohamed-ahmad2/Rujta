import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useMedicines from "../hook/useMedicines";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import Navbar from "../../user/components/Navbar"; // Adjust path as needed

const MedicineDetails = ({ cart, setCart, onCartClick }) => {
  const { id } = useParams();
  const { medicines, fetchAll, loading, error } = useMedicines();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const product = medicines.find((m) => m.id === Number(id));

  const addToCart = () => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500 text-lg animate-pulse">Loading product...</p>;

  if (error)
    return <p className="text-center mt-10 text-red-500 text-lg animate-pulse">{error}</p>;

  if (!product)
    return <p className="text-center mt-10 text-gray-500 text-lg animate-pulse">Product not found</p>;

  return (
    <>
      {/* Navbar */}
      <Navbar cart={cart} onCartClick={onCartClick} />

      {/* Page Content */}
      <div className="min-h-screen bg-[#F5F5F5] pt-24 pb-12"> {/* pt-24 to offset sticky navbar */}
        <div className="container mx-auto px-6">

        
          {/* Product Section */}
          <div className="grid md:grid-cols-2 gap-12 bg-white rounded-3xl p-8 shadow-lg">
            
            {/* Left - Image */}
            <div className="flex justify-center items-center">
              <div className="w-full max-w-md p-4 bg-white/50 backdrop-blur-md rounded-2xl shadow-md hover:shadow-lg transition-all duration-500">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full rounded-xl object-contain transform hover:scale-105 transition-transform duration-500"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400")}
                />
              </div>
            </div>

            {/* Right - Info */}
            <div className="flex flex-col justify-between space-y-6">
              
              {/* Name & Rating */}
              <div>
                <h1 className="text-4xl font-extrabold text-secondary mb-3">
                  {product.name}
                </h1>

                
                <p className="text-gray-700 text-lg leading-relaxed">
                  {product.description || "No description available"}
                </p>
              </div>

              {/* Price & Stock */}
              <div className="flex flex-col space-y-2">
                <span className="text-3xl font-bold text-secondary">
                  {product.price} EGP
                </span>
                <span
                  className={`px-3 py-1 rounded-full w-fit text-sm font-semibold ${
                    product.stock > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* Add to Cart */}
              <button
                onClick={addToCart}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-secondary to-[#9DC873] text-white font-semibold py-3 px-8 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <FaShoppingCart />
                Add to Cart
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MedicineDetails;
