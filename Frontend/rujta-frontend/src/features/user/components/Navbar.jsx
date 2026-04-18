// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import { FiShoppingCart } from "react-icons/fi";
import { CgProfile, CgProfile as CgProfileFill } from "react-icons/cg";
import { LuLogOut, LuLogOut as LuLogOutFill } from "react-icons/lu";
import { BsBoxSeam, BsBoxSeamFill } from "react-icons/bs";
import {
  IoNotificationsOutline,
  IoNotifications,
  IoQrCodeOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useSearchMedicines } from "../../medicines/hook/useSearchMedicines";
import { useOrders } from "../../orders/hooks/useOrders";
import { useNotifications } from "../../notifications/hook/useNotifications";

const Navbar = ({ cart, setCart, onCartClick }) => {
  const [query, setQuery] = useState("");
  const [incompleteOrdersCount, setIncompleteOrdersCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);

  const navigate = useNavigate();
  const { handleLogout } = useAuth();

  const { unreadCount } = useNotifications();
  const { orders, fetchUser } = useOrders();

  const {
    results: searchResults,
    loading: searchLoading,
    selected,
    chooseResult,
    resetSelected,
  } = useSearchMedicines(query, 10);

  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (orders) {
      const count = orders.filter(
        (o) =>
          !["Delivered", "CancelledByUser", "CancelledByPharmacy"].includes(
            o.status,
          ),
      ).length;
      setIncompleteOrdersCount(count);
    }
  }, [orders]);

  useEffect(() => {
    setShowResults(query.length > 0 && !selected);
  }, [query, selected]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchResults]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openScanner = () => {
    navigate("/user/scan-prescription");
  };

  const logoutAndRedirect = () => {
    handleLogout();
    navigate("/");
  };

  const handleSelect = (medicine) => {
    console.log("Selected medicine:", medicine);

    if (!medicine?.id) {
      console.warn("Medicine has no id!");
      return;
    }

    chooseResult(medicine);
    setQuery(medicine.name || "");
    setShowResults(false);
    setSelectedIndex(-1);

    navigate(`/user/medicine/${medicine.id}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === -1 ? 0 : Math.min(prev + 1, searchResults.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSelect(searchResults[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowResults(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 md:py-5 gap-4 md:gap-0">
          {/* Logo */}
          <div
            className="text-3xl font-bold text-secondary cursor-pointer 
             transition-all duration-200 hover:scale-105 
             hover:tracking-wide hover:opacity-90"
            onClick={() => navigate("/user")}
          >
            Rujta
          </div>

          {/* Search */}
          <div className="w-full md:w-1/2 lg:w-1/3 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search medicines..."
              className="w-full px-5 py-3 border rounded-full"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetSelected();
              }}
              onKeyDown={handleKeyDown}
            />
            <IoMdSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />

            {/* Dropdown Results */}
            {showResults && (
              <div
                ref={resultsRef}
                className="absolute mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl max-h-72 overflow-auto z-50"
              >
                {searchLoading ? (
                  <div className="px-5 py-4 text-gray-500 text-sm">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((medicine, index) => (
                    <div
                      key={medicine.id || index}
                      className={`px-5 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-3 text-sm border-b last:border-none ${
                        index === selectedIndex ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handleSelect(medicine)}
                    >
                      <span className="flex-1 truncate">{medicine.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-4 text-gray-500 text-sm">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4 md:gap-6 mt-2 md:mt-0">
            {/* Scanner */}
            <IoQrCodeOutline
              className="text-2xl text-gray-600 cursor-pointer hover:text-secondary hover:scale-110 transition-transform duration-200"
              onClick={openScanner}
            />

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative cursor-pointer hover:scale-110 transition-transform duration-200 group"
            >
              <div className="relative w-6 h-6">
                {/* Outline */}
                <FiShoppingCart className="absolute inset-0 text-2xl text-gray-600 group-hover:text-secondary transition-all duration-200 opacity-100 group-hover:opacity-0" />

                {/* Filled */}
                <FaCartShopping className="absolute inset-0 text-2xl text-gray-600 group-hover:text-secondary transition-all duration-200 opacity-0 group-hover:opacity-100" />
              </div>

              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Orders */}
            <button
              onClick={() => navigate("/user/orders")}
              className="relative cursor-pointer hover:scale-110 transition-transform duration-200 group"
            >
              <div className="relative w-6 h-6">
                {/* Outline */}
                <BsBoxSeam className="absolute inset-0 text-2xl text-gray-600 group-hover:text-secondary transition-all duration-200 opacity-100 group-hover:opacity-0" />

                {/* Filled */}
                <BsBoxSeamFill className="absolute inset-0 text-2xl text-gray-600 group-hover:text-secondary transition-all duration-200 opacity-0 group-hover:opacity-100" />
              </div>

              {incompleteOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {incompleteOrdersCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate("/user/notifications")}
              className="relative cursor-pointer hover:scale-110 transition-transform duration-200 group"
            >
              <div className="relative w-6 h-6">
                {/* Outline */}
                <IoNotificationsOutline className="absolute inset-0 text-2xl text-gray-600 group-hover:text-secondary transition-opacity duration-200 opacity-100 group-hover:opacity-0" />

                {/* Filled */}
                <IoNotifications className="absolute inset-0 text-2xl text-gray-600 group-hover:text-secondary transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
              </div>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => navigate("/user/profile")}
              className="relative cursor-pointer hover:scale-110 transition-transform duration-200 group"
            >
              <div className="relative w-6 h-6">
                {/* Outline (default) */}
                <CgProfile className="absolute inset-0 text-3xl text-gray-600 group-hover:text-secondary transition-opacity duration-200 opacity-100 group-hover:opacity-0" />

                {/* Filled */}
                <CgProfileFill className="absolute inset-0 text-3xl text-gray-600 group-hover:text-secondary transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={logoutAndRedirect}
              className="relative cursor-pointer hover:scale-110 transition-transform duration-200 group"
            >
              <div className="relative w-6 h-6">
                {/* Outline */}
                <LuLogOut className="absolute inset-0 text-2xl text-gray-600 group-hover:text-red-600 transition-opacity duration-200 opacity-100 group-hover:opacity-0" />

                {/* Filled */}
                <LuLogOutFill className="absolute inset-0 text-2xl text-gray-600 group-hover:text-red-600 transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
