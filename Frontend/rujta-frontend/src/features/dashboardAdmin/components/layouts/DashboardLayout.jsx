import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { MdMenuOpen } from "react-icons/md";
import Sidebar from "../Sidebar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(
    window.innerWidth >= 768
  );

  const location = useLocation();

  // ✅ Redirect
  if (
    location.pathname === "/superadmin" ||
    location.pathname === "/superadmin/"
  ) {
    return <Navigate to="/superadmin/pharmacies" replace />;
  }

  // ✅ يقفل في الموبايل عند تغيير الصفحة
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // ✅ يتحكم حسب حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F6F7F9]">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Content */}
      <div className="flex-1 min-w-0 relative">

        {/* ✅ زرار نفس شكل sidebar */}
        <MdMenuOpen
          size={30}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`md:hidden fixed top-4 z-40 cursor-pointer transition-all duration-300 bg-secondary text-white p-1.5 rounded-lg shadow-lg
            ${!sidebarOpen ? "rotate-180 left-4" : "left-64"}
          `}
        />

        <div className="p-3 sm:p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}