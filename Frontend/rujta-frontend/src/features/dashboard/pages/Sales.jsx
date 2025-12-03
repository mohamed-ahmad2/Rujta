import React from "react";
import SalesCard from "../components/SalesCard";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Sales() {
  const revenueData = [
    { day: "01", amount: 7000 },
    { day: "02", amount: 13000 },
    { day: "03", amount: 9000 },
    { day: "04", amount: 11000 },
    { day: "05", amount: 8000 },
    { day: "06", amount: 10000 },
    { day: "07", amount: 18657 },
    { day: "08", amount: 12000 },
    { day: "09", amount: 9500 },
    { day: "10", amount: 14000 },
    { day: "11", amount: 9000 },
    { day: "12", amount: 10500 },
    { day: "13", amount: 11500 },
  ];

  // Heatmap levels
  const heatmapLevels = [
    0,0,0,0,0,0,0,
    0,0,0,2,0,0,0,
    0,0,1,3,1,0,0,
    0,1,2,4,2,1,0,
    0,0,1,3,1,0,0,
    0,0,0,2,0,0,0,
    0,0,0,1,0,0,0,
    0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,
  ];

  return (
    <div className="space-y-10">

      {/* ===== TOP STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SalesCard title="Total Revenue" value="$112,200" percent="+ 2% Since last week" positive dark />
        <SalesCard title="Total Profit" value="$12,500" percent="+ 8% Since last week" positive />
        <SalesCard title="Total Cost" value="$48,200" percent="+ 0.2% Since last week" />
        <SalesCard title="Average Order Value" value="$96.50" percent="+ 5% Since last week" positive />
      </div>

      {/* ===== REVENUE CHART ===== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Total Revenue</h2>

          <button className="border px-3 py-1 rounded-xl text-sm">This Month</button>
        </div>

        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="amount" radius={[10, 10, 10, 10]} fill="#9DC873" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== GRID SECTION ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ==== HEATMAP CARD ==== */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-emerald-900/10"></span> 500+
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-emerald-900/25"></span> 1,000+
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-emerald-900/50"></span> 2,000+
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-emerald-900/80"></span> 3,000+
            </span>
          </div>

          <h2 className="text-lg font-semibold mt-2">Orders By Time</h2>

          {/* HEATMAP GRID */}
          <div className="mt-4 grid grid-cols-7 gap-2">
            {heatmapLevels.map((lvl, i) => (
              <div
                key={i}
                className={`
                  h-8 rounded-lg 
                  ${lvl === 0 && "bg-emerald-900/10"} 
                  ${lvl === 1 && "bg-emerald-900/25"} 
                  ${lvl === 2 && "bg-emerald-900/40"} 
                  ${lvl === 3 && "bg-emerald-900/60"} 
                  ${lvl === 4 && "bg-emerald-900"}
                `}
              ></div>
            ))}
          </div>

          {/* DAYS LABELS */}
          <div className="mt-4 grid grid-cols-7 text-center text-xs text-gray-500">
            {["Sat","Sun","Mon","Tue","Wed","Thu","Fri"].map((d,i)=>
              <span key={i}>{d}</span>
            )}
          </div>
        </div>

        {/* ==== TOP PRODUCTS ==== */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 col-span-2 max-w-md">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <button className="border px-3 py-1 rounded-xl text-sm">This Month</button>
          </div>

          <div className="mt-5 space-y-6">
            {[
              { name: "Keytruda (Pembrolizumab)", sold: 359, price: "$356" },
              { name: "Ozempic (semaglutide)", sold: 300, price: "$156" },
              { name: "Dupixent (dupilumab)", sold: 289, price: "$254" },
              { name: "Eliquis (apixaban)", sold: 248, price: "$59" },
              { name: "Darzalex (daratumumab)", sold: 220, price: "$189" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://picsum.photos/50?random=${i}`}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-medium">{p.name}</h4>
                    <p className="text-gray-400 text-sm">{p.sold} sold</p>
                  </div>
                </div>
                <p className="font-semibold">{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== RECENT ORDERS ===== */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Order</h2>
          <button className="text-sm text-gray-500 hover:text-gray-700">View All</button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-3 text-left">Order ID</th>
                <th className="py-3 text-left">Medicine Name</th>
                <th className="py-3 text-left">Price</th>
                <th className="py-3 text-left">Order Status</th>
                <th className="py-3 text-left">Payment Status</th>
                <th className="py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {/* ROWS */}
              {[
                ["#ORD576","Paid","Completed","Paracetamol (2)\nIbuprofen (1)","$25.50","secondary"],
                ["#ORD575","Pending","In progress","Amoxicillin (3),\nCetirizine (2)","$42.00","yellow"],
                ["#ORD574","Paid","Pending","Loratadine (1),\nOmeprazole (1)","$15.00","secondary"],
                ["#ORD573","Paid","Completed","Aspirin (4),\nHydrocodone (1)","$48.00","secondary"],
              ].map((row,i)=>(
                <tr key={i} className="border-b">
                  <td className="py-4">{row[0]}</td>
                  <td className="whitespace-pre-line">{row[3]}</td>
                  <td>{row[4]}</td>
                  <td>
                    <span className={`px-3 py-1 text-xs rounded-full bg-secondary/20 text-secondary font-medium`}>
                      {row[1]}
                    </span>
                  </td>
                  <td>
                    <span className={`px-3 py-1 text-xs rounded-full 
                      ${row[2] === "Completed" && "bg-emerald-100 text-emerald-600"}
                      ${row[2] === "Pending" && "bg-yellow-100 text-yellow-600"}
                      ${row[2] === "In progress" && "bg-orange-100 text-orange-600"}
                    `}>
                      {row[2]}
                    </span>
                  </td>
                  <td className="text-center">
                    <button className="text-gray-400 hover:text-gray-600">•••</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
