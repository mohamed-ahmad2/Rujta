import React, { useState, useEffect } from "react";
import AppRoutes from "./routes/Approuts";
import { useAuth } from "./features/auth/hooks/useAuth";
import { useLocation } from "react-router-dom";
import FloatingCartButton from "./features/user/components/FloatingCartButton";
import CartDrawerUser from "./features/user/components/CartDrawer";
import Splash from "./features/splash/splash";

const App = () => {
  const { user, loading } = useAuth();

  /* ===== Splash State ===== */
  const [showSplash, setShowSplash] = useState(true);

  /* ===== Cart State ===== */
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  /* ===== Splash Logic ===== */
  useEffect(() => {
    if (loading) return;

    const globalSeen = localStorage.getItem("seenSplash_global");
    const userSeen = user
      ? localStorage.getItem(`seenSplash_${user.email}`)
      : null;

    // لو Splash اتشاف قبل كده
    if (globalSeen || userSeen) {
      setShowSplash(false);
    }
  }, [user, loading]);

  const handleFinish = () => {
    // Splash 
    localStorage.setItem("seenSplash_global", "true");

    if (user?.email) {
      localStorage.setItem(`seenSplash_${user.email}`, "true");
    }

    setShowSplash(false);
  };

  /* ===== Cart Key ===== */
  const getCartKey = () =>
    user ? `cart_${user.profile?.email || user.email}` : null;

  /* ===== Load Cart ===== */
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setCart([]);
      return;
    }

    const key = getCartKey();
    const savedCart = localStorage.getItem(key);
    setCart(savedCart ? JSON.parse(savedCart) : []);
  }, [user, loading]);

  /* ===== Save Cart ===== */
  useEffect(() => {
    if (loading || !user) return;

    const key = getCartKey();
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, user, loading]);

  /* ===== Hide cart button in some pages ===== */
  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname.startsWith("/auth");
  const isResetPage = location.pathname === "/reset-password";
  const isDashboard = location.pathname.startsWith("/dashboard");

  /* ===== SPLASH FIRST ===== */
  if (showSplash) {
    return <Splash onFinish={handleFinish} />;
  }

  return (
    <>
      <AppRoutes
        cart={cart}
        setCart={setCart}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
      />

      {/* Floating Cart Button */}
      {user &&
        !isLandingPage &&
        !isAuthPage &&
        !isResetPage &&
        !isDashboard && (
          <FloatingCartButton
            cart={cart}
            onClick={() => setIsCartOpen(true)}
          />
        )}

      {/* Cart Drawer */}
      {user && (
        <CartDrawerUser
          cart={cart}
          setCart={setCart}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      )}
    </>
  );
};

export default App;
