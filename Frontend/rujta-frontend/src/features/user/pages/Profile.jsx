// src/features/user/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useUserProfile } from "../../userProfile/hook/useUserProfile"; // Adjusted path to match the hook location

export default function Profile() {
  const { profile, loading, error, updateProfile } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    addresses: [{ street: "", buildingNo: "", city: "", governorate: "" }],
  });

  /* ================= Profile Init ================= */
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.name || "",
        phoneNumber: profile.phoneNumber || "",
        addresses:
          profile.addresses?.length > 0
            ? profile.addresses
            : [
                {
                  street: "",
                  buildingNo: "",
                  city: "",
                  governorate: "",
                },
              ],
      });
    }
  }, [profile]);

  /* ================= Helpers ================= */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (index, field, value) => {
    const updated = [...formData.addresses];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, addresses: updated }));
  };

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        { street: "", buildingNo: "", city: "", governorate: "" },
      ],
    }));
  };

  const removeAddress = (index) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    const dto = {
      Name: formData.fullName,
      PhoneNumber: formData.phoneNumber,
      Addresses: formData.addresses,
      ProfileImageUrl: null,
    };

    const result = await updateProfile(dto);
    if (result) setIsEditing(false);
  };

  /* ================= States ================= */
  if (loading) return <p className="p-10 text-center">Loading...</p>;
  if (error) return <p className="p-10 text-center text-red-500">{error}</p>;

  /* ================= UI ================= */
  return (
    <section className="min-h-screen bg-[#F3F4F6] px-4 py-6 sm:px-6 lg:px-10">
      {/* ================= Profile Card ================= */}
      <div className="mt-4 rounded-xl bg-gradient-to-r from-secondary to-[#e8e0c9] p-4 sm:p-6">
        <div className="rounded-xl bg-white p-4 shadow-md sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xl text-gray-600 sm:h-16 sm:w-16 sm:text-3xl">
                {formData.fullName?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="text-base font-semibold sm:text-lg">
                  {formData.fullName}
                </h3>
                <p className="text-xs text-gray-500 sm:text-sm">
                  {profile?.email}
                </p>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={() => {
                if (isEditing) handleSave();
                else setIsEditing(true);
              }}
              className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 sm:w-auto sm:text-base ${
                isEditing
                  ? "bg-red-400 hover:bg-red-500"
                  : "hover:bg-secondary-dark bg-secondary"
              } active:scale-95`}
            >
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>
        </div>
      </div>

      {/* ================= Profile Form ================= */}
      <div className="mt-6 rounded-xl bg-white p-4 shadow-md sm:p-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <Input
            label="Full Name"
            value={formData.fullName}
            disabled={!isEditing}
            onChange={(e) => handleChange("fullName", e.target.value)}
          />
          <Input
            label="Phone Number"
            value={formData.phoneNumber}
            disabled={!isEditing}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
          />
        </div>

        {/* ================= Addresses ================= */}
        <div className="mt-8">
          <p className="mb-2 text-sm font-semibold text-gray-700 sm:text-base">
            My Addresses
          </p>

          <p className="mb-4 text-xs text-gray-500 sm:text-sm">
            The first address is your primary address used for main purposes.
            Additional addresses can be for other uses.
          </p>

          {formData.addresses.map((address, i) => (
            <div
              key={i}
              className="mb-6 rounded-xl border border-gray-200 p-4 sm:p-5"
            >
              {/* Header */}
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-gray-700 sm:text-base">
                  {i === 0 ? "Primary Address" : `Additional Address #${i}`}
                </p>

                {isEditing && formData.addresses.length > 1 && i > 0 && (
                  <button
                    onClick={() => removeAddress(i)}
                    className="text-red-500 transition hover:text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <Input
                  label="Street"
                  value={address.street}
                  disabled={!isEditing}
                  onChange={(e) =>
                    handleAddressChange(i, "street", e.target.value)
                  }
                />
                <Input
                  label="Building No"
                  value={address.buildingNo}
                  disabled={!isEditing}
                  onChange={(e) =>
                    handleAddressChange(i, "buildingNo", e.target.value)
                  }
                />
                <Input
                  label="City"
                  value={address.city}
                  disabled={!isEditing}
                  onChange={(e) =>
                    handleAddressChange(i, "city", e.target.value)
                  }
                />
                <Input
                  label="Governorate"
                  value={address.governorate}
                  disabled={!isEditing}
                  onChange={(e) =>
                    handleAddressChange(i, "governorate", e.target.value)
                  }
                />
              </div>
            </div>
          ))}

          {/* Add Address */}
          {isEditing && (
            <button
              onClick={addAddress}
              className="hover:bg-secondary-dark w-full rounded-lg bg-secondary px-4 py-2 text-sm text-white transition-all duration-200 active:scale-95 sm:w-auto sm:text-base"
            >
              + Add Address
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ================= Reusable Input ================= */
const Input = ({ label, value, disabled, onChange }) => (
  <div>
    <label className="text-xs text-gray-600 sm:text-sm">{label}</label>

    <input
      type="text"
      value={value || ""}
      disabled={disabled}
      onChange={onChange}
      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-base"
    />
  </div>
);
