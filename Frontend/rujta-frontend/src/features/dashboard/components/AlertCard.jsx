// src/features/home/components/AlertCard.jsx
import React from "react";
import { AlertTriangle } from "lucide-react";

export default function AlertCard({ message }) {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg flex items-center space-x-3 shadow-sm animate-pulse">
      <AlertTriangle className="w-5 h-5" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
