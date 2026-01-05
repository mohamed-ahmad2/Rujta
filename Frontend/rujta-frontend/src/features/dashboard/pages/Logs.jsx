import React, { useState, useEffect } from "react";

const Logs = () => {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    role: "Staff",
    status: "Active",
  });

  // Fetch staff logs
  useEffect(() => {
    fetch("/api/staff") // replace with your API endpoint
      .then((res) => res.json())
      .then((data) => setStaff(data))
      .catch((err) => console.error(err));
  }, []);

  const handleInputChange = (e) => {
    setNewStaff({ ...newStaff, [e.target.name]: e.target.value });
  };

  const addStaff = () => {
    // Validate
    if (!newStaff.name || !newStaff.email) return alert("Please fill in all fields");

    fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStaff),
    })
      .then((res) => res.json())
      .then((staffMember) => {
        setStaff([...staff, staffMember]);
        setShowModal(false);
        setNewStaff({ name: "", email: "", role: "Staff", status: "Active" });
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-8 space-y-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Staff Logs</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-secondary hover:bg-green-500 text-white px-4 py-2 rounded shadow transition"
        >
          Add Staff
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-4 shadow flex flex-col">
          <h3 className="font-semibold text-gray-700 mb-2">Total Staff</h3>
          <span className="text-2xl font-bold">{staff.length}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow flex flex-col">
          <h3 className="font-semibold text-gray-700 mb-2">Active Staff</h3>
          <span className="text-2xl font-bold">
            {staff.filter((s) => s.status === "Active").length}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow flex flex-col">
          <h3 className="font-semibold text-gray-700 mb-2">Inactive Staff</h3>
          <span className="text-2xl font-bold">
            {staff.filter((s) => s.status !== "Active").length}
          </span>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t text-gray-700">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">{s.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      s.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-lg relative">
            <h2 className="text-xl font-bold mb-4">Add New Staff</h2>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={newStaff.name}
                onChange={handleInputChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={newStaff.email}
                onChange={handleInputChange}
              />
              <select
                name="role"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={newStaff.role}
                onChange={handleInputChange}
              >
                <option value="Staff">Staff</option>
                <option value="Pharmacist">Pharmacist</option>
              </select>
              <select
                name="status"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={newStaff.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={addStaff}
                className="px-4 py-2 rounded bg-secondary hover:bg-green-600 text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
