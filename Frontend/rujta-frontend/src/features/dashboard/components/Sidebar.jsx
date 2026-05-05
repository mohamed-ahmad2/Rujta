// src/features/dashboard/components/Sidebar.jsx
import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../../assets/Logo.png";
import { RiLogoutCircleLine } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import { IoHomeOutline } from "react-icons/io5";
import { MdInventory, MdMenuOpen } from "react-icons/md";
import { TbMenuOrder, TbReportSearch } from "react-icons/tb";
import { IoLogoBuffer } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { MdCampaign } from "react-icons/md";

import { MdAttachMoney } from "react-icons/md";


import { useAuth } from "../../auth/hooks/useAuth";

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const { user, loading, handleLogout } = useAuth();
  const navigate = useNavigate();

  // ✅ أغلق على الموبايل عند تغيير الصفحة
  useEffect(() => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  }, [location.pathname]);

  // ✅ افتح تلقائياً لو الشاشة كبرت
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      label: "Customers",
      icon: <IoLogoBuffer size={22} />,
      path: "/dashboard/customers",
    },
   
    {
      label: "Logs",
      icon: <FiUsers size={22} />,
      path: "/dashboard/logs",
      role: "PharmacyAdmin",
    },
    {
      label: "Ads",
      icon: <MdCampaign size={22} />,
      path: "/dashboard/ads",
      role: "PharmacyAdmin",
    },
   {
  label: "Subscription",
  icon: <CiSettings size={22} />,
  path: "/dashboard/subscription",
  role: "PharmacyAdmin",
},
{
  label: "Discounts",
  icon: <TbReportSearch size={22} />,
  path: "/dashboard/discounts",
  role: "PharmacyAdmin",
},
  ];

  const onLogout = async () => {
    await handleLogout();
    navigate("/auth");
  };

  return (
    <>
      {/* Overlay — يظهر على الموبايل لما الـ Sidebar مفتوحة */}
      <div
        className={`fixed inset-0 z-20 bg-black/40 transition-opacity duration-300 md:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      {/* ✅ md:sticky md:top-0 عشان يفضل ثابت عند الـ scroll على desktop */}
      <aside
        className={`fixed z-30 flex h-screen flex-shrink-0 flex-col overflow-hidden bg-secondary text-white transition-all duration-300 md:sticky md:top-0 ${
          open ? "w-64" : "w-0 md:w-20"
        }`}
      >
        {/* ===== Header: Logo + Toggle ===== */}
        <div className="sm:h-18 flex h-16 flex-shrink-0 items-center justify-between border-b border-white/10 px-3 py-2 md:h-20">
          {/* Logo + Name */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {/* ✅ اللوجو يفضل ظاهر دايماً */}
            <img
              src={logo}
              alt="Logo"
              className="w-8 flex-shrink-0 rounded-md sm:w-9 md:w-10"
            />
            {/* ✅ كلمة Rujta بس هي اللي بتختفي */}
            <h1
              className={`overflow-hidden whitespace-nowrap text-base font-bold transition-all duration-300 sm:text-lg md:text-xl ${
                open ? "w-auto opacity-100" : "w-0 opacity-0"
              }`}
            >
              Rujta
            </h1>
          </div>

          {/* ✅ Toggle — على الموبايل مخبي، على desktop ظاهر */}
          <MdMenuOpen
            size={24}
            className={`hidden flex-shrink-0 cursor-pointer transition-transform duration-300 md:block ${
              !open ? "rotate-180" : ""
            }`}
            onClick={() => setOpen(!open)}
          />
        </div>

        {/* ===== Menu Items ===== */}
        <ul className="flex-1 space-y-0.5 overflow-y-auto p-2 sm:space-y-1 sm:p-3">
          {menuItems
            .filter((item) => !item.role || item.role === user?.role)
            .map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl p-2.5 text-sm transition-all sm:p-3 sm:text-base ${
                      isActive
                        ? "bg-white text-black shadow"
                        : "hover:bg-white/20"
                    } ${!open ? "justify-center" : ""}`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {open && (
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
        </ul>

        {/* ===== Logout ===== */}
        <div className="flex-shrink-0 border-t border-white/10 p-2 sm:p-3">
          <button
            onClick={onLogout}
            className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-sm transition-all hover:bg-white/20 sm:p-3 sm:text-base ${
              !open ? "justify-center" : ""
            }`}
          >
            <RiLogoutCircleLine size={22} className="flex-shrink-0" />
            {open && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
