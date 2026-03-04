import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar"; // نفس مسارك
import NavBar from "../NavbarDashbord";   // الناب بار اللي عندك

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#F6F7F9]">

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-40
          transition-all duration-300
          ${sidebarOpen ? "w-64" : "w-20"}
        `}
      >
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </aside>

      {/* Main Content */}
      <div
        className={`
          flex flex-col min-h-screen transition-all duration-300
          ${sidebarOpen ? "ml-64" : "ml-20"}
        `}
      >
        {/* Navbar ثابت فوق */}
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <NavBar />
        </div>

        {/* Pages */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#F6F7F9]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
