// src/features/orders/pages/Orders.jsx
import React, { useEffect, useState, useMemo, useContext } from "react";
import { OrdersContext } from "../../../context/OrdersContext";
import useMedicines from "../../medicines/hook/useMedicines";
import { useOrders } from "../../orders/hooks/useOrders";

export default function Orders() {
  const { orders: liveOrders, setOrders } = useContext(OrdersContext);
  const { fetchUser, cancelByUser, loading } = useOrders();
  const { medicines, fetchAll } = useMedicines();

  const [showMoreGroups, setShowMoreGroups] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    fetchAll();
    fetchUser();
  }, [fetchAll, fetchUser]);

  // ================= Helpers =================
  const getMedicineName = (id) => {
    const med = medicines.find((m) => m.id === id);
    return med ? med.name : `Medicine ID: ${id}`;
  };

  const toggleDetails = (index) => {
    setShowMoreGroups((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const canCancel = (status) => ["Pending", "Accepted"].includes(status);

  const handleCancelGroup = async (group) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order group?"
    );
    if (!confirmCancel) return;

    for (const order of group) {
      await cancelByUser(order?.id);
    }

    fetchUser();
  };

  // ================= Status Badge =================
  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap";

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

  // ================= Stepper =================
  const OrderStatusStepper = ({ currentStatus }) => {
    const stages = [
      { key: "Pending", icon: "⏳" },
      { key: "Accepted", icon: "✔️" },
      { key: "Processing", icon: "⚙️" },
      { key: "OutForDelivery", icon: "🚚" },
      { key: "Delivered", icon: "📦" },
    ];

    const currentIndex = stages.findIndex((s) => s.key === currentStatus);

    return (
      <div className="flex justify-between mt-4">
        {stages.map((stage, index) => (
          <div
            key={stage.key}
            className={`w-9 h-9 flex items-center justify-center rounded-full text-sm
              ${index <= currentIndex
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-500"
              }`}
          >
            {stage.icon}
          </div>
        ))}
      </div>
    );
  };

  // ================= Group Logic =================
  const groupedTabs = useMemo(() => {
    const tabs = { active: [], completed: [], cancelled: [] };

    const filteredGroups = liveOrders.filter((group) =>
      group?.some(
        (order) =>
          order?.id?.toString()?.includes(searchQuery) ||
          order?.status?.toLowerCase()?.includes(searchQuery.toLowerCase())
      )
    );

    filteredGroups.forEach((group) => {
      const status = group?.[0]?.status || "Pending";

      if (["CancelledByUser", "CancelledByPharmacy"].includes(status)) {
        tabs.cancelled.push(group);
      } else if (status === "Delivered") {
        tabs.completed.push(group);
      } else {
        tabs.active.push(group);
      }
    });

    return tabs;
  }, [liveOrders, searchQuery]);

  // ================= UI =================
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">My Orders</h2>

        {/* Tabs */}
        <div className="flex space-x-4 sm:space-x-6 mb-6 border-b overflow-x-auto">
          {["active", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium capitalize whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab
                  ? "border-b-2 border-secondary text-secondary"
                  : "text-gray-500"
              }`}
            >
              {tab} ({groupedTabs[tab]?.length || 0})
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search orders..."
          className="mb-6 w-full max-w-md px-4 py-2 border rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* ===== Cards ===== */}
        {groupedTabs[activeTab]?.map((group, index) => {
          const firstOrder = group?.[0] || {};
          const groupStatus = firstOrder?.status || "Pending";
          const groupDate = firstOrder?.orderDate
            ? new Date(firstOrder.orderDate).toLocaleDateString()
            : "-";

          // بدل ما نعرض كل الـ IDs، نعرض أول ID وعدد الباقين
          const firstId = group?.[0]?.id || "N/A";
          const extraCount = group.length - 1;
          const groupIdLabel = extraCount > 0
            ? `#${firstId} +${extraCount} more`
            : `#${firstId}`;

          const isOpen = showMoreGroups[index];

          return (
            // ===== Outer Card =====
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-sm hover:shadow-xl transition"
            >
              {/* Header — كل حاجة في سطر واحد */}
              <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                {/* Left: info */}
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 uppercase">Order Group</p>
                  <p className="font-bold text-base sm:text-lg truncate">{groupIdLabel}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{groupDate}</p>
                </div>

                {/* Right: badge + buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusBadge(groupStatus)}

                  <button
                    onClick={() => toggleDetails(index)}
                    className="text-sm text-gray-600 hover:text-black flex items-center gap-1 whitespace-nowrap"
                  >
                    Details
                    <span className={`transition-transform inline-block ${isOpen ? "rotate-180" : ""}`}>
                      ⌄
                    </span>
                  </button>

                  {activeTab === "active" && canCancel(groupStatus) && (
                    <button
                      onClick={() => handleCancelGroup(group)}
                      className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-red-500 text-white hover:bg-red-600 whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* ===== Details (expanded) ===== */}
              <div
                className={`transition-all duration-500 overflow-hidden ${
                  isOpen ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col gap-4">
                  {group?.map((order, orderIndex) => {
                    const orderItems = order?.orderItems || [];
                    const pharmacyLabel = order?.pharmacyName || `Pharmacy Order #${order?.id}`;

                    return (
                      <div
                        key={orderIndex}
                        className="border border-gray-100 rounded-xl p-4 bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className="text-xs text-gray-400 uppercase">Order</p>
                            <p className="font-semibold text-base">#{order?.id}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{pharmacyLabel}</p>
                          </div>
                          {getStatusBadge(order?.status)}
                        </div>

                        <OrderStatusStepper currentStatus={order?.status} />

                        {orderItems.length > 0 ? (
                          <ul className="mt-4 space-y-2">
                            {orderItems.map((item, i) => (
                              <li
                                key={i}
                                className="flex justify-between bg-white p-3 rounded-lg border border-gray-100"
                              >
                                <span className="font-medium text-sm">
                                  {getMedicineName(item?.medicineID)}
                                </span>
                                <span className="text-gray-500 text-sm">Qty: {item?.quantity || 0}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 mt-4">No items found.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
