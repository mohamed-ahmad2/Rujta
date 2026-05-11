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
import { createOrder } from "../../customerOrders/api/customerOrdersApi";

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ type, message, onClose }) => (
  <div
    className={`animate-fadeIn fixed left-4 right-4 top-4 z-50 flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-white shadow-lg sm:left-auto sm:right-6 sm:top-6 sm:px-4 sm:py-3 sm:text-base ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`}
  >
    <span>{message}</span>
    <button onClick={onClose} className="flex-shrink-0 transition hover:opacity-80">
      <X className="h-4 w-4" />
    </button>
  </div>
);

// ─── Medicine Search Input ────────────────────────────────────────────────────
function MedicineSearchInput({ value, onChange, onSelect, medicines }) {
  const [query, setQuery]     = useState(value?.name || "");
  const [open, setOpen]       = useState(false);
  const [focused, setFocused] = useState(false);

  const filtered = medicines.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (med) => {
    setQuery(med.name);
    setOpen(false);
    onSelect(med);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    onChange(e.target.value);
  };

  return (
    <div className="relative col-span-6">
      <div
        className={`flex items-center rounded-lg border bg-white px-2.5 transition ${
          focused ? "border-secondary ring-1 ring-secondary/20" : "border-gray-200"
        }`}
      >
        <Search className="h-3 w-3 flex-shrink-0 text-gray-300" />
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 150); }}
          placeholder="Search medicine..."
          className="w-full bg-transparent py-2 pl-1.5 text-xs outline-none"
        />
        {query && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { setQuery(""); onSelect(null); setOpen(false); }}
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
              <span className="font-semibold text-secondary">{med.price} EGP</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Customer Orders Modal ────────────────────────────────────────────────────
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
              onClick={() => { onClose(); onAddOrder(customer.name); }}
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
              <p className="mt-1 text-xs text-gray-400">
                Press "Add Order" to create the first order
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customerOrders.map((order) => {
                const items = order.items || [];
                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-secondary">#{order.id}</span>
                          <span className="text-xs text-gray-500">
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString("en-US", {
                                  year: "numeric", month: "short", day: "numeric",
                                })
                              : "—"}
                          </span>
                        </div>
                        {order.createdAt && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(order.createdAt).toLocaleTimeString("en-US", {
                                hour: "2-digit", minute: "2-digit", hour12: true,
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-secondary">
                        {order.totalPrice} EGP
                      </span>
                    </div>

                    {items.length > 0 && (
                      <div className="border-t border-gray-100 px-4 py-2">
                        <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          <Package className="h-3 w-3" />
                          Items ({items.length})
                        </p>
                        <ul className="space-y-1">
                          {items.map((item, i) => (
                            <li key={i} className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-xs text-gray-600">
                                <span>💊</span>
                                {item.name || `Item #${i + 1}`}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary">
                                  ×{item.qty || item.quantity || 0}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {item.price} EGP
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-3">
          <span className="text-xs text-gray-400">
            {customerOrders.length} order{customerOrders.length !== 1 ? "s" : ""} total
          </span>
          <button
            onClick={onClose}
            className="rounded-full border border-gray-200 px-5 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Order Modal ──────────────────────────────────────────────────────────
function AddOrderModal({ open, onClose, onAdd, defaultCustomerName = "", pharmacyId }) {
  const { medicines, fetchAll } = useMedicine();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const emptyItem = { medicine: null, qty: 1, price: "" };

  const [form, setForm] = useState({
    userName:  defaultCustomerName,
    orderDate: new Date().toISOString().split("T")[0],
    items:     [{ ...emptyItem }],
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        userName:  defaultCustomerName,
        orderDate: new Date().toISOString().split("T")[0],
        items:     [{ ...emptyItem }],
      });
    }
  }, [open, defaultCustomerName]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const updateItem = (idx, patch) =>
    setForm((f) => {
      const items = [...f.items];
      items[idx]  = { ...items[idx], ...patch };
      return { ...f, items };
    });

  const handleSelectMedicine = (idx, med) => {
    updateItem(idx, {
      medicine: med,
      price:    med ? med.price ?? "" : "",
    });
  };

  const addItem    = () => setForm((f) => ({ ...f, items: [...f.items, { ...emptyItem }] }));
  const removeItem = (idx) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const calcTotal = () =>
    form.items
      .reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1), 0)
      .toFixed(2);

  // ✅ handleSubmit بيبعت للـ API دلوقتي
  const handleSubmit = async () => {
    if (!form.userName.trim())
      return toast.error("Customer name is required.");
    if (form.items.some((it) => !it.medicine))
      return toast.error("Please select a medicine for each item.");

    const payload = [
      {
        pharmacyID:        pharmacyId,
        prescriptionID:    null,
        deliveryAddressId: null,
        orderItems: form.items.map((it) => ({
          medicineID:   it.medicine.id,
          medicineName: it.medicine.name,
          quantity:     Number(it.qty),
        })),
      },
    ];

    setSubmitting(true);
    try {
      const res = await createOrder(payload);
      const createdOrder = res.data?.[0];

      onAdd({
        id:         createdOrder?.id || Date.now(),
        userName:   form.userName,
        orderDate:  form.orderDate,
        createdAt:  new Date().toISOString(),
        totalPrice: calcTotal(),
        items: form.items.map((it) => ({
          name:     it.medicine?.name || "",
          qty:      it.qty,
          quantity: it.qty,
          price:    it.price,
        })),
      });

      toast.success("Order added successfully!");
      onClose();
    } catch (err) {
      console.error("Create order error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to create order.");
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

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Add New Order</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.userName}
                onChange={(e) => update("userName", e.target.value)}
                placeholder="e.g. Ahmed Mohamed"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Order Date
              </label>
              <input
                type="date"
                value={form.orderDate}
                onChange={(e) => update("orderDate", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Order Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary transition hover:bg-secondary/20"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>

            <div className="mb-1 grid grid-cols-12 gap-2 px-1 text-xs font-medium text-gray-400">
              <span className="col-span-6">Medicine</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-3 text-center">Price</span>
              <span className="col-span-1" />
            </div>

            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-2"
                >
                  <MedicineSearchInput
                    value={item.medicine}
                    onChange={() => {}}
                    onSelect={(med) => handleSelectMedicine(idx, med)}
                    medicines={medicines}
                  />

                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) => {
                      const qty = Number(e.target.value) || 1;
                      const basePrice = item.medicine?.price ?? 0;
                      updateItem(idx, { qty, price: (basePrice * qty).toFixed(2) });
                    }}
                    className="col-span-2 rounded-lg border border-gray-200 bg-white px-1 py-2 text-center text-xs focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/20"
                  />

                  <div className="col-span-3 flex items-center rounded-lg border border-gray-100 bg-white px-2 py-2">
                    <span className="w-full text-center text-xs font-semibold text-secondary">
                      {item.price || "0.00"} EGP
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={form.items.length === 1}
                    className="col-span-1 flex justify-center text-gray-300 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3">
            <span className="text-sm font-medium text-gray-600">Total Price</span>
            <span className="text-lg font-bold text-secondary">{calcTotal()} EGP</span>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-full bg-secondary px-6 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Add Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Customers Page ──────────────────────────────────────────────────────
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

  const [modalOpen, setModalOpen]                       = useState(false);
  const [deleteModalOpen, setDeleteModalOpen]           = useState(false);
  const [deleteTarget, setDeleteTarget]                 = useState(null);
  const [editing, setEditing]                           = useState(null);
  const [searchPhone, setSearchPhone]                   = useState("");
  const [filteredCustomers, setFilteredCustomers]       = useState([]);
  const [notification, setNotification]                 = useState(null);
  const [form, setForm]                                 = useState({ name: "", email: "", phoneNumber: "" });
  const [localOrders, setLocalOrders]                   = useState([]);
  const [orderModalOpen, setOrderModalOpen]             = useState(false);
  const [orderDefaultCustomer, setOrderDefaultCustomer] = useState("");
  const [selectedCustomer, setSelectedCustomer]         = useState(null);

  useEffect(() => { setFilteredCustomers(customers); }, [customers]);

  const totalAnim     = useSpring({ number: stats.totalCustomers,     from: { number: 0 } });
  const newAnim       = useSpring({ number: stats.newCustomers,       from: { number: 0 } });
  const returningAnim = useSpring({ number: stats.returningCustomers, from: { number: 0 } });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "", phoneNumber: "" });
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditing({ id: customer.id });
    setForm({ name: customer.name, email: customer.email, phoneNumber: customer.phoneNumber });
    setModalOpen(true);
  };

  const openAddOrder = (customerName = "") => {
    setOrderDefaultCustomer(customerName);
    setOrderModalOpen(true);
  };

  const getCustomerOrderCount = (customerName) =>
    localOrders.filter((o) => o.userName === customerName).length;

  const handleSubmit = async () => {
    const payload = {
      Name:        form.name,
      PhoneNumber: form.phoneNumber,
      Email:       form.email || "",
      PharmacyId:  pharmacyId,
    };
    try {
      if (editing) await editCustomer(editing.id, payload);
      else await addCustomer(payload);
      setModalOpen(false);
      await refetch();
      setNotification({ type: "success", message: editing ? "Customer updated" : "Customer added" });
    } catch (err) {
      console.error("Submit error:", err);
      setNotification({ type: "error", message: "Failed to submit customer data" });
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
      setNotification({ type: "success", message: "Customer deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err);
      setNotification({ type: "error", message: "Failed to delete customer" });
    } finally {
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleSearch = async () => {
    if (!searchPhone) { setFilteredCustomers(customers); return; }
    try {
      const res = await searchByPhone(searchPhone);
      if (res.data.exists) {
        setFilteredCustomers(customers.filter((c) => c.phoneNumber.includes(searchPhone)));
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
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full flex-1 gap-2 sm:w-auto sm:max-w-md">
          <input
            type="text"
            placeholder="Search by phone..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary sm:text-base"
          />
          <button
            onClick={handleSearch}
            className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-sm text-white transition hover:opacity-90 sm:px-4 sm:text-base"
          >
            <Search className="h-4 w-4" />
            <span className="xs:inline hidden sm:inline">Search</span>
          </button>
          <button
            onClick={() => { setSearchPhone(""); setFilteredCustomers(customers); }}
            className="flex-shrink-0 rounded-lg bg-gray-200 px-3 py-2 text-sm transition hover:bg-gray-300 sm:text-base"
          >
            Clear
          </button>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <button
            onClick={() => openAddOrder("")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-secondary px-3 py-2 text-sm text-secondary transition hover:bg-secondary/10 sm:flex-none sm:px-4 sm:text-base"
          >
            <ShoppingCart className="h-4 w-4" />
            Add New Order
          </button>
          <button
            onClick={openAdd}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-white transition hover:opacity-90 sm:flex-none sm:px-4 sm:text-base"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] table-auto">
            <thead className="bg-gray-100">
              <tr>
                {["Name", "Email", "Phone", "Orders", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-2 text-xs uppercase tracking-wider text-gray-600 sm:px-4 sm:py-3 sm:text-sm md:px-6 ${
                      i >= 3 ? "text-center" : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="py-8 text-center sm:py-10">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-sm text-gray-500 sm:py-10 sm:text-base">
                    No customers found
                  </td>
                </tr>
              )}

              {!loading &&
                filteredCustomers.map((c) => {
                  const orderCount = getCustomerOrderCount(c.name);
                  return (
                    <tr key={c.id} className="border-t transition hover:bg-gray-50">
                      <td className="max-w-[120px] truncate px-3 py-3 text-sm sm:max-w-none sm:px-4 sm:py-4 sm:text-base md:px-6">
                        {c.name}
                      </td>
                      <td className="max-w-[140px] truncate px-3 py-3 text-sm sm:max-w-none sm:px-4 sm:py-4 sm:text-base md:px-6">
                        {c.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm sm:px-4 sm:py-4 sm:text-base md:px-6">
                        {c.phoneNumber}
                      </td>

                      <td className="px-3 py-3 text-center sm:px-4 sm:py-4 md:px-6">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                            orderCount > 0
                              ? "bg-secondary/10 text-secondary hover:bg-secondary/20"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          <ClipboardList className="h-3 w-3" />
                          {orderCount} {orderCount === 1 ? "order" : "orders"}
                        </button>
                      </td>

                      <td className="px-3 py-3 sm:px-4 sm:py-4 md:px-6">
                        <div className="flex justify-center gap-2 sm:gap-3">
                          <button
                            onClick={() => openEdit(c)}
                            className="rounded p-1 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                          </button>
                          <button
                            onClick={() => openAddOrder(c.name)}
                            className="rounded p-1 text-secondary transition hover:bg-secondary/10"
                            title="Add Order for this customer"
                          >
                            <ShoppingCart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                          </button>
                          <button
                            onClick={() => confirmDelete(c)}
                            className="rounded p-1 text-red-600 transition hover:bg-red-50 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="animate-fadeIn relative max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-lg sm:max-w-md sm:rounded-xl sm:p-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 sm:right-4 sm:top-4"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <h2 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg md:text-xl">
              {editing ? "Edit Customer" : "Add Customer"}
            </h2>
            <div className="space-y-3">
              {[
                { name: "name",        placeholder: "Name" },
                { name: "email",       placeholder: "Email" },
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
                className="rounded-lg bg-secondary px-3 py-2 text-sm text-white transition hover:bg-secondary sm:px-4 sm:text-base"
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
          onClick={(e) => e.target === e.currentTarget && setDeleteModalOpen(false)}
        >
          <div className="animate-fadeIn w-full rounded-t-2xl bg-white p-4 shadow-lg sm:max-w-sm sm:rounded-xl sm:p-6">
            <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">Delete Customer</h3>
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
      />
    </div>
  );
}