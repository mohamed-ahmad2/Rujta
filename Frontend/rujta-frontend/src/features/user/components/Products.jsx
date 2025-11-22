import React, { useEffect } from "react";
import imge1 from "../../../assets/hero/img1.png";
import { FaStar } from "react-icons/fa";
import useMedicine from "../../medicines/hook/useMedicines";

const Products = ({ cart, setCart }) => {
  const { medicines, fetchAll, loading, error } = useMedicine();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) return <p className="text-center">Loading medicines...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        {/* Header section */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-secondary mb-3">
            Top Rated Medicines
          </h2>
          <p className="text-gray-600 max-w-[600px] mx-auto text-sm">
            Discover our most trusted medicines and healthcare products,
            carefully selected for quality, safety, and effectiveness.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center">
          {medicines.map((data) => (
            <div
              key={data.id}
              data-aos="fade-up"
              data-aos-delay={data.aosDelay}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 
                        border border-gray-100 w-[270px] overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative bg-[#E8F3E8] flex justify-center items-center h-[200px] overflow-hidden">
                <img
                  src={data.imageUrl || imge1}
                  alt={data.name}
                  className="w-[150px] object-contain group-hover:scale-110 duration-300"
                  onError={(e) => {
                    e.currentTarget.src = imge1;
                  }}
                />

                <span className="absolute top-3 left-3 bg-secondary text-white text-xs px-3 py-1 rounded-full">
                  Bestseller
                </span>
              </div>

              {/* Product Info */}
              <div className="p-5 text-center">
                <div className="flex justify-center mb-2 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                <h3 className="text-lg font-bold text-secondary group-hover:text-[#2b472b] transition-colors">
                  {data.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{data.description}</p>

                <p className="text-lg font-semibold text-secondary mt-3">
                  {data.price + " EGP"}
                </p>

                <button
                  onClick={() => handleAddToCart(data)}
                  className="mt-4 bg-gradient-to-r from-secondary to-[#6AA76A] 
                             hover:scale-105 transition-transform duration-300 
                             text-white font-medium py-2 px-5 rounded-full w-full"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Section */}
        <div className="mt-20 text-center">
          <h2 className="text-xl font-bold mb-4 text-secondary">
            🛒 Your Cart
          </h2>
          {cart.length > 0 ? (
            <ul className="inline-block text-left text-gray-700 space-y-1">
              {cart.map((item) => (
                <li key={item.id} className="border-b pb-1">
                  {item.name}{" "}
                  <span className="text-gray-500">× {item.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No items in cart yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
