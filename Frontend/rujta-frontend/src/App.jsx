// App.jsx - Full Fixed Version

import React, { useState, useEffect } from "react";
import AppRoutes from "./routes/Approuts";
import { useAuth } from "./features/auth/hooks/useAuth";
import { useLocation } from "react-router-dom";
import FloatingCartButton from "./features/user/components/FloatingCartButton";
import CartDrawerUser from "./features/user/components/CartDrawer";
import Splash from "./features/splash/splash";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { PresenceProvider } from "./context/PresenceProvider";
import { OrdersProvider } from "./context/OrdersProvider";
import { NotificationProvider } from "./context/NotificationProvider";
import { ToastProvider } from "./context/ToastProvider";
import { AdminNotificationProvider } from "./context/AdminNotificationProvider"; // 🆕



const App = () => {
  const { user, loading } = useAuth();

  /* ===== Splash State ===== */
  const [showSplash, setShowSplash] = useState(true);

  /* ===== Cart State ===== */
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [cartUser, setCartUser] = useState(null);

  const location = useLocation();

  /* ===== Splash Logic ===== */
  useEffect(() => {
    if (loading) return;
    const globalSeen = localStorage.getItem("seenSplash_global");
    const userSeen = user
      ? localStorage.getItem(`seenSplash_${user.email}`)
      : null;
    if (globalSeen || userSeen) {
      setShowSplash(false);
    }
  }, [user, loading]);

  const handleFinish = () => {
    localStorage.setItem("seenSplash_global", "true");
    if (user?.email) {
      localStorage.setItem(`seenSplash_${user.email}`, "true");
    }
    setShowSplash(false);
  };

  /* ===== Cart Key ===== */
  const getCartEmail = () => user?.profile?.email || user?.email || null;
  const getCartKey = () => {
    const email = getCartEmail();
    return email ? `cart_${email}` : null;
  };

  /* ===== Load Cart ===== */
  useEffect(() => {
    if (loading) return;

    setCartUser(null);

    if (!user) {
      setCart([]);
      return;
    }

    const key = getCartKey();
    const savedCart = localStorage.getItem(key);
    setCart(savedCart ? JSON.parse(savedCart) : []);

    setCartUser(getCartEmail());
  }, [user, loading]);

  /* ===== Save Cart ===== */
  useEffect(() => {
    const currentEmail = getCartEmail();

    if (!cartUser || cartUser !== currentEmail || loading || !user) return;

    const key = getCartKey();
    if (!key) return;

    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, cartUser, user, loading]);

  /* ===== Hide cart button in some pages ===== */
  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname.startsWith("/auth");
  const isResetPage = location.pathname === "/reset-password";
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isSuperAdmin = location.pathname.startsWith("/superadmin");

  /* ===== SPLASH FIRST ===== */
  if (showSplash) {
    return <Splash onFinish={handleFinish} />;
  }

  return (
    <PresenceProvider>
      <OrdersProvider>
        <ToastProvider>
          <NotificationProvider>
            <AdminNotificationProvider>

          <AppRoutes
            cart={cart}
            setCart={setCart}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
          />

          {user &&
            !isLandingPage &&
            !isAuthPage &&
            !isResetPage &&
            !isDashboard &&
            !isSuperAdmin && (
              <FloatingCartButton
                cart={cart}
                onClick={() => setIsCartOpen(true)}
              />
            )}

          {user && (
            <CartDrawerUser
              cart={cart}
              setCart={setCart}
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
            />
          )}

          <SpeedInsights />
            </AdminNotificationProvider>
         </NotificationProvider>
        </ToastProvider>
      </OrdersProvider>
    </PresenceProvider>
  );
};

export default App;
