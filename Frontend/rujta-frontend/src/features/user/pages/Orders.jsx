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
    const base = "px-3 py-1 rounded-full text-xs font-semibold";

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
      <div className="flex justify-between mt-6">
        {stages.map((stage, index) => (
          <div
            key={stage.key}
            className={`w-9 h-9 flex items-center justify-center rounded-full
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
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">My Orders</h2>

        {/* Tabs */}
        <div className="flex space-x-6 mb-6 border-b">
          {["active", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium capitalize ${
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

        {/* Cards */}
        {groupedTabs[activeTab]?.map((group, index) => {
          const order = group?.[0] || {};
          const groupStatus = order?.status || "Pending";
          const groupDate = order?.orderDate
            ? new Date(order.orderDate).toLocaleDateString()
            : "-";
          const groupItems = group?.flatMap((o) => o?.orderItems || []) || [];
          const groupId = group?.map((o) => o?.id || "N/A").join(", ");
          const isOpen = showMoreGroups[index];

          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm hover:shadow-xl transition"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Order Group</p>
                  <p className="font-bold text-lg">#{groupId}</p>
                  <p className="text-sm text-gray-500 mt-1">{groupDate}</p>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(groupStatus)}

                  <button
                    onClick={() => toggleDetails(index)}
                    className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
                  >
                    Details
                    <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
                      ⌄
                    </span>
                  </button>

                  {activeTab === "active" && canCancel(groupStatus) && (
                    <button
                      onClick={() => handleCancelGroup(group)}
                      className="px-4 py-1.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Details */}
              <div
                className={`transition-all duration-500 overflow-hidden ${
                  isOpen ? "max-h-[600px] opacity-100 mt-6" : "max-h-0 opacity-0"
                }`}
              >
                <OrderStatusStepper currentStatus={groupStatus} />

                {groupItems.length > 0 ? (
                  <ul className="mt-6 space-y-2">
                    {groupItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <span className="font-medium">{getMedicineName(item?.medicineID)}</span>
                        <span>Qty: {item?.quantity || 0}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mt-4">No items found.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}