import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Search, X } from "lucide-react";
import { useCustomers } from "../../customerOrders/hook/useCustomerOrders";
import CustomersCard from "../components/CustomersCard";
import { useSpring, animated } from "@react-spring/web";

// Toast component
const Toast = ({ type, message, onClose }) => (
  <div
    className={`animate-fadeIn fixed left-4 right-4 top-4 z-50 flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-white shadow-lg sm:left-auto sm:right-6 sm:top-6 sm:px-4 sm:py-3 sm:text-base ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
  >
    <span>{message}</span>
    <button
      onClick={onClose}
      className="flex-shrink-0 transition hover:opacity-80"
      aria-label="Close"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

export default function Customers() {
  const pharmacyId = 1;
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

  useEffect(() => {
    setFilteredCustomers(customers);
  }, [customers]);

  const totalAnim = useSpring({
    number: stats.totalCustomers,
    from: { number: 0 },
  });
  const newAnim = useSpring({
    number: stats.newCustomers,
    from: { number: 0 },
  });
  const returningAnim = useSpring({
    number: stats.returningCustomers,
    from: { number: 0 },
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", phoneNumber: "" });
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditing({ id: customer.id });
    setForm({
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
    });
    setModalOpen(true);
  };

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
      setNotification({
        type: "error",
        message: "Failed to submit customer data",
      });
    }
  };

  const confirmDelete = (customer) => {
    setDeleteTarget(customer);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeCustomer(deleteTarget.id);
      await refetch();
      setNotification({
        type: "success",
        message: "Customer deleted successfully",
      });
    } catch (err) {
      console.error("Delete error:", err);
      setNotification({ type: "error", message: "Failed to delete customer" });
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleSearch = async () => {
    if (!searchPhone) {
      setFilteredCustomers(customers);
      return;
    }
    try {
      const res = await searchByPhone(searchPhone);
      if (res.data.exists) {
        const matched = customers.filter((c) =>
          c.phoneNumber.includes(searchPhone),
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
    <div className="relative mx-auto max-w-7xl space-y-4 p-3 sm:space-y-6 sm:p-4 md:space-y-8 md:p-6">
      {/* Notification */}
      {notification && (
        <Toast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-6">
        <CustomersCard
          title="Total Customers"
          value={
            <animated.span>
              {totalAnim.number.to((n) => n.toFixed(0))}
            </animated.span>
          }
        />
        <CustomersCard
          title="New Customers"
          value={
            <animated.span>
              {newAnim.number.to((n) => n.toFixed(0))}
            </animated.span>
          }
        />
        <CustomersCard
          title="Returning Customers"
          value={
            <animated.span>
              {returningAnim.number.to((n) => n.toFixed(0))}
            </animated.span>
          }
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="flex w-full flex-1 gap-2 sm:w-auto sm:max-w-md">
          <input
            type="text"
            placeholder="Search by phone..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
          />
          <button
            onClick={handleSearch}
            className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition hover:bg-blue-700 sm:px-4 sm:text-base"
          >
            <Search className="h-4 w-4" />
            <span className="xs:inline hidden sm:inline">Search</span>
          </button>
          <button
            onClick={() => {
              setSearchPhone("");
              setFilteredCustomers(customers);
            }}
            className="flex-shrink-0 rounded-lg bg-gray-200 px-3 py-2 text-sm transition hover:bg-gray-300 sm:text-base"
          >
            Clear
          </button>
        </div>

        {/* Add Button */}
        <button
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition hover:bg-green-700 sm:w-auto sm:px-4 sm:text-base"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Table — Scroll على الموبايل */}
      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-600 sm:px-4 sm:py-3 sm:text-sm md:px-6">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-600 sm:px-4 sm:py-3 sm:text-sm md:px-6">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-600 sm:px-4 sm:py-3 sm:text-sm md:px-6">
                  Phone
                </th>
                <th className="px-3 py-2 text-center text-xs uppercase tracking-wider text-gray-600 sm:px-4 sm:py-3 sm:text-sm md:px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4" className="py-8 text-center sm:py-10">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="py-8 text-center text-sm text-gray-500 sm:py-10 sm:text-base"
                  >
                    No customers found
                  </td>
                </tr>
              )}

              {!loading &&
                filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t transition hover:bg-gray-50"
                  >
                    <td className="max-w-[120px] truncate px-3 py-3 text-sm sm:max-w-none sm:px-4 sm:py-4 sm:text-base md:px-6">
                      {c.name}
                    </td>
                    <td className="max-w-[140px] truncate px-3 py-3 text-sm sm:max-w-none sm:px-4 sm:py-4 sm:text-base md:px-6">
                      {c.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm sm:px-4 sm:py-4 sm:text-base md:px-6">
                      {c.phoneNumber}
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 md:px-6">
                      <div className="flex justify-center gap-2 sm:gap-3">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded p-1 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                          aria-label="Edit"
                        >
                          <Edit className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                        </button>
                        <button
                          onClick={() => confirmDelete(c)}
                          className="rounded p-1 text-red-600 transition hover:bg-red-50 hover:text-red-800"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="animate-fadeIn relative max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-lg sm:max-w-md sm:rounded-xl sm:p-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 sm:right-4 sm:top-4"
              aria-label="Close"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <h2 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg md:text-xl">
              {editing ? "Edit Customer" : "Add Customer"}
            </h2>

            <div className="space-y-3">
              {[
                { name: "name", placeholder: "Name" },
                { name: "email", placeholder: "Email" },
                { name: "phoneNumber", placeholder: "Phone Number" },
              ].map((field) => (
                <input
                  key={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                />
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-100 sm:px-4 sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition hover:bg-blue-700 sm:px-4 sm:text-base"
              >
                {editing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setDeleteModalOpen(false)
          }
        >
          <div className="animate-fadeIn w-full rounded-t-2xl bg-white p-4 shadow-lg sm:max-w-sm sm:rounded-xl sm:p-6">
            <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
              Delete Customer
            </h3>
            <p className="mb-4 text-sm text-gray-600 sm:mb-6 sm:text-base">
              Are you sure you want to delete{" "}
              <strong className="text-gray-800">{deleteTarget.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-lg border px-3 py-2 text-sm transition hover:bg-gray-100 sm:px-4 sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700 sm:px-4 sm:text-base"
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
