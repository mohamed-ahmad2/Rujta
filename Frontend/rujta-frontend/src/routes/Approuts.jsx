import React from "react";
import { Navigate } from "react-router-dom";

import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../shared/components/ProtectedRoute";

import NavbarLanding from "../features/landing/components/Navbarlanding";
import HeroLanding from "../features/landing/pages/Herolanding";

import NavbarUser from "../features/user/components/Navbar";
import HeroUser from "../features/user/pages/Hero";

import Profile from "../features/user/pages/Profile";

import ProductsUser from "../features/user/components/Products";
import FooterUser from "../features/user/components/Footer";
import CartDrawerUser from "../features/user/components/CartDrawer";
import Sidebar from "../features/dashboard/components/Sidebar";
import NavbarDashbord from "../features/dashboard/components/NavbarDashbord";

import Home from "../features/dashboard/pages/Home";
import Products from "../features/dashboard/pages/Products";
import Orders from "../features/dashboard/pages/Orders";
import Settings from "../features/dashboard/pages/Settings";
import Customers from "../features/dashboard/pages/Customers";
import Sales from "../features/dashboard/pages/Sales";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import MedicineDetails from "../features/medicines/pages/MedicineDetails";

import AuthPage from "../features/auth/pages/AuthPage";

const DashboardLayout = () => (
  <div className="flex min-h-screen bg-[#F6F7F9]">
    <Sidebar />

    {/* Main Section */}
    <div className="flex-1 flex flex-col">

      {/* Navbar */}
      <div className="shrink-0 bg-white shadow-sm">
        <NavbarDashbord />
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#F6F7F9]">
        <Routes>
          <Route path="home" element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="settings" element={<Settings />} />
          <Route path="customers" element={<Customers />} />
          <Route path="sales" element={<Sales />} />
        </Routes>
      </div>

    </div>
  </div>
);

<Route path="/reset-password" element={<ResetPasswordPage />} />

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
<Route
  path="/reset-password"
  element={
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <ResetPasswordPage />
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
<Route path="/medicines/:id" element={<MedicineDetails />} />

    <Route
  path="/user/profile"
  element={
    <ProtectedRoute>
      <div className="overflow-x-hidden bg-page min-h-screen">
        <NavbarUser cart={cart} onCartClick={() => setIsCartOpen(true)} />
        <Profile />
        <FooterUser />
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
<Route
  path="/medicine/:id"
  element={
    <ProtectedRoute>
      <div className="overflow-x-hidden bg-page min-h-screen">
        <NavbarUser cart={cart} onCartClick={() => setIsCartOpen(true)} />

        <MedicineDetails cart={cart} setCart={setCart} />

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

    {/* Protected Admin Dashboard */}
    <Route
      path="/dashboard/*"
      element={
        <ProtectedRoute role="Pharmacist">
          <DashboardLayout />
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
