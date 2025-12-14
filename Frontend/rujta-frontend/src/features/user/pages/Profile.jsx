// F:\Graduation project\Rujta\Frontend\rujta-frontend\src\features\user\pages\Profile.jsx
import React, { useState, useEffect } from "react";
import { HiOutlineMail } from "react-icons/hi";
import { FiTrash2 } from "react-icons/fi";
import { useUserProfile } from "../../userProfile/hook/useUserProfile";
import { useOrders } from "../../orders/hooks/useOrders";
import { getOrderDetails } from "../../orders/api/ordersApi";

export default function Profile() {
  const { profile, loading, error, updateProfile } = useUserProfile();
  const { orders, fetchUserOrders, ordersLoading } = useOrders();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    address: { street: "", buildingNo: "", city: "", governorate: "" },
    emailList: [],
    phoneNumber: "",
  });

  const [details, setDetails] = useState({}); // تخزين تفاصيل الطلبات

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

  /* ================= Load User Orders + Details ================= */
  useEffect(() => {
   const loadOrdersWithDetails = async () => {
  try {
    const userOrders = await fetchUserOrders(); 
        console.log(userOrders);

    for (const order of userOrders) {
      try {
        const detailRes = await getOrderDetails(order.id); 
        setDetails(prev => ({ ...prev, [order.id]: detailRes.data }));
      } catch(err) {
        console.error(`Error fetching details for order ${order.id}:`, err);
      }
    }
  } catch(err) {
    console.error("Error fetching user orders:", err);
  }
};



    loadOrdersWithDetails();
  }, [fetchUserOrders]);

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

  /* ================= Status Badge ================= */
  const statusMap = {
    0: "Pending",
    1: "Accepted",
    2: "Processing",
    3: "OutForDelivery",
    4: "Delivered",
    5: "Cancelled",
    6: "Cancelled",
  };

  const getStatusBadge = (status) => {
    const text = statusMap[status] || "Unknown";
    const base = "px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap";

    switch (text) {
      case "Pending":
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>{text}</span>;
      case "Accepted":
        return <span className={`${base} bg-blue-100 text-blue-700`}>{text}</span>;
      case "Processing":
        return <span className={`${base} bg-indigo-100 text-indigo-700`}>{text}</span>;
      case "OutForDelivery":
        return <span className={`${base} bg-purple-100 text-purple-700`}>{text}</span>;
      case "Delivered":
        return <span className={`${base} bg-green-100 text-green-700`}>{text}</span>;
      case "Cancelled":
        return <span className={`${base} bg-red-100 text-red-700`}>{text}</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-600`}>{text}</span>;
    }
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
                <p className="text-sm text-gray-500">{formData.emailList?.[0] || ""}</p>
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
          <Input label="Full Name" value={formData.fullName} disabled={!isEditing} onChange={(e) => handleChange("fullName", e.target.value)} />
          <Input label="Phone Number" value={formData.phoneNumber} disabled={!isEditing} onChange={(e) => handleChange("phoneNumber", e.target.value)} />
          <Input label="Street" value={formData.address.street} disabled={!isEditing} onChange={(e) => handleAddressChange("street", e.target.value)} />
          <Input label="Building No" value={formData.address.buildingNo} disabled={!isEditing} onChange={(e) => handleAddressChange("buildingNo", e.target.value)} />
          <Input label="City" value={formData.address.city} disabled={!isEditing} onChange={(e) => handleAddressChange("city", e.target.value)} />
          <Input label="Governorate" value={formData.address.governorate} disabled={!isEditing} onChange={(e) => handleAddressChange("governorate", e.target.value)} />
        </div>

        {/* ================= Email List ================= */}
        <div className="mt-8">
          <p className="font-semibold mb-2 text-gray-700">My Email Address</p>
          {(formData.emailList ?? []).map((email, i) => (
            <div key={i} className="flex justify-between items-center bg-gray-50 border rounded-lg p-3 mb-2">
              <div className="flex items-center gap-3">
                <HiOutlineMail className="text-secondary text-xl" />
                <span>{email}</span>
              </div>
              {isEditing && (
                <button onClick={() => handleDeleteEmail(i)} className="text-red-500">
                  <FiTrash2 />
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button onClick={handleAddEmail} className="mt-4 bg-secondary text-white px-4 py-2 rounded-lg">
              + Add Email Address
            </button>
          )}
        </div>
      </div>

      {/* ================= Orders ================= */}
      <div className="mx-10 mt-8 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4">My Orders</h2>

        {ordersLoading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="space-y-4">
            {orders
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((order) => (
                <div key={order.id} className="border rounded-xl p-4 mb-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-sm text-gray-500 mt-2">Created At</p>
                      <p className="text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-semibold">{order.total} EGP</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">Status</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* ================= Show Details directly ================= */}
                  {details[order.id]?.items?.length > 0 ? (
                    <ul className="mt-2 list-disc list-inside">
                      {details[order.id].items.map((item, index) => (
                        <li key={index}>
                          {item.name} - {item.quantity} x {item.price} EGP
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">No items found.</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ================= Reusable Input ================= */
const Input = ({ label, value, disabled, onChange }) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <input type="text" value={value || ""} disabled={disabled} onChange={onChange} className="w-full border rounded-lg px-3 py-2 mt-1 disabled:bg-gray-100" />
  </div>
);
