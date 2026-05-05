import React, { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  if (
    location.pathname === "/superadmin" ||
    location.pathname === "/superadmin/"
  ) {
    return <Navigate to="/superadmin/pharmacies" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen z-40">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </aside>

      {/* Main Content */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <div className="flex-1 p-6 overflow-y-auto bg-[#F6F7F9]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}