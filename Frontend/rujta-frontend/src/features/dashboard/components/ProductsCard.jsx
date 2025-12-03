import { MoreVertical } from "lucide-react";

export default function ProductsCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl px-6 py-5 shadow-sm flex items-center justify-between">
      
      {/* Left side */}
      <div className="flex items-center gap-4">
        
        {/* Icon container */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <div className="text-white">{icon}</div>
        </div>

        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-[22px] font-semibold">{value}</p>
        </div>
      </div>

      {/* Menu icon */}
      <MoreVertical size={20} className="text-gray-400" />
    </div>
  );
}
