// src/features/pharmacies/pages/Pharmacies.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
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
  ChevronDown,
  ChevronUp,
  Home,
} from "lucide-react";
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

function PharmacyAvatar({ src, name, size = "md" }) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  const sizeClasses = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-lg",
    lg: "h-20 w-20 text-2xl",
  };

  const showImage = src && !errored;

  return showImage ? (
    <img
      src={getImageUrl(src)}
      onError={() => setErrored(true)}
      className={`${sizeClasses[size]} rounded-full border object-cover`}
      alt={name || "pharmacy"}
    />
  ) : (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 font-semibold text-blue-700`}
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
  const styles =
    status === "Active"
      ? "bg-green-100 text-green-700"
      : status === "Deleted"
        ? "bg-red-100 text-red-600"
        : "bg-yellow-100 text-yellow-700";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}>
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
  const handle = () => {
    navigator.clipboard.writeText(value ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs transition hover:bg-gray-200"
    >
      <Copy size={12} />
      {copied ? "Copied!" : label}
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
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmData, setConfirmData] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAdvancedEdit, setShowAdvancedEdit] = useState(false);

  const emptyForm = {
    pharmacyName: "",
    street: "",
    buildingNo: "",
    city: "",
    governorate: "",
    latitude: "",
    longitude: "",
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
  const [addForm, setAddForm] = useState(emptyForm);

  const [editForm, setEditForm] = useState({
    name: "",
    street: "",
    buildingNo: "",
    city: "",
    governorate: "",
    contactNumber: "",
    openHours: "9AM - 11PM",
  });

  const perPage = 7;

  useEffect(() => {
    fetchAll();
    fetchMain();
    fetchUserAddresses();
  }, [fetchAll, fetchMain, fetchUserAddresses]);

  useEffect(() => {
    return () => {
      if (addForm.imagePreview && addForm.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(addForm.imagePreview);
      }
    };
  }, [addForm.imagePreview]);

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
    if (addForm.imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(addForm.imagePreview);
    }
    setAddForm(emptyForm);
    setShowAdvanced(false);
  }, [addForm.imagePreview]);

  const handleAdd = async () => {
    const {
      pharmacyName,
      managerName,
      managerEmail,
      managerPhone,
      street,
      city,
      governorate,
    } = addForm;

    if (!pharmacyName || !managerName || !managerEmail || !managerPhone) {
      setErrorMsg("Please fill all required fields (*)");
      return;
    }

    if (!street && !city && !governorate) {
      setErrorMsg(
        "Please enter the pharmacy address (street, city, governorate)",
      );
      return;
    }

    if (addForm.isBranch && !addForm.parentPharmacyId) {
      setErrorMsg("Please select a parent (main) pharmacy for the branch");
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
          latitude: parseFloat(addForm.latitude) || 0,
          longitude: parseFloat(addForm.longitude) || 0,
        },
        image: addForm.image,
      };

      if (addForm.isBranch && addForm.parentPharmacyId) {
        payload.parentPharmacyId = parseInt(addForm.parentPharmacyId, 10);
      }

      const res = await create(payload);
      if (!res) {
        setErrorMsg("Failed to create pharmacy. Please try again.");
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
      setErrorMsg(err?.message || "Error creating pharmacy");
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
    setShowAdvancedEdit(false);
    setModal("edit");
  };

  const handleEdit = async () => {
    if (!editForm.name) {
      setErrorMsg("Pharmacy name is required");
      return;
    }

    const updated = await update(selected.id, {
      name: editForm.name,
      contactNumber: editForm.contactNumber,
      openHours: editForm.openHours || "9AM - 11PM",
      address: {
        street: editForm.street,
        buildingNo: editForm.buildingNo,
        city: editForm.city,
        governorate: editForm.governorate,
      },
    });

    if (updated) {
      setModal(null);
      fetchAll();
    } else {
      setErrorMsg("Error updating pharmacy");
    }
  };

  const handleResetPassword = (p) => {
    setConfirmData({
      title: "Reset Password",
      message: `Reset the manager password for "${p.name}"?`,
      confirmText: "Reset",
      onConfirm: async () => {
        const newPwd = await resetPassword(p.id);
        setConfirmData(null);
        if (newPwd) {
          setSuccessData({
            email: p.managerEmail ?? p.raw?.managerEmail ?? "manager@email",
            password: newPwd,
            title: "Password Reset!",
          });
        } else {
          setErrorMsg("Failed to reset password");
        }
      },
    });
  };

  const handleDelete = (p) => {
    setConfirmData({
      title: "Delete Pharmacy",
      message: `Are you sure you want to delete "${p.name}"? This will deactivate it.`,
      confirmText: "Delete",
      danger: true,
      onConfirm: async () => {
        const ok = await remove(p.id);
        setConfirmData(null);
        if (!ok) {
          setErrorMsg(
            "Could not delete pharmacy (it may have active branches).",
          );
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
        const ok = await restore(p.id);
        setConfirmData(null);
        if (!ok) setErrorMsg("Could not restore pharmacy.");
      },
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (addForm.imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(addForm.imagePreview);
    }

    setAddForm({
      ...addForm,
      image: file,
      imagePreview: URL.createObjectURL(file),
    });
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f7fb] p-8 lg:p-10">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Pharmacies</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage and control all registered pharmacies & branches
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
                className={`rounded-full px-4 py-1.5 transition ${
                  filterType === tab.key
                    ? "bg-secondary text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
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

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-3 text-center">Logo</th>
                <th className="px-3 py-3 text-left">Name</th>
                <th className="px-3 py-3 text-left">Phone</th>
                <th className="px-3 py-3 text-left">Location</th>
                <th className="px-3 py-3 text-center">Type</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-center">Branches</th>
                <th className="px-3 py-3 text-center">Orders</th>
                <th className="px-3 py-3 text-center">Actions</th>
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
                  <td className="px-3 py-3 text-gray-600">{p.contactNumber}</td>
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 w-9 rounded-full text-sm transition ${
                page === i + 1
                  ? "bg-secondary text-white shadow"
                  : "border bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {modal === "add" && (
        <Modal onClose={() => setModal(null)} width="560px">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Plus size={18} /> Add New Pharmacy
          </h2>
          <p className="text-xs text-gray-400">
            Create a new pharmacy with its manager account
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
                Open Hours
              </label>
              <TimeRangePicker
                value={addForm.openHours}
                onChange={(v) => setAddForm({ ...addForm, openHours: v })}
                placeholder="Select open hours"
              />
            </div>
          </Section>

          <Section title="Pharmacy Address">
            {addresses && addresses.length > 0 && (
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
                    -- {addressLoading ? "Loading..." : "Select to autofill"} --
                  </option>
                  {addresses.map((a) => {
                    const id = a.id ?? a.Id;
                    const street = a.street ?? a.Street ?? "";
                    const city = a.city ?? a.City ?? "";
                    const gov = a.governorate ?? a.Governorate ?? "";
                    return (
                      <option key={id} value={id}>
                        {[street, city, gov].filter(Boolean).join(", ")}
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

            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="flex items-center gap-1 text-xs text-secondary hover:underline"
            >
              {showAdvanced ? (
                <ChevronUp size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
              Advanced (GPS coordinates - optional)
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
                <Field
                  label="Latitude"
                  placeholder="30.0444"
                  value={addForm.latitude}
                  onChange={(v) => setAddForm({ ...addForm, latitude: v })}
                />
                <Field
                  label="Longitude"
                  placeholder="31.2357"
                  value={addForm.longitude}
                  onChange={(v) => setAddForm({ ...addForm, longitude: v })}
                />
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
                Click to upload image
                <input
                  type="file"
                  accept="image/*"
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
                className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors duration-200 ${
                  addForm.isBranch ? "bg-secondary" : "bg-gray-300"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    addForm.isBranch ? "translate-x-5" : "translate-x-0"
                  }`}
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
                    setAddForm({ ...addForm, parentPharmacyId: e.target.value })
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
              {loading && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
          </div>
        </Modal>
      )}

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
            <DetailRow label="Latitude" value={selected.latitude} />
            <DetailRow label="Longitude" value={selected.longitude} />
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
                  selected.parentPharmacyName || `#${selected.parentPharmacyId}`
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

      {modal === "edit" && selected && (
        <Modal onClose={() => setModal(null)} width="500px">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Edit size={18} /> Edit Pharmacy
          </h2>

          <Field
            label="Name *"
            placeholder="Pharmacy name"
            value={editForm.name}
            onChange={(v) => setEditForm({ ...editForm, name: v })}
          />

          <Field
            label="Contact Number"
            placeholder="01012345678"
            value={editForm.contactNumber}
            onChange={(v) => setEditForm({ ...editForm, contactNumber: v })}
          />

          <div>
            <label className="mb-1 block text-xs text-gray-500">
              Open Hours
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

            {showAdvancedEdit && (
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
                <Field
                  label="Latitude"
                  placeholder="30.0444"
                  value={editForm.latitude}
                  onChange={(v) => setEditForm({ ...editForm, latitude: v })}
                />
                <Field
                  label="Longitude"
                  placeholder="31.2357"
                  value={editForm.longitude}
                  onChange={(v) => setEditForm({ ...editForm, longitude: v })}
                />
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
              className="rounded-lg bg-secondary px-5 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
            >
              Update
            </button>
          </div>
        </Modal>
      )}

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
            onClick={() => {
              navigator.clipboard.writeText(
                `Email: ${successData.email}\nPassword: ${successData.password}`,
              );
            }}
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

      {errorMsg && (
        <Modal onClose={() => setErrorMsg("")}>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-red-600">
            <XCircle size={18} /> Error
          </h2>
          <p className="text-sm text-gray-600">{errorMsg}</p>
          <div className="flex justify-end">
            <button
              onClick={() => setErrorMsg("")}
              className="rounded-lg bg-red-500 px-5 py-2 text-sm text-white hover:bg-red-600"
            >
              OK
            </button>
          </div>
        </Modal>
      )}

      {confirmData && (
        <Modal onClose={() => setConfirmData(null)}>
          <h2
            className={`flex items-center gap-2 text-lg font-semibold ${
              confirmData.danger ? "text-red-600" : "text-gray-800"
            }`}
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
              className={`rounded-lg px-5 py-2 text-sm text-white ${
                confirmData.danger
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-secondary hover:opacity-90"
              }`}
            >
              {confirmData.confirmText || "Confirm"}
            </button>
          </div>
        </Modal>
      )}
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

function Field({ label, value, onChange, placeholder, type = "text" }) {
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
