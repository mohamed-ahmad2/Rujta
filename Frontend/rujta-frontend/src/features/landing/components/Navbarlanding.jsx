import React from "react";
import Logo from "../../../assets/Logo2.png";
import { NavbarMenu } from "../../../mockData/data";
import { MdMenu, MdClose } from "react-icons/md";
import { useNavigate, Link } from "react-router-dom";

import ResponsiveMenulanding from "./ResponsiveMenulanding";

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const authButtonClass =
    "rounded-md border-2 border-secondary px-6 py-2 font-semibold text-secondary transition duration-200 hover:bg-secondary hover:text-white";
  return (
    <>
      <nav className="bg-page">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-0 md:py-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={Logo}
              alt="Logo"
              className="h-12 w-12 object-contain sm:h-16 sm:w-16"
            />
            <p className="text-2xl font-extrabold text-secondary sm:text-3xl">
              Rujta
            </p>
          </Link>

          {/* Desktop Menu */}
          <div className="ml-10 hidden items-center gap-6 lg:flex">
            {NavbarMenu.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="px-3 py-1 font-semibold duration-200 hover:text-secondary"
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Desktop Login/Signup */}
          <div className="hidden items-center gap-4 lg:flex">
            <button
              onClick={() => navigate("/auth?mode=login")}
              className={authButtonClass}
            >
              Login
            </button>

            <button
              onClick={() => navigate("/auth?mode=signup")}
              className={authButtonClass}
            >
              SignUp
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="lg:hidden">
            <MdMenu
              className="cursor-pointer text-4xl"
              onClick={() => setOpen(!open)}
            />
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <ResponsiveMenulanding open={open} setOpen={setOpen} />
    </>
  );
};

export default Navbar;
