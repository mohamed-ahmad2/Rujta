import React, { useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { FaCartShopping } from "react-icons/fa6";
import { LuLogOut } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";
import { BsBoxSeam } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useSearchMedicines } from "../../medicines/hook/useSearchMedicines";

const Navbar = ({ cart,setCart, onCartClick }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { handleLogout } = useAuth();

  const {
    results: searchResults,
    loading,
    chooseResult,
    resetSelected,
  } = useSearchMedicines(query, 10);

  const logoutAndRedirect = async () => {
    await handleLogout();
    
    navigate("/user");
  };

  return (
    // ⭐⭐ Sticky Navbar ⭐⭐
    <div className="sticky top-0 z-50 shadow-md bg-white text-gray-800">
      <div className="py-3">
   <div className="container mx-auto px-6 flex flex-wrap md:flex-nowrap justify-between items-center relative">
  {/* Logo */}
<div
  onClick={() => navigate("/user")}
  className="cursor-pointer font-extrabold text-2xl text-secondary sm:text-3xl"
>
  Rujta
</div>


  {/* Search Bar */}
  <div className="flex-1 mx-4 min-w-[200px] max-w-[800px]">
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search medicines..."
        className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          resetSelected();
        }}
      />
      <IoMdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />

      {/* Search Results */}
      {searchResults.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto z-50">
          {searchResults.map((med) => (
            <li
              key={med.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                chooseResult(med.name);
                navigate(`/medicines/${med.id}`);
                setQuery("");
              }}
            >
              {med.name}
            </li>
          ))}
        </ul>
      )}

      {loading && (
        <div className="absolute top-full left-0 right-0 bg-white px-4 py-2 border mt-1 text-sm">
          Loading...
        </div>
      )}
    </div>
  </div>

  {/* Right Icons */}
  <div className="flex items-center gap-4 md:gap-6 mt-2 md:mt-0">
    {/* Cart */}
    <div className="relative cursor-pointer" onClick={onCartClick}>
      <FaCartShopping className="text-2xl text-secondary" />
      {cart.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {cart.length}
        </span>
      )}
    </div>

    {/* Orders */}
    <BsBoxSeam
      className="text-2xl text-gray-600 cursor-pointer hover:text-secondary"
      onClick={() => navigate("/user/orders")}
    />

    {/* Profile */}
    <CgProfile
      className="text-3xl text-gray-600 cursor-pointer hover:text-secondary"
      onClick={() => navigate("/user/profile")}
    />

    {/* Logout */}
    <LuLogOut
      className="text-2xl text-gray-600 cursor-pointer hover:text-red-600"
      onClick={logoutAndRedirect}
    />
  </div>
</div>

      </div>
    </div>
  );
};

export default Navbar;
