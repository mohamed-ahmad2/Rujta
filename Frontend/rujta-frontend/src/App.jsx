import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom"; // ✅ بدون BrowserRouter أو Router

// 🏠 Landing Page
import NavbarLanding from "./components/Navbarlanding/Navbarlanding";
import HeroLanding from "./components/Herolanding/Herolanding";

// 👤 User Page
import NavbarUser from "./components/Navbar/Navbar";
import HeroUser from "./components/Hero/Hero";
import ProductsUser from "./components/Products/Products";
import FooterUser from "./components/Footer/Footer";
import CartDrawerUser from "./components/CartDrawer/CartDrawer";

// 🧭 Dashboard
import Sidebar from "./Sidebar";

// 📄 Pages
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Add from "./pages/add";
import View from "./pages/view";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Log from "./pages/Log";
import Report from "./pages/Report";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6">
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="add" element={<Add />} />
          <Route path="view" element={<View />} />
          <Route path="orders" element={<Orders />} />
          <Route path="settings" element={<Settings />} />
          <Route path="log" element={<Log />} />
          <Route path="report" element={<Report />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <Routes>
      {/* 🌍 Landing Page */}
      <Route
        path="/"
        element={
          <div className="overflow-x-hidden bg-page min-h-screen">
            <NavbarLanding />
            <HeroLanding />
          </div>
        }
      />

      {/* 👤 User Shopping Page */}
      <Route
        path="/user"
        element={
          <div className="overflow-x-hidden bg-page min-h-screen">
            <NavbarUser cart={cart} onCartClick={() => setIsCartOpen(true)} />
            <HeroUser />
            <ProductsUser cart={cart} setCart={setCart} />
            <FooterUser />
            <CartDrawerUser
              cart={cart}
              setCart={setCart}
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
            />
          </div>
        }
      />

      {/* 🔐 Auth Page */}
      <Route
        path="/auth"
        element={
          <div className="flex items-center justify-center h-screen bg-gray-100">
            <AuthPage />
          </div>
        }
      />

      {/* 🧾 Dashboard */}
      <Route path="/dashboard/*" element={<DashboardLayout />} />
    </Routes>
  );
};

export default App;
