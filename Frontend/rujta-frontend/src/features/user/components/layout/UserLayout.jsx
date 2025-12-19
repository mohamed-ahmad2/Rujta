import React from "react";
import { Outlet } from "react-router-dom";
import NavbarUser from "../../components/Navbar";
import FooterUser from "../../components/Footer";
import CartDrawerUser from "../../components/CartDrawer";

const UserLayout = ({ cart, setCart, isCartOpen, setIsCartOpen }) => {
  return (
    <div className="min-h-screen flex flex-col bg-page">

      {/* Navbar ثابتة */}
      <div className="sticky top-0 z-50">
        <NavbarUser
          cart={cart}
          onCartClick={() => setIsCartOpen(true)}
        />
      </div>

      {/* محتوى الصفحة */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <FooterUser />

      {/* Cart Drawer */}
      <CartDrawerUser
        cart={cart}
        setCart={setCart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
};

export default UserLayout;
