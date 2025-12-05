import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useMedicines from "../hook/useMedicines";
import { FaStar, FaShoppingCart } from "react-icons/fa";

const MedicineDetails = ({ cart, setCart }) => {
  const { id } = useParams();
  const { medicines, fetchAll } = useMedicines();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const product = medicines.find((m) => m.id === Number(id));

  if (!product)
    return (
      <p className="text-center mt-10 text-gray-500 text-lg animate-pulse">
        Loading product...
      </p>
    );

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

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-6">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/user" className="hover:underline">Home</Link> /{" "}
          <span className="text-gray-700 font-semibold">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Left - Image */}
          <div className="flex justify-center items-center">
            <div className="w-full max-w-md p-4 bg-white/40 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full rounded-xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Right - Info */}
          <div className="flex flex-col justify-between space-y-6">
            {/* Name & Rating */}
            <div>
              <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-yellow-400 ${
                      i < product.rating ? "opacity-100" : "opacity-30"
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-500 text-sm">
                  ({product.rating || 0} reviews)
                </span>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price & Stock */}
            <div className="flex flex-col space-y-3">
              <span className="text-3xl font-bold text-green-600">
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

            {/* Add to Cart Button */}
            <button
              onClick={addToCart}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <FaShoppingCart />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Related Medicines (Optional) */}
        {/* <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Related Medicines</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            // Map related products here
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default MedicineDetails;
