import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from './logo.png';

// icons
import { MdInventory, MdMenuOpen } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";

import { TbMenuOrder, TbReportSearch } from "react-icons/tb";
import { IoLogoBuffer } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { FaUserCircle } from "react-icons/fa";

const menuItems = [
  { icons: <IoHomeOutline size={30} />, label: 'Home', path: '/dashboard/home' },
  {
    icons: <MdInventory size={30} />,
    label: 'Products',
    path: '/dashboard/products',
    subItems: [
      { label: 'Add Product', path: '/dashboard/add' },
      { label: 'View Products', path: '/dashboard/view' }
    ]
  },
  { icons: <TbMenuOrder size={30} />, label: 'Orders', path: '/dashboard/orders' },
  { icons: <TbReportSearch size={30} />, label: 'Report', path: '/dashboard/report' },
  { icons: <IoLogoBuffer size={30} />, label: 'Log', path: '/dashboard/log' },
  { icons: <CiSettings size={30} />, label: 'Settings', path: '/dashboard/settings' },
];


export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(null); // which dropdown is open
  const location = useLocation();

  const toggleExpand = (path) => {
    setExpanded(expanded === path ? null : path);
  };

  return (
    <nav className={`shadow-md h-screen p-2 flex flex-col duration-500 bg-black text-white ${open ? 'w-60' : 'w-16'}`}>
      {/* Header */}
      <div className='px-3 py-2 h-20 flex justify-between items-center'>
        <img src={logo} alt="Logo" className={`${open ? 'w-10' : 'w-0'} rounded-md`} />
        <MdMenuOpen
          size={34}
          className={`duration-500 cursor-pointer ${!open && 'rotate-180'}`}
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* Menu */}
      <ul className='flex-1'>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          if (item.subItems) {
            return (
              <li key={item.path}>
                <button
                  className={`px-3 py-2 my-2 rounded-md duration-300 cursor-pointer flex justify-between items-center w-full
                    ${expanded === item.path ? 'bg-[#96C66C] text-black' : 'hover:bg-[#96C66C] hover:text-black'}`}
                  onClick={() => toggleExpand(item.path)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(item.path); }}
                  aria-expanded={expanded === item.path}
                >
                  <div className='flex items-center gap-2'>
                    {item.icons}
                    <p className={`${!open && 'w-0 translate-x-24'} duration-500 overflow-hidden`}>
                      {item.label}
                    </p>
                  </div>
                  {open && <IoIosArrowDown className={`duration-300 ${expanded === item.path ? 'rotate-180' : ''}`} />}
                </button>

                {/* Submenu */}
                {expanded === item.path && (
                  <ul className={`ml-10 mt-1 overflow-hidden transition-all duration-300 ${open ? 'block' : 'hidden'}`}>
                    {item.subItems.map((sub) => (
                      <Link to={sub.path} key={sub.path}>
                        <li
                          className={`px-2 py-1 rounded-md my-1 text-sm cursor-pointer duration-200 
                            ${location.pathname === sub.path
                              ? 'bg-[#96C66C] text-black'
                              : 'hover:bg-[#96C66C] hover:text-black'
                            }`}
                        >
                          {sub.label}
                        </li>
                      </Link>
                    ))}
                  </ul>
                )}
              </li>
            );
          }

          // Normal item (no submenu)
          return (
            <Link to={item.path} key={item.path}>
              <li
                className={`px-3 py-2 my-2 rounded-md duration-300 cursor-pointer flex gap-2 items-center relative group
                ${isActive ? 'bg-[#96C66C] text-black' : 'hover:bg-[#96C66C] hover:text-black'}`}
              >
                <div>{item.icons}</div>
                <p className={`${!open && 'w-0 translate-x-24'} duration-500 overflow-hidden`}>
                  {item.label}
                </p>
              </li>
            </Link>
          );
        })}
      </ul>

      {/* Footer */}
      <div className='flex items-center gap-2 px-3 py-2'>
        <FaUserCircle size={30} />
        <div className={`leading-5 ${!open && 'w-0 translate-x-24'} duration-500 overflow-hidden`}>
          <p>Loki</p>
          <span className='text-xs'>Loki</span>
        </div>
      </div>
    </nav>
  )
}
