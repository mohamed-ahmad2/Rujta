import { MoreVertical, ArrowUp, ArrowDown } from "lucide-react";

export default function SalesCard({
  title,
  value,
  percent,
  positive = true,
  dark = false,
}) {
  return (
    <div
      className={`
        rounded-2xl p-6 shadow-sm relative transition-all
        ${dark ? "bg-secondary [#0ed2a7] text-white" : "bg-white text-gray-900 border border-gray-100"}
      `}
    >
      {/* 3 dots menu */}
      <button
        className={`absolute top-4 right-4 ${
          dark ? "text-white/70" : "text-gray-400"
        }`}
      >
        <MoreVertical size={18} />
      </button>

      {/* Title */}
      <p className={`text-sm ${dark ? "text-white/70" : "text-gray-500"}`}>
        {title}
      </p>

      {/* Value */}
      <h2 className="text-3xl font-bold mt-1">{value}</h2>

      {/* Percent */}
      <p
        className={`
          mt-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-xl
          ${positive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
        `}
      >
        {positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        {percent}
      </p>
    </div>
  );
}
