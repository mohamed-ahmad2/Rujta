// features/dashboard/components/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../../assets/Logo.png";
import { RiLogoutCircleLine } from "react-icons/ri";

// Icons
import { IoHomeOutline } from "react-icons/io5";
import { MdInventory, MdMenuOpen } from "react-icons/md";
import { TbMenuOrder, TbReportSearch } from "react-icons/tb";
import { IoLogoBuffer } from "react-icons/io";
import { CiSettings } from "react-icons/ci";

export default function Sidebar({ open, setOpen }) {
  const [expanded, setExpanded] = useState(null);
  const location = useLocation();

  const menuItems = [
    { label: "Overview", icon: <IoHomeOutline size={22} />, path: "/dashboard/home" },
    { label: "Products", icon: <MdInventory size={22} />, path: "/dashboard/products" },
    { label: "Orders", icon: <TbMenuOrder size={22} />, path: "/dashboard/orders" },
    { label: "Sales", icon: <TbReportSearch size={22} />, path: "/dashboard/sales" },
    { label: "Customers", icon: <IoLogoBuffer size={22} />, path: "/dashboard/customers" },
    { label: "Settings", icon: <CiSettings size={22} />, path: "/dashboard/settings" },
  ];

  return (
    <aside
      className={`
        h-screen bg-secondary text-white
        transition-all duration-300 overflow-hidden
        ${open ? "w-64" : "w-20"}
      `}
    >
      {/* Header */}
      <div className="px-3 py-2 h-20 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={logo}
            alt="Logo"
            className={`rounded-md transition-all duration-300 ${
              open ? "w-10" : "w-0"
            }`}
          />
          {open && <h1 className="text-xl font-bold">Rujta</h1>}
        </div>

        {/* Toggle */}
        <MdMenuOpen
          size={32}
          className={`cursor-pointer transition-transform duration-300 ${
            !open && "rotate-180"
          }`}
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* Menu */}
      <ul className="p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-all
                  ${isActive ? "bg-white text-black shadow" : "hover:bg-white/20"}
                  ${!open && "justify-center"}
                `}
              >
                {item.icon}
                {open && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout */}
      <div className="absolute bottom-4 left-0 w-full px-3">
        <Link
          to="/logout"
          className={`
            flex items-center gap-3 p-3 rounded-xl hover:bg-white/20 transition-all
            ${!open && "justify-center"}
          `}
        >
          <RiLogoutCircleLine size={22} />
          {open && <span>Logout</span>}
        </Link>
      </div>
    </aside>
  );
}
