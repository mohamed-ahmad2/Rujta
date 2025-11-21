import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../shared/components/ProtectedRoute";

import NavbarLanding from "../features/landing/components/Navbarlanding";
import HeroLanding from "../features/landing/pages/Herolanding";

import NavbarUser from "../features/user/components/Navbar";
import HeroUser from "../features/user/pages/Hero";
import ProductsUser from "../features/user/components/Products";
import FooterUser from "../features/user/components/Footer";
import CartDrawerUser from "../features/user/components/CartDrawer";

import Sidebar from "../features/dashboard/components/Sidebar";
import Home from "../features/dashboard/pages/Home";
import Add from "../features/dashboard/pages/add";
import View from "../features/dashboard/pages/view";
import Orders from "../features/dashboard/pages/Orders";
import Settings from "../features/dashboard/pages/Settings";
import Log from "../features/dashboard/pages/Log";
import Report from "../features/dashboard/pages/Report";

import AuthPage from "../features/auth/pages/AuthPage";

const DashboardLayout = () => (
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

const AppRoutes = ({ cart, setCart, isCartOpen, setIsCartOpen }) => (
  <Routes>
    {/* Landing Page */}
    <Route
      path="/"
      element={
        <div className="overflow-x-hidden bg-page min-h-screen">
          <NavbarLanding />
          <HeroLanding />
        </div>
      }
    />

    {/* Protected User Page */}
    <Route
      path="/user"
      element={
        <ProtectedRoute>
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
        </ProtectedRoute>
      }
    />

    {/* Auth Page */}
    <Route
      path="/auth"
      element={
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <AuthPage />
        </div>
      }
    />

    {/* Protected Admin Dashboard */}
    <Route
      path="/dashboard/*"
      element={
        <ProtectedRoute role="Admin">
          <DashboardLayout />
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
