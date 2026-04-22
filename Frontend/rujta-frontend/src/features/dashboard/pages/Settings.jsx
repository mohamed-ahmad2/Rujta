import React from "react";
import { Save, RefreshCw } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-4 p-3 sm:space-y-5 sm:p-4 md:space-y-6 md:p-0">
      {/* ===== Page Title ===== */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl md:text-3xl">
          Settings
        </h1>
        <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm md:text-base">
          Manage your pharmacy system settings
        </p>
      </div>

      {/* ===== General Settings ===== */}
      <div className="space-y-3 rounded-xl bg-white p-3 shadow sm:space-y-4 sm:p-4 md:p-5 lg:p-6">
        <h2 className="text-base font-semibold text-gray-700 sm:text-lg">
          General Settings
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-gray-600 sm:text-sm">
              Pharmacy Name
            </label>
            <input
              type="text"
              placeholder="Rujta Pharmacy"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-xs outline-none transition focus:ring-2 focus:ring-blue-500 sm:py-2.5 sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 sm:text-sm">
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@rujta.com"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-xs outline-none transition focus:ring-2 focus:ring-blue-500 sm:py-2.5 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* ===== Account Settings ===== */}
      <div className="space-y-3 rounded-xl bg-white p-3 shadow sm:space-y-4 sm:p-4 md:p-5 lg:p-6">
        <h2 className="text-base font-semibold text-gray-700 sm:text-lg">
          Account Settings
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-gray-600 sm:text-sm">
              Admin Name
            </label>
            <input
              type="text"
              placeholder="James Bond"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-xs outline-none transition focus:ring-2 focus:ring-blue-500 sm:py-2.5 sm:text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 sm:text-sm">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-xs outline-none transition focus:ring-2 focus:ring-blue-500 sm:py-2.5 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* ===== System Preferences ===== */}
      <div className="space-y-3 rounded-xl bg-white p-3 shadow sm:space-y-4 sm:p-4 md:p-5 lg:p-6">
        <h2 className="text-base font-semibold text-gray-700 sm:text-lg">
          System Preferences
        </h2>

        {/* Toggle Row */}
        {[
          {
            title: "Enable Notifications",
            desc: "Receive alerts for new orders",
          },
          {
            title: "Maintenance Mode",
            desc: "Temporarily disable the system",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between gap-4 border-b border-gray-100 py-2 last:border-0 sm:py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-700 sm:text-sm md:text-base">
                {item.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
                {item.desc}
              </p>
            </div>

            {/* Custom Toggle */}
            <label className="relative inline-flex flex-shrink-0 cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" />
              <div className="peer h-5 w-9 rounded-full bg-gray-200 transition-colors duration-200 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:duration-200 after:content-[''] peer-checked:bg-secondary peer-checked:after:translate-x-4 peer-focus:ring-2 peer-focus:ring-secondary/30 sm:h-6 sm:w-11 sm:after:h-5 sm:after:w-5 sm:peer-checked:after:translate-x-5" />
            </label>
          </div>
        ))}
      </div>

      {/* ===== Actions ===== */}
      <div className="flex flex-col-reverse justify-end gap-2 pt-1 sm:flex-row sm:gap-3 sm:pt-2">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs transition hover:bg-gray-100 sm:w-auto sm:px-5 sm:py-2.5 sm:text-sm">
          <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Reset
        </button>

        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-xs text-white transition hover:opacity-90 sm:w-auto sm:px-5 sm:py-2.5 sm:text-sm">
          <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
