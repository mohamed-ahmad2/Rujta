import { MoreVertical } from "lucide-react";

export default function StatCard({ title, value, sub, percent, variant }) {
  return (
    <div
      className={`flex w-full items-start justify-between rounded-2xl px-4 py-4 shadow-sm transition-all sm:px-5 sm:py-5 md:px-6 ${
        variant === "green"
          ? "bg-gradient-to-br from-secondary to-secondary text-white"
          : "bg-white text-black"
      } `}
    >
      {/* Content */}
      <div className="min-w-0 flex-1 pr-2">
        {/* Title */}
        <p
          className={`truncate text-xs sm:text-sm md:text-base ${variant === "green" ? "text-white/80" : "text-gray-400"}`}
        >
          {title}
        </p>

        {/* Value */}
        <h2 className="mt-1 truncate text-xl font-semibold sm:text-2xl md:text-3xl">
          {value}
        </h2>

        {/* Sub */}
        <p
          className={`mt-1 truncate text-xs sm:text-sm ${variant === "green" ? "text-white/80" : "text-gray-400"}`}
        >
          {sub}
        </p>

        {/* Percent */}
        <span
          className={`mt-1 inline-block text-xs font-medium sm:mt-2 sm:text-sm ${variant === "green" ? "text-white" : "text-green-600"}`}
        >
          {percent}
        </span>
      </div>

      {/* Icon */}
      <MoreVertical
        size={16}
        className={`mt-0.5 flex-shrink-0 sm:w-[18px] md:w-5 ${variant === "green" ? "text-white" : "text-gray-400"}`}
      />
    </div>
  );
}
