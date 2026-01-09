import React from "react";
import Logo from "../../../assets/Logo2.png";
import { NavbarMenu } from "../../../mockData/data";
import { CiSearch } from "react-icons/ci";
import { PiShoppingCartThin } from "react-icons/pi";
import { MdMenu } from "react-icons/md";
import ResponsiveMenulanding from "./ResponsiveMenulanding.jsx";
import { useNavigate, Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav>
        <div className="container flex justify-between items-center py-8 bg-page">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={Logo}
              alt="Logo"
              className="w-16 h-16 object-contain"
            />
            <p className="font-extrabold text-2xl text-secondary sm:text-3xl">
              Rujta
            </p>
          </Link>

          {/* Menu */}
          <div
            className=" rounded-md border-2 hidden md:block"
            style={{ marginLeft: "70px" }}
          >
            <ul className="flex items-center gap-6 ">
              {NavbarMenu.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.link}
                    className="inline-block py-1 px-3 hover:text-secondary font-semibold duration-200"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
           

            <button
              onClick={() => navigate("/auth")}
              className="hover:bg-secondary text-secondary font-semibold hover:text-white rounded-md border-2 border-secondary px-6 py-2 duration-200 hidden md:block"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/auth")}
              className="hover:bg-secondary text-secondary font-semibold hover:text-white rounded-md border-2 border-secondary px-6 py-2 duration-200 hidden md:block"
            >
              SignUp
            </button>
          </div>

          {/* Mobile menu icon */}
          <div className="md:hidden" onClick={() => setOpen(!open)}>
            <MdMenu className="text-4xl" />
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <ResponsiveMenulanding open={open} setOpen={setOpen} />

    </>
  );
};

export default Navbar;
