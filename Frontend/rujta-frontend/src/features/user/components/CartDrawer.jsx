import React, { useState, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { FaPlus, FaMinus, FaPills } from "react-icons/fa";
import { MdShoppingCartCheckout } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import audio from "../../../assets/audio.wav";

const CartDrawerUser = ({ cart, setCart, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const clickSound = useRef(new Audio(audio));

  const handleIncrease = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const handleDecrease = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemove = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleNavigateToMedicine = (id) => {
    onClose();
    navigate(`/user/medicine/${id}`);
  };

  const handleCheckout = () => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    clickSound.current.play();
    setTimeout(() => {
      onClose();
      navigate("/user/Checkout");
    }, 400);
  };

  return (
    <>
      {/* ── Backdrop ───────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* ── Drawer ─────────────────────────────────────────────── */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-[360px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-gray-900 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10">
              <MdShoppingCartCheckout className="text-xl text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight text-gray-800 dark:text-white">
                Your Cart
              </h2>
              <p className="text-xs text-gray-400">
                {cart.length === 0
                  ? "No items"
                  : `${cart.length} ${cart.length === 1 ? "item" : "items"}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-100 hover:text-red-600 dark:border-red-900/30 dark:bg-red-900/10"
              >
                <RiDeleteBin6Line className="text-sm" />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <IoMdClose className="text-lg" />
            </button>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────── */}
        <div className="mx-6 h-px bg-gray-100 dark:bg-gray-800" />

        {/* ── Items ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 pt-24">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gray-50 text-5xl shadow-inner dark:bg-gray-800">
                🛒
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-600 dark:text-gray-300">
                  Cart is empty
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Add some medicines to continue
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleNavigateToMedicine(item.id)}
                  className="relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/80 p-4 transition-all duration-200 hover:border-secondary/20 hover:bg-white hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800/60"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* ── ROW 1: Image + Name + Delete ─────────────── */}
                  <div className="flex items-center gap-3">
                    {/* ✅ Medicine Image with Fallback */}
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 shadow-sm dark:bg-gray-700">
                      {item.image || item.imageUrl ? (
                        <img
                          src={item.image || item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      {/* Fallback Icon */}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          display:
                            item.image || item.imageUrl ? "none" : "flex",
                        }}
                      >
                        <FaPills className="text-lg text-secondary" />
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 dark:text-white">
                        {item.name}
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-300 transition-all hover:bg-red-100 hover:text-red-500 dark:bg-red-900/10 dark:text-red-400"
                    >
                      <RiDeleteBin6Line className="text-base" />
                    </button>
                  </div>

                  {/* ── ROW 2: Quantity + Controls ────────────────── */}
                  <div
                    className="mt-3 flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Quantity */}
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                        {item.quantity} {item.quantity === 1 ? "unit" : "units"}
                      </span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 rounded-2xl bg-white p-1 shadow-sm dark:bg-gray-700">
                      <button
                        onClick={() => handleDecrease(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-red-100 hover:text-red-500 dark:bg-gray-600"
                      >
                        <FaMinus className="text-[9px]" />
                      </button>
                      <span className="w-7 text-center text-sm font-extrabold text-gray-800 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrease(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-green-100 hover:text-green-500 dark:bg-gray-600"
                      >
                        <FaPlus className="text-[9px]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        {cart.length > 0 && (
          <div className="px-5 pb-6 pt-3">
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-secondary/5 px-4 py-3">
              <span className="text-sm font-medium text-gray-500">
                Total items
              </span>
              <span className="text-sm font-extrabold text-secondary">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} units
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className={`flex w-full items-center justify-center gap-2.5 rounded-2xl bg-secondary py-3.5 text-sm font-bold text-white shadow-lg shadow-secondary/30 transition-all duration-300 ${
                isCheckingOut
                  ? "animate-pulse cursor-not-allowed opacity-75"
                  : "hover:scale-[1.02] hover:shadow-xl hover:shadow-secondary/40 active:scale-[0.98]"
              }`}
            >
              {isCheckingOut ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <MdShoppingCartCheckout className="text-lg" />
                  Proceed to Checkout
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawerUser;
