import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Search, X } from "lucide-react";
import { useCustomers } from "../../customerOrders/hook/useCustomerOrders";
import CustomersCard from "../components/CustomersCard";
import { useSpring, animated } from "@react-spring/web";

// Toast component
const Toast = ({ type, message, onClose }) => (
  <div
    className={`fixed top-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white z-50 animate-fadeIn ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`}
  >
    {message}
    <button onClick={onClose} className="ml-4 font-bold">
      <X size={16} />
    </button>
  </div>
);

export default function Customers() {
  const pharmacyId = 1; // replace with logged-in pharmacy id
  const {
    customers,
    stats,
    loading,
    addCustomer,
    editCustomer,
    removeCustomer,
    searchByPhone,
    refetch,
  } = useCustomers(pharmacyId);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editing, setEditing] = useState(null);
  const [searchPhone, setSearchPhone] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "" });

  // Sync filteredCustomers with backend data
  useEffect(() => {
    setFilteredCustomers(customers);
  }, [customers]);

  // Animate stats numbers
  const totalAnim = useSpring({ number: stats.totalCustomers, from: { number: 0 } });
  const newAnim = useSpring({ number: stats.newCustomers, from: { number: 0 } });
  const returningAnim = useSpring({ number: stats.returningCustomers, from: { number: 0 } });

  // Input handler
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Open Add Modal
  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", phoneNumber: "" });
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEdit = (customer) => {
    setEditing({ id: customer.id });
    setForm({
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
    });
    setModalOpen(true);
  };

  // Submit Add/Edit
  const handleSubmit = async () => {
    const payload = {
      Name: form.name,
      PhoneNumber: form.phoneNumber,
      Email: form.email || "",
      PharmacyId: pharmacyId,
    };
    try {
      if (editing) await editCustomer(editing.id, payload);
      else await addCustomer(payload);
      setModalOpen(false);
      await refetch();
      setNotification({
        type: "success",
        message: editing ? "Customer updated" : "Customer added",
      });
    } catch (err) {
      console.error("Submit error:", err);
      setNotification({ type: "error", message: "Failed to submit customer data" });
    }
  };

  // Open Delete Modal
  const confirmDelete = (customer) => {
    setDeleteTarget(customer);
    setDeleteModalOpen(true);
  };

  // Delete customer
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeCustomer(deleteTarget.id);
      await refetch();
      setNotification({ type: "success", message: "Customer deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err);
      setNotification({ type: "error", message: "Failed to delete customer" });
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  // Search by phone
  const handleSearch = async () => {
    if (!searchPhone) {
      setFilteredCustomers(customers);
      return;
    }
    try {
      const res = await searchByPhone(searchPhone);
      if (res.data.exists) {
        const matched = customers.filter((c) =>
          c.phoneNumber.includes(searchPhone)
        );
        setFilteredCustomers(matched);
        setNotification({ type: "success", message: "Customer found" });
      } else {
        setFilteredCustomers([]);
        setNotification({ type: "error", message: "Customer not found" });
      }
    } catch (err) {
      console.error("Search error:", err);
      setNotification({ type: "error", message: "Error searching customer" });
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto relative">
      {/* Notification */}
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Animated Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <CustomersCard
          title="Total Customers"
          value={<animated.span>{totalAnim.number.to((n) => n.toFixed(0))}</animated.span>}
        />
        <CustomersCard
          title="New Customers"
          value={<animated.span>{newAnim.number.to((n) => n.toFixed(0))}</animated.span>}
        />
        <CustomersCard
          title="Returning Customers"
          value={<animated.span>{returningAnim.number.to((n) => n.toFixed(0))}</animated.span>}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by phone..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition"
          >
            <Search size={16} /> Search
          </button>
          <button
            onClick={() => {
              setSearchPhone("");
              setFilteredCustomers(customers);
            }}
            className="bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Clear
          </button>
        </div>
        <button
          onClick={openAdd}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-gray-600 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-center text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No customers found
                </td>
              </tr>
            )}
            {!loading &&
              filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4">{c.email}</td>
                  <td className="px-6 py-4">{c.phoneNumber}</td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => confirmDelete(c)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative animate-fadeIn">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">{editing ? "Edit Customer" : "Add Customer"}</h2>
            <div className="space-y-3">
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                name="phoneNumber"
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                {editing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm p-6 rounded-xl shadow-lg animate-fadeIn">
            <h3 className="text-lg font-semibold mb-4">Delete Customer</h3>
            <p className="mb-6">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}