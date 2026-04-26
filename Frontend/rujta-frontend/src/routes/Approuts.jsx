import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import SmartRedirect from "../shared/components/SmartRedirect";

/* ================= Loading ================= */
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-page">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

/* ================= Error ================= */
const AnimatedErrorPage = lazy(
  () => import("../features/Error/AnimatedErrorPage"),
);

/* ================= Landing ================= */
const LandingLayout = lazy(() => import("../layouts/LandingLayout"));
const NavbarLanding = lazy(
  () => import("../features/landing/components/Navbarlanding"),
);
const Features = lazy(() => import("../features/landing/pages/Features"));
const HowItWorks = lazy(() => import("../features/landing/pages/HowItWorks"));
const Contact = lazy(() => import("../features/landing/pages/Contact"));

/* ================= Auth ================= */
const AuthPage = lazy(() => import("../features/auth/pages/AuthPage"));
const ResetPasswordPage = lazy(
  () => import("../features/auth/pages/ResetPasswordPage"),
);
const ChangePasswordPage = lazy(
  () => import("../features/auth/pages/ChangePasswordPage"),
);

/* ================= User ================= */
const UserLayout = lazy(
  () => import("../features/user/components/layout/UserLayout"),
);
const HeroUser = lazy(() => import("../features/user/pages/Hero"));
const ProductsUser = lazy(() => import("../features/user/components/Products"));
const Profile = lazy(() => import("../features/user/pages/Profile"));
const Ordersuser = lazy(() => import("../features/user/pages/Orders"));
const Checkout = lazy(() => import("../features/user/pages/Checkout"));
const PharmacyDetails = lazy(
  () => import("../features/user/pages/PharmacyDetails"),
);

const MedicineDetails = lazy(
  () => import("../features/medicines/pages/MedicineDetails"),
);
const ScanPrescription = lazy(
  () => import("../features/prescription/pages/ScanPrescription"),
);
const NotificationsPage = lazy(
  () => import("../features/notifications/pages/NotificationsPage"),
);

/* ================= Dashboard ================= */
const DashboardLayout = lazy(
  () => import("../features/dashboard/components/layouts/DashboardLayout"),
);
const Home = lazy(() => import("../features/dashboard/pages/Home"));
const Products = lazy(() => import("../features/dashboard/pages/Products"));
const Orders = lazy(() => import("../features/dashboard/pages/Orders"));
const Sales = lazy(() => import("../features/dashboard/pages/Sales"));
const Customers = lazy(() => import("../features/dashboard/pages/Customers"));
const Settings = lazy(() => import("../features/dashboard/pages/Settings"));
const Logs = lazy(() => import("../features/dashboard/pages/Logs"));
const Ads = lazy(() => import("../features/dashboard/pages/Ads"));
const Subscription = lazy(() => import("../features/dashboard/pages/Subscription"));
const Discounts = lazy(() => import("../features/dashboard/pages/Discounts"));
const AdminNotifications = lazy(() => import("../features/dashboard/notifications/pages/AdminNotificationsPage"));
/* ================= Super Admin ================= */
const DashboardLayoutSuberAdmin = lazy(
  () => import("../features/dashboardAdmin/components/layouts/DashboardLayout"),
);
const Overview = lazy(
  () => import("../features/dashboardAdmin/pages/Overview"),
);
const Pharmacies = lazy(
  () => import("../features/dashboardAdmin/pages/Pharmacies"),
);
const Reports = lazy(() => import("../features/dashboardAdmin/pages/Reports"));

const ServicePricing = lazy(() => import("../features/dashboardAdmin/pages/ServicePricing"));
const ApprovalQueue = lazy(() => import("../features/dashboardAdmin/pages/ApprovalQueue"));

/* ================================================== */

const AppRoutes = ({ cart, setCart, isCartOpen, setIsCartOpen }) => {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ================= Error ================= */}
        <Route path="/error" element={<AnimatedErrorPage />} />
        <Route path="*" element={<AnimatedErrorPage />} />

        {/* ================= Landing ================= */}
        <Route
          path="/"
          element={
            <SmartRedirect>
              <LandingLayout />
            </SmartRedirect>
          }
        />

        <Route
          path="/features"
          element={
            <div className="min-h-screen bg-page">
              <NavbarLanding />
              <Features />
            </div>
          }
        />

        <Route
          path="/how-it-works"
          element={
            <div className="min-h-screen bg-page">
              <NavbarLanding />
              <HowItWorks />
            </div>
          }
        />

        <Route
          path="/contact"
          element={
            <div className="min-h-screen bg-page">
              <NavbarLanding />
              <Contact />
            </div>
          }
        />

        {/* ================= Auth ================= */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* ================= User ================= */}
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
          <Route
            path="pharmacy/:id"
            element={<PharmacyDetails cart={cart} setCart={setCart} />}
          />
          <Route
            path="scan-prescription"
            element={<ScanPrescription cart={cart} setCart={setCart} />}
          />
          <Route
            path="medicine/:id"
            element={<MedicineDetails cart={cart} setCart={setCart} />}
          />
        </Route>

        {/* ================= Medicines (Public) ================= */}
        <Route
          path="/medicines/:id"
          element={<MedicineDetails cart={cart} setCart={setCart} />}
        />

        {/* ================= Dashboard ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["Pharmacist", "PharmacyAdmin"]}>
              {user?.role === "PharmacyAdmin" && user?.isFirstLogin ? (
                <Navigate to="/change-password" replace />
              ) : (
                <DashboardLayout />
              )}
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

          <Route
            path="logs"
            element={
              <ProtectedRoute roles={["PharmacyAdmin"]}>
                <Logs />
              </ProtectedRoute>
            }
          />

          <Route
            path="ads"
            element={
              <ProtectedRoute roles={["PharmacyAdmin"]}>
                <Ads />
              </ProtectedRoute>
            }
          />

          <Route
            path="subscription"
            element={
              <ProtectedRoute roles={["PharmacyAdmin"]}>
                <Subscription />
              </ProtectedRoute>
            }
          />

          <Route
            path="discounts"
            element={
              <ProtectedRoute roles={["PharmacyAdmin"]}>
                <Discounts />
              </ProtectedRoute>
            }
          />
          {/* ✅ Add this */}
<Route
  path="notifications"
  element={
    <ProtectedRoute roles={["PharmacyAdmin", "Pharmacist"]}>
      <AdminNotifications />
    </ProtectedRoute>
  }
/>
        </Route>

        {/* ================= Super Admin ================= */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute roles={["SuperAdmin"]}>
              <DashboardLayoutSuberAdmin />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="pharmacies" element={<Pharmacies />} />
          <Route path="reports" element={<Reports />} />
          <Route path="service-pricing" element={<ServicePricing />} />
          <Route path="ApprovalQueue" element={<ApprovalQueue />} />
        </Route>

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;