import { MoreVertical } from "lucide-react";

export default function ProductsCard({ title, value, icon, color }) {
  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-2xl bg-white px-3 py-3 shadow-sm sm:px-4 sm:py-4 md:px-5 md:py-5 lg:px-6">
      {/* Left side */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:gap-4">
        {/* Icon container */}
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-12 lg:w-12 ${color}`}
        >
          <div className="text-white [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-4 sm:[&>svg]:w-4 md:[&>svg]:h-5 md:[&>svg]:w-5">
            {icon}
          </div>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-gray-500 sm:text-sm md:text-base">
            {title}
          </p>
          <p className="truncate text-lg font-semibold sm:text-xl md:text-[22px]">
            {value}
          </p>
        </div>
      </div>

      {/* Menu icon */}
      <MoreVertical className="h-4 w-4 flex-shrink-0 text-gray-400 sm:h-5 sm:w-5" />
    </div>
  );
}
