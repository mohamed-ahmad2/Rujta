import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth"; // Adjust the path if needed
import { usePharmacists } from "../../pharmacists/hook/usePharmacists";
import { usePresence } from "../../../context/usePresence"; // Assuming the path is correct based on provided files

const Logs = () => {
  const { handleRegisterStaff } = useAuth();
  const { fetchPharmacyStaff, loading: pharmacistsLoading } = usePharmacists();
  const { onlineUsers } = usePresence(); // Get online users from PresenceContext
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    createPassword: "",
    confirmPassword: "",
    role: "Pharmacist",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all"); // New: Filter by online/offline
  const [searchTerm, setSearchTerm] = useState(""); // New: Search functionality
  const itemsPerPage = 10;

  // Fetch staff and enhance with online status
  useEffect(() => {
    const loadStaff = async () => {
      const data = await fetchPharmacyStaff();
      const enhancedData = (data || []).map((p) => ({
        id: p.id,
        name: p.fullName,
        email: p.email,
        phone: p.phone,
        role: "Pharmacist",
        hireDate: p.hireDate
          ? new Date(p.hireDate).toLocaleDateString()
          : "N/A",
        isOnline: onlineUsers.includes(p.id), // Determine online status from onlineUsers (userId)
      }));
      setStaff(enhancedData);
    };
    loadStaff();
  }, [fetchPharmacyStaff, onlineUsers]); // Re-fetch when onlineUsers change

  const handleInputChange = (e) => {
    setNewStaff({ ...newStaff, [e.target.name]: e.target.value });
  };

  const addStaff = async () => {
    if (
      !newStaff.name ||
      !newStaff.email ||
      !newStaff.phone ||
      !newStaff.location ||
      !newStaff.createPassword ||
      !newStaff.confirmPassword
    ) {
      return alert("Please fill in all required fields");
    }

    if (newStaff.createPassword !== newStaff.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const response = await handleRegisterStaff({
        Name: newStaff.name,
        Email: newStaff.email,
        Phone: newStaff.phone,
        Location: newStaff.location,
        CreatePassword: newStaff.createPassword,
        ConfirmPassword: newStaff.confirmPassword,
        Role: newStaff.role,
      });

      const newStaffMember = {
        id: response.UserId,
        name: newStaff.name,
        email: response.Email,
        phone: newStaff.phone,
        role: newStaff.role,
        hireDate: new Date().toLocaleDateString(),
        isOnline: false, // New staff starts offline
      };

      setStaff([...staff, newStaffMember]);
      setShowModal(false);
      setNewStaff({
        name: "",
        email: "",
        phone: "",
        location: "",
        createPassword: "",
        confirmPassword: "",
        role: "Pharmacist",
      });
    } catch (err) {
      console.error("Add staff failed:", err);
      alert(
        "Failed to add staff: " + (err.response?.data?.message || err.message),
      );
    }
  };

  // Filter and search staff
  const filteredStaff = staff
    .filter((s) => {
      if (filterStatus === "online") return s.isOnline;
      if (filterStatus === "offline") return !s.isOnline;
      return true;
    })
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  // Pagination calculations
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const currentStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Stats calculations
  const totalStaff = staff.length;
  const onlineCount = staff.filter((s) => s.isOnline).length;
  const offlineCount = totalStaff - onlineCount;
  const recentHires = staff.filter((s) => {
    const hireDate = new Date(s.hireDate);
    return hireDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }).length;

  return (
    <div className="p-8 space-y-6 bg-gray-100 min-h-screen">
      {/* Header with Search and Filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Staff Logs</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="bg-secondary hover:bg-green-500 text-white px-4 py-2 rounded shadow transition"
          >
            Add Staff
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-4 shadow flex flex-col items-center text-center">
          <h3 className="font-semibold text-gray-700 mb-2">Total Staff</h3>
          <span className="text-2xl font-bold">{totalStaff}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow flex flex-col items-center text-center">
          <h3 className="font-semibold text-gray-700 mb-2">Online</h3>
          <span className="text-2xl font-bold text-green-600">
            {onlineCount}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow flex flex-col items-center text-center">
          <h3 className="font-semibold text-gray-700 mb-2">Offline</h3>
          <span className="text-2xl font-bold text-red-600">
            {offlineCount}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow flex flex-col items-center text-center">
          <h3 className="font-semibold text-gray-700 mb-2">
            Recent Hires (30 days)
          </h3>
          <span className="text-2xl font-bold">{recentHires}</span>
        </div>
      </div>

      {/* Staff Table with Status Column */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-left table-auto min-w-max">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Hire Date</th>
              <th className="px-4 py-3">Status</th> {/* New Status Column */}
            </tr>
          </thead>
          <tbody>
            {pharmacistsLoading ? (
              <tr>
                <td colSpan="6" className="px-4 py-3 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : currentStaff.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-3 text-center text-gray-500">
                  No staff found
                </td>
              </tr>
            ) : (
              currentStaff.map((s) => (
                <tr
                  key={s.id}
                  className="border-t text-gray-700 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.phone}</td>
                  <td className="px-4 py-3">{s.role}</td>
                  <td className="px-4 py-3">{s.hireDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        s.isOnline
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-1 ${
                          s.isOnline ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      {s.isOnline ? "Online" : "Offline"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
          >
            &lt;&lt;
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-secondary text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              } transition`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
          >
            &gt;
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
          >
            &gt;&gt;
          </button>
        </div>
      )}

      {/* Improved Modal with Better UX (e.g., labels, better layout) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-xl font-bold mb-4">Add New Staff</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="mt-1 border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={newStaff.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="mt-1 border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={newStaff.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  className="mt-1 border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={newStaff.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location (e.g., EG)
                </label>
                <input
                  type="text"
                  name="location"
                  className="mt-1 border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={newStaff.location}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="createPassword"
                  className="mt-1 border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={newStaff.createPassword}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="mt-1 border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={newStaff.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  className="mt-1 border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={newStaff.role}
                  onChange={handleInputChange}
                >
                  <option value="Pharmacist">Pharmacist</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={addStaff}
                className="px-4 py-2 rounded bg-secondary hover:bg-green-600 text-white transition"
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
