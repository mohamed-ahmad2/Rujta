// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import { LuLogOut } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { BsBoxSeam } from "react-icons/bs";
import { IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useSearchMedicines } from "../../medicines/hook/useSearchMedicines";
import { useOrders } from "../../orders/hooks/useOrders";
import { useNotifications } from "../../notifications/hook/useNotifications";

const Navbar = ({ cart, setCart, onCartClick }) => {
  const [query, setQuery] = useState("");
  const [incompleteOrdersCount, setIncompleteOrdersCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestion, setSuggestion] = useState("");
  const [showResults, setShowResults] = useState(false);

  const navigate = useNavigate();
  const { handleLogout } = useAuth();

  // ================= Notification =================
  const { unreadCount } = useNotifications();

  // ================= Orders =================
  const { orders, fetchUser, loading: ordersLoading } = useOrders();

  // ================= Search =================
  const {
    results: searchResults,
    loading: searchLoading,
    chooseResult,
    resetSelected,
  } = useSearchMedicines(query, 10);

  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // ================= Load Orders =================
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ================= Update Incomplete Orders Count =================
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

  // ================= Suggestion Update =================
  useEffect(() => {
    let newIndex = selectedIndex;
    if (newIndex === -1 && searchResults.length > 0 && query) {
      newIndex = 0;
    }
    if (newIndex >= 0 && newIndex < searchResults.length) {
      const selectedName = searchResults[newIndex].name;
      if (selectedName.toLowerCase().startsWith(query.toLowerCase())) {
        setSuggestion(selectedName);
      } else {
        setSuggestion("");
      }
    } else {
      setSuggestion("");
    }
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
    }
  }, [searchResults, query, selectedIndex]);

  // ================= Show/Hide Results =================
  useEffect(() => {
    if (query && (searchResults.length > 0 || searchLoading)) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [query, searchResults, searchLoading]);

  // ================= Click Outside to Close =================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ================= Key Down Handler =================
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (searchResults.length > 0) {
        const newIndex = (selectedIndex + 1) % searchResults.length;
        setSelectedIndex(newIndex);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (searchResults.length > 0) {
        const newIndex =
          (selectedIndex - 1 + searchResults.length) % searchResults.length;
        setSelectedIndex(newIndex);
      }
    } else if (e.key === "Tab") {
      if (selectedIndex >= 0 && suggestion) {
        e.preventDefault();
        setQuery(suggestion);
        setSuggestion("");
        setSelectedIndex(-1);
      }
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && searchResults.length > 0) {
        const selectedMed = searchResults[selectedIndex];
        chooseResult(selectedMed.name);
        navigate(`/medicines/${selectedMed.id}`);
        setQuery("");
        setSuggestion("");
        setSelectedIndex(-1);
        resetSelected();
        setShowResults(false);
      }
    } else if (e.key === "Escape") {
      setQuery("");
      setSuggestion("");
      setSelectedIndex(-1);
      setShowResults(false);
    }
  };

  // ================= Query Change =================
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
    setSuggestion("");
    if (e.target.value) {
      setShowResults(true);
    }
  };

  // ================= Logout =================
  const logoutAndRedirect = () => {
    handleLogout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 transition-shadow duration-300">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 md:py-5 gap-4 md:gap-0">
          {/* Logo */}
          <div
            className="text-3xl font-bold text-secondary cursor-pointer hover:text-secondary/90 transition-colors duration-200"
            onClick={() => navigate("/user")}
          >
            Rujta
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-1/2 lg:w-1/3 relative" ref={inputRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search medicines..."
                className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 pl-12 pr-12 text-base"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
                onFocus={() => query && setShowResults(true)}
                aria-label="Search medicines"
              />
              {suggestion && (
                <div className="absolute left-12 top-3 text-gray-400 pointer-events-none truncate max-w-[calc(100%-6rem)]">
                  {query + suggestion.slice(query.length)}
                </div>
              )}
              <IoMdSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />

              {/* Search Results */}
              {showResults && (
                <ul
                  ref={resultsRef}
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 max-h-72 overflow-y-auto z-50 shadow-xl divide-y divide-gray-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                >
                  {searchResults.map((med, index) => (
                    <li
                      key={med.id}
                      className={`px-5 py-3.5 hover:bg-secondary/10 cursor-pointer transition-colors duration-150 flex items-center ${
                        index === selectedIndex ? "bg-secondary/20" : ""
                      }`}
                      onClick={() => {
                        chooseResult(med.name);
                        navigate(`/medicines/${med.id}`);
                        setQuery("");
                        setShowResults(false);
                      }}
                    >
                      <span className="font-medium text-gray-800 flex-1">
                        {med.name}
                      </span>
                    </li>
                  ))}
                  {searchResults.length === 0 && !searchLoading && query && (
                    <li className="px-5 py-3.5 text-gray-500 text-center">
                      No results found
                    </li>
                  )}
                </ul>
              )}

              {searchLoading && showResults && (
                <div className="absolute top-full left-0 right-0 bg-white px-5 py-3.5 border border-gray-200 rounded-xl mt-2 text-sm text-gray-500 shadow-xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary mr-2"></div>
                  Loading suggestions...
                </div>
              )}
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
            {/* Cart */}
            <button
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
              onClick={onCartClick}
              aria-label="Shopping Cart"
            >
              <FaCartShopping className="text-xl md:text-2xl text-secondary group-hover:scale-110 transition-transform duration-200" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center animate-pulse">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Orders */}
            <button
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
              onClick={() => navigate("/user/orders")}
              aria-label="My Orders"
            >
              <BsBoxSeam className="text-xl md:text-2xl text-gray-600 group-hover:text-secondary group-hover:scale-110 transition-all duration-200" />
              {incompleteOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center animate-pulse">
                  {incompleteOrdersCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
              onClick={() => navigate("/user/notifications")}
              aria-label="Notifications"
            >
              <IoNotificationsOutline className="text-xl md:text-2xl text-gray-600 group-hover:text-secondary group-hover:scale-110 transition-all duration-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
              onClick={() => navigate("/user/profile")}
              aria-label="Profile"
            >
              <CgProfile className="text-2xl md:text-3xl text-gray-600 group-hover:text-secondary group-hover:scale-110 transition-all duration-200" />
            </button>

            {/* Logout */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
              onClick={logoutAndRedirect}
              aria-label="Logout"
            >
              <LuLogOut className="text-xl md:text-2xl text-gray-600 group-hover:text-red-600 group-hover:scale-110 transition-all duration-200" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
