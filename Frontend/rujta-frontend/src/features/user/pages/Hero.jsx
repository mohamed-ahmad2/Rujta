import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCampaigns from "../../campaigns/hook/useCampaigns";
import { usePharmacies } from "../../pharmacies/hooks/usePharmacies";
const staticAds = [];

// ─── Pharmacy Badge ────────────────────────────────────────────────────────────
const PharmacyBadge = ({ imageUrl, name, pharmacyId, navigate }) => {
  const [hovered, setHovered] = useState(false);
  if (!imageUrl && !name) return null;

  return (
    <div
      onClick={() => pharmacyId && navigate(`/user/pharmacy/${pharmacyId}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        top: 16,
        right: 20,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: hovered ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.13)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1.5px solid ${hovered ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)"}`,
        borderRadius: 100,
        padding: "6px 16px 6px 6px",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.15)",
        cursor: pharmacyId ? "pointer" : "default",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.25s ease",
      }}
    >
      {imageUrl && (
        <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.85)", flexShrink: 0, background: "#fff" }}>
          <img src={imageUrl} alt={name || "Pharmacy"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {name && (
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.3)", whiteSpace: "nowrap", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>
            {name}
          </span>
        )}
        {pharmacyId && (
          <span style={{ color: hovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", transition: "color 0.2s" }}>
            Visit Store →
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ duration, running, slideIndex }) => {
  const [width, setWidth] = useState(0);
  const rafRef = useRef();
  const startRef = useRef();

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    setWidth(0);
    startRef.current = null;
    if (!running) return;
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const pct = Math.min(((ts - startRef.current) / duration) * 100, 100);
      setWidth(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, duration, slideIndex]);

  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 3, background: "rgba(255,255,255,0.15)", zIndex: 40 }}>
      <div style={{ height: "100%", width: `${width}%`, background: "rgba(255,255,255,0.65)", transition: "width 0.08s linear" }} />
    </div>
  );
};

