import { MoreVertical } from "lucide-react";

export default function StatCard({ title, value, sub, percent, variant }) {
  return (
    <div
      className={`rounded-2xl px-6 py-5 shadow-sm flex justify-between items-start transition-all
        ${
          variant === "green"
            ? "bg-gradient-to-br from-secondary to-secondary text-white"
            : "bg-white text-black"
        }
      `}
    >
      <div>
        <p className={`text-sm ${variant === "green" ? "text-white/80" : "text-gray-400"}`}>
          {title}
        </p>

        <h2 className="text-2xl font-semibold mt-1">{value}</h2>

        <p className={`text-xs mt-1 ${variant === "green" ? "text-white/80" : "text-gray-400"}`}>
          {sub}
        </p>

        <span
          className={`text-xs font-medium mt-2 inline-block ${
            variant === "green" ? "text-white" : "text-green-600"
          }`}
        >
          {percent}
        </span>
      </div>

      <MoreVertical
        size={18}
        className={`${variant === "green" ? "text-white" : "text-gray-400"}`}
      />
    </div>
  );
}
