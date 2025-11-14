import React from 'react';
import Logo from "../../../assets/Logo.png";
import { NavbarMenu } from '../../../mockData/data'
import { CiSearch } from "react-icons/ci";
import { PiShoppingCartThin } from "react-icons/pi";
import { MdMenu } from "react-icons/md";
import ResponsiveMenulanding from "./ResponsiveMenulanding.jsx";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [open,setOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <> 
      <nav >
        <div className="container flex justify-between items-center py-8">
          {/* Logo section */}
          <div className="flex items-center gap-2 ">
            <img 
              src={Logo} 
              alt="Logo" 
              className="w-16 h-16 object-contain"
            />
            <p className="font-extrabold text-2xl text-secondary sm:text-3xl flex gap-2">Rujta</p>
            

          </div>

          {/* Menu section */}
          <div className="bg-white hover:text-white rounded-md border-2 hidden md:block" style={{ marginLeft: "70px" }}>

            <ul className="flex items-center gap-6 text-gray-600">
              {NavbarMenu.map((item) => (
                <li key={item.id}>
                  <a href={item.link} className="inline-block py-1 px-3 hover:text-secondary font-semibold">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Icon section */}
          <div className='flex items-center gap-4'>
            <button className="text-2xl hover:bg-secondary hover:text-white rounded-full p-2 duration-200">
              <CiSearch />
            </button>

            <button className="text-2xl hover:bg-secondary hover:text-white rounded-full p-2 duration-200">
              <PiShoppingCartThin />
            </button>

            <button
              onClick={() => navigate("/auth")}
            className='hover:bg-secondary text-secondary font-semibold hover:text-white rounded-md border-2 border-secondary px-6 py-2 duration-200 hidden md:block'>
              Login
            </button>

            <button  onClick={() => navigate("/auth")}
            className='hover:bg-secondary text-secondary font-semibold hover:text-white rounded-md border-2 border-secondary px-6 py-2 duration-200 hidden md:block'>
              SignUp
            </button>
          </div>

        {/* Mobile hamburger Menu section */}
          <div className="" onClick={() => setOpen(!open)}>
            <MdMenu className="text-4xl " />
          </div>

        </div>

      </nav>

      {/* Mobile Sidebar section */}
      <ResponsiveMenulanding open={open}/>
    </>
  );
};

export default Navbar;
