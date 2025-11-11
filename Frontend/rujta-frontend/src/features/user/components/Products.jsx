import React from "react";
import imge1 from "../../assets/hero/img1.png";
import imge2 from "../../assets/hero/img2.png";
import imge3 from "../../assets/hero/img3.png";
import imge4 from "../../assets/hero/img4.png";
import imge5 from "../../assets/hero/img5.png";
import imge6 from "../../assets/hero/img6.png";
import imge7 from "../../assets/hero/img7.png";
import imge8 from "../../assets/hero/img8.png";

import { FaStar } from "react-icons/fa";

const ProductsData = [
  {
    id: 1,
    img: imge1,
    title: "Astaxanthin",
    description: "Powerful antioxidant supplement",
    price: "90 EGP",
    rating: 5.0,
    aosDelay: "0",
  },
  {
    id: 2,
    img: imge2,
    title: "Fenofibrat",
    description: "Antibiotic for bacterial infections",
    price: "105 EGP",
    rating: 4.5,
    aosDelay: "200",
  },
  {
    id: 3,
    img: imge3,
    title: "Brufen",
    description: "Pain relief and anti-inflammatory",
    price: "44 EGP",
    rating: 4.7,
    aosDelay: "400",
  },
  {
    id: 4,
    img: imge4,
    title: "Antinal",
    description: "Intestinal anti-infection medication",
    price: "30 EGP",
    rating: 5.0,
    aosDelay: "600",
  },
  {
    id: 5,
    img: imge5,
    title: "Omeprazole",
    description: "Intestinal anti-infection medication",
    price: "30 EGP",
    rating: 4.0,
    aosDelay: "600",
  },
  {
    id: 6,
    img: imge6,
    title: "Omega 3",
    description: "Supports heart and brain health",
    price: "230 EGP",
    rating: 4.0,
    aosDelay: "600",
  },
  {
    id: 7,
    img: imge7,
    title: "Bronchicum",
    description: "Natural cough syrup",
    price: "70 EGP",
    rating: 4.0,
    aosDelay: "600",
  },
  {
    id: 8,
    img: imge8,
    title: "Starville Cream",
    description: "Whitening and skin care cream",
    price: "120 EGP",
    rating: 4.0,
    aosDelay: "600",
  },
];

const Products = ({ cart, setCart }) => {
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // 🟢 If already in cart, increase quantity
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // 🆕 Add new item with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        {/* Header section */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-[#3C623C] mb-3">
            Top Rated Medicines
          </h2>
          <p className="text-gray-600 max-w-[600px] mx-auto text-sm">
            Discover our most trusted medicines and healthcare products,
            carefully selected for quality, safety, and effectiveness.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center">
          {ProductsData.map((data) => (
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
                  src={data.img}
                  alt={data.title}
                  className="w-[150px] object-contain group-hover:scale-110 duration-300"
                />
                <span className="absolute top-3 left-3 bg-[#3C623C] text-white text-xs px-3 py-1 rounded-full">
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

                <h3 className="text-lg font-bold text-[#3C623C] group-hover:text-[#2b472b] transition-colors">
                  {data.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{data.description}</p>

                <p className="text-lg font-semibold text-[#3C623C] mt-3">
                  {data.price}
                </p>

                <button
                  onClick={() => handleAddToCart(data)}
                  className="mt-4 bg-gradient-to-r from-[#3C623C] to-[#6AA76A] 
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
          <h2 className="text-xl font-bold mb-4 text-[#3C623C]">🛒 Your Cart</h2>
          {cart.length > 0 ? (
            <ul className="inline-block text-left text-gray-700 space-y-1">
              {cart.map((item) => (
                <li key={item.id} className="border-b pb-1">
                  {item.title} <span className="text-gray-500">× {item.quantity}</span>
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
