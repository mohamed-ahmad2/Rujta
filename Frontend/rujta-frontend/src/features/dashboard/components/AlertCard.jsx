// src/features/home/components/AlertCard.jsx
import React from "react";
import { AlertTriangle } from "lucide-react";

export default function AlertCard({ message }) {
  return (
    <div className="flex w-full animate-pulse items-start gap-2 rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-3 text-yellow-700 shadow-sm sm:items-center sm:gap-3 sm:p-4 md:p-5">
      {/* Icon */}
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 sm:mt-0 sm:h-5 sm:w-5 md:h-6 md:w-6" />

      {/* Message */}
      <p className="text-xs font-medium leading-snug sm:text-sm md:text-base">
        {message}
      </p>
    </div>
  );
}
