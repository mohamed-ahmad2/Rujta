import React, { useState, useEffect } from "react";
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

  // Helper: cart key based on profile email
  const getCartKey = () => user ? `cart_${user.profile?.email || user.email}` : null;

  // Load cart on user login
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setCart([]);
      return;
    }

    const key = getCartKey();
    console.log("Loading cart for key:", key);

    const savedCart = localStorage.getItem(key);
    setCart(savedCart ? JSON.parse(savedCart) : []);
  }, [user, loading]);

  // Save cart whenever it updates
  useEffect(() => {
    if (loading || !user) return;

    const key = getCartKey();
    console.log("Saving cart for key:", key, cart);
    localStorage.setItem(key, JSON.stringify(cart));
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
