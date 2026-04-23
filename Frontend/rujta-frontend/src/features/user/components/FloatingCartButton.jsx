import React from "react";
import { FaCartShopping } from "react-icons/fa6";

const FloatingCartButton = ({ cart, onClick }) => {
  if (!cart) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 cursor-pointer"
      onClick={onClick}
    >
      <div className="group relative">
        {/* Floating button */}
        <div className="flex h-16 w-16 transform items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl">
          <FaCartShopping className="text-2xl text-white" />
        </div>

        {/* Badge */}
        {cart.length > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
            {cart.length}
          </span>
        )}
      </div>
    </div>
  );
};

export default FloatingCartButton;
