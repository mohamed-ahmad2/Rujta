import React from 'react';
import { Plus, Edit, Trash2, Save, RefreshCw } from 'lucide-react'; // optional icons

export default function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">⚙️ Settings</h1>
      <p className="text-gray-600 mb-6">Manage your preferences and system settings here.</p>

      <div className="bg-white shadow rounded-lg p-4 max-w-xl">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Plus size={18} /> Add New
          </button>

          <button className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
            <Edit size={18} /> Edit
          </button>

          <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            <Trash2 size={18} /> Delete
          </button>

          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            <Save size={18} /> Save Changes
          </button>

          <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
            <RefreshCw size={18} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
