import React from 'react';
import Logo from "../../assets/Logo.png";
import { NavbarMenu } from '../../mockData/data'
import { FaDumbbell, FaHamburger } from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { PiShoppingCartThin } from "react-icons/pi";
import ResponsiveMenu from "./ResponsiveMenu";

const Navbar = () => {
    const [open,setOpen] = React.useState(false);
  return (
     <> 
        <nav >
            <div className="container flex justify-between items-center py-8">
                {/* Logo section */}
                <div className="flex items-center gap-2 ">
            <img 
              src={Logo} 
              alt="Logo" 
              className="w-16 h-16 object-contain" // ممكن تعدلي المقاسات
            />
            <p className="text-secondary text-2xl">Rujta</p>
          </div>
                {/* Menu section */}
                <div className="hidden md:block">
                    <ul className="flex items-center gap-6 text-gray-600">
                        { NavbarMenu.map((item)=>{
                                return(
                                    <li key={item.id}>
                                        <a href={item.link} className="inline-block py-1 px-3 hover:text-secondary font-semibold">{item.title}</a>
                                    </li>
                                )

                            })
                        }
                    </ul>
                </div>
                {/* Icon section */}
                <div className='flex item-conter gap-4'>
                    <button className="text-2xl hover:bg-secondary hover:text-white rounded-full p-2 duration-200">
                        <CiSearch />
                    </button>

                    <button className="text-2xl hover:bg-secondary hover:text-white rounded-full p-2 duration-200">
                        <PiShoppingCartThin />
                    </button>
                    <button className='hover:bg-secondary text-secondary font-semibold hover:text-white rounded-md border-2 border-secondary px-6 py-2 duration-200 hidden md:block'>Login</button>
                    <button className='hover:bg-secondary text-secondary font-semibold hover:text-white rounded-md border-2 border-secondary px-6 py-2 duration-200 hidden md:block'>SignUp</button>
                </div>

                {/* Mobil hamurger Menu section */}
                   
                <div className="md:hiddn" onClick={()=>
                    setOpen(!open)}>
                    <MdMenu className='text-4xl'/>
                </div> 
                

            </div>
        </nav>

         {/* Mobil Sidebar section */}
         
         <ResponsiveMenu open={open}/>
          
            
                     
     </>
    
  );
};

export default Navbar;