import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../../assets/Logo.png";
import { RiLogoutCircleLine } from "react-icons/ri";
import { MdMenuOpen, MdAttachMoney } from "react-icons/md";
import { TbMenuOrder } from "react-icons/tb";
import { useAuth } from "../../auth/hooks/useAuth";
import { AiOutlineClockCircle } from "react-icons/ai";
import { MdOutlinePendingActions } from "react-icons/md";
export default function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const { loading, handleLogout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <aside
        className={`h-screen bg-secondary text-white transition-all duration-300 ${
          open ? "w-64" : "w-20"
        }`}
      >
        <div className="h-20 flex justify-center items-center">
          Loading...
        </div>
      </aside>
    );
  }

  const menu = [
    {
      label: "Pharmacies",
      icon: <TbMenuOrder size={22} />,
      path: "/superadmin/pharmacies",
    },
    {
      label: "Service Pricing",
      icon: <MdAttachMoney size={22} />,
      path: "/superadmin/service-pricing",
    },
    {
      label: "Approval Queue",
      icon: <MdOutlinePendingActions size={22} />,
      path: "/superadmin/ApprovalQueue",
    },
  ];

  const onLogout = async () => {
    await handleLogout();
    navigate("/auth");
  };

  return (
    <>
      {/* ✅ Overlay (موبايل فقط) */}
      <div
        className={`fixed inset-0 z-20 bg-black/40 transition-opacity duration-300 md:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed z-30 h-screen bg-secondary text-white transition-all duration-300 overflow-hidden
        md:sticky md:top-0
        ${open ? "w-64" : "w-0 md:w-20"}`}
      >
        {/* Header */}
        <div className="px-3 py-2 h-20 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={logo}
              alt="Logo"
              className="w-10 rounded-md"
            />
            <h1
              className={`text-xl font-bold transition-all duration-300 ${
                open ? "opacity-100" : "opacity-0 w-0"
              }`}
            >
              Rujta
            </h1>
          </div>

          {/* Toggle (desktop فقط) */}
          <MdMenuOpen
            size={28}
            className={`hidden md:block cursor-pointer transition-transform duration-300 ${
              !open ? "rotate-180" : ""
            }`}
            onClick={() => setOpen(!open)}
          />
        </div>

        {/* Menu */}
        <ul className="p-3 space-y-1">
          {menu.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all
                  ${
                    isActive
                      ? "bg-white text-black shadow"
                      : "hover:bg-white/20"
                  }
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
          <button
            onClick={onLogout}
            className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/20 transition-all w-full ${
              !open ? "justify-center" : ""
            }`}
          >
            <RiLogoutCircleLine size={22} />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}