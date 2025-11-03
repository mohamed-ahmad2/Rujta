import React from "react";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";

const Navbar = ({ cart, onCartClick }) => {
  return (
    <div className="shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40">
      <div className="bg-secondary/40 py-2">
        <div className="container flex justify-between items-center">
          <a href="#" className="font-bold text-2xl text-primary sm:text-3xl flex gap-2">
            Rujta
          </a>

          <div className="flex justify-between items-center gap-4">
            {/* search */}
            <div className="relative group hidden sm:block">
              <input
                type="text"
                placeholder="search"
                className="w-[200px] sm:w-[200px] group-hover:w-[300px] transition-all duration-300 
                           rounded-full border border-gray-300 px-2 py-1 focus:outline-none 
                           focus:border-1 focus:border-secondary"
              />
              <IoMdSearch className="text-gray-500 group-hover:text-secondary absolute top-1/2 -translate-y-1/2 right-3" />
            </div>

            {/* cart icon */}
            <div className="relative cursor-pointer" onClick={onCartClick}>
              <FaCartShopping className="text-2xl text-primary" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs 
                                 font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
