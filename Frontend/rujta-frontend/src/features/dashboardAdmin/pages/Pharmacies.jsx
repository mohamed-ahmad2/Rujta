// src/features/pharmacies/pages/Pharmacies.jsx
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  KeyRound,
  X,
  CheckCircle,
  XCircle,
  Trash2,
  RotateCcw,
  Building2,
  GitBranch,
  Loader2,
  Copy,
  MapPin,
  Phone,
  Clock,
  User,
  Mail,
  Home,
} from "lucide-react";
import { createPortal } from "react-dom";
import useSuperAdmin from "../../super-admin/hook/useSuperAdmin";
import useAddress from "../../address/hook/useAddress";
import TimeRangePicker from "../components/TimeRangePicker";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://localhost:7001";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
};

const EGYPTIAN_PHONE_RE = /^01[0125]\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateAddForm = (f) => {
  const errors = [];
  if (!f.pharmacyName?.trim()) errors.push("Pharmacy name is required.");
  if (f.pharmacyName?.length > 150)
    errors.push("Pharmacy name must not exceed 150 characters.");
  if (!f.openHours?.trim()) errors.push("Open hours are required.");
  if (!f.street?.trim() && !f.city?.trim() && !f.governorate?.trim())
    errors.push("Address is required — enter Street, City, or Governorate.");
  if (!f.managerName?.trim()) errors.push("Manager name is required.");
  if (!f.managerEmail?.trim()) errors.push("Manager email is required.");
  else if (!EMAIL_RE.test(f.managerEmail))
    errors.push("Invalid manager email format.");
  if (!f.managerPhone?.trim()) errors.push("Manager phone is required.");
  else if (!EGYPTIAN_PHONE_RE.test(f.managerPhone))
    errors.push(
      "Manager phone must be a valid Egyptian number (010, 011, 012, 015).",
    );
  if (
    f.managerExperienceYears !== "" &&
    f.managerExperienceYears !== undefined
  ) {
    const y = Number(f.managerExperienceYears);
    if (!Number.isFinite(y) || y < 0 || y > 60)
      errors.push("Experience years must be between 0 and 60.");
  }
  if (f.isBranch && !f.parentPharmacyId)
    errors.push("Please select a parent (main) pharmacy for the branch.");
  if (f.image) {
    if (f.image.size > 5 * 1024 * 1024)
      errors.push("Image size must not exceed 5 MB.");
    if (!["image/jpeg", "image/png"].includes(f.image.type))
      errors.push("Only JPG or PNG images are allowed.");
  }
  return errors;
};

const validateEditForm = (f) => {
  const errors = [];
  if (!f.name?.trim()) errors.push("Pharmacy name is required.");
  if (f.name?.length > 150)
    errors.push("Pharmacy name must not exceed 150 characters.");
  if (!f.contactNumber?.trim()) errors.push("Contact number is required.");
  else if (!EGYPTIAN_PHONE_RE.test(f.contactNumber))
    errors.push(
      "Contact number must be a valid Egyptian number (010, 011, 012, 015).",
    );
  if (!f.openHours?.trim()) errors.push("Open hours are required.");
  if (!f.street?.trim() && !f.city?.trim() && !f.governorate?.trim())
    errors.push("Address is required — enter Street, City, or Governorate.");
  return errors;
};

const extractErrors = (err) => {
  const serverErrors = err?.response?.data?.errors;
  if (serverErrors && typeof serverErrors === "object")
    return Object.values(serverErrors).flat();
  return [];
};

const extractMessage = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.title ||
  err?.message ||
  "An unexpected error occurred.";

