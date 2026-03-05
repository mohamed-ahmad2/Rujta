// src/features/orders/pages/Orders.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useOrders } from "../../orders/hooks/useOrders";
import useMedicines from "../../medicines/hook/useMedicines";

export default function Orders() {
  const {
    orders: liveGroups,
    fetchUser,
    cancelByUser,
    loading,
    error,
  } = useOrders();
  const { medicines, fetchAll } = useMedicines();

  const [showMoreGroups, setShowMoreGroups] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

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

  const toggleDetails = (groupIndex) => {
    setShowMoreGroups((prev) => ({ ...prev, [groupIndex]: !prev[groupIndex] }));
  };

  const canCancel = (status) => {
    return ["Pending", "Accepted"].includes(status);
  };

  const handleCancelGroup = async (group) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order group?",
    );
    if (!confirmCancel) return;

    try {
      for (const order of group) {
        await cancelByUser(order.id);
      }
      alert("Order group cancelled successfully");
      fetchUser(); // Refetch to update
    } catch (err) {
      alert(
        "Error cancelling order group: " + (err.message || "Please try again"),
      );
    }
  };

  // ================= Status Badge =================
  const getStatusBadge = (status) => {
    const base =
      "px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm";

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

    const isCancelled = ["CancelledByUser", "CancelledByPharmacy"].includes(
      currentStatus,
    );

    const currentIndex = stages.findIndex((s) => s.key === currentStatus);

    return (
      <div className="w-full mt-6 relative">
        <div className="flex justify-between items-center relative">
          {/* Gray Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 transform -translate-y-1/2 -z-10"></div>

          {/* Progress Line */}
          <div
            className="absolute top-1/2 left-0 h-1 transition-all duration-700 ease-in-out transform -translate-y-1/2"
            style={{
              width: `${
                isCancelled
                  ? 100
                  : Math.max(0, (currentIndex / (stages.length - 1)) * 100)
              }%`,
              backgroundColor: isCancelled ? "#ef4444" : "#22c55e",
            }}
          ></div>

          {stages.map((stage, index) => {
            const completed = index <= currentIndex && !isCancelled;
            const isCurrent = index === currentIndex && !isCancelled;
            const cancelledHere = isCancelled && index === currentIndex;

            return (
              <div key={stage.key} className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                    completed || isCurrent
                      ? "bg-green-500 text-white scale-110 shadow-md"
                      : cancelledHere
                        ? "bg-red-500 text-white scale-110 shadow-md"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {stage.icon}
                </div>
                <span className="text-xs mt-2 font-medium text-gray-700 text-center">
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ================= Grouped and Filtered Orders =================
  const groupedTabs = useMemo(() => {
    const tabs = {
      active: [],
      completed: [],
      cancelled: [],
    };

    const filteredGroups = liveGroups.filter((group) =>
      group.some(
        (order) =>
          order.id.toString().includes(searchQuery) ||
          order.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
          new Date(order.orderDate)
            .toLocaleDateString()
            .includes(searchQuery) ||
          order.deliveryAddress
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    );

    filteredGroups.forEach((group) => {
      const groupStatus = group[0]?.status || "Unknown"; // Assume all same
      if (["CancelledByUser", "CancelledByPharmacy"].includes(groupStatus)) {
        tabs.cancelled.push(group);
      } else if (groupStatus === "Delivered") {
        tabs.completed.push(group);
      } else {
        tabs.active.push(group);
      }
    });

    return tabs;
  }, [liveGroups, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <button
          onClick={fetchUser}
          className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === "active"
              ? "border-b-2 border-secondary text-secondary"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("active")}
        >
          Active ({groupedTabs.active.length})
        </button>
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === "completed"
              ? "border-b-2 border-secondary text-secondary"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("completed")}
        >
          Completed ({groupedTabs.completed.length})
        </button>
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === "cancelled"
              ? "border-b-2 border-secondary text-secondary"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("cancelled")}
        >
          Cancelled ({groupedTabs.cancelled.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by order ID, status, date, or address..."
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {groupedTabs[activeTab].length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-500 text-lg">No orders in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedTabs[activeTab].map((group, groupIndex) => {
            const isOpen = showMoreGroups[groupIndex] || false;
            const groupStatus = group[0]?.status || "Unknown";
            const groupDate = new Date(
              group[0]?.orderDate,
            ).toLocaleDateString();
            const groupTotal = group
              .reduce((sum, o) => sum + (o.totalPrice || 0), 0)
              .toFixed(2);
            const groupItems = group.flatMap((o) => o.orderItems || []);
            const groupAddress = group[0]?.deliveryAddress || "N/A";
            const groupId = group.map((o) => o.id).join(", "); // For display

            return (
              <div
                key={groupIndex}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Order Group #{groupId}
                    </h3>
                    {getStatusBadge(groupStatus)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Date: {groupDate}
                  </p>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    Total: ${groupTotal}
                  </p>
                </div>

                {/* Actions */}
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => toggleDetails(groupIndex)}
                      className="text-secondary font-medium flex items-center gap-1 hover:underline transition"
                    >
                      {isOpen ? "Hide Details" : "Show Details"}
                      <span
                        className={`transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        ⌄
                      </span>
                    </button>

                    {activeTab === "active" && canCancel(groupStatus) && (
                      <button
                        onClick={() => handleCancelGroup(group)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                          ${
                            loading
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600 text-white shadow hover:shadow-md"
                          }`}
                      >
                        {loading ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>

                  {/* Animated Details */}
                  <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      isOpen
                        ? "max-h-[800px] opacity-100 mt-6"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <OrderStatusStepper currentStatus={groupStatus} />

                    {groupItems.length > 0 ? (
                      <ul className="mt-6 space-y-3">
                        {groupItems.map((item, i) => (
                          <li
                            key={i}
                            className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition duration-200"
                          >
                            <span className="font-medium text-gray-700 truncate max-w-[60%]">
                              {getMedicineName(item.medicineID)}
                            </span>
                            <span className="text-gray-600 text-sm">
                              Qty: {item.quantity} | $
                              {item.subTotal?.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 mt-4">
                        No items found for this order group.
                      </p>
                    )}

                    <p className="mt-4 text-sm text-gray-600">
                      Delivery Address: {groupAddress}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
