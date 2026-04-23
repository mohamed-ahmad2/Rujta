import { ArrowUp, ArrowDown } from "lucide-react";

const StatCard = ({ title, value, sub, percent, positive, icon, dark }) => {
  return (
    <div
      className={`relative flex w-full flex-col rounded-2xl p-3 shadow-md sm:p-4 md:p-5 ${dark ? "bg-secondary text-white" : "bg-white text-gray-800"}`}
    >
      {/* Background Illustration */}
      <div
        className={`pointer-events-none absolute bottom-2 right-2 select-none opacity-10 sm:bottom-3 sm:right-3 ${dark ? "text-white" : "text-gray-700"}`}
      >
        <div className="text-4xl sm:text-5xl md:text-6xl">📊</div>
      </div>

      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        {/* Icon */}
        <div
          className={`flex-shrink-0 rounded-lg p-1.5 sm:p-2 ${
            dark ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          <span className="[&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">
            {icon}
          </span>
        </div>

        {/* Percentage badge */}
        <div
          className={`flex flex-shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs sm:gap-1 sm:px-2 sm:py-1 sm:text-sm ${
            positive ? "bg-green-100 text-secondary" : "bg-red-100 text-red-600"
          }`}
        >
          {positive ? (
            <ArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          ) : (
            <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          )}
          <span>{percent}</span>
        </div>
      </div>

      {/* Title */}
      <p
        className={`mt-3 truncate text-xs sm:mt-4 sm:text-sm md:mt-5 ${dark ? "text-white/90" : "text-gray-500"}`}
      >
        {title}
      </p>

      {/* Value */}
      <h2
        className={`mt-0.5 truncate text-xl font-bold sm:mt-1 sm:text-2xl md:text-3xl ${dark ? "text-white" : "text-gray-900"}`}
      >
        {value}
      </h2>

      {/* Sub */}
      <p
        className={`mt-0.5 truncate text-xs sm:mt-1 ${dark ? "text-white/70" : "text-gray-500"}`}
      >
        {sub}
      </p>
    </div>
  );
};

export default StatCard;
