import React from "react";
import img1 from "../../assets/pro/m1.png";
import img2 from "../../assets/pro/m2.png";
import img3 from "../../assets/pro/m3.png";
import { FaStar } from "react-icons/fa";

const ProductsData = [
  {
    id: 1,
    img: img1,
    title: "Paracetamol",
    description: "Pain relief and fever reducer",
    price: "15EGP",
  },
  {
    id: 2,
    img: img2,
    title: "Amoxicillin",
    description: "Antibiotic for bacterial infections",
    price: "95 EGP",
  },
  {
    id: 3,
    img: img3,
    title: "Vitamin D3",
    description: "Boosts immune system and energy",
    price: "170 EGP",
  },
];

const TopProducts = ({ cart, setCart }) => {
  
  const handleAddToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  return (
    <div className="bg-page dark:bg-gray-950 py-16">
      <div className="container">
        {/* Header section */}
        <div className="text-left mb-10">
          <p data-aos="fade-up" className="text-sm text-secondary">
            Top Rated Products for you
          </p>
          <h1 data-aos="fade-up" className="text-3xl font-bold">
            Best Products
          </h1>
          <p data-aos="fade-up" className="text-xs text-gray-400">
            Discover our best-selling medicines with trusted quality and care.
          </p>
        </div>

        {/* Body section */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
                     gap-20 md:gap-5 place-items-center"
        >
          {ProductsData.map((data) => (
            <div
              key={data.id}
              className="rounded-2xl bg-white dark:bg-gray-800 
                         hover:bg-black/80 dark:hover:bg-primary hover:text-white 
                         relative shadow-xl duration-300 group max-w-[300px]"
            >
              {/* image section */}
              <div className="h-[180px] flex justify-center items-center">
                <img
                  src={data.img}
                  alt={data.title}
                  className="max-w-[140px] block mx-auto transform translate-y-10 
                             group-hover:scale-105 duration-300 drop-shadow-md"
                />
              </div>

              {/* details section */}
              <div className="p-4 text-center">
                {/* star rating */}
                <div className="w-full flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-500" />
                  ))}
                </div>

                <h1 className="text-xl font-bold mb-1">{data.title}</h1>
                <p className="text-gray-500 group-hover:text-white duration-300 text-sm line-clamp-2">
                  {data.description}
                </p>

               
                <div className="mt-4">
                  <p className="font-semibold text-gray-800 dark:text-gray-100 mb-3 group-hover:text-white">
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

export default TopProducts;
