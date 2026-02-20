import React, { useState, useEffect } from "react";
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

  const navigate = useNavigate();
  const { handleLogout } = useAuth();

  // ================= Notification =================
  const { unreadCount } = useNotifications();

  // ================= Orders =================
  const { orders, fetchUser, loading } = useOrders();

  // ================= Search =================
  const {
    results: searchResults,
    loading: searchLoading,
    chooseResult,
    resetSelected,
  } = useSearchMedicines(query, 10);

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
      if (selectedIndex >= 0 && suggestion) {
        e.preventDefault();
        chooseResult(suggestion);
        navigate(`/medicines/${searchResults[selectedIndex].id}`);
        setQuery("");
        setSuggestion("");
        setSelectedIndex(-1);
      }
    }
  };

  // ================= Logout =================
  const logoutAndRedirect = async () => {
    try {
      await handleLogout();
      navigate("/auth");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="sticky top-0 z-50 shadow-md bg-white text-gray-800">
      <div className="py-3">
        <div className="container mx-auto px-6 flex flex-wrap md:flex-nowrap justify-between items-center relative">
          {/* Logo */}

          <div
            onClick={() => navigate("/user")}
            className="cursor-pointer font-extrabold text-2xl text-secondary sm:text-3xl"
          >
            Rujta
          </div>

          {/* Search Bar */}
          <div className="flex-1 mx-4 min-w-[200px] max-w-[800px]">
            <div className="relative w-full">
              <div className="absolute inset-0 px-4 py-2 pointer-events-none text-gray-400 text-sm flex items-center z-0">
                {suggestion}
              </div>
              <input
                type="text"
                placeholder="Search medicines..."
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-transparent z-10 relative shadow-sm"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  resetSelected();
                }}
                onKeyDown={handleKeyDown}
              />
              <IoMdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />

              {/* Search Results */}
              {searchResults.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto z-50 shadow-md">
                  {searchResults.map((med, index) => (
                    <li
                      key={med.id}
                      className={`px-4 py-2 hover:bg-secondary/10 cursor-pointer ${index === selectedIndex ? "bg-secondary/20" : ""}`}
                      onClick={() => {
                        chooseResult(med.name);
                        navigate(`/medicines/${med.id}`);
                        setQuery("");
                      }}
                    >
                      {med.name}
                    </li>
                  ))}
                </ul>
              )}

              {searchLoading && (
                <div className="absolute top-full left-0 right-0 bg-white px-4 py-2 border mt-1 text-sm">
                  Loading...
                </div>
              )}
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4 md:gap-6 mt-2 md:mt-0">
            {/* Cart */}
            <div className="relative cursor-pointer" onClick={onCartClick}>
              <FaCartShopping className="text-2xl text-secondary" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>

            {/* Orders */}
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/user/orders")}
            >
              <BsBoxSeam className="text-2xl text-gray-600 hover:text-secondary" />
              {incompleteOrdersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {incompleteOrdersCount}
                </span>
              )}
            </div>
            {/* Notifications */}
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/user/notifications")}
            >
              <IoNotificationsOutline className="text-2xl text-gray-600 hover:text-secondary" />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>

            {/* Profile */}
            <CgProfile
              className="text-3xl text-gray-600 cursor-pointer hover:text-secondary"
              onClick={() => navigate("/user/profile")}
            />

            {/* Logout */}
            <LuLogOut
              className="text-2xl text-gray-600 cursor-pointer hover:text-red-600"
              onClick={logoutAndRedirect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
