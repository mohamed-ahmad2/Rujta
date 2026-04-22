import React from "react";
import { useLocation } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { MdMenuOpen } from "react-icons/md";
import UserImage from "../../../assets/change/HeroImg1.png";
import { useUserProfile } from "../../userProfile/hook/useUserProfile";
import { useAuth } from "../../auth/hooks/useAuth";

const NavbarDashbord = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { profile, loading } = useUserProfile();
  const { user } = useAuth();

  const pages = {
    "/dashboard/home": {
      title: "Overview",
      subtitle: "Your overall performance today",
    },
    "/dashboard/products": {
      title: "Products",
      subtitle: "Manage your inventory",
    },
    "/dashboard/orders": {
      title: "Orders",
      subtitle: "Incoming & processed orders",
    },
    "/dashboard/customers": {
      title: "Customers",
      subtitle: "Your customer base",
    },
    "/dashboard/settings": {
      title: "Settings",
      subtitle: "Dashboard preferences",
    },
    "/dashboard/sales": { title: "Sales", subtitle: "Your sales overview" },
    "/dashboard/logs": { title: "Logs", subtitle: "Staff activity logs" },
    "/dashboard/ads": { title: "Ads", subtitle: "Manage your ads" },
  };

  const current = pages[location.pathname] || {
    title: "Dashboard",
    subtitle: "Welcome back",
  };

  const displayName = loading
    ? "Loading..."
    : profile?.fullName || profile?.name || user?.email || "User";

  const displayRole = loading
    ? ""
    : profile?.role || user?.role || "Pharmacist";

  const displayImage = loading
    ? UserImage
    : profile?.profileImageUrl || UserImage;

  return (
    <header className="flex w-full items-center justify-between gap-3 border-b bg-white px-3 py-3 sm:px-4 md:px-6 md:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 md:hidden"
          aria-label="Toggle menu"
        >
          <MdMenuOpen
            size={22}
            className={`transition-transform duration-300 ${sidebarOpen ? "" : "rotate-180"}`}
          />
        </button>

        {/* Title */}
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-gray-800 sm:text-lg md:text-xl">
            {current.title}
          </h2>
          <p className="hidden truncate text-xs text-gray-500 sm:block md:text-sm">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right — Bell + User */}
      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
        {/* Bell */}
        <button
          className="relative rounded-full p-2 transition hover:bg-gray-100"
          aria-label="Notifications"
        >
          <FaBell className="text-base text-gray-600 sm:text-lg" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-gray-200 sm:block" />

        {/* User */}
        <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray-100 sm:gap-3 sm:px-3 sm:py-2">
          <img
            src={displayImage}
            alt="user"
            className="h-8 w-8 flex-shrink-0 rounded-full border-2 border-gray-200 object-cover sm:h-9 sm:w-9 md:h-10 md:w-10"
          />
          <div className="hidden max-w-[100px] leading-tight sm:block md:max-w-[140px] lg:max-w-[180px]">
            <h4 className="truncate text-xs font-semibold text-gray-800 sm:text-sm">
              {displayName}
            </h4>
            <p className="truncate text-xs text-gray-500">{displayRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavbarDashbord;
