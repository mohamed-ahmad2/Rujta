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
import { IoIosArrowDown } from "react-icons/io";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const location = useLocation();

  const toggleExpand = (path) => {
    setExpanded(expanded === path ? null : path);
  };

  const menuItems = [
    {
      label: "Overview",
      icon: <IoHomeOutline size={22} />,
      path: "/dashboard/home",
    },
    {
      label: "Products",
      icon: <MdInventory size={22} />,
      path: "/dashboard/products",

    },
    {
      label: "Orders",
      icon: <TbMenuOrder size={22} />,
      path: "/dashboard/orders",
    },
    {
      label: "Sales",
      icon: <TbReportSearch size={22} />,
      path: "/dashboard/sales",
    },
    {
      label: "Customers",
      icon: <IoLogoBuffer size={22} />,
      path: "/dashboard/customers",
    },
    {
      label: "Settings",
      icon: <CiSettings size={22} />,
      path: "/dashboard/settings",
    },
  ];

  return (
    <aside
      className={`h-screen bg-secondary text-white transition-all duration-300 
      ${open ? "w-64" : "w-20"} relative overflow-hidden`}
    >
      {/* Header */}
      <div className="px-3 py-2 h-20 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo"
            className={`${open ? "w-10" : "w-0"} rounded-md transition-all duration-500`}
          />
          {open && <h1 className="text-xl font-bold tracking-wide">Rujta</h1>}
        </div>

         <MdMenuOpen
            size={34}
            className={`duration-500 cursor-pointer ${!open && 'rotate-180'}`}
            onClick={() => setOpen(!open)}
          />
      </div>

      {/* Menu */}
      <ul className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          if (item.subItems) {
            return (
              <li key={item.label}>
                <button
                  onClick={() => toggleExpand(item.path)}
                  className={`flex items-center justify-between w-full p-3 rounded-xl
                  transition-all duration-300 group
                  ${
                    expanded === item.path
                      ? "bg-white text-black shadow"
                      : "hover:bg-white/20"
                  }
                  ${!open && "justify-center"}
                `}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {open && <span className="font-medium">{item.label}</span>}
                  </div>

                  {open && (
                    <IoIosArrowDown
                      className={`transition-transform duration-300 ${
                        expanded === item.path ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Submenu */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    expanded === item.path && open ? "max-h-40" : "max-h-0"
                  }`}
                >
                  <ul className="ml-10 mt-1 space-y-1">
                    {item.subItems.map((sub) => (
                      <Link to={sub.path} key={sub.path}>
                        <li
                          className={`p-2 rounded-md text-sm transition-all duration-300 
                          ${
                            location.pathname === sub.path
                              ? "bg-white text-black shadow"
                              : "hover:bg-white/20"
                          }`}
                        >
                          {sub.label}
                        </li>
                      </Link>
                    ))}
                  </ul>
                </div>
              </li>
            );
          }

          // Normal Items
          return (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                  ${
                    isActive
                      ? "bg-white text-black shadow-md"
                      : "hover:bg-white/20"
                  }
                  ${!open && "justify-center"}
                `}
              >
                {item.icon}
                {open && <span className="font-medium">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout */}
      <div className="absolute bottom-5 left-0 w-full px-4">
        <Link
          to="/logout"
          className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/20 transition-all
          ${!open && "justify-center"}
        `}
        >
          <RiLogoutCircleLine size={22} />
          {open && <span className="font-medium">Logout</span>}
        </Link>
      </div>
    </aside>
  );
}
