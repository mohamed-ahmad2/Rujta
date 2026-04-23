import React, { useState, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import audio from "../../../assets/audio.wav";

const CartDrawerUser = ({ cart, setCart, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // ✅ useRef بدل new Audio في كل render
  const clickSound = useRef(new Audio(audio));

  // Increase quantity
  const handleIncrease = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  // Decrease quantity
  const handleDecrease = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  // Total price
  const total = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  );

  // Handle Checkout
  const handleCheckout = () => {
    if (isCheckingOut) return;

    setIsCheckingOut(true);

    // ✅ clickSound.current بدل clickSound
    clickSound.current.play();

    setTimeout(() => {
      onClose();
      navigate("/user/Checkout");
    }, 400);
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-[320px] transform bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-900 ${isOpen ? "translate-x-0" : "translate-x-full"} z-50 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <h2 className="text-lg font-bold dark:text-white">Your Cart</h2>
        <IoMdClose
          className="cursor-pointer text-2xl text-gray-500 transition-colors hover:text-red-500"
          onClick={onClose}
        />
      </div>

      {/* Cart Items */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {cart.length === 0 ? (
          <p className="mt-10 text-center text-gray-500 dark:text-gray-300">
            Your cart is empty 🛒
          </p>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-gray-100 p-3 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800"
            >
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {item.name} ×{item.quantity}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {(parseFloat(item.price) * item.quantity).toFixed(2)} EGP
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecrease(item.id)}
                  className="rounded-full bg-gray-200 p-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <FaMinus className="text-xs text-gray-700 dark:text-gray-200" />
                </button>
                <span className="w-5 text-center text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleIncrease(item.id)}
                  className="rounded-full bg-gray-200 p-1 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <FaPlus className="text-xs text-gray-700 dark:text-gray-200" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="sticky bottom-0 border-t border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              Total:
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {total.toFixed(2)} EGP
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className={`flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-secondary to-secondary py-2.5 font-semibold text-white transition-all duration-300 ${
              isCheckingOut
                ? "animate-pulse cursor-not-allowed opacity-80"
                : "hover:scale-105 hover:opacity-90 active:scale-95"
            }`}
          >
            {isCheckingOut && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            )}
            {isCheckingOut ? "Processing..." : "Checkout"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDrawerUser;
