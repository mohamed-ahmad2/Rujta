import React from "react";
import { Save, RefreshCw } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your pharmacy system settings
        </p>
      </div>

      {/* ===== General Settings ===== */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          General Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Pharmacy Name</label>
            <input
              type="text"
              placeholder="Rujta Pharmacy"
              className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email Address</label>
            <input
              type="email"
              placeholder="admin@rujta.com"
              className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ===== Account Settings ===== */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Account Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Admin Name</label>
            <input
              type="text"
              placeholder="James Bond"
              className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">New Password</label>
            <input
              type="password"
              placeholder="********"
              className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ===== System Settings ===== */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          System Preferences
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">
              Enable Notifications
            </p>
            <p className="text-sm text-gray-500">
              Receive alerts for new orders
            </p>
          </div>

          <input type="checkbox" className="w-5 h-5 accent-green-700" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">
              Maintenance Mode
            </p>
            <p className="text-sm text-gray-500">
              Temporarily disable the system
            </p>
          </div>

          <input type="checkbox" className="w-5 h-5 accent-green-700" />
        </div>
      </div>

      {/* ===== Actions ===== */}
      <div className="flex justify-end gap-3">
        <button className="flex items-center gap-2 px-5 py-2 rounded-lg border hover:bg-gray-100">
          <RefreshCw size={16} />
          Reset
        </button>

        <button className="flex items-center gap-2 px-5 py-2 rounded-lg bg-secondary text-white hover:secondary">
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
