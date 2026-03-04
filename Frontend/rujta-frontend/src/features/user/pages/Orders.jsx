import React, { useEffect, useState } from "react";
import { useOrders } from "../../orders/hooks/useOrders";
import useMedicines from "../../medicines/hook/useMedicines";

export default function Orders() {
  const { orders, fetchUser, cancelByUser, loading } = useOrders();
  const { medicines, fetchAll } = useMedicines();

  const [showMoreOrders, setShowMoreOrders] = useState({});

  // ================= Load Data =================
  useEffect(() => {
    fetchAll();
    fetchUser();
  }, [fetchAll, fetchUser]);

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
    if (res) alert("Order cancelled successfully");
  };

  // ================= Status Badge =================
  const getStatusBadge = (status) => {
    const base =
      "px-3 py-1 rounded-full text-xs font-semibold tracking-wide";

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

  // ================= Modern Stepper =================
  const OrderStatusStepper = ({ currentStatus }) => {
    const stages = [
      { key: "Pending", label: "Pending", icon: "⏳" },
      { key: "Accepted", label: "Accepted", icon: "✔️" },
      { key: "Processing", label: "Processing", icon: "⚙️" },
      { key: "OutForDelivery", label: "Out For Delivery", icon: "🚚" },
      { key: "Delivered", label: "Delivered", icon: "📦" },
    ];

    const isCancelled = [
      "CancelledByUser",
      "CancelledByPharmacy",
    ].includes(currentStatus);

    const currentIndex = stages.findIndex(
      (s) => s.key === currentStatus
    );

    return (
      <div className="w-full mt-6">
        <div className="relative flex justify-between items-center">
          {/* Gray Line */}
          <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200 -z-10"></div>

          {/* Progress Line */}
          <div
            className="absolute top-4 left-0 h-[2px] transition-all duration-700"
            style={{
              width: `${
                isCancelled
                  ? 100
                  : (currentIndex / (stages.length - 1)) * 100
              }%`,
              backgroundColor: isCancelled ? "#ef4444" : "#22c55e",
            }}
          ></div>

          {stages.map((stage, index) => {
            const completed =
              index <= currentIndex && !isCancelled;
            const isCurrent =
              index === currentIndex && !isCancelled;

            return (
              <div
                key={stage.key}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-lg
                  transition-all duration-500 ${
                    isCancelled
                      ? "bg-red-500 text-white shadow-lg shadow-red-300"
                      : completed
                      ? "bg-green-500 text-white shadow-lg shadow-green-300 scale-110"
                      : "bg-white border-2 border-gray-400 text-gray-400"
                  } ${
                    isCurrent && !isCancelled
                      ? "animate-pulse"
                      : ""
                  }`}
                >
                  {stage.icon}
                </div>

                <p
                  className={`text-xs mt-2 font-medium ${
                    isCancelled ? "text-red-600" : ""
                  }`}
                >
                  {stage.label}
                </p>
              </div>
            );
          })}
        </div>

        {isCancelled && (
          <p className="text-sm text-red-600 mt-4 font-semibold text-center">
            This order has been cancelled.
          </p>
        )}
      </div>
    );
  };

  // ================= UI =================
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">
          My Orders
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No orders found.
          </div>
        ) : (
          orders
            .slice()
            .sort(
              (a, b) =>
                new Date(b.orderDate) -
                new Date(a.orderDate)
            )
            .map((order) => {
              const isOpen = showMoreOrders[order.id];

              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 
                  shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">
                        Order ID
                      </p>
                      <p className="font-bold text-lg text-gray-800">
                        #{order.id}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {order.orderDate
                          ? new Date(
                              order.orderDate
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.status)}

                      <button
                        onClick={() =>
                          setShowMoreOrders((prev) => ({
                            ...prev,
                            [order.id]:
                              !prev[order.id],
                          }))
                        }
                        className="text-sm font-medium text-gray-600 hover:text-black transition flex items-center gap-1"
                      >
                        Details
                        <span
                          className={`transition-transform duration-300 ${
                            isOpen
                              ? "rotate-180"
                              : ""
                          }`}
                        >
                          ⌄
                        </span>
                      </button>

                      {[
                        "Pending",
                        "Accepted",
                        "Processing",
                      ].includes(order.status) && (
                        <button
                          onClick={() =>
                            handleCancelOrder(order.id)
                          }
                          disabled={loading}
                          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-300
                          ${
                            loading
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
                          }`}
                        >
                          {loading
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Animated Details */}
                  <div
                    className={`transition-all duration-500 overflow-hidden ${
                      isOpen
                        ? "max-h-[600px] opacity-100 mt-6"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <OrderStatusStepper
                      currentStatus={order.status}
                    />

                    {order.orderItems?.length > 0 ? (
                      <ul className="mt-6 space-y-2">
                        {order.orderItems.map(
                          (item, i) => (
                            <li
                              key={i}
                              className="flex justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition"
                            >
                              <span className="font-medium text-gray-700">
                                {getMedicineName(
                                  item.medicineID
                                )}
                              </span>
                              <span className="text-gray-600">
                                Qty: {item.quantity}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 mt-4">
                        No items found.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </section>
  );
}