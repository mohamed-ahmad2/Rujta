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
  IoMenuOutline,
  IoCloseOutline,
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
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
  const mobileInputRef = useRef(null);
  const resultsRef = useRef(null);
  const mobileResultsRef = useRef(null);
  const menuRef = useRef(null);

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
    if (showMobileSearch && mobileInputRef.current) {
      setTimeout(() => mobileInputRef.current?.focus(), 100);
    }
  }, [showMobileSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        if (
          !mobileInputRef.current?.contains(event.target) &&
          !mobileResultsRef.current?.contains(event.target)
        ) {
          setShowResults(false);
          setSelectedIndex(-1);
        }
      }

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openScanner = () => {
    setShowMobileMenu(false);
    navigate("/user/scan-prescription");
  };

  const logoutAndRedirect = () => {
    handleLogout();
    navigate("/");
  };

  const handleSelect = (medicine) => {
    if (!medicine?.id) {
      console.warn("Medicine has no id!");
      return;
    }
    chooseResult(medicine);
    setQuery(medicine.name || "");
    setShowResults(false);
    setSelectedIndex(-1);
    setShowMobileSearch(false);
    navigate(`/user/medicine/${medicine.id}`);
  };

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
      setShowMobileSearch(false);
    }
  };

  const formatBadge = (count) => (count > 9 ? "9+" : count);

  const SearchDropdown = ({ ref: dropRef }) => (
    <div
      ref={dropRef}
      className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-gray-100 bg-white shadow-2xl"
    >
      {searchLoading ? (
        <div className="flex items-center gap-2 px-5 py-4 text-sm text-gray-400">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-secondary" />
          Searching...
        </div>
      ) : searchResults.length > 0 ? (
        searchResults.map((medicine, index) => (
          <div
            key={medicine.id || index}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSelect(medicine)}
            className={`flex cursor-pointer items-center gap-3 border-b border-gray-50 px-5 py-3 text-sm transition-colors last:border-none ${
              index === selectedIndex
                ? "bg-secondary/10 text-secondary"
                : "hover:bg-gray-50"
            }`}
          >
            <IoMdSearch className="flex-shrink-0 text-gray-400" />
            <span className="flex-1 truncate font-medium">{medicine.name}</span>
          </div>
        ))
      ) : (
        <div className="px-5 py-4 text-sm text-gray-400">No results found</div>
      )}
    </div>
  );

  return (
    <nav className="sticky top-0 z-[100] border-b border-gray-100 bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* ═══════════════════════════════════════════════ */}
        {/*  DESKTOP (lg+)                                  */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="hidden items-center justify-between gap-10 py-3.5 lg:flex">
          {/* ✅ gap-6 → gap-10 */}

          {/* Logo */}
          <div
            className="flex-shrink-0 cursor-pointer text-3xl font-bold text-secondary transition-all duration-200 hover:opacity-80"
            onClick={() => navigate("/user")}
          >
            Rujta
          </div>

          {/* Search */}
          <div className="relative w-[420px] xl:w-[720px]">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search medicines..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-5 pr-12 text-sm transition-all duration-200 focus:border-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetSelected();
              }}
              onKeyDown={handleKeyDown}
            />
            <IoMdSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400" />
            {showResults && <SearchDropdown ref={resultsRef} />}
          </div>

          {/* Icons */}
          <div className="flex flex-shrink-0 items-center gap-10">
            {/* Scanner */}
            <button
              title="Scan Prescription"
              onClick={openScanner}
              className="group cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <IoQrCodeOutline className="text-[22px] text-gray-600 transition-colors duration-200 group-hover:text-secondary" />
            </button>

            {/* Cart */}
            <button
              title="Cart"
              onClick={onCartClick}
              className="group relative cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <div className="relative h-[22px] w-[22px]">
                <FiShoppingCart className="absolute inset-0 text-[22px] text-gray-600 opacity-100 transition-all duration-200 group-hover:text-secondary group-hover:opacity-0" />
                <FaCartShopping className="absolute inset-0 text-[22px] text-gray-600 opacity-0 transition-all duration-200 group-hover:text-secondary group-hover:opacity-100" />
              </div>
              {cart.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold text-white">
                  {formatBadge(cart.length)}
                </span>
              )}
            </button>

            {/* Orders */}
            <button
              title="My Orders"
              onClick={() => navigate("/user/orders")}
              className="group relative cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <div className="relative h-[22px] w-[22px]">
                <BsBoxSeam className="absolute inset-0 text-[22px] text-gray-600 opacity-100 transition-all duration-200 group-hover:text-secondary group-hover:opacity-0" />
                <BsBoxSeamFill className="absolute inset-0 text-[22px] text-gray-600 opacity-0 transition-all duration-200 group-hover:text-secondary group-hover:opacity-100" />
              </div>
              {incompleteOrdersCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold text-white">
                  {formatBadge(incompleteOrdersCount)}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              title="Notifications"
              onClick={() => navigate("/user/notifications")}
              className="group relative cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <div className="relative h-[22px] w-[22px]">
                <IoNotificationsOutline className="absolute inset-0 text-[22px] text-gray-600 opacity-100 transition-opacity duration-200 group-hover:text-secondary group-hover:opacity-0" />
                <IoNotifications className="absolute inset-0 text-[22px] text-gray-600 opacity-0 transition-opacity duration-200 group-hover:text-secondary group-hover:opacity-100" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-semibold text-white">
                  {formatBadge(unreadCount)}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              title="Profile"
              onClick={() => navigate("/user/profile")}
              className="group relative cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <div className="relative h-[22px] w-[22px]">
                <CgProfile className="absolute inset-0 text-[26px] text-gray-600 opacity-100 transition-opacity duration-200 group-hover:text-secondary group-hover:opacity-0" />
                <CgProfileFill className="absolute inset-0 text-[26px] text-gray-600 opacity-0 transition-opacity duration-200 group-hover:text-secondary group-hover:opacity-100" />
              </div>
            </button>

            {/* Logout */}
            <button
              title="Logout"
              onClick={logoutAndRedirect}
              className="group relative cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <div className="relative h-[22px] w-[22px]">
                <LuLogOut className="absolute inset-0 text-[22px] text-gray-600 opacity-100 transition-opacity duration-200 group-hover:text-red-500 group-hover:opacity-0" />
                <LuLogOutFill className="absolute inset-0 text-[22px] text-gray-600 opacity-0 transition-opacity duration-200 group-hover:text-red-500 group-hover:opacity-100" />
              </div>
            </button>
          </div>
        </div>


        <div className="lg:hidden">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <div
              className="cursor-pointer text-2xl font-bold text-secondary"
              onClick={() => navigate("/user")}
            >
              Rujta
            </div>

            {/* Mobile Icons */}
            <div className="flex items-center gap-3.5">
              <button
                title="Search"
                onClick={() => {
                  setShowMobileSearch((prev) => !prev);
                  setShowMobileMenu(false);
                  if (showMobileSearch) {
                    setQuery("");
                    resetSelected();
                    setShowResults(false);
                  }
                }}
                className="group relative cursor-pointer transition-transform duration-200 active:scale-90"
              >
                {showMobileSearch ? (
                  <IoCloseOutline className="text-[24px] text-secondary" />
                ) : (
                  <IoMdSearch className="text-[24px] text-gray-600 transition-colors group-hover:text-secondary" />
                )}
              </button>

              {/* Cart */}
              <button
                title="Cart"
                onClick={onCartClick}
                className="group relative cursor-pointer transition-transform duration-200 active:scale-90"
              >
                <div className="relative h-[22px] w-[22px]">
                  <FiShoppingCart className="absolute inset-0 text-[22px] text-gray-600 opacity-100 transition-all duration-200 group-hover:text-secondary group-hover:opacity-0" />
                  <FaCartShopping className="absolute inset-0 text-[22px] text-gray-600 opacity-0 transition-all duration-200 group-hover:text-secondary group-hover:opacity-100" />
                </div>
                {cart.length > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-semibold text-white">
                    {formatBadge(cart.length)}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <button
                title="Notifications"
                onClick={() => navigate("/user/notifications")}
                className="group relative cursor-pointer transition-transform duration-200 active:scale-90"
              >
                <div className="relative h-[22px] w-[22px]">
                  <IoNotificationsOutline className="absolute inset-0 text-[22px] text-gray-600 opacity-100 transition-opacity duration-200 group-hover:text-secondary group-hover:opacity-0" />
                  <IoNotifications className="absolute inset-0 text-[22px] text-gray-600 opacity-0 transition-opacity duration-200 group-hover:text-secondary group-hover:opacity-100" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-semibold text-white">
                    {formatBadge(unreadCount)}
                  </span>
                )}
              </button>

              {/* Hamburger Menu */}
              <div ref={menuRef} className="relative">
                <button
                  title="Menu"
                  onClick={() => {
                    setShowMobileMenu((prev) => !prev);
                    setShowMobileSearch(false);
                    setQuery("");
                    resetSelected();
                    setShowResults(false);
                  }}
                  className="group relative cursor-pointer transition-transform duration-200 active:scale-90"
                >
                  {showMobileMenu ? (
                    <IoCloseOutline className="text-[26px] text-secondary" />
                  ) : (
                    <IoMenuOutline className="text-[26px] text-gray-600 transition-colors group-hover:text-secondary" />
                  )}
                  {incompleteOrdersCount > 0 && !showMobileMenu && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-semibold text-white">
                      {formatBadge(incompleteOrdersCount)}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showMobileMenu && (
                  <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                    {/* Scanner */}
                    <button
                      onClick={openScanner}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <IoQrCodeOutline className="text-[20px] text-gray-500" />
                      <span className="font-medium">Scan Prescription</span>
                    </button>

                    <div className="mx-4 border-t border-gray-100" />

                    {/* Orders */}
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        navigate("/user/orders");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <div className="relative">
                        <BsBoxSeam className="text-[20px] text-gray-500" />
                        {incompleteOrdersCount > 0 && (
                          <span className="absolute -right-1.5 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-semibold text-white">
                            {formatBadge(incompleteOrdersCount)}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">My Orders</span>
                    </button>

                    <div className="mx-4 border-t border-gray-100" />

                    {/* Profile */}
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        navigate("/user/profile");
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <CgProfile className="text-[20px] text-gray-500" />
                      <span className="font-medium">Profile</span>
                    </button>

                    <div className="mx-4 border-t border-gray-100" />

                    {/* Logout */}
                    <button
                      onClick={logoutAndRedirect}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LuLogOut className="text-[20px]" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showMobileSearch
                ? "max-h-20 pb-3 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="relative">
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Search medicines..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-5 pr-12 text-sm transition-all duration-200 focus:border-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  resetSelected();
                }}
                onKeyDown={handleKeyDown}
              />
              <IoMdSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400" />
              {showResults && <SearchDropdown ref={mobileResultsRef} />}
            </div>
          </div>
        </div>
        {/* ═══════════════════════════════════════════════════ */}
      </div>
    </nav>
  );
};

export default Navbar;