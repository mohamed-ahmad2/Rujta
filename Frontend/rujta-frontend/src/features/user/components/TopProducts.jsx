import React from "react";
import img1 from "../../../assets/pro/m1.png";
import img2 from "../../../assets/pro/m2.png";
import img3 from "../../../assets/pro/m3.png";
import img4 from "../../../assets/pro/m4.png";
import img5 from "../../../assets/pro/m5.png";
import img6 from "../../../assets/pro/m6.png";
import { FaStar } from "react-icons/fa";

const ProductsData = [
  {
    id: 1,
    img: img1,
    title: "Paracetamol",
    description: "Pain relief and fever reducer",
    price: "15 EGP",
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
  {
    id: 4,
    img: img4,
    title: "dexatobrin eye drops",
    description: "Boosts immune system and energy",
    price: "39 EGP",
  },
   {
    id: 5,
    img: img5,
    title: "Librax Capsule",
    description: " chlordiazepoxide and clidinium",
    price: "39 EGP",
  },
   {
    id: 6,
    img: img6,
    title: "Vacation Cleanser",
    description: " Vacation Facial Cleansing Hydro Gel",
    price: "235 EGP",
  },
];

const Products = ({ cart, setCart }) => {
  const handleAddToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        {/* Title Section */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-[#3C623C] mb-3">
            Featured Medicines
          </h2>
          <p className="text-gray-600 max-w-[600px] mx-auto text-sm">
            Explore our trusted pharmacy essentials, carefully selected for your
            health and well-being.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 place-items-center">
          {ProductsData.map((data) => (
            <div
              key={data.id}
              className="bg-white rounded-3xl shadow-md hover:shadow-xl 
                         duration-300 max-w-[280px] overflow-hidden transform hover:-translate-y-2"
            >
              {/* Image Section */}
              <div className="bg-[#E8F3E8] flex justify-center items-center h-[200px] overflow-hidden">
                <img
                  src={data.img}
                  alt={data.title}
                  className="h-[160px] object-contain transition-transform duration-300 hover:scale-110"
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
                  {data.title}
                </h2>

                <p className="text-gray-500 text-sm mb-3">
                  {data.description}
                </p>

                <p className="text-[#3C623C] font-bold mb-4">{data.price}</p>

                <button
                  onClick={() => handleAddToCart(data)}
                  className="bg-gradient-to-r from-[#3C623C] to-[#6AA76A] 
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
          <h2 className="text-lg font-bold mb-3 text-[#3C623C]">
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
