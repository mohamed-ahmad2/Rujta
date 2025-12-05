import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar"; 

export default function DashboardLayout() {
  return (
    <div className="w-full h-screen flex overflow-hidden bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow h-full">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}
