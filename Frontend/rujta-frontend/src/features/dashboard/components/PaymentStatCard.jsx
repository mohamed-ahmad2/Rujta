import React from "react";
import { MoreVertical, Check, AlertTriangle, X } from "lucide-react";

export default function PaymentStatCard({ title, value, sub, variant }) {
  const styles = {
    completed: {
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    pending: {
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    failed: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  };

  const Icon =
    variant === "completed" ? Check : variant === "pending" ? AlertTriangle : X;

  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-2xl border bg-white p-3 shadow-sm sm:p-4 md:p-5 lg:p-6">
      {/* LEFT SIDE */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:gap-4">
        {/* Circle Icon */}
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-12 lg:w-12 ${styles[variant].iconBg}`}
        >
          <Icon
            className={`${styles[variant].iconColor} h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6`}
          />
        </div>

        {/* TEXT */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-gray-500 sm:text-sm">{sub}</p>
          <h2 className="mt-0.5 truncate text-xl font-bold sm:mt-1 sm:text-2xl md:text-3xl">
            {value}
          </h2>
          <p className="mt-0.5 truncate text-xs text-gray-500 sm:mt-1 sm:text-sm">
            {title}
          </p>
        </div>
      </div>

      {/* MENU ICON */}
      <MoreVertical className="h-4 w-4 flex-shrink-0 cursor-pointer text-gray-400 sm:h-5 sm:w-5" />
    </div>
  );
}
