import React, { useEffect, useState } from "react";
import { useOrders } from "../../orders/hooks/useOrders";
import {
  getOrderDetails,
  cancelOrder,
} from "../../orders/api/ordersApi";
import useMedicines from "../../medicines/hook/useMedicines";

export default function Orders() {
  const { orders, fetchUserOrders } = useOrders();
  const { medicines, fetchAll } = useMedicines();

  const [details, setDetails] = useState({});
  const [showMoreOrders, setShowMoreOrders] = useState({});

  /* ================= Load Medicines ================= */
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ================= Load Orders + Details ================= */
  useEffect(() => {
    const loadOrdersWithDetails = async () => {
      const userOrders = await fetchUserOrders();

      for (const order of userOrders) {
        try {
          const res = await getOrderDetails(order.id);
          setDetails((prev) => ({
            ...prev,
            [order.id]: res.data,
          }));
        } catch (err) {
          console.error("Error loading order details", err);
        }
      }
    };

    loadOrdersWithDetails();
  }, [fetchUserOrders]);

  /* ================= Helpers ================= */
  const getMedicineName = (id) => {
    const med = medicines.find((m) => m.id === id);
    return med ? med.name : `Medicine ID: ${id}`;
  };

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );
    if (!confirmCancel) return;

    try {
      await cancelOrder(orderId);
      await fetchUserOrders();
      alert("Order cancelled successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel order");
    }
  };

  /* ================= Status Badge ================= */
  const statusMap = {
    0: "Pending",
    1: "Accepted",
    2: "Processing",
    3: "OutForDelivery",
    4: "Delivered",
    5: "Cancelled",
    6: "Cancelled",
  };

  const getStatusBadge = (status) => {
    const text = statusMap[status] || "Unknown";
    const base =
      "px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap";

    const styles = {
      Pending: "bg-yellow-100 text-yellow-700",
      Accepted: "bg-blue-100 text-blue-700",
      Processing: "bg-indigo-100 text-indigo-700",
      OutForDelivery: "bg-purple-100 text-purple-700",
      Delivered: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
    };

    return <span className={`${base} ${styles[text]}`}>{text}</span>;
  };

  /* ================= UI ================= */
  return (
    <section className="min-h-screen bg-[#F3F4F6] p-10">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">My Orders</h2>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders
            .slice()
            .sort(
              (a, b) =>
                new Date(b.orderDate) - new Date(a.orderDate)
            )
            .map((order) => (
              <div
                key={order.id}
                className="border rounded-xl p-4 mb-4"
              >
                {/* ===== Header ===== */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-semibold">{order.id}</p>

                    <p className="text-sm text-gray-500 mt-2">
                      Created At
                    </p>
                    <p className="text-sm">
                      {order.orderDate
                        ? new Date(
                            order.orderDate
                          ).toLocaleString()
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
                      {showMoreOrders[order.id]
                        ? "Show Less"
                        : "Show More"}
                    </button>

                    {/* ===== Cancel Button ===== */}
                    {[0, 1, 2].includes(order.status) && (
                      <button
                        onClick={() =>
                          handleCancelOrder(order.id)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* ===== Order Details ===== */}
                {showMoreOrders[order.id] && (
                  <div className="mt-4">
                    {order.orderItems.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {order.orderItems.map((item, i) => (
                          <li key={i}>
                            {getMedicineName(
                              item.medicineID
                            )}{" "}
                            – Qty: {item.quantity}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No items found.
                      </p>
                    )}

                    {details[order.id] && (
                      <p className="text-sm text-gray-600 mt-2">
                        Delivery Address:{" "}
                        {details[order.id].deliveryAddress ||
                          "N/A"}
                      </p>
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
