// src/features/user/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { FiTrash2 } from "react-icons/fi";
import { useUserProfile } from "../../userProfile/hook/useUserProfile";

export default function Profile() {
  const { profile, loading, error, updateProfile } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    address: { street: "", buildingNo: "", city: "", governorate: "" },
    emailList: [],
    phoneNumber: "",
  });

  /* ================= Profile Init ================= */
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.name || "",
        address: {
          street: profile.address?.street || "",
          buildingNo: profile.address?.buildingNo || "",
          city: profile.address?.city || "",
          governorate: profile.address?.governorate || "",
        },
        emailList: profile.email ? [profile.email] : [],
        phoneNumber: profile.phoneNumber || "",
      });
    }
  }, [profile]);

  /* ================= Helpers ================= */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleAddEmail = () => {
    const newEmail = prompt("Enter new email:");
    if (newEmail) {
      setFormData((prev) => ({
        ...prev,
        emailList: [...prev.emailList, newEmail],
      }));
    }
  };

  const handleDeleteEmail = (index) => {
    setFormData((prev) => ({
      ...prev,
      emailList: prev.emailList.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    const dto = {
      Name: formData.fullName,
      PhoneNumber: formData.phoneNumber,
      Address: { ...formData.address },
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
                <h3 className="text-lg font-semibold">{formData.fullName}</h3>
                <p className="text-sm text-gray-500">
                  {formData.emailList?.[0] || ""}
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
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
          />
          <Input
            label="Street"
            value={formData.address.street}
            disabled={!isEditing}
            onChange={(e) => handleAddressChange("street", e.target.value)}
          />
          <Input
            label="Building No"
            value={formData.address.buildingNo}
            disabled={!isEditing}
            onChange={(e) => handleAddressChange("buildingNo", e.target.value)}
          />
          <Input
            label="City"
            value={formData.address.city}
            disabled={!isEditing}
            onChange={(e) => handleAddressChange("city", e.target.value)}
          />
          <Input
            label="Governorate"
            value={formData.address.governorate}
            disabled={!isEditing}
            onChange={(e) =>
              handleAddressChange("governorate", e.target.value)
            }
          />
        </div>

        {/* ================= Email List ================= */}
        <div className="mt-8">
          <p className="font-semibold mb-2 text-gray-700">
            My Email Address
          </p>

          {(formData.emailList ?? []).map((email, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-50 border rounded-lg p-3 mb-2"
            >
              <div className="flex items-center gap-3">
                <HiOutlineMail className="text-secondary text-xl" />
                <span>{email}</span>
              </div>

              {isEditing && (
                <button
                  onClick={() => handleDeleteEmail(i)}
                  className="text-red-500"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          ))}

          {isEditing && (
            <button
              onClick={handleAddEmail}
              className="mt-4 bg-secondary text-white px-4 py-2 rounded-lg"
            >
              + Add Email Address
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
