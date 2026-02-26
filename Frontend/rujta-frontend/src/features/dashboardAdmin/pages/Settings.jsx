import React, { useState } from "react";

import img from "../../../assets/change/HeroImg1.png";



/* ---------- SWITCH ---------- */

const Toggle = ({ on, setOn }) => (
  <button
    onClick={() => setOn(!on)}
    className={`w-12 h-6 rounded-full transition ${
      on ? "bg-secondary" : "bg-gray-300"
    }`}
  >
    <div
      className={`h-5 w-5 bg-white rounded-full shadow transform transition ${
        on ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

/* ---------- PAGE ---------- */

export default function Settings() {
  const [appearance, setAppearance] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [twoFA, setTwoFA] = useState(false);

  return (
    <div className="p-8 space-y-8 bg-[#f5f6fb] min-h-screen">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-gray-500">
          Manage your account and system preferences
        </p>
      </div>

      {/* PROFILE + GENERAL */}
      <div className="grid grid-cols-3 gap-6">

        {/* PROFILE */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border p-6">

          <h3 className="font-semibold mb-6">Profile Settings</h3>

          <div className="flex gap-6">

            {/* Avatar */}
            <div className="flex flex-col items-center">
              <img
                src={img}
                className="w-28 h-28 rounded-full object-cover"
              />
              <button className="mt-3 bg-secondary text-white px-4 py-1 rounded-md text-sm">
                Change Avatar
              </button>
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-4">

              <div>
                <label className="text-sm text-gray-500">Name</label>
                <input
                  className="w-full border rounded-lg px-4 py-2 mt-1"
                  defaultValue="James Bond"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">
                  Email Address
                </label>
                <input
                  className="w-full border rounded-lg px-4 py-2 mt-1"
                  defaultValue="@james.bond"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button className="flex-1 border rounded-lg py-2 text-gray-600">
                  Change Password
                </button>
                <button className="flex-1 bg-secondary text-white rounded-lg py-2">
                  Update Info
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT GENERAL */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">

          <h3 className="font-semibold">General Settings</h3>

          <div className="space-y-4">

            <div>
              <label className="text-sm text-gray-500">Language</label>
              <select className="w-full border rounded-lg px-3 py-2 mt-1">
                <option>English</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-500">Time Zone</label>
              <select className="w-full border rounded-lg px-3 py-2 mt-1">
                <option>Europe / Cairo</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <span>Appearance</span>
              <Toggle on={appearance} setOn={setAppearance} />
            </div>

            <div className="flex justify-between items-center">
              <span>Email Notifications</span>
              <Toggle on={emailNotif} setOn={setEmailNotif} />
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM PANELS */}
      <div className="grid grid-cols-2 gap-6">

        {/* GENERAL */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">

          <h3 className="font-semibold">General Settings</h3>

          <div className="flex justify-between">
            <span>Language</span>
            <span>English</span>
          </div>

          <div className="flex justify-between">
            <span>Time Zone</span>
            <span>Europe / Cairo</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Appearance</span>
            <Toggle on={appearance} setOn={setAppearance} />
          </div>

          <div className="flex justify-between items-center">
            <span>Email Notifications</span>
            <Toggle on={emailNotif} setOn={setEmailNotif} />
          </div>

          <button className="w-full bg-secondary text-white py-2 rounded-lg">
            Save Changes
          </button>
        </div>

        {/* SECURITY */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">

          <h3 className="font-semibold">Security Settings</h3>

          <button className="bg-secondary text-white px-4 py-2 rounded-md">
            Change Password
          </button>

          <div className="flex justify-between items-center">
            <div>
              <p>Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">Enable</p>
            </div>
            <Toggle on={twoFA} setOn={setTwoFA} />
          </div>

          <button className="w-full border border-red-300 text-red-500 py-2 rounded-lg">
            Delete Account
          </button>
        </div>
      </div>

    </div>
  );
}
