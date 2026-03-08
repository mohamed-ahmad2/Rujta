// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import { LuLogOut } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { BsBoxSeam } from "react-icons/bs";
import { IoNotificationsOutline, IoQrCodeOutline } from "react-icons/io5";
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

  const { unreadCount } = useNotifications();
  const { orders, fetchUser } = useOrders();

  const {
    results: searchResults,
    loading: searchLoading,
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

  const openScanner = () => {
    navigate("/user/scan-prescription");
  };

  const logoutAndRedirect = () => {
    handleLogout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 md:py-5 gap-4 md:gap-0">

          {/* Logo */}
          <div
            className="text-3xl font-bold text-secondary cursor-pointer"
            onClick={() => navigate("/user")}
          >
            Rujta
          </div>

          {/* Search */}
          <div className="w-full md:w-1/2 lg:w-1/3 relative">
            <input
              type="text"
              placeholder="Search medicines..."
              className="w-full px-5 py-3 border rounded-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <IoMdSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4 md:gap-6 mt-2 md:mt-0">

            {/* Scanner */}
            <IoQrCodeOutline
              className="text-2xl text-gray-600 cursor-pointer hover:text-secondary"
              onClick={openScanner}
            />

            {/* Cart */}
            <button onClick={onCartClick} className="relative">
              <FaCartShopping className="text-2xl text-secondary" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Orders */}
            <button onClick={() => navigate("/user/orders")} className="relative">
              <BsBoxSeam className="text-2xl text-gray-600" />
              {incompleteOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {incompleteOrdersCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button onClick={() => navigate("/user/notifications")} className="relative">
              <IoNotificationsOutline className="text-2xl text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button onClick={() => navigate("/user/profile")}>
              <CgProfile className="text-3xl text-gray-600" />
            </button>

            {/* Logout */}
            <button onClick={logoutAndRedirect}>
              <LuLogOut className="text-2xl text-gray-600 hover:text-red-600" />
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;