// ─── Dynamic Slide ────────────────────────────────────────────────────────────
const DynamicSlide = ({ ad, pharmacyMap, navigate, isActive }) => {
  const pid = ad.pharmacyId || ad.PharmacyId || null;
  const livePharmacy = pid ? pharmacyMap[pid] : null;

  const resolvedPharmacy = livePharmacy
    ? { imageUrl: livePharmacy.imageUrl || livePharmacy.ImageUrl || null, name: livePharmacy.name || null, pharmacyId: pid }
    : ad.pharmacyImage || ad.pharmacyName
    ? { imageUrl: ad.pharmacyImage || null, name: ad.pharmacyName || null, pharmacyId: null }
    : null;

  const handleShopNow = () => {
    if (pid) navigate(`/user/pharmacy/${pid}`);
    else if (ad.medicineId || ad.MedicineId) navigate(`/medicines/${ad.medicineId || ad.MedicineId}`);
    else if (ad.category) navigate(`/user/products?category=${encodeURIComponent(ad.category)}`);
    else navigate("/user/products");
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at top left, ${ad.colorTo || "#0369a1"}, ${ad.colorFrom || "#0ea5e9"})`,
        opacity: isActive ? 1 : 0,
        transition: "opacity 0.6s ease",
        pointerEvents: isActive ? "auto" : "none",
        overflow: "hidden",
        borderRadius: "inherit",
      }}
    >
      <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "40%", height: "40%", borderRadius: "50%", background: "rgba(255,255,255,0.08)", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "30%", height: "30%", borderRadius: "50%", background: "rgba(0,0,0,0.15)", filter: "blur(60px)" }} />

      {/* Corner ribbon */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 120, height: 120, overflow: "hidden", pointerEvents: "none", zIndex: 30 }}>
        <div style={{ position: "absolute", top: 28, left: -36, width: 160, padding: "6px 0", background: "linear-gradient(135deg, #1a5c2a 0%, #2d8c45 100%)", transform: "rotate(-45deg)", textAlign: "center", boxShadow: "0 3px 10px rgba(0,0,0,0.3)" }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
            {ad.badge || "NEW ARRIVAL"}
          </span>
        </div>
      </div>

      {resolvedPharmacy && (
        <PharmacyBadge imageUrl={resolvedPharmacy.imageUrl} name={resolvedPharmacy.name} pharmacyId={resolvedPharmacy.pharmacyId} navigate={navigate} />
      )}

      <div style={{ position: "relative", zIndex: 10, width: "100%", padding: "0 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h1 style={{ color: "#fff", fontWeight: 800, lineHeight: 1.1, fontSize: "clamp(1rem, 1.6vw, 1.6rem)", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            {ad.headline}
          </h1>
          <div style={{ width: 36, height: 3, background: "rgba(255,255,255,0.45)", borderRadius: 4 }} />
          {ad.subtext && (
            <p style={{ color: "rgba(255,255,255,0.88)", fontWeight: 900, fontSize: "clamp(2rem, 4.5vw, 5rem)", lineHeight: 1, textShadow: "0 2px 10px rgba(0,0,0,0.18)" }}>
              {ad.subtext}
            </p>
          )}
          <button
            onClick={handleShopNow}
            style={{ alignSelf: "flex-start", background: "#fff", color: "#111", border: "none", borderRadius: 100, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: "0.04em", boxShadow: "0 6px 20px rgba(0,0,0,0.18)", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.28)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.18)"; }}
          >
            SHOP NOW
          </button>
        </div>

        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <div style={{ position: "absolute", width: "75%", height: "75%", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.18)", animation: "spin 12s linear infinite" }} />
          <img
            src={ad.medicineImage || ad.imageDataUrl}
            alt={ad.headline}
            style={{ width: "clamp(120px, 18vw, 260px)", objectFit: "contain", filter: "drop-shadow(0 16px 16px rgba(0,0,0,0.4))", position: "relative", zIndex: 1, animation: "float 5s ease-in-out infinite" }}
          />
          <div style={{ position: "absolute", bottom: 0, width: "45%", height: 16, background: "rgba(0,0,0,0.2)", filter: "blur(8px)", borderRadius: "50%" }} />
        </div>
      </div>
    </div>
  );
};

// ─── Static Slide ─────────────────────────────────────────────────────────────
const StaticSlide = ({ ad, isActive }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `url(${ad.bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      opacity: isActive ? 1 : 0,
      transition: "opacity 0.6s ease",
      pointerEvents: isActive ? "auto" : "none",
      overflow: "hidden",
      borderRadius: "inherit",
    }}
  >
    <div style={{ position: "relative", zIndex: 20, maxWidth: 1280, margin: "0 auto", padding: "0 24px", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      <div style={{ marginTop: "-30px", display: "flex", flexDirection: "column", gap: 6 }}>
        <p className={`font-medium ${ad.textColor1} ${ad.textSize1}`}>{ad.text1}</p>
        <p className={`font-extrabold ${ad.textColor2} ${ad.textSize2}`}>{ad.text2}</p>
      </div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={ad.productImg} className={`absolute ${ad.productPosition} ${ad.productSize} z-10`} alt="product" />
        <img src={ad.modelImg}   className={`absolute ${ad.modelPosition} ${ad.modelSize} z-10`}   alt="model" />
      </div>
    </div>
  </div>
);

// ─── Dots ─────────────────────────────────────────────────────────────────────
const Dots = ({ count, current, onChange }) => (
  <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", zIndex: 30, display: "flex", gap: 6 }}>
    {Array.from({ length: count }).map((_, i) => (
      <button
        key={i}
        onClick={() => onChange(i)}
        aria-label={`Go to slide ${i + 1}`}
        style={{ width: i === current ? 22 : 7, height: 7, borderRadius: 4, background: i === current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s ease" }}
      />
    ))}
  </div>
);

// ─── Arrow ────────────────────────────────────────────────────────────────────
const Arrow = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    aria-label={direction === "left" ? "Previous slide" : "Next slide"}
    style={{
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      [direction === "left" ? "left" : "right"]: 12,
      zIndex: 30,
      width: 34,
      height: 34,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.2)",
      color: "rgba(255,255,255,0.8)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      transition: "background 0.2s, color 0.2s",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = "#fff"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
  >
    {direction === "left" ? "‹" : "›"}
  </button>
);

// ─── Main Hero ────────────────────────────────────────────────────────────────
const SLIDE_DURATION = 6000;

const Hero = () => {
  const navigate = useNavigate();
  const { fetchAll, ads: backendAds } = useCampaigns();
  const { pharmacies, fetchAllPharmacies } = usePharmacies();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [allSlides, setAllSlides] = useState(staticAds);
  const [isPaused, setIsPaused] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchAll();
    fetchAllPharmacies();
  }, []); // eslint-disable-line

  const pharmacyMap = useMemo(() => {
    const map = {};
    (pharmacies || []).forEach((ph) => { map[ph.id] = ph; });
    return map;
  }, [pharmacies]);

  useEffect(() => {
    if (!backendAds?.length) return;
    const dynamicSlides = backendAds.map((ad) => ({ ...ad, id: `dynamic-${ad.id}`, type: "dynamic" }));
    setAllSlides([...staticAds, ...dynamicSlides]);
  }, [backendAds]);

  const goTo = (index) => setCurrentIndex((index + allSlides.length) % allSlides.length);

  useEffect(() => {
    if (allSlides.length <= 1 || isPaused) return;
    const t = setInterval(() => setCurrentIndex((prev) => (prev + 1) % allSlides.length), SLIDE_DURATION);
    return () => clearInterval(t);
  }, [allSlides.length, isPaused, currentIndex]);

  if (!allSlides.length) return null;

  return (
    <>
      <style>{`
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      `}</style>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "420px",         /* fixed card height — change to suit your layout */
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          margin: "24px auto",     /* top/bottom space */
          maxWidth: "calc(100% - 48px)", /* left/right space */
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {allSlides.map((slide, i) =>
          slide.type === "dynamic" ? (
            <DynamicSlide key={slide.id} ad={slide} pharmacyMap={pharmacyMap} navigate={navigate} isActive={i === currentIndex} />
          ) : (
            <StaticSlide key={slide.id} ad={slide} isActive={i === currentIndex} />
          )
        )}

        <Arrow direction="left"  onClick={() => goTo(currentIndex - 1)} />
        <Arrow direction="right" onClick={() => goTo(currentIndex + 1)} />
        <Dots count={allSlides.length} current={currentIndex} onChange={goTo} />
        <ProgressBar duration={SLIDE_DURATION} running={!isPaused} slideIndex={currentIndex} />
      </div>
    </>
  );
};

export default Hero;