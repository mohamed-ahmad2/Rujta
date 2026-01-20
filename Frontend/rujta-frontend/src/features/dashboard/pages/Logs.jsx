import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth"; // Adjust the path if needed
import { usePharmacists } from "../../pharmacists/hook/usePharmacists";

const Logs = () => {
  const { handleRegisterStaff } = useAuth();
  const { fetchPharmacyStaff, loading } = usePharmacists();
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
  const itemsPerPage = 10; // Number of staff per page

  // Fetch staff using fetchPharmacyStaff
  useEffect(() => {
    const loadStaff = async () => {
      const data = await fetchPharmacyStaff();
      // Map data to match display needs based on PharmacistDto fields (use camelCase as per JSON)
      const enhancedData = (data || []).map((p) => ({
        id: p.id,
        name: p.fullName,
        email: p.email,
        phone: p.phone,
        role: "Pharmacist", // Hardcoded role as per request
        hireDate: p.hireDate
          ? new Date(p.hireDate).toLocaleDateString()
          : "N/A",
      }));
      setStaff(enhancedData);
    };
    loadStaff();
  }, [fetchPharmacyStaff]);

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

      // Add new staff to local state with PharmacistDto-aligned fields (camelCase for consistency)
      const newStaffMember = {
        id: response.UserId,
        name: newStaff.name,
        email: response.Email,
        phone: newStaff.phone,
        role: newStaff.role,
        hireDate: new Date().toLocaleDateString(), // Use current date since not provided in DTO
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

  // Pagination calculations
  const totalPages = Math.ceil(staff.length / itemsPerPage);
  const currentStaff = staff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Stats calculations
  const recentHires = staff.filter((s) => {
    const hireDate = new Date(s.hireDate);
    return hireDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }).length;

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

      {/* Stats Cards - Removed Average Salary */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-4 shadow flex flex-col">
          <h3 className="font-semibold text-gray-700 mb-2">Total Staff</h3>
          <span className="text-2xl font-bold">{staff.length}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow flex flex-col">
          <h3 className="font-semibold text-gray-700 mb-2">
            Recent Hires (30 days)
          </h3>
          <span className="text-2xl font-bold">{recentHires}</span>
        </div>
      </div>

      {/* Staff Table - Adjusted columns to match request: Replaced Position with Role */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Hire Date</th>
            </tr>
          </thead>
          <tbody>
            {currentStaff.map((s) => (
              <tr key={s.id} className="border-t text-gray-700">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">{s.phone}</td>
                <td className="px-4 py-3">{s.role}</td>
                <td className="px-4 py-3">{s.hireDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            &lt;&lt;
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-2 py-1 rounded ${
                currentPage === page
                  ? "bg-secondary text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            &gt;
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            &gt;&gt;
          </button>
        </div>
      )}

      {/* Modal - Adjusted to match RegisterByAdminDto: Removed hireDate and salary */}
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
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={newStaff.phone}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="location"
                placeholder="Location (e.g., EG)"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={newStaff.location}
                onChange={handleInputChange}
              />
              <input
                type="password"
                name="createPassword"
                placeholder="Password"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={newStaff.createPassword}
                onChange={handleInputChange}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={newStaff.confirmPassword}
                onChange={handleInputChange}
              />
              <select
                name="role"
                className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={newStaff.role}
                onChange={handleInputChange}
              >
                <option value="Pharmacist">Pharmacist</option>
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
