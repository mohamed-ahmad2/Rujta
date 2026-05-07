import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { usePharmacists } from "../../pharmacists/hook/usePharmacists";
import { usePresence } from "../../../context/usePresence";
import {
  X,
  Search,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import Toast from "../components/logs/Toast";
import { createPortal } from "react-dom";

const normalize = (v) => (v ?? "").toString().toLowerCase();

const extractErrors = (err) => {
  const serverErrors = err?.response?.data?.errors;
  if (serverErrors && typeof serverErrors === "object") {
    return Object.values(serverErrors).flat();
  }
  return [];
};

const extractMessage = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.title || 
  err?.message ||
  "An unexpected error occurred. Please try again.";

const MODAL_FIELDS = [
  { name: "name", label: "Full Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  {
    name: "phone",
    label: "Phone",
    type: "text",
    required: true,
    hint: "Egyptian number (010, 011, 012, 015)",
  },
  { name: "salary", label: "Salary (EGP)", type: "number", required: true },
  {
    name: "createPassword",
    label: "Password",
    type: "password",
    required: true,
    hint: "Min 8 chars · uppercase · lowercase · number · special char",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    required: true,
  },
];

const EMPTY_STAFF = {
  name: "",
  email: "",
  phone: "",
  location: "",
  salary: "",
  createPassword: "",
  confirmPassword: "",
};

const Logs = () => {
  const { handleRegisterStaff } = useAuth();
  const { fetchPharmacyStaff, loading: pharmacistsLoading } = usePharmacists();
  const { onlineUsers } = usePresence();

  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [addingStaff, setAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState(EMPTY_STAFF);
  const [showPasswords, setShowPasswords] = useState({
    createPassword: false,
    confirmPassword: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  const itemsPerPage = 10;

  const showToast = (type, message, details = []) =>
    setToast({ type, message, details });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff((prev) => ({ ...prev, [name]: value }));
  };

  const loadStaff = React.useCallback(async () => {
    const data = await fetchPharmacyStaff();
    setStaff(
      (data || []).map((p) => ({
        id: p.id,
        name: p.fullName,
        email: p.email,
        phone: p.phone,
        role: "Pharmacist",
        hireDateRaw: p.hireDate ? new Date(p.hireDate) : null,
        hireDate: p.hireDate
          ? new Date(p.hireDate).toLocaleDateString()
          : "N/A",
        isOnline: onlineUsers.includes(p.id),
      })),
    );
  }, [fetchPharmacyStaff, onlineUsers]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const closeModal = () => {
    setShowModal(false);
    setNewStaff(EMPTY_STAFF);
    setShowPasswords({ createPassword: false, confirmPassword: false });
  };

  const addStaff = async () => {
    const missing = MODAL_FIELDS.filter(
      (f) => f.required && !newStaff[f.name]?.toString().trim(),
    );
    if (missing.length) {
      showToast(
        "warning",
        "Missing required fields",
        missing.map((f) => `${f.label} is required.`),
      );
      return;
    }

    if (newStaff.createPassword !== newStaff.confirmPassword) {
      showToast("error", "Passwords do not match", [
        "Make sure both password fields are identical.",
      ]);
      return;
    }

    try {
      setAddingStaff(true);

      const res = await handleRegisterStaff({
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        location: newStaff.location,
        salary: Number(newStaff.salary),
        createPassword: newStaff.createPassword,
        confirmPassword: newStaff.confirmPassword,
      });

      if (res?.success === false) {
        showToast(
          "error",
          res.message || "Failed to add staff",
          res.errors ?? [],
        );
        return;
      }

      showToast("success", "Staff member added successfully! 🎉");
      closeModal();
      await loadStaff();
    } catch (err) {
      const message = extractMessage(err);
      const details = extractErrors(err);

      showToast(
        "error",
        details.length
          ? "Validation failed — please review the errors below."
          : message,
        details.length ? details : [],
      );
    } finally {
      setAddingStaff(false);
    }
  };

  const filteredStaff = staff
    .filter((s) => {
      if (filterStatus === "online") return s.isOnline;
      if (filterStatus === "offline") return !s.isOnline;
      return true;
    })
    .filter((s) => {
      const q = searchTerm.toLowerCase().trim();
      return (
        normalize(s.name).includes(q) ||
        normalize(s.email).includes(q) ||
        normalize(s.phone).includes(q) ||
        normalize(s.hireDate).includes(q)
      );
    });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const currentStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalStaff = staff.length;
  const onlineCount = staff.filter((s) => s.isOnline).length;
  const offlineCount = totalStaff - onlineCount;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentHires = staff.filter(
    (s) => s.hireDateRaw && s.hireDateRaw > thirtyDaysAgo,
  ).length;

  const statsData = [
    {
      label: "Total Staff",
      value: totalStaff,
      icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "text-gray-800",
      iconBg: "bg-gray-100",
    },
    {
      label: "Online",
      value: onlineCount,
      icon: <Wifi className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "text-green-600",
      iconBg: "bg-green-100",
    },
    {
      label: "Offline",
      value: offlineCount,
      icon: <WifiOff className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "text-red-500",
      iconBg: "bg-red-100",
    },
    {
      label: "Recent Hires (30d)",
      value: recentHires,
      icon: <Clock className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "text-blue-600",
      iconBg: "bg-blue-100",
    },
  ];

  return (
    <>
      <div className="min-h-screen space-y-4 bg-gray-100 p-3 sm:space-y-5 sm:p-4 md:space-y-6 md:p-6 lg:p-8">
        {/*  Header  */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="text-xl font-bold text-gray-800 sm:text-2xl md:text-3xl">
            Staff Logs
          </h1>

          <div className="xs:flex-row xs:items-center flex w-full flex-col items-stretch gap-2 sm:w-auto sm:gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:w-48 md:w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-shrink-0 rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>

            {/* Add button */}
            <button
              onClick={() => setShowModal(true)}
              className="flex flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-white shadow transition hover:bg-green-500 sm:px-4 sm:text-base"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Staff</span>
            </button>
          </div>
        </div>

        {/*  Stats Cards  */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
          {statsData.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center shadow sm:p-4 md:p-5"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full sm:h-10 sm:w-10 ${stat.iconBg} ${stat.color}`}
              >
                {stat.icon}
              </div>
              <h3 className="text-xs font-semibold leading-tight text-gray-600 sm:text-sm">
                {stat.label}
              </h3>
              <span
                className={`text-xl font-bold sm:text-2xl md:text-3xl ${stat.color}`}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/*  Table  */}
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] table-auto text-left">
              <thead className="bg-gray-200">
                <tr>
                  {[
                    "Name",
                    "Email",
                    "Phone",
                    "Role",
                    "Hire Date",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-3 py-2 text-xs font-semibold text-gray-600 sm:px-4 sm:py-3 sm:text-sm"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pharmacistsLoading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentStaff.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No staff found
                    </td>
                  </tr>
                ) : (
                  currentStaff.map((s) => (
                    <tr
                      key={s.id}
                      className="border-t text-gray-700 transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-3 py-2 text-xs font-medium sm:px-4 sm:py-3 sm:text-sm">
                        {s.name}
                      </td>
                      <td className="max-w-[140px] truncate px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm">
                        {s.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm">
                        {s.phone}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm">
                        {s.role}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm">
                        {s.hireDate}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <span
                          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium sm:py-1 ${s.isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full sm:h-2 sm:w-2 ${s.isOnline ? "bg-green-500" : "bg-red-500"}`}
                          />
                          {s.isOnline ? "Online" : "Offline"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/*  Pagination  */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            {[
              {
                label: "«",
                action: () => setCurrentPage(1),
                disabled: currentPage === 1,
              },
              {
                label: "‹",
                action: () => setCurrentPage((p) => Math.max(1, p - 1)),
                disabled: currentPage === 1,
              },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                disabled={btn.disabled}
                className="rounded bg-gray-200 px-2 py-1 text-sm transition hover:bg-gray-300 disabled:opacity-50 sm:px-3"
              >
                {btn.label}
              </button>
            ))}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded px-2 py-1 text-sm transition sm:px-3 ${currentPage === page ? "bg-secondary text-white" : "bg-gray-200 hover:bg-gray-300"}`}
              >
                {page}
              </button>
            ))}
            {[
              {
                label: "›",
                action: () =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1)),
                disabled: currentPage === totalPages,
              },
              {
                label: "»",
                action: () => setCurrentPage(totalPages),
                disabled: currentPage === totalPages,
              },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                disabled={btn.disabled}
                className="rounded bg-gray-200 px-2 py-1 text-sm transition hover:bg-gray-300 disabled:opacity-50 sm:px-3"
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/*  Modal  */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-lg sm:max-w-md sm:rounded-2xl sm:p-6">
              {/* Modal header */}
              <div className="mb-4 flex items-center justify-between sm:mb-5">
                <div>
                  <h2 className="text-base font-bold sm:text-lg md:text-xl">
                    Add New Staff
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Fields marked <span className="text-red-500">*</span> are
                    required
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Modal fields */}
              <div className="flex flex-col gap-3 sm:gap-4">
                {MODAL_FIELDS.map((field) => {
                  const isPassword = field.type === "password";
                  const visible = showPasswords[field.name];

                  return (
                    <div key={field.name}>
                      <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                        {field.label}
                        {field.required && (
                          <span className="ml-0.5 text-red-500">*</span>
                        )}
                      </label>

                      <div className="relative">
                        <input
                          type={
                            isPassword
                              ? visible
                                ? "text"
                                : "password"
                              : field.type
                          }
                          name={field.name}
                          value={newStaff[field.name]}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                          style={{
                            paddingRight: isPassword ? "2.5rem" : undefined,
                          }}
                        />
                        {isPassword && (
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                [field.name]: !prev[field.name],
                              }))
                            }
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label={
                              visible ? "Hide password" : "Show password"
                            }
                          >
                            {visible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Hint text */}
                      {field.hint && (
                        <p className="mt-1 text-[11px] text-gray-400">
                          {field.hint}
                        </p>
                      )}

                      {/* Inline password match warning */}
                      {field.name === "confirmPassword" &&
                        newStaff.confirmPassword &&
                        newStaff.createPassword !==
                          newStaff.confirmPassword && (
                          <p className="mt-1 text-[11px] text-red-500">
                            Passwords do not match
                          </p>
                        )}
                    </div>
                  );
                })}
              </div>

              {/* Modal actions */}
              <div className="mt-5 flex justify-end gap-2 sm:mt-6 sm:gap-3">
                <button
                  onClick={closeModal}
                  className="rounded-lg bg-gray-200 px-3 py-2 text-sm transition hover:bg-gray-300 sm:px-4 sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={addStaff}
                  disabled={addingStaff}
                  className={`rounded-lg px-3 py-2 text-sm text-white transition sm:px-4 sm:text-base ${
                    addingStaff
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-secondary hover:bg-green-600"
                  }`}
                >
                  {addingStaff ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Adding...
                    </span>
                  ) : (
                    "Add Staff"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {createPortal(
        <Toast toast={toast} onClose={() => setToast(null)} />,
        document.body,
      )}
    </>
  );
};

export default Logs;
