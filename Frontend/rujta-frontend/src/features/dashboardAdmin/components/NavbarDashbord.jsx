import React from "react";
import { useLocation } from "react-router-dom";
import { FaSearch, FaBell } from "react-icons/fa";
import UserImage from "../../../assets/change/HeroImg1.png";

const NavbarDashbord = () => {
  const location = useLocation();

  // ربط كل صفحة بعنوان ووصف خاص بها
  const titles = {
    "/dashboard/home": {
      title: "Overview",
      subtitle: "Your overall performance today",
    },
    "/dashboard/products": {
      title: "Product List",
      subtitle: "Manage and track your pharmacy products",
    },
    "/dashboard/orders": {
      title: "Orders",
      subtitle: "Review and manage incoming orders",
    },
    "/dashboard/sales": {
      title: "Sales",
      subtitle: "Track and analyze your daily sales",
    },
    "/dashboard/customers": {
      title: "Customers",
      subtitle: "Manage your customer relationships",
    },
    "/dashboard/payments": {
      title: "Payments",
      subtitle: "View all transactions and settlements",
    },
    "/dashboard/settings": {
      title: "Settings",
      subtitle: "Adjust your dashboard preferences",
    },
    "/dashboard/help": {
      title: "Help & Support",
      subtitle: "Get assistance whenever you need it",
    },
  };

  // العنوان الحالي حسب الصفحة
  const current = titles[location.pathname] || {
    title: "Dashboard",
    subtitle: "Welcome to your dashboard",
  };

  return (
    <div className="w-full bg-white px-6 py-4 flex items-center justify-between shadow-sm">
      
      {/* Left — Title + Subtitle */}
      <div>
        <h2 className="text-xl font-semibold">{current.title}</h2>
        <p className="text-sm text-gray-500">{current.subtitle}</p>
      </div>

      {/* Middle — Search */}
      <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full w-72">
        <FaSearch className="text-gray-500" size={14} />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none ml-2 w-full"
        />
      </div>

      {/* Right — User Info */}
      <div className="flex items-center gap-4">
        <FaBell size={20} className="text-gray-600 cursor-pointer" />

        <img
          src={UserImage}
          alt="user"
          className="w-10 h-10 rounded-full border"
        />

        <div className="text-right">
          <h4 className="font-semibold">James Bond</h4>
          <p className="text-xs text-gray-500">@james.bond</p>
        </div>
      </div>
    </div>
  );
};

export default NavbarDashbord;
