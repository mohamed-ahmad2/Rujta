import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  X,
  PlusCircle,
  ShoppingCart,
  Package,
  ClipboardList,
  Clock,
} from "lucide-react";
import { useCustomers } from "../../customerOrders/hook/useCustomerOrders";
import CustomersCard from "../components/CustomersCard";
import { useSpring, animated } from "@react-spring/web";
import { toast } from "react-toastify";
import useMedicine from "../../medicines/hook/useMedicines";
//import { createOrder } from "../../customerOrders/api/customerOrdersApi";

// ─── Toast Component ─────────────────────────────────────────────────────────
const Toast = ({ type, message, onClose }) => (
  <div
    className={`animate-fadeIn fixed left-4 right-4 top-4 z-50 flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-white shadow-lg sm:left-auto sm:right-6 sm:top-6 sm:px-4 sm:py-3 sm:text-base ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`}
  >
    <span>{message}</span>
    <button
      onClick={onClose}
      className="flex-shrink-0 transition hover:opacity-80"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

// ─── Medicine Search Input ───────────────────────────────────────────────────
function MedicineSearchInput({ value, onChange, onSelect, medicines }) {
  const [query, setQuery] = useState(value?.name || "");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const filtered = medicines.filter((m) =>
    m.name?.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (med) => {
    setQuery(med.name);
    setOpen(false);
    onSelect(med);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    onChange?.(e.target.value);
  };

  return (
    <div className="relative col-span-6">
      <div
        className={`flex items-center rounded-lg border bg-white px-2.5 transition ${
          focused
            ? "border-secondary ring-1 ring-secondary/20"
            : "border-gray-200"
        }`}
      >
        <Search className="h-3 w-3 flex-shrink-0 text-gray-300" />
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
          }}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setOpen(false), 200);
          }}
          placeholder="Search medicine..."
          className="w-full bg-transparent py-2 pl-1.5 text-xs outline-none"
        />
        {query && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery("");
              onSelect(null);
              setOpen(false);
            }}
            className="text-gray-300 hover:text-gray-500"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-40 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
          {filtered.map((med) => (
            <li
              key={med.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(med)}
              className="flex cursor-pointer items-center justify-between px-3 py-2 text-xs hover:bg-secondary/5"
            >
              <span className="font-medium text-gray-700">{med.name}</span>
              <span className="font-semibold text-secondary">
                {med.price} EGP
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Customer Orders Modal ───────────────────────────────────────────────────
function CustomerOrdersModal({ customer, orders, onClose, onAddOrder }) {
  if (!customer) return null;

  const customerOrders = orders.filter((o) => o.userName === customer.name);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Customer Orders
            </p>
            <h3 className="text-lg font-bold text-gray-800">{customer.name}</h3>
            <p className="text-xs text-gray-400">{customer.phoneNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onAddOrder(customer.name);
              }}
              className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Order
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {customerOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <ClipboardList className="mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">No orders yet</p>
              <p className="mt-1 text-xs">
                Press "Add Order" to create the first order
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customerOrders.map((order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-secondary">
                          #{order.id}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            order.orderDate || order.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-secondary">
                      {order.totalPrice} EGP
                    </span>
                  </div>

                  {order.items?.length > 0 && (
                    <div className="border-t border-gray-100 px-4 py-2">
                      <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        <Package className="h-3 w-3" />
                        Items ({order.items.length})
                      </p>
                      <ul className="space-y-1">
                        {order.items.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-gray-600">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-secondary">
                                ×{item.qty}
                              </span>
                              <span className="text-gray-400">
                                {item.price} EGP
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Add Order Modal ─────────────────────────────────────────────────────────
function AddOrderModal({
  open,
  onClose,
  onAdd,
  defaultCustomerName = "",
  pharmacyId,
  addCustomerOrder,
}) {
  const { medicines, fetchAll } = useMedicine();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const emptyItem = { medicine: null, qty: 1, price: "" };

  const [form, setForm] = useState({
    fullName: defaultCustomerName,
    phoneNumber: "",
    items: [emptyItem],
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        fullName: defaultCustomerName,
        phoneNumber: "",
        items: [emptyItem],
      });
    }
  }, [open, defaultCustomerName]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateItem = (idx, patch) =>
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], ...patch };
      return { ...f, items };
    });

  const handleSelectMedicine = (idx, med) => {
    updateItem(idx, { medicine: med, price: med?.price ?? "" });
  };

  const addItem = () =>
    setForm((f) => ({ ...f, items: [...f.items, emptyItem] }));
  const removeItem = (idx) => {
    if (form.items.length === 1) return;
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const calcTotal = () =>
    form.items
      .reduce(
        (sum, item) =>
          sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
        0,
      )
      .toFixed(2);

  const handleSubmit = async () => {
    if (!form.fullName.trim()) return toast.error("Customer name is required");
    if (!form.phoneNumber.trim())
      return toast.error("Phone number is required");
    if (form.items.some((i) => !i.medicine))
      return toast.error("Please select medicine for all items");

    const payload = {
      fullName: form.fullName,
      phoneNumber: form.phoneNumber,
      pharmacyId: pharmacyId,
      items: form.items.map((item) => ({
        medicineID: item.medicine.id,
        quantity: Number(item.qty),
      })),
    };

    setSubmitting(true);
    try {
      const result = await addCustomerOrder(payload);

      onAdd({
        id: result.orderId || Date.now(),
        userName: form.fullName,
        orderDate: new Date().toISOString(),
        totalPrice: calcTotal(),
        items: form.items.map((it) => ({
          name: it.medicine.name,
          qty: it.qty,
          price: it.price,
        })),
      });

      toast.success(result.message || "Order created successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-h-[90vh] sm:w-[90%] sm:rounded-2xl md:w-[75%] lg:w-[60%] xl:max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
            Add New Order
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Customer Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="Ahmed Mohamed"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                value={form.phoneNumber}
                onChange={(e) => update("phoneNumber", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="01234567890"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Order Items <span className="text-red-500">*</span>
              </label>
              <button
                onClick={addItem}
                className="flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary hover:bg-secondary/20"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 rounded-xl border border-gray-100 bg-gray-50 p-2"
                >
                  <MedicineSearchInput
                    value={item.medicine}
                    onSelect={(med) => handleSelectMedicine(idx, med)}
                    medicines={medicines}
                  />

                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => {
                      const qty = Number(e.target.value) || 1;
                      const price = (item.medicine?.price || 0) * qty;
                      updateItem(idx, { qty, price: price.toFixed(2) });
                    }}
                    className="col-span-2 rounded-lg border border-gray-200 bg-white px-2 py-2 text-center text-sm"
                  />

                  <div className="col-span-3 flex items-center rounded-lg border border-gray-100 bg-white px-3 text-sm font-semibold text-secondary">
                    {item.price || "0.00"} EGP
                  </div>

                  <button
                    onClick={() => removeItem(idx)}
                    disabled={form.items.length === 1}
                    className="col-span-1 text-gray-400 hover:text-red-500 disabled:opacity-40"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-4">
            <span className="text-lg font-medium text-gray-700">
              Total Price
            </span>
            <span className="text-2xl font-bold text-secondary">
              {calcTotal()} EGP
            </span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={submitting}
              className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-full bg-secondary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-70"
            >
              {submitting ? "Saving..." : "Create Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Customers() {
  const pharmacyId = 1; // غيّرها لاحقاً حسب الـ Authentication

  const {
    customers,
    stats,
    loading,
    addCustomer,
    editCustomer,
    removeCustomer,
    searchByPhone,
    refetch,
    addCustomerOrder,
  } = useCustomers(pharmacyId);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editing, setEditing] = useState(null);
  const [searchPhone, setSearchPhone] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [localOrders, setLocalOrders] = useState([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderDefaultCustomer, setOrderDefaultCustomer] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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

  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "" });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", phoneNumber: "" });
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phoneNumber: customer.phoneNumber || "",
    });
    setModalOpen(true);
  };

  const openAddOrder = (customerName = "") => {
    setOrderDefaultCustomer(customerName);
    setOrderModalOpen(true);
  };

  const handleSubmitCustomer = async () => {
    if (!form.name.trim() || !form.phoneNumber.trim()) {
      return toast.error("Name and Phone Number are required");
    }

    const payload = {
      Name: form.name,
      PhoneNumber: form.phoneNumber,
      Email: form.email || "",
    };

    try {
      if (editing) await editCustomer(editing.id, payload);
      else await addCustomer(payload);

      setModalOpen(false);
      await refetch();
      toast.success(
        editing
          ? "Customer updated successfully"
          : "Customer added successfully",
      );
    } catch (err) {
      toast.error("Failed to save customer");
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
      toast.success("Customer deleted successfully");
    } catch (err) {
      toast.error("Failed to delete customer");
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
      if (res.data?.exists) {
        setFilteredCustomers(
          customers.filter((c) => c.phoneNumber === searchPhone),
        );
        toast.success("Customer found");
      } else {
        setFilteredCustomers([]);
        toast.error("Customer not found");
      }
    } catch (err) {
      toast.error("Search failed");
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Toast Notification */}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by phone..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-secondary sm:w-80"
          />
          <button
            onClick={handleSearch}
            className="rounded-lg bg-secondary px-4 text-white"
          >
            Search
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => openAddOrder("")}
            className="flex items-center gap-2 rounded-lg border border-secondary px-4 py-2 text-secondary hover:bg-secondary/10"
          >
            <ShoppingCart className="h-4 w-4" /> New Order
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-white hover:bg-secondary/90"
          >
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Phone
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                Orders
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4 text-gray-600">{c.email || "—"}</td>
                  <td className="px-6 py-4">{c.phoneNumber}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary"
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      View Orders
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openAddOrder(c.name)}
                        className="text-secondary hover:text-secondary/80"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(c)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="mb-5 text-xl font-semibold">
              {editing ? "Edit Customer" : "Add New Customer"}
            </h2>
            <div className="space-y-4">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full Name"
                className="w-full rounded-xl border px-4 py-3"
              />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email (optional)"
                className="w-full rounded-xl border px-4 py-3"
              />
              <input
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                placeholder="Phone Number"
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border px-5 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCustomer}
                className="rounded-xl bg-secondary px-5 py-2.5 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setDeleteModalOpen(false)
          }
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold">Delete Customer</h3>
            <p className="mt-2 text-gray-600">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-xl border px-5 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-5 py-2 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Orders Modal */}
      <CustomerOrdersModal
        customer={selectedCustomer}
        orders={localOrders}
        onClose={() => setSelectedCustomer(null)}
        onAddOrder={openAddOrder}
      />

      {/* ✅ pharmacyId اتضاف هنا */}
      <AddOrderModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        defaultCustomerName={orderDefaultCustomer}
        onAdd={(newOrder) => setLocalOrders((prev) => [newOrder, ...prev])}
        pharmacyId={pharmacyId}
        addCustomerOrder={addCustomerOrder}
      />
    </div>
  );
}
