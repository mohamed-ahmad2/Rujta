import React from "react";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";

const Navbar = ({ cart, onCartClick }) => {
  return (
    <div className="shadow-md bg-white text-gray-800 relative z-40">
      <div className="py-3">
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <a
            href="#"
            className="font-extrabold text-2xl text-secondary sm:text-3xl flex gap-2"
          >
            Rujta
          </a>

          {/* Search Bar in the center */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-[220px] sm:w-[320px]">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search medicines..."
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
              />
              <IoMdSearch
                className="text-gray-500 group-hover:text-secondary absolute 
                           top-1/2 -translate-y-1/2 right-3 text-lg"
              />
            </div>
          </div>

          {/* Cart Icon */}
          <div className="relative cursor-pointer" onClick={onCartClick}>
            <FaCartShopping className="text-2xl text-secondary" />
            {cart.length > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs 
                           font-bold rounded-full h-5 w-5 flex items-center justify-center"
              >
                {cart.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
