import React from "react";
import { IoMdClose } from "react-icons/io";
import { FaPlus, FaMinus } from "react-icons/fa";

const CartDrawerUser = ({ cart, setCart, isOpen, onClose }) => {
  // ➕ Increase quantity
  const handleIncrease = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // ➖ Decrease quantity
  const handleDecrease = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };


  // 💰 Total price
  const total = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[320px] bg-white dark:bg-gray-900 
                  shadow-2xl transform transition-transform duration-300 
                  ${isOpen ? "translate-x-0" : "translate-x-full"} z-50 flex flex-col`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold dark:text-white">Your Cart</h2>
        <IoMdClose
          className="text-2xl cursor-pointer text-gray-500 hover:text-red-500 transition-colors"
          onClick={onClose}
        />
      </div>

      {/* Cart Items */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300 text-center mt-10">
            Your cart is empty 🛒
          </p>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Item info */}
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {item.title} ×{item.quantity}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {(parseFloat(item.price) * item.quantity).toFixed(2)} EGP
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecrease(item.id)}
                  className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <FaMinus className="text-gray-700 dark:text-gray-200 text-xs" />
                </button>
                <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm w-5 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleIncrease(item.id)}
                  className="p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <FaPlus className="text-gray-700 dark:text-gray-200 text-xs" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer — stays visible */}
      {cart.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-900 sticky bottom-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-700 dark:text-gray-300 font-semibold">
              Total:
            </span>
            <span className="text-lg font-bold text-primary">
              {total.toFixed(2)} EGP
            </span>
          </div>
          <button
            className="w-full bg-gradient-to-r from-primary to-secondary 
                       text-white py-2.5 rounded-md font-semibold 
                       hover:opacity-90 transition-all duration-300"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDrawerUser;