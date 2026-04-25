import React from "react";
import { FaCartShopping } from "react-icons/fa6";

const FloatingCartButton = ({ cart, onClick }) => {
  if (!cart) return null;

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 cursor-pointer"
      onClick={onClick}
    >
      <div
        className={`flex items-center gap-2.5 rounded-full bg-pr px-4 py-3 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95`}
      >
        {/* Icon */}
        <FaCartShopping className="text-xl text-white" />

        {/* Divider */}
        {itemCount > 0 && <div className="h-4 w-px bg-white/30" />}

        {/* Count */}
        {itemCount > 0 && (
          <span className="min-w-[20px] text-center text-sm font-bold text-white">
            {itemCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default FloatingCartButton;
