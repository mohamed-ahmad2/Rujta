// src/features/orders/pages/Orders.jsx
import React, { useEffect, useState, useMemo, useContext } from "react";
import { OrdersContext } from "../../../context/OrdersContext";
import useMedicines from "../../medicines/hook/useMedicines";
import { useOrders } from "../../orders/hooks/useOrders";

const ACTIVE_STATUSES = ["Pending", "Accepted", "Processing", "OutForDelivery"];
const CANCELLED_STATUSES = ["CancelledByUser", "CancelledByPharmacy"];
const COMPLETED_STATUSES = ["Delivered"];

const STATUS_PRIORITY = [
  "Pending",
  "Accepted",
  "Processing",
  "OutForDelivery",
  "Delivered",
  "CancelledByUser",
  "CancelledByPharmacy",
];

const getDisplayStatus = (orders) => {
  const statuses = orders.map((o) => o?.status).filter(Boolean);
  for (const s of STATUS_PRIORITY) {
    if (statuses.includes(s)) return s;
  }
  return orders[0]?.status || "Pending";
};

const splitBatchIntoTabs = (originalBatch) => {
  const groupId = originalBatch[0]?.id;
  const groupDate = originalBatch[0]?.orderDate;
  const totalInBatch = originalBatch.length;

  const makeEntry = (orders) => ({ groupId, groupDate, totalInBatch, orders });

  return {
    active: makeEntry(
      originalBatch.filter((o) => ACTIVE_STATUSES.includes(o?.status)),
    ),
    cancelled: makeEntry(
      originalBatch.filter((o) => CANCELLED_STATUSES.includes(o?.status)),
    ),
    completed: makeEntry(
      originalBatch.filter((o) => COMPLETED_STATUSES.includes(o?.status)),
    ),
  };
};

