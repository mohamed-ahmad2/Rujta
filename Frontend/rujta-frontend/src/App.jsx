import React, { useState, useEffect, useRef } from "react";
import AppRoutes from "./routes/Approuts";
import { useAuth } from "./features/auth/hooks/useAuth";
import { useLocation } from "react-router-dom";
import FloatingCartButton from "./features/user/components/FloatingCartButton";
import CartDrawerUser from "./features/user/components/CartDrawer";

const App = () => {
  const { user, loading } = useAuth();
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const prevUserRef = useRef(null);

  // Load cart when user changes
  useEffect(() => {
    if (loading) return;

    if (!user) {
      setCart([]);
      return;
    }

    const prevUser = prevUserRef.current;
    const currentKey = `cart_${user.email}`;

    if (prevUser && prevUser.email !== user.email) {
      const prevKey = `cart_${prevUser.email}`;
      localStorage.setItem(prevKey, JSON.stringify(cart));
    }

    const savedCart = localStorage.getItem(currentKey);
    setCart(savedCart ? JSON.parse(savedCart) : []);

    prevUserRef.current = user;
  }, [user, loading]);

  // Save cart when updated
  useEffect(() => {
    if (loading || !user) return;
    const currentKey = `cart_${user.email}`;
    localStorage.setItem(currentKey, JSON.stringify(cart));
  }, [cart, user, loading]);

  // Pages where cart button should not appear
  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname.startsWith("/auth");
  const isResetPage = location.pathname === "/reset-password";
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <>
      <AppRoutes
        cart={cart}
        setCart={setCart}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
      />

      {/* Floating Cart Button (only in /user pages) */}
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
