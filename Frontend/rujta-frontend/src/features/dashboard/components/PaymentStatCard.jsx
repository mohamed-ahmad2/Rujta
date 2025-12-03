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
    variant === "completed"
      ? Check
      : variant === "pending"
      ? AlertTriangle
      : X;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border flex items-center justify-between">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        {/* Circle Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${styles[variant].iconBg}`}>
          <Icon size={26} className={styles[variant].iconColor} />
        </div>

        {/* TEXT */}
        <div>
          <p className="text-gray-500 text-sm">{sub}</p>
          <h2 className="text-3xl font-bold mt-1">{value}</h2>
          <p className="text-gray-500 text-sm mt-1">{title}</p>
        </div>
      </div>

      {/* MENU ICON */}
      <MoreVertical size={20} className="text-gray-400 cursor-pointer" />
    </div>
  );
}