export default function Orders() {
  const { orders: liveOrders } = useContext(OrdersContext);
  const { fetchUser, cancelByUser, loading } = useOrders();
  const { medicines, fetchAll } = useMedicines();

  const [showMoreGroups, setShowMoreGroups] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // ✅ Fix: إزالة fetchAll و fetchUser من dependencies لتجنب infinite loop
  useEffect(() => {
    fetchAll();
    fetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getMedicineName = (id) => {
    const med = medicines.find((m) => m.id === id);
    return med ? med.name : `Medicine ID: ${id}`;
  };

  const toggleDetails = (tabKey, index) =>
    setShowMoreGroups((prev) => ({
      ...prev,
      [`${tabKey}-${index}`]: !prev[`${tabKey}-${index}`],
    }));

  const canCancel = (status) => ["Pending", "Accepted"].includes(status);

  // ================= Cancel Handlers =================
  const handleCancelGroup = async (orders) => {
    const cancellable = orders.filter((o) => canCancel(o?.status));
    if (!cancellable.length) return;
    if (
      !window.confirm(
        "Are you sure you want to cancel all cancellable orders in this group?",
      )
    )
      return;
    for (const order of cancellable) await cancelByUser(order?.id);
    fetchUser();
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${order?.id}?`))
      return;
    await cancelByUser(order?.id);
    fetchUser();
  };

  // ================= Status Badge =================
  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-700 ring-yellow-200",
      Accepted: "bg-blue-100   text-blue-700   ring-blue-200",
      Processing: "bg-indigo-100 text-indigo-700 ring-indigo-200",
      OutForDelivery: "bg-purple-100 text-purple-700 ring-purple-200",
      Delivered: "bg-green-100  text-green-700  ring-green-200",
      CancelledByUser: "bg-red-100    text-red-700    ring-red-200",
      CancelledByPharmacy: "bg-red-100    text-red-700    ring-red-200",
    };
    return (
      <span
        className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status] || "bg-gray-100 text-gray-600 ring-gray-200"}`}
      >
        {status}
      </span>
    );
  };

  // ================= Stepper =================
  const OrderStatusStepper = ({ currentStatus }) => {
    const stages = [
      { key: "Pending", icon: "⏳", label: "Pending" },
      { key: "Accepted", icon: "✅", label: "Accepted" },
      { key: "Processing", icon: "⚙️", label: "Processing" },
      { key: "OutForDelivery", icon: "🚚", label: "Delivery" },
      { key: "Delivered", icon: "📦", label: "Delivered" },
    ];

    const isCancelled = CANCELLED_STATUSES.includes(currentStatus);
    const currentIndex = isCancelled
      ? -1
      : stages.findIndex((s) => s.key === currentStatus);

    if (isCancelled) {
      return (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5">
          <span className="text-lg">❌</span>
          <span className="text-sm font-medium text-red-600">
            {currentStatus}
          </span>
        </div>
      );
    }

    return (
      <div className="relative mt-5 px-2">
        {/* Background line */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-200" />
        {/* Progress line */}
        <div
          className="absolute left-6 top-4 h-0.5 bg-green-400 transition-all duration-500"
          style={{
            width:
              currentIndex <= 0
                ? "0%"
                : `${(currentIndex / (stages.length - 1)) * 100}%`,
          }}
        />
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const isDone = index <= currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <div
                key={stage.key}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all duration-300 ${isDone ? "bg-green-500 text-white shadow-md shadow-green-200" : "bg-white text-gray-400 ring-2 ring-gray-200"} ${isCurrent ? "ring-2 ring-green-300 ring-offset-2" : ""}`}
                >
                  {stage.icon}
                </div>
                <span
                  className={`text-[10px] font-medium ${isDone ? "text-green-600" : "text-gray-400"}`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const groupedTabs = useMemo(() => {
    const tabs = { active: [], completed: [], cancelled: [] };

    // ✅ Fix: التأكد إن liveOrders array مش null أو undefined
    const safeLiveOrders = Array.isArray(liveOrders) ? liveOrders : [];

    const filtered = safeLiveOrders.filter((batch) =>
      batch?.some(
        (order) =>
          order?.id?.toString()?.includes(searchQuery) ||
          order?.status?.toLowerCase()?.includes(searchQuery.toLowerCase()),
      ),
    );

    filtered.forEach((originalBatch) => {
      const { active, cancelled, completed } =
        splitBatchIntoTabs(originalBatch);

      if (active.orders.length > 0) tabs.active.push(active);
      if (cancelled.orders.length > 0) tabs.cancelled.push(cancelled);
      if (completed.orders.length > 0) tabs.completed.push(completed);
    });

    return tabs;
  }, [liveOrders, searchQuery]);

  // ================= UI =================
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">My Orders</h2>

        {/* Tabs */}
        <div className="mb-6 flex space-x-2 overflow-x-auto border-b border-gray-200 sm:space-x-6">
          {["active", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-3 text-sm font-medium capitalize transition-colors sm:text-base ${
                activeTab === tab
                  ? "border-b-2 border-secondary text-secondary"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}{" "}
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs ${activeTab === tab ? "bg-secondary/10 text-secondary" : "bg-gray-100 text-gray-500"}`}
              >
                {groupedTabs[tab]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by order ID or status..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Empty State */}
        {groupedTabs[activeTab]?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <span className="text-4xl">📋</span>
            <p className="mt-3 text-gray-500">No {activeTab} orders found</p>
          </div>
        )}

        {/* ===== Cards ===== */}
        {groupedTabs[activeTab]?.map((entry, index) => {
          const { groupId, groupDate, totalInBatch, orders } = entry;

          const displayStatus = getDisplayStatus(orders);
          const formattedDate = groupDate
            ? new Date(groupDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "-";

          const splitNote =
            orders.length < totalInBatch
              ? `${orders.length} of ${totalInBatch} from batch`
              : null;

          const firstId = orders[0]?.id || groupId;
          const extraCount = orders.length - 1;
          const groupIdLabel =
            extraCount > 0 ? `#${firstId} +${extraCount} more` : `#${firstId}`;

          const isOpen = showMoreGroups[`${activeTab}-${index}`];
          const isActiveTab = activeTab === "active";
          const hasCancellable = orders.some((o) => canCancel(o?.status));

          return (
            <div
              key={`${groupId}-${activeTab}-${index}`}
              className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
            >
              {/* ===== Group Header ===== */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Order Group
                  </p>
                  <p className="mt-0.5 truncate text-lg font-bold text-gray-800">
                    {groupIdLabel}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                      <span>📅</span> {formattedDate}
                    </p>
                    {splitNote && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-500">
                        {splitNote}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  {getStatusBadge(displayStatus)}

                  <button
                    onClick={() => toggleDetails(activeTab, index)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    {isOpen ? "Hide" : "Details"}
                    <span
                      className={`inline-block transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </button>

                  {isActiveTab && hasCancellable && (
                    <button
                      onClick={() => handleCancelGroup(orders)}
                      disabled={loading}
                      className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                    >
                      Cancel All
                    </button>
                  )}
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-5">
                  <div className="flex flex-col gap-4">
                    {orders.map((order, orderIndex) => {
                      const orderItems = order?.orderItems || [];
                      const pharmacyLabel =
                        order?.pharmacyName || `Pharmacy #${order?.id}`;

                      return (
                        <div
                          key={orderIndex}
                          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                        >
                          {/* Order Header */}
                          <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/50 p-4">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                Order
                              </p>
                              <p className="mt-0.5 text-base font-bold text-gray-800">
                                #{order?.id}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                                <span>🏪</span> {pharmacyLabel}
                              </p>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-2">
                              {getStatusBadge(order?.status)}

                              {isActiveTab && canCancel(order?.status) && (
                                <button
                                  onClick={() => handleCancelOrder(order)}
                                  disabled={loading}
                                  className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Stepper */}
                          <div className="px-4 pb-2 pt-1">
                            <OrderStatusStepper currentStatus={order?.status} />
                          </div>

                          {/* Items */}
                          <div className="p-4 pt-2">
                            {orderItems.length > 0 ? (
                              <>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                  Items ({orderItems.length})
                                </p>
                                <ul className="space-y-2">
                                  {orderItems.map((item, i) => (
                                    <li
                                      key={i}
                                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-base">💊</span>
                                        <span className="text-sm font-medium text-gray-700">
                                          {getMedicineName(item?.medicineID)}
                                        </span>
                                      </div>
                                      <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                                        ×{item?.quantity || 0}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            ) : (
                              <p className="py-2 text-center text-sm text-gray-400">
                                No items found
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
