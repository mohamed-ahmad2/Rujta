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
    <nav className="sticky top-0 z-50 bg-white shadow-lg">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 py-4 md:py-5 lg:flex-row lg:gap-0">
          {/* Logo */}
          <div
            className="cursor-pointer text-4xl font-bold text-secondary transition-all duration-200 hover:scale-105 hover:tracking-wide hover:opacity-90 md:text-5xl lg:text-4xl"
            onClick={() => navigate("/user")}
          >
            Rujta
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-1/2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search medicines..."
              className="w-full rounded-full border px-5 py-3"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetSelected();
              }}
              onKeyDown={handleKeyDown}
            />
            <IoMdSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-500" />

            {/* Dropdown Results */}
            {showResults && (
              <div
                ref={resultsRef}
                className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-gray-200 bg-white shadow-xl"
              >
                {searchLoading ? (
                  <div className="px-5 py-4 text-sm text-gray-500">
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((medicine, index) => (
                    <div
                      key={medicine.id || index}
                      className={`flex cursor-pointer items-center gap-3 border-b px-5 py-3.5 text-sm transition-colors last:border-none hover:bg-gray-100 ${
                        index === selectedIndex ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handleSelect(medicine)}
                    >
                      <span className="flex-1 truncate">{medicine.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-4 text-sm text-gray-500">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="mt-2 flex items-center gap-6 md:mt-0 md:gap-10 lg:gap-6">
            {/* Scanner */}
            <IoQrCodeOutline
              className="cursor-pointer text-2xl text-gray-600 transition-transform duration-200 hover:scale-110 hover:text-secondary"
              onClick={openScanner}
            />

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="group relative cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <div className="relative h-6 w-6">
                {/* Outline */}
                <FiShoppingCart className="absolute inset-0 text-2xl text-gray-600 opacity-100 transition-all duration-200 group-hover:text-secondary group-hover:opacity-0" />

                {/* Filled */}
                <FaCartShopping className="absolute inset-0 text-2xl text-gray-600 opacity-0 transition-all duration-200 group-hover:text-secondary group-hover:opacity-100" />
              </div>

              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Orders */}
            <button
              onClick={() => navigate("/user/orders")}
              className="group relative cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <div className="relative h-6 w-6">
                {/* Outline */}
                <BsBoxSeam className="absolute inset-0 text-2xl text-gray-600 opacity-100 transition-all duration-200 group-hover:text-secondary group-hover:opacity-0" />

                {/* Filled */}
                <BsBoxSeamFill className="absolute inset-0 text-2xl text-gray-600 opacity-0 transition-all duration-200 group-hover:text-secondary group-hover:opacity-100" />
              </div>

              {incompleteOrdersCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {incompleteOrdersCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate("/user/notifications")}
              className="group relative cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <div className="relative h-6 w-6">
                {/* Outline */}
                <IoNotificationsOutline className="absolute inset-0 text-2xl text-gray-600 opacity-100 transition-opacity duration-200 group-hover:text-secondary group-hover:opacity-0" />

                {/* Filled */}
                <IoNotifications className="absolute inset-0 text-2xl text-gray-600 opacity-0 transition-opacity duration-200 group-hover:text-secondary group-hover:opacity-100" />
              </div>

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => navigate("/user/profile")}
              className="group relative cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <div className="relative h-6 w-6">
                {/* Outline (default) */}
                <CgProfile className="absolute inset-0 text-3xl text-gray-600 opacity-100 transition-opacity duration-200 group-hover:text-secondary group-hover:opacity-0" />

                {/* Filled */}
                <CgProfileFill className="absolute inset-0 text-3xl text-gray-600 opacity-0 transition-opacity duration-200 group-hover:text-secondary group-hover:opacity-100" />
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={logoutAndRedirect}
              className="group relative cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <div className="relative h-6 w-6">
                {/* Outline */}
                <LuLogOut className="absolute inset-0 text-2xl text-gray-600 opacity-100 transition-opacity duration-200 group-hover:text-red-600 group-hover:opacity-0" />

                {/* Filled */}
                <LuLogOutFill className="absolute inset-0 text-2xl text-gray-600 opacity-0 transition-opacity duration-200 group-hover:text-red-600 group-hover:opacity-100" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
