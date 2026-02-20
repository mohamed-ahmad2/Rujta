import React, { useEffect, useState } from "react";
import { useOrders } from "../../orders/hooks/useOrders";
import useMedicines from "../../medicines/hook/useMedicines";

export default function Orders() {
  const {
    orders,
    fetchUser,
    cancelByUser,
    loading,
  } = useOrders();

  const { medicines, fetchAll } = useMedicines();

  const [details, setDetails] = useState({});
  const [showMoreOrders, setShowMoreOrders] = useState({});

  // ================= Load Medicines =================
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ================= Load Orders =================
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ================= Helpers =================
  const getMedicineName = (id) => {
    const med = medicines.find((m) => m.id === id);
    return med ? med.name : `Medicine ID: ${id}`;
  };

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirmCancel) return;

    const res = await cancelByUser(orderId);

    if (res) {
      alert("Order cancelled successfully");
    }
  };

  // ================= Status Badge =================
  const getStatusBadge = (status) => {
    const base =
      "px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap";

    const styles = {
      Pending: "bg-yellow-100 text-yellow-700",
      Accepted: "bg-blue-100 text-blue-700",
      Processing: "bg-indigo-100 text-indigo-700",
      OutForDelivery: "bg-purple-100 text-purple-700",
      Delivered: "bg-green-100 text-green-700",
      CancelledByUser: "bg-red-100 text-red-700",
      CancelledByPharmacy: "bg-red-100 text-red-700",
    };

    return <span className={`${base} ${styles[status] || ""}`}>{status}</span>;
  };

  // ================= NEW: ICON + ANIMATION STEPPER =================
 const OrderStatusStepper = ({ currentStatus }) => {
  const stages = [
    { key: "Pending", label: "Pending", icon: "⏳" },
    { key: "Accepted", label: "Accepted", icon: "✔️" },
    { key: "Processing", label: "Processing", icon: "⚙️" },
    { key: "OutForDelivery", label: "Out For Delivery", icon: "🚚" },
    { key: "Delivered", label: "Delivered", icon: "📦" },
  ];

  const isCancelled = ["CancelledByUser", "CancelledByPharmacy"].includes(currentStatus);
  const currentIndex = stages.findIndex(s => s.key === currentStatus);

  return (
    <div className="w-full mt-4 mb-2 px-2">
      <div className="flex items-center justify-between relative">
        {/* الخلفية الرمادي */}
        <div className="absolute top-3 left-0 h-[2px] w-full bg-gray-300 -z-10" />

        {/* الخط الأخضر أو رمادي */}
        <div
          className={`absolute top-3 left-0 h-[2px] transition-all duration-700`}
          style={{
            width: `${isCancelled ? 100 : (currentIndex / (stages.length - 1)) * 100}%`,
            backgroundColor: isCancelled ? "red" : "#22c55e", // أحمر إذا ملغى، أخضر إذا طبيعي
          }}
        />

        {stages.map((stage, index) => {
          const completed = index <= currentIndex && !isCancelled;
          const isCurrent = index === currentIndex && !isCancelled;

          return (
            <div key={stage.key} className="flex flex-col items-center relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg 
                transition-all duration-500 transform ${
                  isCancelled
                    ? "bg-red-500 text-white"
                    : completed
                    ? "bg-green-500 text-white scale-110"
                    : "bg-white border-2 border-gray-400 text-gray-400"
                } ${isCurrent && !isCancelled ? "animate-pulse" : ""}`}
              >
                {stage.icon}
              </div>

              <p className={`text-xs mt-2 text-center font-medium ${isCancelled ? "text-red-600" : ""}`}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <p className="text-sm text-red-600 mt-2 font-semibold">
          This order has been cancelled.
        </p>
      )}
    </div>
  );
};

  // ================================================================

  // ================= UI =================
  return (
    <section className="min-h-screen bg-[#F3F4F6] p-10">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">My Orders</h2>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders
            .slice()
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .map((order) => (
              <div key={order.id} className="border rounded-xl p-4 mb-4">
                {/* ===== Header ===== */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-semibold">{order.id}</p>

                    <p className="text-sm text-gray-500 mt-2">Created At</p>
                    <p className="text-sm">
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}

                    <button
                      onClick={() =>
                        setShowMoreOrders((prev) => ({
                          ...prev,
                          [order.id]: !prev[order.id],
                        }))
                      }
                      className="bg-secondary text-white px-3 py-1 rounded-lg text-sm"
                    >
                      {showMoreOrders[order.id] ? "Show Less" : "Show More"}
                    </button>

                    {/* ===== Cancel Button ===== */}
                    {["Pending", "Accepted", "Processing"].includes(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* ===== Order Details (أضفت الـ Stepper هنا فقط) ===== */}
                {showMoreOrders[order.id] && (
                  <div className="mt-4">
                    <OrderStatusStepper currentStatus={order.status} />

                    {order.orderItems?.length > 0 ? (
                      <ul className="list-disc list-inside mt-4">
                        {order.orderItems.map((item, i) => (
                          <li key={i}>
                            {getMedicineName(item.medicineID)} – Qty:{" "}
                            {item.quantity}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No items found.</p>
                    )}
                  </div>
                )}
              </div>
            ))
        )}
      </div>
    </section>
  );
}