const TOAST_CFG = {
  success: {
    border: "border-l-green-500",
    icon: CheckCircle,
    iconCls: "text-green-500",
    detailBg: "bg-green-50",
    detailTxt: "text-green-700",
  },
  error: {
    border: "border-l-red-500",
    icon: XCircle,
    iconCls: "text-red-500",
    detailBg: "bg-red-50",
    detailTxt: "text-red-700",
  },
  warning: {
    border: "border-l-amber-500",
    icon: null,
    iconCls: "text-amber-500",
    detailBg: "bg-amber-50",
    detailTxt: "text-amber-700",
  },
};

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, toast.details?.length > 0 ? 8000 : 4500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const cfg = TOAST_CFG[toast.type] ?? TOAST_CFG.error;
  const Icon = cfg.icon ?? XCircle;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] w-full max-w-sm">
      <div
        className={`relative flex gap-3 rounded-xl border-l-4 bg-white p-4 shadow-2xl ring-1 ring-black/5 ${cfg.border}`}
        style={{ animation: "toastIn .3s cubic-bezier(.22,1,.36,1) forwards" }}
      >
        <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${cfg.iconCls}`} />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-gray-800">{toast.message}</p>
          {toast.details?.length > 0 && (
            <div className={`mt-2 rounded-lg p-3 ${cfg.detailBg}`}>
              <p className={`mb-1.5 text-xs font-semibold ${cfg.detailTxt}`}>
                Please fix the following:
              </p>
              <ul className="space-y-1">
                {toast.details.map((d, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-1.5 text-xs ${cfg.detailTxt}`}
                  >
                    <span className="mt-0.5 flex-shrink-0">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <style>{`@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  );
}

function PharmacyAvatar({ src, name, size = "md" }) {
  const [errored, setErrored] = useState(false);
  useEffect(() => {
    setErrored(false);
  }, [src]);
  const sz = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
  };
  return src && !errored ? (
    <img
      src={getImageUrl(src)}
      onError={() => setErrored(true)}
      className={`${sz[size]} rounded-full border object-cover`}
      alt={name || "pharmacy"}
    />
  ) : (
    <div
      className={`${sz[size]} flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 font-semibold text-blue-700`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function Modal({ onClose, children, width = "440px" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="relative max-h-[90vh] space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        style={{ width }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s =
    status === "Active"
      ? "bg-green-100 text-green-700"
      : status === "Deleted"
        ? "bg-red-100 text-red-600"
        : "bg-yellow-100 text-yellow-700";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s}`}>
      {status}
    </span>
  );
}

function TypeBadge({ isBranch }) {
  return isBranch ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700">
      <GitBranch size={11} /> Branch
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
      <Building2 size={11} /> Main
    </span>
  );
}

function CopyButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value ?? "");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs transition hover:bg-gray-200"
    >
      <Copy size={12} />
      {copied ? "Copied!" : label}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", hint }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-500">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border p-2 text-sm transition focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3 pt-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
      <span className="flex items-center gap-1.5 text-gray-500">
        {icon}
        {label}
      </span>
      <span className="max-w-[60%] truncate text-right font-medium text-gray-800">
        {value || "-"}
      </span>
    </div>
  );
}

function StatsCard({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-white p-5">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function IconBtn({ children, title, onClick, color }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`rounded-md p-1.5 transition ${color}`}
    >
      {children}
    </button>
  );
}

const buildLocationText = ({ street, buildingNo, city, governorate }) => {
  const parts = [];
  if (street?.toString().trim()) parts.push(street.toString().trim());
  if (buildingNo?.toString().trim())
    parts.push(`Building ${buildingNo.toString().trim()}`);
  if (city?.toString().trim()) parts.push(city.toString().trim());
  if (governorate?.toString().trim()) parts.push(governorate.toString().trim());
  return parts.join(", ");
};

const EMPTY_ADD = {
  pharmacyName: "",
  street: "",
  buildingNo: "",
  city: "",
  governorate: "",
  openHours: "9AM - 11PM",
  managerName: "",
  managerEmail: "",
  managerPhone: "",
  managerQualification: "",
  managerExperienceYears: "",
  parentPharmacyId: "",
  isBranch: false,
  image: null,
  imagePreview: null,
  selectedAddressId: "",
};

const EMPTY_EDIT = {
  name: "",
  street: "",
  buildingNo: "",
  city: "",
  governorate: "",
  contactNumber: "",
  openHours: "9AM - 11PM",
};

