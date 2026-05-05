// src/features/home/components/SalesCard.jsx
import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function SalesCard({ title, value, positive = true }) {
  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-2xl bg-white p-3 shadow transition-transform hover:scale-105 sm:p-4 md:p-5 lg:p-6">
      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-gray-500 sm:text-sm md:text-base">
          {title}
        </p>
        <p className="mt-0.5 truncate text-lg font-bold sm:mt-1 sm:text-xl md:text-2xl">
          {value}
        </p>
      </div>

      {/* Arrow Icon */}
      <div className="flex flex-shrink-0 items-center">
        {positive ? (
          <ArrowUp className="h-4 w-4 text-green-500 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        ) : (
          <ArrowDown className="h-4 w-4 text-red-500 sm:h-5 sm:w-5 md:h-6 md:w-6" />
        )}
      </div>
    </div>
  );
}
