// src/features/user/components/OffersSection.jsx
import React, { useEffect } from "react";
import doctorImg  from "../../../assets/change/HeroImg1.png";
import vitaminImg from "../../../assets/pro/m3.png";
import useCampaigns from "../../campaigns/hook/useCampaigns";

const staticCards = [
  { id: "s1", bg: "#D8F3DC", title: "Free Home Delivery",       text: "Order medicines and get them delivered safely to your door.", cta: "Learn More →", ctaColor: "#1A3E1A" },
  { id: "s2", bg: "#EDE7F6", title: "Doctor's Appointment",     text: "Schedule online consultations anytime.",                     ctaColor: "#1A3E1A", image: doctorImg,  imageAlt: "Doctor"  },
  { id: "s3", bg: "#FFF9C4", title: "Vitamin D3 Supplement",    text: "Boost your immunity and stay healthy.",                      ctaColor: "#1A3E1A", image: vitaminImg, imageAlt: "Vitamin" },
  { id: "s4", bg: "#FCE4EC", title: "Operational Optimization", text: "Improve your workflow and save time."                                                                                     },
  { id: "s5", bg: "#C8E6C9", title: "Exclusive Health Tips",    text: "Stay updated with daily healthcare guidance."                                                                             },
];

function DynamicAdCard({ ad }) {
  return (
    <div className="rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl
        transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${ad.colorFrom}, ${ad.colorTo})`, fontFamily: ad.fontValue || "sans-serif", minHeight: 180 }}
    >
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10 pointer-events-none"
        style={{ background: ad.colorAccent, transform: "translate(30%,-30%)" }} />

      {ad.adMode === "medicine" && ad.imageDataUrl && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full overflow-hidden border-2"
          style={{ borderColor: "rgba(255,255,255,0.5)" }}>
          <img src={ad.imageDataUrl} alt={ad.medicineName} className="w-full h-full object-cover" />
        </div>
      )}

      <div>
        <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2"
          style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}>
          {ad.badge}
        </span>
        <h3 className="text-lg font-black text-white mb-1 leading-tight max-w-[70%]">{ad.headline}</h3>
        <p className="text-xs text-white/75 max-w-[70%] leading-snug">{ad.subtext}</p>
      </div>

      <button className="mt-4 self-start px-4 py-1.5 rounded-lg text-xs font-bold transition hover:scale-105"
        style={{ background: "#fff", color: ad.colorFrom }}>
        {ad.ctaLabel}
      </button>
    </div>
  );
}

function StaticCard({ card }) {
  return (
    <div className="rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
      style={{ backgroundColor: card.bg }}>
      <div className={`flex ${card.image ? "justify-between items-start" : "flex-col"}`}>
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{card.text}</p>
        </div>
        {card.image && <img src={card.image} alt={card.imageAlt} className="w-20 h-20 object-contain flex-shrink-0" />}
      </div>
      {card.cta && <button className="mt-auto font-semibold hover:underline text-sm" style={{ color: card.ctaColor }}>{card.cta}</button>}
    </div>
  );
}

const OffersSection = () => {
  const { ads, loading, fetchActive } = useAds();

  useEffect(() => { fetchActive(); }, [fetchActive]);

  return (
    <div className="bg-white py-14 px-4">
      <div className="container mx-auto">

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => <div key={i} className="rounded-2xl h-44 bg-gray-100 animate-pulse" />)}
          </div>
        )}

        {/* Dynamic ads from backend */}
        {!loading && ads.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-block w-1 h-5 rounded-full bg-secondary" />
              <h2 className="text-lg font-bold text-gray-800">Featured Offers</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {ads.map(ad => <DynamicAdCard key={ad.id} ad={ad} />)}
            </div>
            <hr className="mb-8 border-gray-100" />
          </div>
        )}

        {/* Static cards — always shown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#FFE7C4] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Get 30% OFF</h3>
              <p className="text-sm text-gray-600 mb-3">Save big on your favorite vitamins and supplements.</p>
            </div>
            <button className="mt-auto text-[#1A3E1A] font-semibold hover:underline">Shop Now →</button>
          </div>
          {staticCards.map(card => <StaticCard key={card.id} card={card} />)}
        </div>
      </div>
    </div>
  );
};

export default OffersSection;