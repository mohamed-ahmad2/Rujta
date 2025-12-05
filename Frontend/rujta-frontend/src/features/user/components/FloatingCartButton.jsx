import React from "react";
import { FaCartShopping } from "react-icons/fa6";

const FloatingCartButton = ({ cart, onClick }) => {
  if (!cart) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative group">
        {/* Floating button */}
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary 
                        rounded-full flex items-center justify-center shadow-lg 
                        hover:shadow-2xl transform hover:scale-110 transition-all duration-300">
          <FaCartShopping className="text-white text-2xl" />
        </div>

        {/* Badge */}
        {cart.length > 0 && (
          <span
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs 
                       font-bold rounded-full h-6 w-6 flex items-center justify-center 
                       animate-pulse shadow-md"
          >
            {cart.length}
          </span>
        )}
      </div>
    </div>
  );
};

export default FloatingCartButton;
