import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../../assets/Logo.png";

import { TbMenuOrder } from "react-icons/tb";
import { RiLogoutCircleLine } from "react-icons/ri";
import { MdMenuOpen } from "react-icons/md";

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();

  const menu = [
    { label: "Pharmacies", icon: <TbMenuOrder size={22} />, path: "/superadmin/pharmacies" },
  ];

  return (
    <aside
      className={`h-screen bg-secondary text-white transition-all duration-300 overflow-hidden ${
        open ? "w-64" : "w-20"
      }`}
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

        <MdMenuOpen
          size={32}
          className={`cursor-pointer transition-transform duration-300 ${
            !open ? "rotate-180" : ""
          }`}
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* Menu */}
      <ul className="p-3 space-y-1">
        {menu.map((item) => {
          const active = location.pathname.startsWith(item.path);

          return (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all
                ${active ? "bg-white text-black shadow" : "hover:bg-white/20"}
                ${!open ? "justify-center" : ""}
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
          className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/20 transition-all ${
            !open ? "justify-center" : ""
          }`}
        >
          <RiLogoutCircleLine size={22} />
          {open && <span>Logout</span>}
        </Link>
      </div>
    </aside>
  );
}