import React, { useState } from "react";

// ── Plan Card ─────────────────────────────────────────────────────────────
const PlanCard = ({ item, selectedId, onSelect }) => {
  const isSelected = selectedId === item.id;

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`relative cursor-pointer flex flex-col flex-1 rounded-2xl border-2 p-6 text-center transition-all duration-300 overflow-hidden
        ${isSelected
          ? "border-[#3C623C] -translate-y-1 shadow-xl bg-gradient-to-br from-[#f8fcf4] to-[#edf6e0]"
          : "border-[#c8e0ab] hover:-translate-y-1 hover:border-[#3C623C] hover:shadow-lg bg-white"
        }`}
    >
      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute top-2.5 left-2.5 bg-[#3C623C] text-white text-[10px] px-2.5 py-1 rounded-full font-bold">
          ✓ Selected
        </div>
      )}

      {/* Corner Ribbon */}
      {item.ribbon && (
        <div className="absolute top-0 right-0 w-[90px] h-[90px] overflow-hidden rounded-tr-2xl pointer-events-none">
          <span className="absolute top-[20px] right-[-22px] bg-[#3C623C] text-white text-[10px] font-extrabold py-1 px-7 rotate-45 whitespace-nowrap shadow-md tracking-wide">
            {item.ribbon}
          </span>
        </div>
      )}

      {/* Title */}
      <p className="text-xl font-black text-[#3C623C] tracking-wide mt-1">{item.label}</p>
      <p className="text-xs text-gray-400 mb-2">{item.sublabel}</p>

      {/* Equiv badge */}
      {item.equiv && (
        <div className="text-[11px] text-[#9DC873] font-bold bg-[#f0f7e8] rounded-full px-3 py-1 inline-block mb-2 mx-auto">
          {item.equiv}
        </div>
      )}

      {/* Price */}
      <p className="text-4xl font-black text-[#2d4a2d] leading-tight mt-2">{item.price}</p>
      <p className="text-[13px] text-[#7aaa50] font-semibold mb-3">{item.unit}</p>

      {/* Push button to bottom */}
      <div className="flex-1" />

      <hr className="border-dashed border-[#d4eabb] my-3" />

      {/* Button */}
      <button
        className={`w-full py-3 rounded-xl text-white text-sm font-bold transition-all
          ${isSelected ? "bg-[#3C623C]" : "bg-[#9DC873] hover:bg-[#3C623C]"}`}
      >
        {isSelected ? "✓ Selected" : `Choose ${item.label} Plan`}
      </button>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────
const PricingControl = () => {
  const [selectedSub, setSelectedSub] = useState(null);

  const subPlans = [
    {
      id: "monthly",
      label: "MONTHLY",
      sublabel: "Simple monthly billing.",
      price: "1,500",
      unit: "EGP / month",
    },
    {
      id: "yearly",
      label: "YEARLY",
      sublabel: "Best annual deal.",
      price: "14,400",
      unit: "EGP / year",
      equiv: "(Equiv. to 1,200 EGP/month) - Best Value!",
      ribbon: "SAVE 20%!",
    },
  ];

  const selected = subPlans.find((p) => p.id === selectedSub);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      {/* Section Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f2e0] p-6 mb-5">
        <h2 className="text-base font-bold text-[#2d4a2d] pb-3 border-b-2 border-[#f0f5f0] mb-5 flex items-center gap-2">
          Subscription Pricing
          <span className="text-xs font-medium text-[#9DC873] bg-[#f0f7e8] px-3 py-0.5 rounded-full">
            Choose your plan
          </span>
        </h2>

        {/* Cards — equal height via items-stretch */}
        <div className="flex gap-5 items-stretch">
          {subPlans.map((item) => (
            <PlanCard
              key={item.id}
              item={item}
              selectedId={selectedSub}
              onSelect={setSelectedSub}
            />
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div className="bg-white rounded-2xl border border-[#e0f0cc] shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-[#7a9a7a]">Selected Plan</p>
          <p className="text-[17px] font-black text-[#3C623C]">
            {selected
              ? `${selected.label} — ${selected.price} ${selected.unit}`
              : "Not selected yet"}
          </p>
        </div>
        <button
          disabled={!selectedSub}
          className={`px-7 py-3 rounded-xl text-white text-sm font-bold transition-all
            ${selectedSub ? "bg-[#3C623C] hover:bg-[#2d4a2d]" : "bg-[#c5ddb0] cursor-default"}`}
        >
          Confirm Selection
        </button>
      </div>

    </div>
  );
};

export default PricingControl;