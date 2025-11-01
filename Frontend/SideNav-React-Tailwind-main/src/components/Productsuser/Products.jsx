import React from "react";
import imge1 from "../../assets/hero/img1.png";
import imge2 from "../../assets/hero/img2.png";
import imge3 from "../../assets/hero/img3.png";
import imge4 from "../../assets/hero/img4.png";
import { FaStar } from "react-icons/fa";

const ProductsData = [
  {
    id: 1,
    img: imge1,
    title: "Astaxanthin",
    description: "powerful antioxidant ",
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
    description: "Intestinal anti-infection",
    price: "30 EGP",
    rating: 5.0,
    aosDelay: "600",
  },
];

const Products = ({ cart, setCart }) => {
  // 🛒 Add to Cart Function
const handleAddToCart = (product) => {
  setCart((prevCart) => {
    const existingItem = prevCart.find((item) => item.id === product.id);

    if (existingItem) {
      // Increase quantity if product exists
      return prevCart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // Add new product with quantity = 1
      return [...prevCart, { ...product, quantity: 1 }];
    }
  });
};


  return (
    <div className="mt-14 mb-12 bg-page dark:bg-gray-950 py-10">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10 max-w-[600px] mx-auto">
          <p className="text-sm text-secondary">Top Selling Products for you</p>
          <h1 className="text-3xl font-bold">Medicines</h1>
          <p className="text-xs text-gray-400">
            Explore our best-selling medicines, carefully chosen for quality and effectiveness.
          </p>
        </div>

       
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 place-items-center gap-6">
          {ProductsData.map((data) => (
            <div
              key={data.id}
              data-aos="fade-up"
              data-aos-delay={data.aosDelay}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden w-[250px] group hover:shadow-lg duration-300"
            >
              <div className="w-full h-[200px] bg-gray-100 flex justify-center items-center overflow-hidden">
                <img
                  src={data.img}
                  alt={data.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4 text-center">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                  {data.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
                  {data.description}
                </p>

                <div className="flex items-center justify-center gap-1 mb-2">
                  <FaStar className="text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-200 text-sm">
                    {data.rating}
                  </span>
                </div>

                <p className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
                  {data.price}
                </p>

                <button
                  onClick={() => handleAddToCart(data)}
                  className="bg-gradient-to-r from-primary to-secondary 
                             hover:scale-105 transition-transform duration-700 
                             text-white text-sm font-medium py-2 px-4 
                             rounded-md w-full transition-colors duration-200"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        
        <div className="mt-10 text-center">
          <h2 className="text-lg font-bold mb-3">🛒 Your Cart:</h2>
          {cart.length > 0 ? (
            <ul className="text-gray-700 dark:text-gray-200">
              {cart.map((item, index) => (
                <li key={index}>{item.title}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No items in cart yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
