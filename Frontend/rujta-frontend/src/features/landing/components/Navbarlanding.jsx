import React from "react";
import Logo from "../../../assets/Logo2.png";
import { NavbarMenu } from "../../../mockData/data";
import { MdMenu, MdClose } from "react-icons/md";
import { useNavigate, Link } from "react-router-dom";

const ResponsiveMenulanding = ({ open, setOpen }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-page z-50 transform transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Close Button */}
      <div className="flex justify-end p-6">
        <MdClose
          className="text-4xl cursor-pointer"
          onClick={() => setOpen(false)}
        />
      </div>

      {/* Menu Items */}
      <ul className="flex flex-col items-center justify-center gap-8 mt-10 text-2xl">
        {NavbarMenu.map((item) => (
          <li key={item.id} onClick={() => setOpen(false)}>
            <Link to={item.link}>{item.title}</Link>
          </li>
        ))}

        {/* Login & Signup Buttons */}
        <div className="flex flex-col gap-4 mt-8">
          <button
            onClick={() => { navigate("/auth"); setOpen(false); }}
            className="hover:bg-secondary text-secondary font-semibold hover:text-white rounded-md border-2 border-secondary px-6 py-2 duration-200"
          >
            Login
          </button>

          <button
            onClick={() => { navigate("/auth"); setOpen(false); }}
            className="hover:bg-secondary text-secondary font-semibold hover:text-white rounded-md border-2 border-secondary px-6 py-2 duration-200"
          >
            SignUp
          </button>
        </div>
      </ul>
    </div>
  );
};

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="bg-page">
        <div className="container mx-auto flex justify-between items-center py-4 md:py-8 px-4 md:px-0">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
            <p className="font-extrabold text-2xl sm:text-3xl text-secondary">Rujta</p>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 ml-10">
            {NavbarMenu.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="py-1 px-3 hover:text-secondary font-semibold duration-200"
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Desktop Login/Signup */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="hover:bg-secondary text-secondary font-semibold hover:text-white rounded-md border-2 border-secondary px-6 py-2 duration-200"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="hover:bg-secondary text-secondary font-semibold hover:text-white rounded-md border-2 border-secondary px-6 py-2 duration-200"
            >
              SignUp
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <MdMenu
              className="text-4xl cursor-pointer"
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