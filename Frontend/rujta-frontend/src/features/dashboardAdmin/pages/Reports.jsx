import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ---------------- DATA ---------------- */

const stats = [
  { title: "Total Pharmacies", value: "24", sub: "+5.5% this month" },
  { title: "Active Rate", value: "83.3%" },
  { title: "Growth Rate", value: "+4.3%", sub: "+3.3% this week" },
  { title: "Suspend Rate", value: "16.7%" },
];

const growth = [
  { m: "May", v: 1 },
  { m: "Jun", v: 1.5 },
  { m: "Jul", v: 2 },
  { m: "Aug", v: 3 },
  { m: "Sep", v: 3.5 },
  { m: "Oct", v: 3.5 },
  { m: "Nov", v: 4 },
  { m: "Apr", v: 4.2 },
];

const activeTrend = [
  { m: "May", active: 30, suspended: 10 },
  { m: "Jun", active: 40, suspended: 20 },
  { m: "Jul", active: 50, suspended: 25 },
  { m: "Aug", active: 60, suspended: 35 },
  { m: "Sep", active: 65, suspended: 45 },
  { m: "Oct", active: 70, suspended: 55 },
  { m: "Nov", active: 75, suspended: 60 },
  { m: "Apr", active: 85, suspended: 75 },
];

const rows = [
  ["Al Noor", "Active", "Apr 17", "Apr 24, 2024", "High", "Low"],
  ["Seif Pharmacy", "Active", "Apr 18", "Apr 24, 2024", "Medium", "Medium"],
  ["Royal Pharmacy", "Active", "Apr 18", "Apr 24, 2024", "High", "Low"],
  ["Pharmacy Care", "Suspended", "Apr 16", "Apr 24, 2024", "Low", "Medium"],
  ["Dar El Fouad", "Suspended", "Apr 16", "Apr 24, 2024", "High", "High"],
  ["Health Plus", "Suspended", "Apr 16", "Apr 24, 2024", "Low", "Medium"],
];

/* ---------------- BADGE ---------------- */

const Badge = ({ text }) => {
  const map = {
    Active: "bg-green-100 text-green-700",
    Suspended: "bg-blue-100 text-blue-700",
    High: "bg-red-100 text-red-600",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs ${map[text]}`}>
      {text}
    </span>
  );
};

/* ---------------- PAGE ---------------- */

export default function Reports() {
  return (
    <div className="p-8 space-y-8 bg-[#f5f6fb] min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Reports</h1>
          <p className="text-gray-500 text-sm">
            Detailed analytics & performance insights
          </p>
        </div>

        <button className="bg-secondary text-white px-5 py-2 rounded-lg">
          Export Report ▼
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">{s.title}</p>
            <h2 className="text-2xl font-semibold mt-1">{s.value}</h2>
            {s.sub && (
              <p className="text-xs text-green-600 mt-1">{s.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6">

        {/* Growth */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">Pharmacy Growth</h3>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Line
                dataKey="v"
                stroke="#7ED957"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Active vs Suspended */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">
            Active vs Suspended Trend
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={activeTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Area
                dataKey="active"
                stroke="#7ED957"
                fill="#7ED95755"
              />
              <Area
                dataKey="suspended"
                stroke="#FF6B6B"
                fill="#FF6B6B55"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold mb-4">Pharmacies by Location</h3>

        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="py-3 text-left">Pharmacy</th>
              <th>Status</th>
              <th>Created</th>
              <th>Date</th>
              <th>Activity</th>
              <th>Risk</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="py-3 font-medium">{r[0]}</td>
                <td><Badge text={r[1]} /></td>
                <td>{r[2]}</td>
                <td>{r[3]}</td>
                <td><Badge text={r[4]} /></td>
                <td><Badge text={r[5]} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
          <div>Rows per page: 10</div>
          <div>1–7 of 7 | 1 2 3</div>
        </div>
      </div>

    </div>
  );
}