export default function Pharmacies() {
  const {
    pharmacies,
    mainPharmacies,
    loading,
    fetchAll,
    fetchById,
    fetchMain,
    create,
    update,
    remove,
    restore,
    resetPassword,
  } = useSuperAdmin();
  const {
    addresses,
    fetchUserAddresses,
    loading: addressLoading,
  } = useAddress();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [addForm, setAddForm] = useState(EMPTY_ADD);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (type, message, details = []) => setToast({ type, message, details }),
    [],
  );

  const perPage = 7;

  useEffect(() => {
    fetchAll();
    fetchMain();
    fetchUserAddresses();
  }, [fetchAll, fetchMain, fetchUserAddresses]);

  useEffect(
    () => () => {
      if (addForm.imagePreview?.startsWith("blob:"))
        URL.revokeObjectURL(addForm.imagePreview);
    },
    [addForm.imagePreview],
  );

  const filtered = useMemo(() => {
    let list = pharmacies;
    if (filterType === "main") list = list.filter((p) => !p.isBranch);
    if (filterType === "branch") list = list.filter((p) => p.isBranch);
    if (!q) return list;
    const lower = q.toLowerCase();
    return list.filter(
      (p) =>
        p.name?.toLowerCase().includes(lower) ||
        p.location?.toLowerCase().includes(lower) ||
        p.contactNumber?.toLowerCase().includes(lower),
    );
  }, [q, pharmacies, filterType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const data = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSelectSavedAddress = useCallback(
    (addressId) => {
      if (!addressId) {
        setAddForm((prev) => ({ ...prev, selectedAddressId: "" }));
        return;
      }
      const addr = addresses.find(
        (a) => String(a.id ?? a.Id) === String(addressId),
      );
      if (!addr) return;
      setAddForm((prev) => ({
        ...prev,
        selectedAddressId: addressId,
        street: addr.street ?? addr.Street ?? "",
        buildingNo: String(addr.buildingNo ?? addr.BuildingNo ?? ""),
        city: addr.city ?? addr.City ?? "",
        governorate: addr.governorate ?? addr.Governorate ?? "",
      }));
    },
    [addresses],
  );

  const resetAddForm = useCallback(() => {
    if (addForm.imagePreview?.startsWith("blob:"))
      URL.revokeObjectURL(addForm.imagePreview);
    setAddForm(EMPTY_ADD);
  }, [addForm.imagePreview]);

  const handleAdd = async () => {
    const errors = validateAddForm(addForm);
    if (errors.length) {
      showToast(
        "warning",
        errors.length === 1
          ? errors[0]
          : "Please fix the following issues before saving.",
        errors.length > 1 ? errors : [],
      );
      return;
    }

    try {
      const payload = {
        pharmacyName: addForm.pharmacyName,
        openHours: addForm.openHours || "9AM - 11PM",
        managerName: addForm.managerName,
        managerEmail: addForm.managerEmail,
        managerPhone: addForm.managerPhone,
        managerQualification: addForm.managerQualification || "N/A",
        managerExperienceYears:
          parseInt(addForm.managerExperienceYears, 10) || 0,
        address: {
          street: addForm.street,
          buildingNo: addForm.buildingNo,
          city: addForm.city,
          governorate: addForm.governorate,
          latitude: 0,
          longitude: 0,
        },
        image: addForm.image,
      };
      if (addForm.isBranch && addForm.parentPharmacyId)
        payload.parentPharmacyId = parseInt(addForm.parentPharmacyId, 10);

      const res = await create(payload);
      if (!res) {
        showToast("error", "Failed to create pharmacy. Please try again.");
        return;
      }

      setSuccessData({
        email: res.managerEmail ?? res.ManagerEmail ?? addForm.managerEmail,
        password: res.generatedPassword ?? res.GeneratedPassword ?? "",
      });
      resetAddForm();
      setModal(null);
      fetchMain();
    } catch (err) {
      const details = extractErrors(err);
      showToast(
        "error",
        details.length
          ? "Validation failed — review the errors below."
          : extractMessage(err),
        details,
      );
    }
  };

  const handleView = async (p) => {
    setSelected(p);
    setModal("view");
    const detail = await fetchById(p.id);
    if (detail) setSelected({ ...p, ...detail });
  };

  const openEdit = (p) => {
    setSelected(p);
    setEditForm({
      name: p.name ?? "",
      street: p.street ?? "",
      buildingNo: p.buildingNo ?? "",
      city: p.city ?? "",
      governorate: p.governorate ?? "",
      contactNumber: p.contactNumber === "-" ? "" : (p.contactNumber ?? ""),
      openHours:
        p.openHours && p.openHours !== "-" ? p.openHours : "9AM - 11PM",
    });
    setModal("edit");
  };

  const handleEdit = async () => {
    const errors = validateEditForm(editForm);
    if (errors.length) {
      showToast(
        "warning",
        errors.length === 1
          ? errors[0]
          : "Please fix the following issues before saving.",
        errors.length > 1 ? errors : [],
      );
      return;
    }

    try {
      const updated = await update(selected.id, {
        name: editForm.name,
        contactNumber: editForm.contactNumber,
        openHours: editForm.openHours || "9AM - 11PM",
        address: {
          street: editForm.street,
          buildingNo: editForm.buildingNo,
          city: editForm.city,
          governorate: editForm.governorate,
          latitude: 0,
          longitude: 0,
        },
      });

      if (updated) {
        showToast("success", "Pharmacy updated successfully.");
        setModal(null);
        fetchAll();
      } else {
        showToast("error", "Failed to update pharmacy. Please try again.");
      }
    } catch (err) {
      const details = extractErrors(err);
      showToast(
        "error",
        details.length
          ? "Validation failed — review the errors below."
          : extractMessage(err),
        details,
      );
    }
  };

  const handleResetPassword = (p) => {
    setConfirmData({
      title: "Reset Password",
      message: `Reset the manager password for "${p.name}"?`,
      confirmText: "Reset",
      onConfirm: async () => {
        try {
          const newPwd = await resetPassword(p.id);
          setConfirmData(null);
          if (newPwd) {
            setSuccessData({
              email: p.managerEmail ?? p.raw?.managerEmail ?? "manager@email",
              password: newPwd,
              title: "Password Reset!",
            });
          } else {
            showToast("error", "Failed to reset password. Please try again.");
          }
        } catch (err) {
          setConfirmData(null);
          showToast("error", extractMessage(err));
        }
      },
    });
  };

  const handleDelete = (p) => {
    setConfirmData({
      title: "Delete Pharmacy",
      danger: true,
      message: `Are you sure you want to delete "${p.name}"? This will deactivate it.`,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          const ok = await remove(p.id);
          setConfirmData(null);
          if (ok) showToast("success", `"${p.name}" has been deleted.`);
          else
            showToast(
              "error",
              "Could not delete pharmacy — it may have active branches.",
            );
        } catch (err) {
          setConfirmData(null);
          showToast("error", extractMessage(err));
        }
      },
    });
  };

  const handleRestore = (p) => {
    setConfirmData({
      title: "Restore Pharmacy",
      message: `Restore "${p.name}" back to active state?`,
      confirmText: "Restore",
      onConfirm: async () => {
        try {
          const ok = await restore(p.id);
          setConfirmData(null);
          if (ok) showToast("success", `"${p.name}" has been restored.`);
          else showToast("error", "Could not restore pharmacy.");
        } catch (err) {
          setConfirmData(null);
          showToast("error", extractMessage(err));
        }
      },
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Image size must not exceed 5 MB.");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      showToast("error", "Only JPG or PNG images are allowed.");
      return;
    }
    if (addForm.imagePreview?.startsWith("blob:"))
      URL.revokeObjectURL(addForm.imagePreview);
    setAddForm({
      ...addForm,
      image: file,
      imagePreview: URL.createObjectURL(file),
    });
  };

  return (
    <>
      <div className="min-h-screen space-y-6 bg-[#f5f7fb] p-8 lg:p-10">
        {/* HEADER */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Pharmacies</h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage and control all registered pharmacies &amp; branches
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-full border bg-white p-1 text-sm">
              {[
                { key: "all", label: "All" },
                { key: "main", label: "Main" },
                { key: "branch", label: "Branches" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setFilterType(tab.key);
                    setPage(1);
                  }}
                  className={`rounded-full px-4 py-1.5 transition ${filterType === tab.key ? "bg-secondary text-white" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex w-[260px] items-center gap-2 rounded-xl border bg-white px-4 py-2.5">
              <Search size={16} className="text-gray-400" />
              <input
                placeholder="Search pharmacy..."
                className="w-full bg-transparent text-sm outline-none"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button
              onClick={() => setModal("add")}
              className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm text-white shadow-sm transition hover:opacity-90"
            >
              <Plus size={16} /> Add Pharmacy
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatsCard
            icon={<Building2 size={20} />}
            label="Total Pharmacies"
            value={pharmacies.length}
            color="bg-blue-50 text-blue-600"
          />
          <StatsCard
            icon={<Building2 size={20} />}
            label="Main Pharmacies"
            value={pharmacies.filter((p) => !p.isBranch).length}
            color="bg-purple-50 text-purple-600"
          />
          <StatsCard
            icon={<GitBranch size={20} />}
            label="Branches"
            value={pharmacies.filter((p) => p.isBranch).length}
            color="bg-green-50 text-green-600"
          />
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  {[
                    "Logo",
                    "Name",
                    "Phone",
                    "Location",
                    "Type",
                    "Status",
                    "Branches",
                    "Orders",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-3 py-3 ${h === "Logo" || h === "Type" || h === "Status" || h === "Branches" || h === "Orders" || h === "Actions" ? "text-center" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && data.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <Loader2 className="inline-block animate-spin text-gray-400" />
                      <p className="mt-2 text-sm text-gray-400">Loading...</p>
                    </td>
                  </tr>
                )}
                {!loading && data.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      No pharmacies found
                    </td>
                  </tr>
                )}
                {data.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50/60">
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <PharmacyAvatar
                          src={p.imageUrl}
                          name={p.name}
                          size="sm"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-800">
                      {p.name}
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {p.contactNumber}
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {buildLocationText(p) || p.location}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <TypeBadge isBranch={p.isBranch} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <StatusBadge status={p.statusLabel} />
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {p.isBranch ? "—" : p.branchesCount}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {p.totalOrders}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center gap-1.5">
                        <IconBtn
                          title="View"
                          color="text-blue-500 hover:bg-blue-50"
                          onClick={() => handleView(p)}
                        >
                          <Eye size={16} />
                        </IconBtn>
                        <IconBtn
                          title="Edit"
                          color="text-gray-500 hover:bg-gray-100"
                          onClick={() => openEdit(p)}
                        >
                          <Edit size={16} />
                        </IconBtn>
                        <IconBtn
                          title="Reset Password"
                          color="text-orange-500 hover:bg-orange-50"
                          onClick={() => handleResetPassword(p)}
                        >
                          <KeyRound size={16} />
                        </IconBtn>
                        {p.isDeleted ? (
                          <IconBtn
                            title="Restore"
                            color="text-green-500 hover:bg-green-50"
                            onClick={() => handleRestore(p)}
                          >
                            <RotateCcw size={16} />
                          </IconBtn>
                        ) : (
                          <IconBtn
                            title="Delete"
                            color="text-red-500 hover:bg-red-50"
                            onClick={() => handleDelete(p)}
                          >
                            <Trash2 size={16} />
                          </IconBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`h-9 w-9 rounded-full text-sm transition ${page === i + 1 ? "bg-secondary text-white shadow" : "border bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/*  ADD MODAL  */}
        {modal === "add" && (
          <Modal
            onClose={() => {
              resetAddForm();
              setModal(null);
            }}
            width="560px"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Plus size={18} /> Add New Pharmacy
            </h2>
            <p className="text-xs text-gray-400">
              Fields marked <span className="text-red-500">*</span> are required
            </p>

            <Section title="Pharmacy Info">
              <Field
                label="Pharmacy Name *"
                placeholder="e.g. Pharma Plus"
                value={addForm.pharmacyName}
                onChange={(v) => setAddForm({ ...addForm, pharmacyName: v })}
              />
              <div>
                <label className="mb-1 block text-xs text-gray-500">
                  Open Hours *
                </label>
                <TimeRangePicker
                  value={addForm.openHours}
                  onChange={(v) => setAddForm({ ...addForm, openHours: v })}
                  placeholder="Select open hours"
                />
              </div>
            </Section>

            <Section title="Pharmacy Address">
              {addresses?.length > 0 && (
                <div className="rounded-lg bg-blue-50 p-3">
                  <label className="mb-1 flex items-center gap-1 text-xs text-blue-700">
                    <Home size={11} /> Use a saved address (optional)
                  </label>
                  <select
                    className="w-full rounded-lg border bg-white p-2 text-sm"
                    value={addForm.selectedAddressId}
                    onChange={(e) => handleSelectSavedAddress(e.target.value)}
                    disabled={addressLoading}
                  >
                    <option value="">
                      -- {addressLoading ? "Loading..." : "Select to autofill"}{" "}
                      --
                    </option>
                    {addresses.map((a) => {
                      const id = a.id ?? a.Id;
                      return (
                        <option key={id} value={id}>
                          {[
                            a.street ?? a.Street,
                            a.city ?? a.City,
                            a.governorate ?? a.Governorate,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
              <Field
                label="Street *"
                placeholder="e.g. El-Tahrir Street"
                value={addForm.street}
                onChange={(v) =>
                  setAddForm({ ...addForm, street: v, selectedAddressId: "" })
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Building No."
                  placeholder="e.g. 12"
                  value={addForm.buildingNo}
                  onChange={(v) =>
                    setAddForm({
                      ...addForm,
                      buildingNo: v,
                      selectedAddressId: "",
                    })
                  }
                />
                <Field
                  label="City / Area *"
                  placeholder="e.g. Nasr City"
                  value={addForm.city}
                  onChange={(v) =>
                    setAddForm({ ...addForm, city: v, selectedAddressId: "" })
                  }
                />
              </div>
              <Field
                label="Governorate *"
                placeholder="e.g. Cairo"
                value={addForm.governorate}
                onChange={(v) =>
                  setAddForm({
                    ...addForm,
                    governorate: v,
                    selectedAddressId: "",
                  })
                }
              />
              {(addForm.street || addForm.city || addForm.governorate) && (
                <div className="rounded-md bg-gray-50 p-2 text-xs text-gray-600">
                  <span className="font-semibold">Preview:</span>{" "}
                  {buildLocationText(addForm) || "—"}
                </div>
              )}
            </Section>

            <Section title="Manager Info">
              <Field
                label="Manager Name *"
                placeholder="e.g. Ahmed Ali"
                value={addForm.managerName}
                onChange={(v) => setAddForm({ ...addForm, managerName: v })}
              />
              <Field
                label="Manager Email *"
                type="email"
                placeholder="manager@example.com"
                value={addForm.managerEmail}
                onChange={(v) => setAddForm({ ...addForm, managerEmail: v })}
              />
              <Field
                label="Manager Phone *"
                placeholder="01012345678"
                value={addForm.managerPhone}
                hint="Egyptian number: 010, 011, 012, 015"
                onChange={(v) => setAddForm({ ...addForm, managerPhone: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Qualification"
                  placeholder="B.Pharm"
                  value={addForm.managerQualification}
                  onChange={(v) =>
                    setAddForm({ ...addForm, managerQualification: v })
                  }
                />
                <Field
                  label="Experience (years)"
                  type="number"
                  placeholder="5"
                  value={addForm.managerExperienceYears}
                  hint="0 – 60"
                  onChange={(v) =>
                    setAddForm({ ...addForm, managerExperienceYears: v })
                  }
                />
              </div>
            </Section>

            <Section title="Logo">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-gray-100">
                  {addForm.imagePreview ? (
                    <img
                      src={addForm.imagePreview}
                      className="h-full w-full object-cover"
                      alt="logo"
                    />
                  ) : (
                    <span className="text-center text-xs text-gray-400">
                      No logo
                    </span>
                  )}
                </div>
                <label className="flex-1 cursor-pointer rounded-lg border border-dashed border-gray-300 p-3 text-center text-sm text-gray-400 transition hover:border-secondary hover:text-secondary">
                  Click to upload (JPG / PNG, max 5 MB)
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </Section>

            <Section title="Type">
              <label className="flex cursor-pointer select-none items-center gap-3">
                <div
                  onClick={() =>
                    setAddForm({
                      ...addForm,
                      isBranch: !addForm.isBranch,
                      parentPharmacyId: "",
                    })
                  }
                  className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors duration-200 ${addForm.isBranch ? "bg-secondary" : "bg-gray-300"}`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${addForm.isBranch ? "translate-x-5" : "translate-x-0"}`}
                  />
                </div>
                <span className="text-sm text-gray-700">
                  Create as Branch (under main pharmacy)
                </span>
              </label>
              {addForm.isBranch && (
                <div className="mt-3">
                  <label className="mb-1 block text-xs text-gray-500">
                    Parent (Main) Pharmacy *
                  </label>
                  <select
                    className="w-full rounded-lg border bg-white p-2 text-sm"
                    value={addForm.parentPharmacyId}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        parentPharmacyId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Select main pharmacy --</option>
                    {mainPharmacies.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.location}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </Section>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  resetAddForm();
                  setModal(null);
                }}
                className="rounded-lg border px-5 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-secondary px-5 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />} Save
              </button>
            </div>
          </Modal>
        )}

        {/*  VIEW MODAL  */}
        {modal === "view" && selected && (
          <Modal onClose={() => setModal(null)} width="500px">
            <div className="flex items-center gap-3 border-b pb-3">
              <PharmacyAvatar
                src={selected.imageUrl}
                name={selected.name}
                size="md"
              />
              <div>
                <h2 className="text-lg font-semibold">{selected.name}</h2>
                <div className="mt-1 flex gap-2">
                  <TypeBadge isBranch={selected.isBranch} />
                  <StatusBadge status={selected.statusLabel} />
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <DetailRow
                icon={<MapPin size={14} />}
                label="Location"
                value={buildLocationText(selected) || selected.location}
              />
              <DetailRow
                icon={<Phone size={14} />}
                label="Phone"
                value={selected.contactNumber}
              />
              <DetailRow
                icon={<Clock size={14} />}
                label="Open Hours"
                value={selected.openHours}
              />
              <DetailRow
                icon={<User size={14} />}
                label="Manager"
                value={selected.managerName}
              />
              <DetailRow label="Admin" value={selected.adminName} />
              <DetailRow label="Total Orders" value={selected.totalOrders} />
              {!selected.isBranch && (
                <DetailRow
                  label="Branches Count"
                  value={selected.branchesCount}
                />
              )}
              {selected.parentPharmacyId && (
                <DetailRow
                  label="Parent Pharmacy"
                  value={
                    selected.parentPharmacyName ||
                    `#${selected.parentPharmacyId}`
                  }
                />
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setModal(null)}
                className="rounded-lg border px-5 py-2 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </Modal>
        )}

        {/*  EDIT MODAL  */}
        {modal === "edit" && selected && (
          <Modal onClose={() => setModal(null)} width="500px">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Edit size={18} /> Edit Pharmacy
            </h2>
            <p className="text-xs text-gray-400">
              Fields marked <span className="text-red-500">*</span> are required
            </p>

            <Field
              label="Name *"
              placeholder="Pharmacy name"
              value={editForm.name}
              onChange={(v) => setEditForm({ ...editForm, name: v })}
            />
            <Field
              label="Contact Number *"
              placeholder="01012345678"
              value={editForm.contactNumber}
              hint="Egyptian number: 010, 011, 012, 015"
              onChange={(v) => setEditForm({ ...editForm, contactNumber: v })}
            />
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Open Hours *
              </label>
              <TimeRangePicker
                value={editForm.openHours}
                onChange={(v) => setEditForm({ ...editForm, openHours: v })}
                placeholder="Select open hours"
              />
            </div>

            <Section title="Address">
              <Field
                label="Street"
                placeholder="e.g. El-Tahrir Street"
                value={editForm.street}
                onChange={(v) => setEditForm({ ...editForm, street: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Building No."
                  placeholder="e.g. 12"
                  value={editForm.buildingNo}
                  onChange={(v) => setEditForm({ ...editForm, buildingNo: v })}
                />
                <Field
                  label="City / Area"
                  placeholder="e.g. Nasr City"
                  value={editForm.city}
                  onChange={(v) => setEditForm({ ...editForm, city: v })}
                />
              </div>
              <Field
                label="Governorate"
                placeholder="e.g. Cairo"
                value={editForm.governorate}
                onChange={(v) => setEditForm({ ...editForm, governorate: v })}
              />
              {(editForm.street || editForm.city || editForm.governorate) && (
                <div className="rounded-md bg-gray-50 p-2 text-xs text-gray-600">
                  <span className="font-semibold">Preview:</span>{" "}
                  {buildLocationText(editForm) || "—"}
                </div>
              )}
            </Section>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setModal(null)}
                className="rounded-lg border px-5 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-secondary px-5 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}{" "}
                Update
              </button>
            </div>
          </Modal>
        )}

        {/*  SUCCESS MODAL  */}
        {successData && (
          <Modal onClose={() => setSuccessData(null)}>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-green-600">
              <CheckCircle size={18} />
              {successData.title || "Pharmacy Created!"}
            </h2>
            <p className="text-sm text-gray-500">
              Manager credentials generated successfully. Save them now — you
              won't see them again.
            </p>
            <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <Mail size={11} /> Manager Email
                </p>
                <p className="truncate font-medium">{successData.email}</p>
              </div>
              <CopyButton value={successData.email} />
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-xs text-gray-400">
                  <KeyRound size={11} /> Password
                </p>
                <p className="font-mono font-medium">
                  {successData.password || "—"}
                </p>
              </div>
              <CopyButton value={successData.password} />
            </div>
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `Email: ${successData.email}\nPassword: ${successData.password}`,
                )
              }
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-2 text-white transition hover:opacity-90"
            >
              <Copy size={14} /> Copy All
            </button>
            <div className="flex justify-end">
              <button
                onClick={() => setSuccessData(null)}
                className="rounded-lg border px-5 py-2 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </Modal>
        )}

        {/*  CONFIRM MODAL  */}
        {confirmData && (
          <Modal onClose={() => setConfirmData(null)}>
            <h2
              className={`flex items-center gap-2 text-lg font-semibold ${confirmData.danger ? "text-red-600" : "text-gray-800"}`}
            >
              {confirmData.title}
            </h2>
            <p className="text-sm text-gray-600">{confirmData.message}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmData(null)}
                className="rounded-lg border px-5 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmData.onConfirm}
                className={`rounded-lg px-5 py-2 text-sm text-white ${confirmData.danger ? "bg-red-500 hover:bg-red-600" : "bg-secondary hover:opacity-90"}`}
              >
                {confirmData.confirmText || "Confirm"}
              </button>
            </div>
          </Modal>
        )}
      </div>

      {createPortal(
        <Toast toast={toast} onClose={() => setToast(null)} />,
        document.body,
      )}
    </>
  );
}
