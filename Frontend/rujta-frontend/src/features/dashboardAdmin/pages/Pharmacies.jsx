import React, { useMemo, useState } from "react";
import { Search, Plus, Eye, Edit, AlertTriangle } from "lucide-react";

/* ---------------- DATA ---------------- */

const stats = [
  { title: "Total Pharmacies", value: 24, sub: "+5.5% this month", color: "bg-green-100" },
  { title: "New This Month", value: 5, sub: "+2 since last week", color: "bg-blue-100" },
  { title: "Active Pharmacies", value: 20, sub: "", color: "bg-yellow-100" },
  { title: "Inactive/Suspended", value: 4, sub: "+25% this week", color: "bg-red-100" },
];

const pharmacies = [
  { name: "Al Noor", phone: "01012345678", location: "Nasr City", email: "admin1@alnoor.com", status: "Active" },
  { name: "Seif Pharmacy", phone: "01165498732", location: "Maadi", email: "admin2@seif.com", status: "Active" },
  { name: "Royal Pharmacy", phone: "01298765432", location: "Dokki", email: "admin3@royal.com", status: "Active" },
  { name: "Pharmacy Care", phone: "01512398765", location: "Heliopolis", email: "admin4@care.com", status: "Active" },
  { name: "Dar El Fouad Pharmacy", phone: "01099887766", location: "Nasr City", email: "admin5@darfouad.com", status: "Suspended" },
  { name: "Mega Pharmacy", phone: "01022223333", location: "Zamalek", email: "admin6@mega.com", status: "Suspended" },
  { name: "Health Plus", phone: "01222224444", location: "New Cairo", email: "admin7@healthplus.com", status: "Active" },
];

/* ---------------- COMPONENT ---------------- */

export default function Pharmacies() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 7;

  const filtered = useMemo(() => {
    if (!q) return pharmacies;
    return pharmacies.filter((p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.location.toLowerCase().includes(q.toLowerCase())
    );
  }, [q]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const data = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-8 bg-[#f5f6fb] min-h-screen space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">Pharmacies</h1>
        <p className="text-gray-500 text-sm">
          Manage and control all registered pharmacies
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className={`w-10 h-10 rounded-lg ${s.color}`} />
            <p className="text-xs text-gray-500 mt-4">{s.title}</p>
            <h2 className="text-2xl font-semibold">{s.value}</h2>
            {s.sub && <p className="text-xs text-green-600 mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Table container */}
      <div className="bg-white rounded-xl shadow-sm border p-6">

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Pharmacies</h3>

          <button className="flex items-center gap-2 bg-secondary text-white px-5 py-2 rounded-full">
            <Plus size={16} /> Add Pharmacy
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg mb-4 w-1/2">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search pharmacy by name or location..."
            className="bg-transparent outline-none w-full text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="py-3 text-left">Name</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Admin Email</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((p, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="py-3 font-medium">{p.name}</td>
                <td>{p.phone}</td>
                <td>{p.location}</td>
                <td>{p.email}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      p.status === "Active"
                        ? "bg-green-100 text-secondary"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="flex gap-3">
                  <Eye size={18} className="cursor-pointer" />
                  <Edit size={18} className="cursor-pointer" />
                </td>

                <td>
                  <AlertTriangle size={18} className="text-red-500 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
          <div>Rows per page: 10</div>

          <div className="flex items-center gap-2">
            <span>1–7 of {filtered.length}</span>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-3 py-1 rounded ${
                  page === n
                    ? "bg-secondary text-white"
                    : "border"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
