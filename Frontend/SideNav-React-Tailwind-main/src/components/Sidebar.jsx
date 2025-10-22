import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../logo.png';

// icons
import { MdInventory, MdMenuOpen } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { FaProductHunt, FaUserCircle } from "react-icons/fa";
import { TbMenuOrder, TbReportSearch } from "react-icons/tb";
import { IoLogoBuffer } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { IoIosArrowDown } from "react-icons/io";

const menuItems = [
  { icons: <IoHomeOutline size={30} />, label: 'Home', path: '/' },
  {
    icons: <MdInventory size={30} />,
    label: 'Products',
    subItems: [
  { label: 'Add Product', path: '/add' },
  { label: 'View Products', path: '/view' }
]

  },
  
 
    { icons: <TbMenuOrder size={30} />, label: 'Orders', path: '/Orders' },
  { icons: <TbReportSearch size={30} />, label: 'Report', path: '/report' },
  { icons: <IoLogoBuffer size={30} />, label: 'Log', path: '/log' },
   { icons: <CiSettings size={30} />, label: 'Setting', path: '/settings' },

];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(null); // which dropdown is open
  const location = useLocation();

  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
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
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;

          // If the item has subItems
          if (item.subItems) {
            return (
              <li key={index}>
                <div
                  className={`px-3 py-2 my-2 rounded-md duration-300 cursor-pointer flex justify-between items-center relative group
                    ${expanded === index ? 'bg-[#96C66C] text-black' : 'hover:bg-[#96C66C] hover:text-black'}`}
                  onClick={() => toggleExpand(index)}
                >
                  <div className='flex items-center gap-2'>
                    {item.icons}
                    <p className={`${!open && 'w-0 translate-x-24'} duration-500 overflow-hidden`}>
                      {item.label}
                    </p>
                  </div>
                  {open && <IoIosArrowDown className={`duration-300 ${expanded === index ? 'rotate-180' : ''}`} />}
                </div>

                {/* Submenu */}
                {expanded === index && (
                  <ul className={`ml-10 mt-1 overflow-hidden transition-all duration-300 ${open ? 'block' : 'hidden'}`}>
                    {item.subItems.map((sub, subIndex) => (
                      <Link to={sub.path} key={subIndex}>
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
            <Link to={item.path} key={index}>
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
