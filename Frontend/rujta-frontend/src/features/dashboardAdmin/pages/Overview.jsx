import React from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

/* ---------------- DATA EXACT LIKE IMAGE ---------------- */

const stats = [
  {
    title: "Total Pharmacies",
    value: 24,
    sub: "+5.5% this month",
    color: "bg-green-100",
  },
  {
    title: "New This Month",
    value: 5,
    sub: "+2 since last week",
    color: "bg-blue-100",
  },
  {
    title: "Active Pharmacies",
    value: 20,
    sub: "",
    color: "bg-yellow-100",
  },
  {
    title: "Pharmacies with Issues",
    value: 4,
    sub: "+25% this week",
    color: "bg-red-100",
  },
];

const growthData = [
  { name: "May", value: 1 },
  { name: "Jun", value: 2 },
  { name: "Jul", value: 2 },
  { name: "Aug", value: 3 },
  { name: "Sep", value: 4 },
  { name: "Oct", value: 4.5 },
  { name: "Nov", value: 4.8 },
  { name: "Apr", value: 5 },
];

const pieData = [
  { name: "Active", value: 87 },
  { name: "Suspended", value: 13 },
];

const activity = [
  { name: "Mega Pharmacy", city: "Zamalek", time: "2 min ago" },
  { name: "Al Noor", city: "Nasr City", time: "10 min ago" },
  { name: "Health Plus", city: "New Cairo", time: "30 min ago" },
  { name: "El Ezaby", city: "Maadi", time: "40 min ago" },
  { name: "Royal Pharmacy", city: "Dokki", time: "1 hour ago" },
];

const locationData = [
  { city: "Nasr City", value: 6 },
  { city: "Maadi", value: 5 },
  { city: "Dokki", value: 4 },
  { city: "Heliopolis", value: 4 },
  { city: "Zamalek", value: 3 },
  { city: "New Cairo", value: 2 },
];

/* ---------------- COMPONENT ---------------- */

export default function Dashboard() {
  return (
    <div className="p-10 bg-[#f7f8fb] min-h-screen space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, Super Admin!
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div
              className={`w-10 h-10 rounded-lg ${s.color} mb-4`}
            ></div>

            <p className="text-gray-500 text-sm">{s.title}</p>

            <h2 className="text-3xl font-bold text-gray-900 mt-1">
              {s.value}
            </h2>

            {s.sub && (
              <p className="text-xs text-green-600 mt-2">
                {s.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* CHART ROW */}
      <div className="grid grid-cols-3 gap-6">

        {/* LINE CHART */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-1">
            Pharmacy Growth Over Time
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Monthly added pharmacies
          </p>

          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#7ED957"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* DONUT CHART */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col items-center justify-center">
          <h3 className="font-semibold text-gray-800 mb-4">
            Pharmacy Status
          </h3>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
              >
                <Cell fill="#7ED957" />
                <Cell fill="#FF6B6B" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="text-center mt-2">
            <p className="text-3xl font-bold">87%</p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-3 gap-6">

        {/* BAR CHART */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">
            Pharmacies by Location
          </h3>

          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={locationData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#7ED957" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ACTIVITY LIST */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">
            Latest Activity
          </h3>

          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-gray-500">{a.city}</p>
                </div>
                <p className="text-gray-400">{a.time}</p>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full border rounded-lg py-2 text-sm text-green-700 hover:bg-green-50">
            Manage Pharmacies →
          </button>
        </div>
      </div>
    </div>
  );
}
