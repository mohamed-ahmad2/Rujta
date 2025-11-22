import React, { useEffect } from "react";
import { FaStar } from "react-icons/fa";
import imge1 from "../../../assets/pro/m1.png"; // fallback image
import useMedicines from "../../medicines/hook/useMedicines";

const Products = ({ cart, setCart }) => {
  const { medicines, fetchAll, loading, error } = useMedicines();

  // Fetch medicines when component mounts
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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

  if (loading) return <p className="text-center">Loading medicines...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        {/* Title Section */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-secondary mb-3">
            Featured Medicines
          </h2>
          <p className="text-gray-600 max-w-[600px] mx-auto text-sm">
            Explore our trusted pharmacy essentials, carefully selected for your
            health and well-being.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 place-items-center">
          {(medicines || []).map((data) => (
            <div
              key={data.id}
              className="bg-white rounded-3xl shadow-md hover:shadow-xl 
                         duration-300 max-w-[280px] overflow-hidden transform hover:-translate-y-2"
            >
              {/* Image Section */}
              <div className="bg-[#E8F3E8] flex justify-center items-center h-[200px] overflow-hidden">
                <img
                  src={data.imageUrl || imge1}
                  alt={data.name}
                  className="h-[160px] object-contain transition-transform duration-300 hover:scale-110"
                  onError={(e) => (e.currentTarget.src = imge1)}
                />
              </div>

              {/* Details Section */}
              <div className="p-5 text-center">
                {/* <div className="flex justify-center mb-2 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div> */}

                <h2 className="text-xl font-semibold mb-1 text-gray-800">
                  {data.name}
                </h2>

                <p className="text-gray-500 text-sm mb-3">{data.description}</p>

                <p className="text-secondary font-bold mb-4">{data.price}</p>

                <button
                  onClick={() => handleAddToCart(data)}
                  className="bg-gradient-to-r from-secondary to-[#6AA76A] 
                             hover:scale-105 transition-transform duration-500 
                             text-white text-sm font-medium py-2 px-4 rounded-md w-full"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Section */}
        <div className="mt-16 text-center">
          <h2 className="text-lg font-bold mb-3 text-secondary">
            🛒 Your Cart:
          </h2>
          {cart.length > 0 ? (
            <ul className="text-gray-700 space-y-1">
              {cart.map((item, index) => (
                <li key={index} className="border-b pb-1">
                  {item.title}
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
