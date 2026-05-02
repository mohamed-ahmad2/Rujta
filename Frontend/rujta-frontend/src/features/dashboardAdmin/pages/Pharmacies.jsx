import React, { useMemo, useState, useEffect } from "react";
import { Search, Plus, Eye, Edit, KeyRound, X, CheckCircle, XCircle, MapPin, Phone, Package } from "lucide-react";
import useSuperAdminPharmacies from "../hooks/useSuperAdminPharmacies";

/* ─────────────────────────────────────────────
   MODAL WRAPPER
───────────────────────────────────────────── */
function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white p-6 rounded-t-2xl sm:rounded-xl w-full sm:w-[440px] space-y-4 relative shadow-xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUBSCRIPTION BADGE
───────────────────────────────────────────── */
function SubBadge({ status }) {
  if (!status) return <span className="text-gray-300 text-xs">—</span>;
  const styles =
    status === "Active"
      ? "bg-green-100 text-green-600"
      : status === "Expired"
      ? "bg-red-100 text-red-600"
      : "bg-yellow-100 text-yellow-600";
  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles}`}>
      {status}
    </span>
  );
}

/* ─────────────────────────────────────────────
   MOBILE PHARMACY CARD
───────────────────────────────────────────── */
function PharmacyCard({ p, onView, onEdit, onResetPassword, onToggle }) {
  return (
    <div className="bg-white rounded-2xl border p-4 space-y-3">
      {/* Top row: logo + name + status */}
      <div className="flex items-center gap-3">
        {p.logo ? (
          <img src={p.logo} className="w-12 h-12 rounded-full object-cover shrink-0" alt="" />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-base font-bold text-gray-500 shrink-0">
            {p.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-sm truncate">{p.name}</span>
            {p.isMain ? (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 shrink-0">Main</span>
            ) : (
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-400 shrink-0">Sub</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-green-500" : "bg-red-400"}`} />
            <span className="text-xs text-gray-500">{p.status}</span>
          </div>
        </div>
        <SubBadge status={p.subscriptionStatus} />
      </div>

      {/* Info row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {p.phone && (
          <span className="flex items-center gap-1">
            <Phone size={11} /> {p.phone}
          </span>
        )}
        {p.location && (
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {p.location}
          </span>
        )}
        {p.totalOrders != null && (
          <span className="flex items-center gap-1">
            <Package size={11} /> {p.totalOrders} orders
          </span>
        )}
      </div>

      {/* Plan + Days */}
      <div className="flex items-center gap-2 flex-wrap">
        {p.plan ? (
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 font-medium">{p.plan}</span>
        ) : null}
        {p.daysRemaining !== null ? (
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{p.daysRemaining}d remaining</span>
        ) : null}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <button
          title="View"
          onClick={() => onView(p)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
        >
          <Eye size={14} /> View
        </button>
        <button
          title="Edit"
          onClick={() => onEdit(p)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100"
        >
          <Edit size={14} /> Edit
        </button>
        <button
          title="Reset Password"
          onClick={() => onResetPassword(p)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100"
        >
          <KeyRound size={14} /> Reset
        </button>
        {p.subscriptionStatus === "Active" ? (
          <button
            title="Deactivate"
            onClick={() => onToggle(p)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100"
          >
            <XCircle size={14} /> Off
          </button>
        ) : p.subscriptionStatus ? (
          <button
            title="Activate"
            onClick={() => onToggle(p)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100"
          >
            <CheckCircle size={14} /> On
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function Pharmacies() {
  const {
    pharmacies,
    fetchAll,
    fetchById,
    create,
    update,
    resetPassword,
    activate,
    deactivate,
  } = useSuperAdminPharmacies();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  /* ---------- ADD FORM ---------- */
  const emptyForm = {
    pharmacyName: "",
    adminPhone: "",
    pharmacyLocation: "",
    adminEmail: "",
    adminName: "",
    latitude: "",
    longitude: "",
    logo: null,
    logoPreview: null,
    isMain: false,
  };
  const [addForm, setAddForm] = useState(emptyForm);

  /* ---------- EDIT FORM ---------- */
  const [editForm, setEditForm] = useState({
    name: "",
    location: "",
    contactNumber: "",
    latitude: "",
    longitude: "",
  });

  const perPage = 7;

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = useMemo(() => {
    if (!q) return pharmacies;
    return pharmacies.filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.location.toLowerCase().includes(q.toLowerCase())
    );
  }, [q, pharmacies]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const data = filtered.slice((page - 1) * perPage, page * perPage);

  /* ══ ADD ══ */
  const handleAdd = async () => {
    const { pharmacyName, adminPhone, adminEmail, adminName } = addForm;
    if (!pharmacyName || !adminPhone || !adminEmail || !adminName) {
      setErrorMsg("Please fill all required fields");
      return;
    }
    try {
      const payload = {
        pharmacyName: addForm.pharmacyName,
        pharmacyLocation: addForm.pharmacyLocation || "Not provided",
        latitude: parseFloat(addForm.latitude) || 0,
        longitude: parseFloat(addForm.longitude) || 0,
        adminName: addForm.adminName,
        adminEmail: addForm.adminEmail,
        adminPhone: addForm.adminPhone,
        logo: addForm.logo,
      };
      const res = await create(payload);
      setSuccessData({
        email: res.adminEmail,
        password: res.generatedPassword,
      });
      setAddForm(emptyForm);
      setModal(null);
      fetchAll();
    } catch (err) {
      setErrorMsg(err?.message || "Error creating pharmacy");
    }
  };

  /* ══ VIEW ══ */
  const handleView = async (p) => {
    try {
      const detail = await fetchById(p.id);
      setSelected({ ...p, ...detail });
    } catch {
      setSelected(p);
    }
    setModal("view");
  };

  /* ══ EDIT ══ */
  const openEdit = (p) => {
    setSelected(p);
    setEditForm({
      name: p.name,
      location: p.location,
      contactNumber: p.phone,
      latitude: p.raw?.latitude || "",
      longitude: p.raw?.longitude || "",
    });
    setModal("edit");
  };

  const handleEdit = async () => {
    if (!editForm.name) {
      alert("Name is required");
      return;
    }
    try {
      await update(selected.id, {
        name: editForm.name,
        location: editForm.location,
        contactNumber: editForm.contactNumber,
        latitude: parseFloat(editForm.latitude) || 0,
        longitude: parseFloat(editForm.longitude) || 0,
      });
      alert("✅ Pharmacy updated successfully!");
      setModal(null);
      fetchAll();
    } catch (err) {
      alert(`❌ ${err?.message || "Error updating pharmacy"}`);
    }
  };

  /* ══ RESET PASSWORD ══ */
  const handleResetPassword = async (p) => {
    if (!window.confirm(`Reset password for "${p.name}"?`)) return;
    try {
      const res = await resetPassword(p.id);
      alert(`✅ New Password: ${res.newPassword}`);
    } catch (err) {
      alert(err?.message || "Error resetting password");
    }
  };

  /* ══ ACTIVATE / DEACTIVATE ══ */
  const handleToggle = async (p) => {
    const isActive = p.subscriptionStatus === "Active";
    const action = isActive ? "Deactivate" : "Activate";
    if (!window.confirm(`Are you sure you want to ${action} "${p.name}"?`)) return;
    try {
      isActive ? await deactivate(p.id) : await activate(p.id);
      alert(`✅ ${action}d successfully!`);
      fetchAll();
    } catch (err) {
      alert(err?.message || `Error during ${action}`);
    }
  };

  /* ══════════════════════════════
     RENDER
  ══════════════════════════════ */
  return (
    <div className="p-4 sm:p-10 bg-[#f5f7fb] min-h-screen space-y-4 sm:space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Pharmacies</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage and control all registered pharmacies
        </p>
      </div>

      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
        <button
          onClick={() => setModal("add")}
          className="flex items-center justify-center gap-2 bg-secondary text-white px-6 py-3 sm:py-2 rounded-full text-sm font-medium"
        >
          <Plus size={16} /> Add Pharmacy
        </button>
        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border w-full sm:w-[320px]">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            placeholder="Search pharmacy..."
            className="bg-transparent outline-none w-full text-sm"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="flex flex-col gap-3 sm:hidden">
        {data.map((p, i) => (
          <PharmacyCard
            key={i}
            p={p}
            onView={handleView}
            onEdit={openEdit}
            onResetPassword={handleResetPassword}
            onToggle={handleToggle}
          />
        ))}
        {data.length === 0 && (
          <div className="py-10 text-center text-gray-400 bg-white rounded-2xl border">
            No pharmacies found
          </div>
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden sm:block bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="py-3 px-2 text-center">Logo</th>
              <th className="py-3 px-2 text-center">Name</th>
              <th className="py-3 px-2 text-center">Phone</th>
              <th className="py-3 px-2 text-center">Location</th>
              <th className="py-3 px-2 text-center">Total Orders</th>
              <th className="py-3 px-2 text-center">Status</th>
              <th className="py-3 px-2 text-center">Branch</th>
              <th className="py-3 px-2 text-center">Subscription</th>
              <th className="py-3 px-2 text-center">Plan</th>
              <th className="py-3 px-2 text-center">Days</th>
              <th className="py-3 px-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="py-3 px-2">
                  <div className="flex justify-center">
                    {p.logo ? (
                      <img src={p.logo} className="w-10 h-10 rounded-full" alt="" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-500">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-2 text-center font-medium">{p.name}</td>
                <td className="py-3 px-2 text-center">{p.phone}</td>
                <td className="py-3 px-2 text-center">{p.location}</td>
                <td className="py-3 px-2 text-center">{p.totalOrders ?? "-"}</td>
                <td className="py-3 px-2 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${p.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  {p.isMain ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">Main</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-400">Sub</span>
                  )}
                </td>
                <td className="py-3 px-2 text-center">
                  <SubBadge status={p.subscriptionStatus} />
                </td>
                <td className="py-3 px-2 text-center">
                  {p.plan ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 font-medium">{p.plan}</span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="py-3 px-2 text-center">
                  {p.daysRemaining !== null ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{p.daysRemaining}d</span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <div className="flex justify-center gap-2">
                    <button title="View" onClick={() => handleView(p)} className="text-blue-500 hover:text-blue-700"><Eye size={17} /></button>
                    <button title="Edit" onClick={() => openEdit(p)} className="text-gray-500 hover:text-gray-700"><Edit size={17} /></button>
                    <button title="Reset Password" onClick={() => handleResetPassword(p)} className="text-orange-500 hover:text-orange-700"><KeyRound size={17} /></button>
                    {p.subscriptionStatus === "Active" ? (
                      <button title="Deactivate" onClick={() => handleToggle(p)} className="text-red-500 hover:text-red-700"><XCircle size={17} /></button>
                    ) : p.subscriptionStatus ? (
                      <button title="Activate" onClick={() => handleToggle(p)} className="text-green-500 hover:text-green-700"><CheckCircle size={17} /></button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={11} className="py-10 text-center text-gray-400">No pharmacies found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-full text-sm ${page === i + 1 ? "bg-secondary text-white" : "bg-white border text-gray-600"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* ══ ADD MODAL ══ */}
      {modal === "add" && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="text-lg font-semibold">Add Pharmacy</h2>
          {[
            { label: "Pharmacy Name *", key: "pharmacyName", placeholder: "e.g. Pharma Plus" },
            { label: "Admin Name *", key: "adminName", placeholder: "e.g. Ahmed Ali" },
            { label: "Admin Email *", key: "adminEmail", placeholder: "admin@example.com", type: "email" },
            { label: "Admin Phone *", key: "adminPhone", placeholder: "e.g. 01012345678" },
            { label: "Location", key: "pharmacyLocation", placeholder: "e.g. Nasr City, Cairo" },
          ].map(({ label, key, placeholder, type = "text" }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                className="border p-2 w-full rounded-lg text-sm"
                value={addForm[key]}
                onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
              />
            </div>
          ))}

          {/* Logo */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden shrink-0">
                {addForm.logoPreview ? (
                  <img src={addForm.logoPreview} className="w-full h-full object-cover" alt="logo" />
                ) : (
                  <span className="text-gray-400 text-xs text-center">No logo</span>
                )}
              </div>
              <label className="flex-1 cursor-pointer border border-dashed border-gray-300 rounded-lg p-2 text-center text-sm text-gray-400 hover:border-gray-400 transition">
                Click to upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setAddForm({ ...addForm, logo: file, logoPreview: URL.createObjectURL(file) });
                  }}
                />
              </label>
            </div>
          </div>

          {/* Main Branch Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setAddForm({ ...addForm, isMain: !addForm.isMain })}
              className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${addForm.isMain ? "bg-secondary" : "bg-gray-300"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${addForm.isMain ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm text-gray-600">Main Branch</span>
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setModal(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            <button onClick={handleAdd} className="bg-secondary text-white px-4 py-2 rounded-lg text-sm">Save</button>
          </div>
        </Modal>
      )}

      {/* ══ VIEW MODAL ══ */}
      {modal === "view" && selected && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="text-lg font-semibold">Pharmacy Details</h2>
          <div className="space-y-2 text-sm">
            {[
              ["ID", selected.id],
              ["Name", selected.name],
              ["Location", selected.location],
              ["Phone", selected.contactNumber || selected.phone],
              ["Latitude", selected.latitude],
              ["Longitude", selected.longitude],
              ["Status", selected.isActive ? "Active" : "Inactive"],
              ["Total Orders", selected.totalOrders ?? "-"],
              ["Admin ID", selected.adminId ?? "-"],
              ["─────────", "─────────"],
              ["Subscription", selected.subscriptionStatus ?? "-"],
              ["Plan", selected.plan ?? "-"],
              ["Start Date", selected.startDate ? new Date(selected.startDate).toLocaleDateString() : "-"],
              ["End Date", selected.endDate ? new Date(selected.endDate).toLocaleDateString() : "-"],
              ["Days Remaining", selected.daysRemaining ?? "-"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b pb-1">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium">{val}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-1">
            <button onClick={() => setModal(null)} className="px-4 py-2 border rounded-lg text-sm">Close</button>
          </div>
        </Modal>
      )}

      {/* ══ EDIT MODAL ══ */}
      {modal === "edit" && selected && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="text-lg font-semibold">Edit Pharmacy</h2>
          {[
            { label: "Name *", key: "name", placeholder: "Pharmacy name" },
            { label: "Location", key: "location", placeholder: "e.g. Nasr City" },
            { label: "Contact Number", key: "contactNumber", placeholder: "e.g. 01012345678" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input
                placeholder={placeholder}
                className="border p-2 w-full rounded-lg text-sm"
                value={editForm[key]}
                onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setModal(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            <button onClick={handleEdit} className="bg-secondary text-white px-4 py-2 rounded-lg text-sm">Update</button>
          </div>
        </Modal>
      )}

      {/* ══ SUCCESS MODAL ══ */}
      {successData && (
        <Modal onClose={() => setSuccessData(null)}>
          <h2 className="text-lg font-semibold text-green-600 flex items-center gap-2">
            <CheckCircle size={18} /> Pharmacy Created!
          </h2>
          <p className="text-sm text-gray-500">Admin credentials generated successfully</p>
          <div className="border rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">Admin Email</p>
              <p className="font-medium text-sm break-all">{successData.email}</p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(successData.email)} className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 shrink-0 ml-2">Copy</button>
          </div>
          <div className="border rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">Password</p>
              <p className="font-medium">{successData.password}</p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(successData.password)} className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 shrink-0 ml-2">Copy</button>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(`Email: ${successData.email}\nPassword: ${successData.password}`)}
            className="w-full bg-secondary text-white py-2 rounded-lg mt-2 text-sm"
          >
            Copy All
          </button>
          <div className="flex justify-end">
            <button onClick={() => setSuccessData(null)} className="px-4 py-2 border rounded-lg text-sm">Close</button>
          </div>
        </Modal>
      )}

      {/* ══ ERROR MODAL ══ */}
      {errorMsg && (
        <Modal onClose={() => setErrorMsg("")}>
          <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <XCircle size={18} /> Error
          </h2>
          <p className="text-sm text-gray-600">{errorMsg}</p>
          <div className="flex justify-end">
            <button onClick={() => setErrorMsg("")} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm">OK</button>
          </div>
        </Modal>
      )}
    </div>
  );
}