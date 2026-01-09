// routes/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../shared/components/ProtectedRoute";

/* ================= Landing ================= */
import NavbarLanding from "../features/landing/components/Navbarlanding";
import HeroLanding from "../features/landing/pages/Herolanding";
import Features from "../features/landing/pages/Features";
import HowItWorks from "../features/landing/pages/HowItWorks";
import Contact from "../features/landing/pages/Contact";

/* ================= Auth ================= */
import AuthPage from "../features/auth/pages/AuthPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";

/* ================= User ================= */
import UserLayout from "../features/user/components/layout/UserLayout";
import HeroUser from "../features/user/pages/Hero";
import ProductsUser from "../features/user/components/Products";
import Profile from "../features/user/pages/Profile";
import Ordersuser from "../features/user/pages/Orders";
import Checkout from "../features/user/pages/Checkout";

/* ================= Medicines ================= */
import MedicineDetails from "../features/medicines/pages/MedicineDetails";

/* ================= Dashboard ================= */
import DashboardLayout from "../features/dashboard/components/layouts/DashboardLayout";
import Home from "../features/dashboard/pages/Home";
import Products from "../features/dashboard/pages/Products";
import Orders from "../features/dashboard/pages/Orders";
import Settings from "../features/dashboard/pages/Settings";
import Customers from "../features/dashboard/pages/Customers";
import Sales from "../features/dashboard/pages/Sales";
import Logs from "../features/dashboard/pages/Logs";


import NotificationsPage from "../features/notifications/pages/NotificationsPage";

// ...

<Route
  path="/dashboard/logs"
  element={
    <ProtectedRoute>
      <Logs />
    </ProtectedRoute>
  }
/>

const AppRoutes = ({ cart, setCart, isCartOpen, setIsCartOpen }) => (
  <Routes>

    {/* ========= Landing ========= */}
    <Route
      path="/"
      element={
        <>
          <NavbarLanding />
          <HeroLanding />
        </>
      }
    />
    <Route path="/features" element={<><NavbarLanding /><Features /></>} />
    <Route path="/how-it-works" element={<><NavbarLanding /><HowItWorks /></>} />
    <Route path="/contact" element={<><NavbarLanding /><Contact /></>} />

    {/* ========= Auth ========= */}
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />

    {/* ========= User ========= */}
    <Route
      path="/user"
      element={
        <ProtectedRoute>
          <UserLayout
            cart={cart}
            setCart={setCart}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
          />
        </ProtectedRoute>
      }
    >
      <Route
        index
        element={
          <>
            <HeroUser />
            <ProductsUser cart={cart} setCart={setCart} />
          </>
        }
      />
      <Route path="orders" element={<Ordersuser />} />
      <Route path="profile" element={<Profile />} />
      <Route path="checkout" element={<Checkout />} />

      <Route path="notifications" element={<NotificationsPage />} />
    </Route>

    {/* ========= Medicine ========= */}
 <Route
  path="/medicines/:id"
  element={<MedicineDetails cart={cart} setCart={setCart} />}
/>



    {/* ========= Dashboard ========= */}
    <Route
      path="/dashboard"
      element={
     <ProtectedRoute roles={["Pharmacist", "PharmacyAdmin"]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Home />} />
      <Route path="home" element={<Home />} />
      <Route path="products" element={<Products />} />
      <Route path="orders" element={<Orders />} />
      <Route path="sales" element={<Sales />} />
      <Route path="customers" element={<Customers />} />
      <Route path="settings" element={<Settings />} />
      {/* Logs page restricted to PharmacyAdmin only */}
          <Route
            path="logs"
            element={
              <ProtectedRoute roles={["PharmacyAdmin"]}>
                <Logs />
              </ProtectedRoute>
            }
          />
    </Route>

  </Routes>
);

export default AppRoutes;
