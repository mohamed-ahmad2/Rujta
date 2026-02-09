// src/features/home/components/SalesCard.jsx
import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function SalesCard({ title, value, positive = true }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between transition-transform hover:scale-105">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="flex items-center">
        {positive ? (
          <ArrowUp className="text-green-500 w-5 h-5" />
        ) : (
          <ArrowDown className="text-red-500 w-5 h-5" />
        )}
      </div>
    </div>
  );
}
