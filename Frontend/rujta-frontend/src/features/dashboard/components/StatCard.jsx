import { ArrowUp, ArrowDown } from "lucide-react";

const StatCard = ({ title, value, sub, percent, positive, icon, dark }) => {
  return (
    <div
      className={`relative flex flex-col p-5 rounded-2xl shadow-md w-64 ${
        dark ? "bg-secondary text-white" : "bg-white text-gray-800"
      }`}
    >
      {/* Background Illustration (blur) */}
      <div
        className={`absolute right-3 bottom-3 opacity-10 ${
          dark ? "text-white" : "text-gray-700"
        }`}
      >
        {/* خلفية أيقونة متكررة */}
        <div className="text-6xl">📊</div>
      </div>

      {/* Top row */}
      <div className="flex justify-between items-start">
        {/* Icon */}
        <div
          className={`p-2 rounded-lg ${
            dark ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          {icon}
        </div>

        {/* Percentage badge */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
            positive
              ? "bg-green-100 text-secondary"
              : "bg-red-100 text-red-600"
          }`}
        >
          {positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          {percent}
        </div>
      </div>

      {/* Text section */}
      <p className={`text-sm mt-5 ${dark ? "text-white/90" : "text-gray-500"}`}>
        {title}
      </p>

      <h2
        className={`text-3xl font-bold mt-1 ${
          dark ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </h2>

      <p className={`text-xs mt-1 ${dark ? "text-white/70" : "text-gray-500"}`}>
        {sub}
      </p>
    </div>
  );
};

export default StatCard;
