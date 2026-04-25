import React, { useMemo, useState, useEffect } from "react";
import { Search, Plus, Eye, Edit, KeyRound, X, CheckCircle, XCircle } from "lucide-react";
import useSuperAdminPharmacies from "../hooks/useSuperAdminPharmacies";

/* ─────────────────────────────────────────────
   MODAL WRAPPER
───────────────────────────────────────────── */
function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[440px] space-y-4 relative shadow-xl max-h-[90vh] overflow-y-auto">
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
      alert("Please fill all required fields");
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
      };

      console.log("🚀 Sending payload:", payload);

      const res = await create(payload);
      alert(
        `✅ Pharmacy created!\n\nAdmin Email: ${res.adminEmail}\nGenerated Password: ${res.generatedPassword}`
      );
      setAddForm(emptyForm);
      setModal(null);
      fetchAll();
    } catch (err) {
      alert(`❌ ${err?.message || "Error creating pharmacy"}`);
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
    <div className="p-10 bg-[#f5f7fb] min-h-screen space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Pharmacies</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage and control all registered pharmacies
        </p>
      </div>

      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 bg-secondary text-white px-6 py-2 rounded-full"
        >
          <Plus size={16} /> Add Pharmacy
        </button>
        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border w-[320px]">
          <Search size={16} className="text-gray-400" />
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

      {/* TABLE */}
      <div className="bg-white rounded-2xl border overflow-hidden">
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

                {/* Logo */}
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

                {/* Status */}
                <td className="py-3 px-2 text-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      p.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                {/* Branch */}
                <td className="py-3 px-2 text-center">
                  {p.isMain ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                      Main
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-400">
                      Sub
                    </span>
                  )}
                </td>

                {/* Subscription Badge */}
                <td className="py-3 px-2 text-center">
                  <SubBadge status={p.subscriptionStatus} />
                </td>

                {/* Plan */}
                <td className="py-3 px-2 text-center">
                  {p.plan ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 font-medium">
                      {p.plan}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>

                {/* Days Remaining */}
                <td className="py-3 px-2 text-center">
                  {p.daysRemaining !== null ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      {p.daysRemaining}d
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-2">
                  <div className="flex justify-center gap-2">
                    <button
                      title="View"
                      onClick={() => handleView(p)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      title="Edit"
                      onClick={() => openEdit(p)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit size={17} />
                    </button>

                    <button
                      title="Reset Password"
                      onClick={() => handleResetPassword(p)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <KeyRound size={17} />
                    </button>

                    {p.subscriptionStatus === "Active" ? (
                      <button
                        title="Deactivate"
                        onClick={() => handleToggle(p)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle size={17} />
                      </button>
                    ) : p.subscriptionStatus ? (
                      <button
                        title="Activate"
                        onClick={() => handleToggle(p)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <CheckCircle size={17} />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={11} className="py-10 text-center text-gray-400">
                  No pharmacies found
                </td>
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
              className={`w-8 h-8 rounded-full text-sm ${
                page === i + 1
                  ? "bg-secondary text-white"
                  : "bg-white border text-gray-600"
              }`}
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
              className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
                addForm.isMain ? "bg-secondary" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  addForm.isMain ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
            <span className="text-sm text-gray-600">Main Branch</span>
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setModal(null)} className="px-4 py-2 border rounded-lg text-sm">
              Cancel
            </button>
            <button onClick={handleAdd} className="bg-secondary text-white px-4 py-2 rounded-lg text-sm">
              Save
            </button>
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
            <button onClick={() => setModal(null)} className="px-4 py-2 border rounded-lg text-sm">
              Close
            </button>
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
          ].map(({ label, key, placeholder, type = "text" }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                className="border p-2 w-full rounded-lg text-sm"
                value={editForm[key]}
                onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setModal(null)} className="px-4 py-2 border rounded-lg text-sm">
              Cancel
            </button>
            <button onClick={handleEdit} className="bg-secondary text-white px-4 py-2 rounded-lg text-sm">
              Update
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}