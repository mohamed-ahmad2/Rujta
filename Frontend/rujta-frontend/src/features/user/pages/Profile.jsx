// src/features/user/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useUserProfile } from "../../userProfile/hook/useUserProfile";

export default function Profile() {
  const { profile, loading, error, updateProfile } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    addresses: [
      { street: "", buildingNo: "", city: "", governorate: "" },
    ],
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
                  street: profile.address?.street || "",
                  buildingNo: profile.address?.buildingNo || "",
                  city: profile.address?.city || "",
                  governorate: profile.address?.governorate || "",
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
  if (error)
    return <p className="p-10 text-center text-red-500">{error}</p>;

  /* ================= UI ================= */
  return (
    <section className="min-h-screen bg-[#F3F4F6]">
      {/* ================= Profile Card ================= */}
      <div className="mx-10 mt-8 bg-gradient-to-r from-secondary to-[#e8e0c9] p-6 rounded-xl">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-600">
                {formData.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {formData.fullName}
                </h3>
                <p className="text-sm text-gray-500">
                  {profile?.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (isEditing) handleSave();
                else setIsEditing(true);
              }}
              className={`px-5 py-2 rounded-lg font-semibold text-white shadow-md ${
                isEditing ? "bg-red-400" : "bg-secondary"
              }`}
            >
              {isEditing ? "Save" : "Edit"}
            </button>
          </div>
        </div>
      </div>

      {/* ================= Profile Form ================= */}
      <div className="mx-10 mt-6 bg-white p-6 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            onChange={(e) =>
              handleChange("phoneNumber", e.target.value)
            }
          />
        </div>

        {/* ================= Addresses ================= */}
        <div className="mt-8">
          <p className="font-semibold mb-4 text-gray-700">
            My Addresses
          </p>

          {formData.addresses.map((address, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 mb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <p className="font-semibold text-gray-700">
                  Address #{i + 1}
                </p>

                {isEditing && formData.addresses.length > 1 && (
                  <button
                    onClick={() => removeAddress(i)}
                    className="text-red-500"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Street"
                  value={address.street}
                  disabled={!isEditing}
                  onChange={(e) =>
                    handleAddressChange(
                      i,
                      "street",
                      e.target.value
                    )
                  }
                />
                <Input
                  label="Building No"
                  value={address.buildingNo}
                  disabled={!isEditing}
                  onChange={(e) =>
                    handleAddressChange(
                      i,
                      "buildingNo",
                      e.target.value
                    )
                  }
                />
                <Input
                  label="City"
                  value={address.city}
                  disabled={!isEditing}
                  onChange={(e) =>
                    handleAddressChange(
                      i,
                      "city",
                      e.target.value
                    )
                  }
                />
                <Input
                  label="Governorate"
                  value={address.governorate}
                  disabled={!isEditing}
                  onChange={(e) =>
                    handleAddressChange(
                      i,
                      "governorate",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          ))}

          {isEditing && (
            <button
              onClick={addAddress}
              className="bg-secondary text-white px-4 py-2 rounded-lg"
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
    <label className="text-sm text-gray-600">{label}</label>
    <input
      type="text"
      value={value || ""}
      disabled={disabled}
      onChange={onChange}
      className="w-full border rounded-lg px-3 py-2 mt-1 disabled:bg-gray-100"
    />
  </div>
);
