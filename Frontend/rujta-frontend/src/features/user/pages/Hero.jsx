import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCampaigns from "../../campaigns/hook/useCampaigns";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";

// ─── Pharmacy Badge ────────────────────────────────────────────────────────────
const PharmacyBadge = ({ imageUrl, name, pharmacyId, navigate }) => {
  const [hovered, setHovered] = useState(false);
  if (!imageUrl && !name) return null;

  const canNavigate = !!pharmacyId;

  return (
    <div
      onClick={() => canNavigate && navigate(`/user/pharmacy/${pharmacyId}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        top: "28px",
        right: "32px",
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: "16px",
        background: hovered ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.13)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `2px solid ${hovered ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.28)"}`,
        borderRadius: "100px",
        padding: "10px 24px 10px 10px",
        boxShadow: hovered
          ? "0 20px 60px rgba(0,0,0,0.4), 0 0 0 4px rgba(255,255,255,0.12)"
          : "0 10px 40px rgba(0,0,0,0.28)",
        cursor: canNavigate ? "pointer" : "default",
        transform: hovered ? "translateY(-4px) scale(1.04)" : "translateY(0) scale(1)",
        transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {imageUrl && (
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid rgba(255,255,255,0.9)",
            flexShrink: 0,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            background: "#fff",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.28s ease",
          }}
        >
          <img
            src={imageUrl}
            alt={name || "Pharmacy"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {name && (
          <span
            style={{
              color: "#fff",
              fontSize: "16px",
              fontWeight: 800,
              letterSpacing: "0.01em",
              textShadow: "0 2px 8px rgba(0,0,0,0.35)",
              whiteSpace: "nowrap",
              maxWidth: 180,
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.2,
            }}
          >
            {name}
          </span>
        )}
        {canNavigate && (
          <span
            style={{
              color: hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.65)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "color 0.2s",
            }}
          >
            Visit Store →
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Dynam
// ─── Dynamic Slide ────────────────────────────────────────────────────────────
const DynamicSlide = ({ ad, pharmacyMap, navigate }) => {
  const pid = ad.pharmacyId || ad.PharmacyId || null;
  const livePharmacy = pid ? pharmacyMap[pid] : null;

  const resolvedPharmacy = livePharmacy
    ? { imageUrl: livePharmacy.imageUrl || livePharmacy.ImageUrl || null, name: livePharmacy.name || null, pharmacyId: pid }
    : (ad.pharmacyImage || ad.pharmacyName)
    ? { imageUrl: ad.pharmacyImage || null, name: ad.pharmacyName || null, pharmacyId: null }
    : null;

  // --- UPDATED: Navigate to Pharmacy Store first, then fallback to Medicine ---
  const handleShopNow = () => {
    if (pid) {
      navigate(`/user/pharmacy/${pid}`);
    } else if (ad.medicineId || ad.MedicineId) {
      navigate(`/medicines/${ad.medicineId || ad.MedicineId}`);
    } else if (ad.category) {
      navigate(`/user/products?category=${encodeURIComponent(ad.category)}`);
    } else {
      navigate("/user/products");
    }
  };

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center"
      style={{
        background: `radial-gradient(circle at top left, ${ad.colorTo || "#0369a1"}, ${ad.colorFrom || "#0ea5e9"})`,
      }}
    >
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-black/20 blur-[100px]" />

      {/* Ribbon Section */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 30,
          width: "180px",
          height: "180px",
          overflow: "hidden",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "42px",
            left: "-48px",
            width: "210px",
            padding: "10px 0",
            background: "linear-gradient(135deg, #1a5c2a 0%, #2d8c45 100%)",
            transform: "rotate(-45deg)",
            textAlign: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
          }}
        >
          <span
            style={{
              fontSize: "clamp(0.75rem, 1.2vw, 0.95rem)",
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#fff",
              textShadow: "0 1px 4px rgba(0,0,0,0.4)",
              whiteSpace: "nowrap",
            }}
          >
            {ad.badge || "NEW ARRIVAL"}
          </span>
        </div>
      </div>

      {resolvedPharmacy && (
        <PharmacyBadge
          imageUrl={resolvedPharmacy.imageUrl}
          name={resolvedPharmacy.name}
          pharmacyId={resolvedPharmacy.pharmacyId}
          navigate={navigate}
        />
      )}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">
        <div className="order-2 md:order-1 space-y-8 text-center md:text-left">
          <div className="space-y-4">
            <h1
              className="text-white font-extrabold leading-[1.1] drop-shadow-md"
              style={{ fontSize: "clamp(3rem, 5vw, 5.5rem)" }}
            >
              {ad.headline}
            </h1>
            <div className="h-1 w-24 bg-white/40 inline-block rounded-full" />

            {/* ── UPDATED: Normal Medicine Name Styling ── */}
            {ad.subtext && (
              <div className="relative">
                <p
                  className="text-white/90 font-medium max-w-lg select-none"
                  style={{ 
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)", // Normal readable size
                    lineHeight: "1.2",
                    textTransform: "none", // Keeps it natural
                    letterSpacing: "normal",
                    transform: "none", // Removed 3D tilt
                    textShadow: "0 2px 10px rgba(0,0,0,0.2)", // Subtle depth only
                    animation: "none" // Removed floating
                  }}
                >
                  {ad.subtext}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
            <button
              onClick={handleShopNow}
              className="group relative bg-white text-gray-900 px-12 py-5 rounded-full font-black text-lg overflow-hidden transition-all hover:pl-16 active:scale-95 shadow-2xl"
            >
              <span className="relative z-10">SHOP NOW</span>
              <span className="absolute left-6 opacity-0 transition-all group-hover:opacity-100 group-hover:left-8">→</span>
            </button>
          </div>
        </div>

        <div className="relative order-1 md:order-2 flex justify-center items-center group">
          <div
            className="absolute w-[80%] h-[80%] rounded-full border-2 border-white/20 animate-[spin_10s_linear_infinite]"
            style={{ boxShadow: `0 0 50px ${ad.colorFrom}44` }}
          />
          <div className="relative z-10 animate-[bounce_4s_ease-in-out_infinite]">
            <img
              src={ad.medicineImage || ad.imageDataUrl}
              alt={ad.headline}
              className="w-[280px] sm:w-[350px] md:w-[500px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="absolute bottom-[-20px] w-1/2 h-10 bg-black/30 blur-2xl rounded-[100%]" />
        </div>
      </div>
    </section>
  );
};

// --- Main Hero Page ---
const Hero = () => {
  const navigate = useNavigate();
  const { fetchAll, ads: backendAds } = useCampaigns();
  const { pharmacies, fetchAllPharmacies } = usePharmacies();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [allSlides, setAllSlides] = useState([]);

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchAll();
    fetchAllPharmacies();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pharmacyMap = React.useMemo(() => {
    const map = {};
    (pharmacies || []).forEach((ph) => { map[ph.id] = ph; });
    return map;
  }, [pharmacies]);

  useEffect(() => {
    if (!backendAds || !Array.isArray(backendAds) || backendAds.length === 0) return;
    const dynamicSlides = backendAds.map((ad) => ({
      ...ad,
      id: `dynamic-${ad.id}`,
      type: "dynamic",
    }));
    setAllSlides(dynamicSlides);
  }, [backendAds]);

  useEffect(() => {
    if (allSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [allSlides.length]);

  const activeSlide = allSlides[currentIndex];
  if (!activeSlide) return null;

  return (
    <div className="relative w-full min-h-screen">
      <DynamicSlide ad={activeSlide} pharmacyMap={pharmacyMap} navigate={navigate} />

      {allSlides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {allSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentIndex ? "w-10 h-3 bg-white" : "w-3 h-3 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;