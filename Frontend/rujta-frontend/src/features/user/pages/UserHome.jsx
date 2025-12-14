import React, { useEffect } from "react";
import { useOrders } from "../../orders/hooks/useOrders";

const HeroUserWithOrderBanner = ({ children }) => {
  const { orders, fetchUserOrders, loading } = useOrders();

  useEffect(() => {
    fetchUserOrders();
  }, []);


  const activeOrder = orders.find(
    o => o.status !== "DELIVERED" && o.status !== "CANCELLED"
  );

  return (
    <>
      {/* الكارد فوق Hero */}
      {!loading && activeOrder && (
        <div className="bg-green-100 text-green-800 text-center p-4 font-semibold">
          🚚 عندك طلب شغال دلوقتي
        </div>
      )}

      {children}
    </>
  );
};

export default HeroUserWithOrderBanner;
