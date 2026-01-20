import React from "react";
import { useLocation } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import UserImage from "../../../assets/change/HeroImg1.png";
import { useUserProfile } from "../../userProfile/hook/useUserProfile";
import { useAuth } from "../../auth/hooks/useAuth";

const NavbarDashbord = () => {
  const location = useLocation();

  // Get full profile
  const { profile, loading } = useUserProfile();
  // Get basic user info as fallback
  const { user } = useAuth();

  const pages = {
    "/dashboard/home": {
      title: "Overview",
      subtitle: "Your overall performance today",
      status: "Live",
      color: "bg-green-100 text-green-700",
    },
    "/dashboard/products": {
      title: "Products",
      subtitle: "Manage your inventory",
      status: "Updated",
      color: "bg-blue-100 text-blue-700",
    },
    "/dashboard/orders": {
      title: "Orders",
      subtitle: "Incoming & processed orders",
      status: "New Orders",
      color: "bg-orange-100 text-orange-700",
    },
    "/dashboard/customers": {
      title: "Customers",
      subtitle: "Your customer base",
      status: "Active",
      color: "bg-purple-100 text-purple-700",
    },
    "/dashboard/settings": {
      title: "Settings",
      subtitle: "Dashboard preferences",
      status: "Private",
      color: "bg-gray-200 text-gray-700",
    },
  };

  const current = pages[location.pathname] || {
    title: "Dashboard",
    subtitle: "Welcome back",
    status: "Online",
    color: "bg-green-100 text-green-700",
  };

  // Fallback values to avoid null
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
    <header className="w-full bg-white px-6 py-4 flex items-center justify-between border-b">
      {/* Left — Title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{current.title}</h2>
        <p className="text-sm text-gray-500">{current.subtitle}</p>
      </div>

      {/* Center — Status Chip */}
      <div>
      <span
        className={`px-4 py-1.5 rounded-full text-sm font-medium ${current.color}`}>
          {current.status}
          </span>

      </div>

      {/* Right — User */}
      <div className="flex items-center gap-4 transform -translate-x-4">
        <FaBell className="text-gray-600 cursor-pointer hover:text-secondary transition" />
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition">
          <img
            src={displayImage}
            alt="user"
            className="w-9 h-9 rounded-full border object-cover"
          />
          <div className="leading-tight">
            <h4 className="text-sm font-semibold text-gray-800">{displayName}</h4>
            <p className="text-xs text-gray-500">{displayRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavbarDashbord;
