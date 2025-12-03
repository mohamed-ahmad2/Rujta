import React from "react";
import StatCard from "../components/StatCard";
import UserImage from "../../../assets/change/HeroImg1.png";

import { Eye, Edit, Trash2 } from "lucide-react";
import { DollarSign, Users, ShoppingCart } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/**
 * Overview.jsx
 *
 * - Requires Tailwind CSS in your project
 * - Requires `recharts`: npm install recharts
 * - Uses the uploaded image at: /mnt/data/91702ec5-0808-4625-bc5d-814ee4cb1358.png
 *
 * Paste this file into: src/dashbord/pages/Overview.jsx
 */

const salesData = [
  { month: "01", value: 5000 },
  { month: "02", value: 8000 },
  { month: "03", value: 6000 },
  { month: "04", value: 12000 },
  { month: "05", value: 9000 },
  { month: "06", value: 16000 },
  { month: "07", value: 18657 },
  { month: "08", value: 14000 },
  { month: "09", value: 10000 },
  { month: "10", value: 15000 },
  { month: "11", value: 8000 },
  { month: "12", value: 6000 },
];

const latestOrders = [
  { id: "#ORD576", name: "Atorvastatin", price: "$18.00", status: "Delivered" },
  { id: "#ORD575", name: "Omeprazole", price: "$12.00", status: "Pending" },
  { id: "#ORD574", name: "Metformin", price: "$27.00", status: "Pending" },
  { id: "#ORD573", name: "Amlodipine", price: "$22.00", status: "Delivered" },
];



export default function Overview() {
  return (
    <div className="space-y-6">

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left column (main content) */}
        <div className="col-span-8 space-y-6">

          {/* Stats cards */}
          <div className="flex gap-4">

        <StatCard
          title="Total Profit"
          value="$12,500"
          sub="Since last week"
          change="+ 2%"
          positive={true}
          dark={true}
          icon={<span className="text-xl">💵</span>}
        />

        <StatCard
          title="Total Customers"
          value="1,200"
          sub="Since last week"
          change="- 0.2%"
          positive={false}
          icon={<span className="text-xl">👥</span>}
        />

        <StatCard
          title="Total Orders"
          value="2,549"
          sub="Since last week"
          change="+ 6%"
          positive={true}
          icon={<span className="text-xl">🛒</span>}
        />

      </div>


          {/* Sales Analytics */}
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Sales Analytics</h3>
              <div className="flex items-center gap-2">
               <select className="text-sm bg-white/80 border rounded px-2 py-1">
                  <option>This Month</option>
                  <option>Last Month</option>
                </select>
              </div>
            </div>

            <div style={{ height: 220 }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#f3f3f3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#9CA3AF" }} />
                  <YAxis tick={{ fill: "#9CA3AF" }} />
                  <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]} fill="#9DC873" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Latest Orders table */}
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Latest Orders</h3>
              <a className="text-sm text-black ">View All</a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-500">
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">Medicine Name</th>
                    <th className="py-3 px-2">Price</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {latestOrders.map((o) => (
                     <tr key={o.id} className="border-t">
                      <td className="py-3 px-2 font-medium">{o.id}</td>
                      <td className="py-3 px-2 text-gray-700">{o.name}</td>
                      <td className="py-3 px-2">{o.price}</td>
                      <td className="py-3 px-2">
                        <span className={`px-3 py-1 rounded-full text-xs ${o.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-500">
                        <div className="flex items-center gap-3">
                          <Eye size={18} className="cursor-pointer hover:text-green-600 transition" />
                          <Edit size={18} className="cursor-pointer hover:text-blue-600 transition" />
                          <Trash2 size={18} className="cursor-pointer text-red-500 hover:text-red-700 transition" />
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right column (sidebar widgets) */}
        <div className="col-span-4 space-y-6">

          {/* Right top hero card */}
          <div className="bg-white rounded-2xl p-4 shadow overflow-hidden relative">
            <img
              src={UserImage}
              alt="hero"
              className="w-full h-45 object-cover rounded-lg mb-3"
            />
            <div className="absolute left-4 bottom-4 bg-white/90 rounded px-3 py-2">
              <h4 className="font-semibold text-sm">Discover How to Maximize Your Pharmacy's Efficiency</h4>
              <button className="mt-2 text-xs text-green-700">Learn more ↗</button>
            </div>
          </div>

          {/* Top Selling Medicine */}
<div className="bg-white rounded-2xl p-6 shadow-sm">
  <div className="flex items-center justify-between mb-6">
    <h3 className="font-semibold text-[17px]">Top Selling Medicine</h3>

   <div className="flex items-center gap-2">
      <select className="text-sm bg-white/80 border rounded px-2 py-1">
        <option>This Month</option>
        <option>Last Month</option>
      </select>
    </div>
  </div>

  {/* Bar Chart */}
  <div className="flex items-end justify-center gap-10 mt-6">

    {/* Orange Bar */}
    <div className="flex flex-col items-center">
      <div className="w-14 h-[160px] bg-[#FF7A30] rounded-t-3xl"></div>
      <p className="mt-3 text-sm font-medium text-gray-700">$5,000</p>
      <p className="text-[11px] text-gray-500 mt-1">
        Keytruda <br /> Pembrolizumab
      </p>
    </div>

    {/* Black Bar */}
    <div className="flex flex-col items-center">
      <div className="w-14 h-[120px] bg-black rounded-t-3xl"></div>
      <p className="mt-3 text-sm font-medium text-gray-700">$3,000</p>
      <p className="text-[11px] text-gray-500 mt-1">
        Ozempic <br /> Semaglutide
      </p>
    </div>

    {/* Green Bar */}
    <div className="flex flex-col items-center">
      <div className="w-14 h-[80px] bg-[#7ED957] rounded-t-3xl"></div>
      <p className="mt-3 text-sm font-medium text-gray-700">$1,500</p>
      <p className="text-[11px] text-gray-500 mt-1">
        Dupixent <br /> Dupilumab
      </p>
    </div>

  </div>
</div>


        </div>
      </div>
    </div>
  );
}
