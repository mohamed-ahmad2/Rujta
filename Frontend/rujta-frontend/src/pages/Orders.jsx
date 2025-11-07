import React, { useState } from "react";
import { Search, Truck, Clock, CheckCircle2, Package } from "lucide-react";

export default function Orders() {
  const [orders] = useState([
    {
      id: 1,
      customer: "Mohamed Ahmed ",
      items: "Paracetamol (2), Amoxicillin (1)",
      total: 120,
      status: "Delivered",
    },
    {
      id: 2,
      customer: "Youssef weal",
      items: "Ibuprofen (3)",
      total: 90,
      status: "Pending",
    },
    {
      id: 3,
      customer: "Omar Hassan",
      items: "Vitamin C (1), Cough Syrup (1)",
      total: 150,
      status: "In Transit",
    },
  ]);

  const [search, setSearch] = useState("");

  const filteredOrders = orders.filter(
    (o) =>
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.status.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
            <CheckCircle2 size={16} /> {status}
          </span>
        );
      case "Pending":
        return (
          <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium">
            <Clock size={16} /> {status}
          </span>
        );
      case "In Transit":
        return (
          <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-sm font-medium">
            <Truck size={16} /> {status}
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <Package className="text-blue-600" />
          Customer Orders
        </h2>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-1/3 mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by customer or status..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="grid gap-4">
          {filteredOrders.map((o) => (
            <div
              key={o.id}
              className="bg-white shadow-md rounded-xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div>
                <p className="text-gray-500 text-sm">Order #{o.id}</p>
                <h3 className="text-lg font-semibold text-gray-800">
                  {o.customer}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{o.items}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8 mt-4 sm:mt-0">
                <p className="text-blue-700 font-semibold text-lg">
                  {o.total} EGP
                </p>
                {getStatusBadge(o.status)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <p>No matching orders found 😕</p>
        </div>
      )}
    </div>
  );
}
