import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  MdCampaign, MdDownload, MdPalette, MdTextFields,
  MdSearch, MdMedication, MdCategory, MdEdit, MdCheckCircle,
} from "react-icons/md";
import { FiCheckCircle } from "react-icons/fi";
import useMedicines from "../../medicines/hook/useMedicines";
import useCampaigns from "../../campaigns/hook/useCampaigns";
import { usePayment } from "../../payment/hooks/usePayment";
import PaymentIframeModal from "../../user/components/checkout/PaymentIframeModal";
import useCategory from "../../category/hook/useCategory";
import { usePricing } from "../../pricing/hooks/usePricing";

// ─── Static Data ──────────────────────────────────────────────────────────────

const adTemplates = [
  { id: 1, name: "Discount Banner", description: "Highlight discounts and offers", badge: "SALE" },
  { id: 2, name: "New Arrival",     description: "Promote new products",           badge: "NEW"  },
  { id: 3, name: "Best Seller",     description: "Show top selling medicines",     badge: "HOT"  },
];

const colorPalettes = [
  { label: "Mint",        from: "#34d399", to: "#065f46", accent: "#a7f3d0" },
  { label: "Lime",        from: "#84cc16", to: "#365314", accent: "#d9f99d" },
  { label: "Forest",      from: "#22c55e", to: "#14532d", accent: "#86efac" },
  { label: "Olive",       from: "#65a30d", to: "#3f6212", accent: "#bef264" },
  { label: "Teal",        from: "#14b8a6", to: "#134e4a", accent: "#99f6e4" },
  { label: "Jade",        from: "#16a34a", to: "#166534", accent: "#bbf7d0" },
  { label: "Sea Green",   from: "#2dd4bf", to: "#115e59", accent: "#99f6e4" },
  { label: "Moss",        from: "#4ade80", to: "#365314", accent: "#dcfce7" },
  { label: "Pine",        from: "#15803d", to: "#052e16", accent: "#86efac" },
  { label: "Clover",      from: "#22c55e", to: "#166534", accent: "#bbf7d0" },
  { label: "Sage",        from: "#6ee7b7", to: "#3f3f46", accent: "#d1fae5" },
  { label: "Fern",        from: "#4ade80", to: "#14532d", accent: "#bbf7d0" },
  { label: "Matcha",      from: "#86efac", to: "#365314", accent: "#f0fdf4" },
  { label: "Aqua Green",  from: "#2dd4bf", to: "#164e63", accent: "#ccfbf1" },
  { label: "Spring",      from: "#5eead4", to: "#115e59", accent: "#ccfbf1" },
  { label: "Leaf",        from: "#16a34a", to: "#14532d", accent: "#dcfce7" },
  { label: "Bamboo",      from: "#65a30d", to: "#1a2e05", accent: "#ecfccb" },
  { label: "Arctic Mint", from: "#99f6e4", to: "#0f766e", accent: "#ecfeff" },
  { label: "Evergreen",   from: "#166534", to: "#022c22", accent: "#6ee7b7" },
  { label: "Neon Green",  from: "#39ff14", to: "#14532d", accent: "#d9f99d" },
];

const fontOptions = [
  { label: "Modern Sans",   value: "'DM Sans', sans-serif",     url: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;800&display=swap"         },
  { label: "Elegant Serif", value: "'Playfair Display', serif", url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap" },
  { label: "Bold Display",  value: "'Sora', sans-serif",        url: "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;800&display=swap"              },
  { label: "Medical Clean", value: "'Nunito', sans-serif",      url: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;800&display=swap"            },
  { label: "Retro Pharma",  value: "'Bebas Neue', cursive",     url: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"                        },
  { label: "Rounded Soft",  value: "'Poppins', sans-serif",     url: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap"          },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadFont(url) {
  if (document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

const getImgSrc = (med) =>
  med?.image || med?.imageUrl || med?.img || med?.photo || null;

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = (text || "").split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
  return y;
}

function drawCanvas({ canvas, template, adMode, product, category, palette, font, imgEl, customHeadline, customSubtext, customCta }) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, palette.from);
  grad.addColorStop(1, palette.to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = palette.accent;
  ctx.beginPath(); ctx.arc(W * 0.82, H * 0.5, 180, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W * 0.08, H * 0.85, 90, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  if (adMode === "medicine" && imgEl) {
    const imgSize = 220;
    const imgX = W - imgSize - 50;
    const imgY = (H - imgSize) / 2;
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2 + 20, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.beginPath();
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(imgEl, imgX, imgY, imgSize, imgSize);
    ctx.restore();
  }
  const fontName = font.value.split(",")[0].replace(/'/g, "");
  const headline = customHeadline || (adMode === "medicine" ? product?.name : `${category} Collection`);
  const subtext  = customSubtext  || (adMode === "medicine" ? (product?.description || "") : `Explore our full range of ${category}`);
  const ctaLabel = customCta      || (adMode === "category" ? "Shop Category" : "View Product");
  const bW = 110, bH = 32, bX = 44, bY = 38;
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, 20); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = `bold 14px ${fontName}`;
  ctx.textAlign = "center";
  ctx.fillText(template.badge, bX + bW / 2, bY + 22);
  ctx.fillStyle = "#fff";
  ctx.font = `800 46px ${fontName}`;
  ctx.textAlign = "left";
  ctx.fillText(headline, 44, 158);
  ctx.globalAlpha = 0.82;
  ctx.font = `400 19px ${fontName}`;
  wrapText(ctx, subtext, 44, 198, imgEl ? W * 0.52 : W - 88, 28);
  ctx.globalAlpha = 1;
  ctx.font = `600 16px ${fontName}`;
  ctx.fillStyle = palette.accent;
  ctx.fillText(`— ${template.name}`, 44, 250);
  const btnX = 44, btnY = 270, btnW = 200, btnH = 50;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath(); ctx.roundRect(btnX, btnY, btnW, btnH, 14); ctx.fill();
  ctx.fillStyle = palette.from;
  ctx.font = `700 17px ${fontName}`;
  ctx.textAlign = "center";
  ctx.fillText(ctaLabel, btnX + btnW / 2, btnY + 33);
  ctx.textAlign = "right";
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#fff";
  ctx.font = `400 12px sans-serif`;
  ctx.fillText("Rujta™", W - 18, H - 14);
  ctx.globalAlpha = 1;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={18} className="text-primary" />
      <h2 className="text-[11px] font-bold tracking-widest uppercase text-gray-400">{label}</h2>
    </div>
  );
}

function ModeTab({ active, onClick, icon: Icon, label, sub }) {
  return (
    <button onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-200
        ${active ? "border-primary bg-primary/5 shadow-sm" : "border-gray-200 hover:border-primary/30"}`}
    >
      <Icon size={22} className={active ? "text-primary" : "text-gray-400"} />
      <span className={`text-sm font-semibold ${active ? "text-primary" : "text-gray-500"}`}>{label}</span>
      <span className="text-[10px] text-gray-400 leading-tight text-center">{sub}</span>
    </button>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3
      bg-white border border-green-200 shadow-2xl rounded-2xl px-5 py-4">
      <MdCheckCircle size={24} className="text-green-500 flex-shrink-0" />
      <p className="text-sm font-semibold text-gray-700">{message}</p>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
    </div>
  );
}

// ─── Plan Modal ───────────────────────────────────────────────────────────────

function PlanModal({ plans, onSelect, onClose, loading }) {
  // ✅ receives plans as prop — no hook calls outside component
  const [selected, setSelected] = useState(plans[1] ?? plans[0]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-1 text-xl font-semibold">Choose Ad Plan</h2>
        <p className="mb-5 text-sm text-gray-500">
          Your ad will go live immediately after payment and deactivate automatically when the plan ends.
        </p>
        <div className="flex flex-col gap-3 mb-6">
          {plans.map((plan) => (
            <label
              key={plan.days}
              className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition ${
                selected?.days === plan.days
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={selected?.days === plan.days}
                  onChange={() => setSelected(plan)}
                  className="accent-primary"
                />
                <div>
                  <p className="font-semibold text-gray-800">{plan.label}</p>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                </div>
              </div>
              <span className="font-bold text-primary text-lg">{plan.price} EGP</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={loading}
            className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={() => onSelect(selected)} disabled={loading}
            className="rounded-lg bg-primary px-5 py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Processing..." : `Pay ${selected?.price} EGP →`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hero-Style Live Preview ──────────────────────────────────────────────────

function AdProgressBar({ duration, running, slideIndex }) {
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
}

// ─── 2. Replace HeroPreview entirely with this ────────────────────────────────

function HeroPreview({ adMode, selectedProduct, selectedCategory, palette, font, selectedTemplate, previewHeadline, previewSubtext, previewCta }) {
  const [isPaused, setIsPaused] = useState(false);

  const imgSrc = adMode === "medicine" ? getImgSrc(selectedProduct) : null;
  const isReady = selectedTemplate && (adMode === "medicine" ? !!selectedProduct : !!selectedCategory);
  const badge = selectedTemplate?.badge || "NEW ARRIVAL";

  // mirrors DynamicSlide.handleShopNow — no-op in the designer context
  const handleShopNow = () => {};

  return (
    <>
      <style>{`
        @keyframes adSpin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes adFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      `}</style>

      {/* Outer shell — identical dimensions & border-radius to Hero.jsx */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          position: "relative",
          width: "100%",
          height: "520px",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          fontFamily: font.value,
          // radial-gradient matches DynamicSlide exactly (colorTo → colorFrom)
          background: `radial-gradient(circle at top left, ${palette.to}, ${palette.from})`,
        }}
      >
        {/* ── Ambient blobs (copied from DynamicSlide) ── */}
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "40%", height: "40%", borderRadius: "50%", background: "rgba(255,255,255,0.08)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "30%", height: "30%", borderRadius: "50%", background: "rgba(0,0,0,0.15)", filter: "blur(60px)" }} />

        {/* ── Corner ribbon — pixel-matched to DynamicSlide ── */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 120, height: 120, overflow: "hidden", pointerEvents: "none", zIndex: 30 }}>
          <div style={{
            position: "absolute", top: 28, left: -36, width: 160,
            padding: "6px 0",
            background: "linear-gradient(135deg, #1a5c2a 0%, #2d8c45 100%)",
            transform: "rotate(-45deg)",
            textAlign: "center",
            boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
              {badge}
            </span>
          </div>
        </div>

        {/* ── Main content grid — same as DynamicSlide ── */}
        <div style={{
          position: "relative", zIndex: 10,
          width: "100%", height: "100%",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 32, alignItems: "center",
          padding: "0 32px", boxSizing: "border-box",
        }}>

          {/* Left: text column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h1 style={{
              color: "#fff", fontWeight: 800, lineHeight: 1.1,
              fontSize: "clamp(1rem, 1.6vw, 1.6rem)",
              textShadow: "0 2px 8px rgba(0,0,0,0.2)", margin: 0,
            }}>
              {isReady ? previewHeadline : <span style={{ opacity: 0.3 }}>Headline here</span>}
            </h1>

            <div style={{ width: 36, height: 3, background: "rgba(255,255,255,0.45)", borderRadius: 4 }} />

            {isReady && previewSubtext && (
              <p style={{
                color: "rgba(255,255,255,0.88)",
                fontWeight: 900,
                // matches DynamicSlide subtext sizing exactly
                fontSize: "clamp(1rem, 3.5vw, 2.5rem)",
                lineHeight: 1,
                textShadow: "0 2px 10px rgba(0,0,0,0.18)",
                margin: 0,
              }}>
                {previewSubtext}
              </p>
            )}

            {!isReady && (
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>
                Select a template &amp; {adMode === "medicine" ? "medicine" : "category"} to preview
              </p>
            )}

            {/* CTA button — same style as DynamicSlide SHOP NOW */}
            <button
              onClick={handleShopNow}
              style={{
                alignSelf: "flex-start",
                background: "#fff", color: "#111",
                border: "none", borderRadius: 100,
                padding: "10px 24px",
                fontWeight: 700, fontSize: 13,
                cursor: "pointer", letterSpacing: "0.04em",
                boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
                transition: "transform 0.15s, box-shadow 0.15s",
                fontFamily: font.value,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.28)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.18)";
              }}
            >
              {previewCta ? previewCta.toUpperCase() : "SHOP NOW"}
            </button>
          </div>

          {/* Right: product image with orbit ring + float animation */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            {/* Spinning orbit ring */}
            <div style={{
              position: "absolute", width: "75%", height: "75%",
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.18)",
              animation: "adSpin 12s linear infinite",
            }} />

            {/* Product image / category placeholder / empty state */}
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={selectedProduct?.name}
                style={{
                  width: "clamp(120px, 18vw, 260px)",
                  objectFit: "contain",
                  filter: "drop-shadow(0 16px 16px rgba(0,0,0,0.4))",
                  position: "relative", zIndex: 1,
                  animation: "adFloat 5s ease-in-out infinite",
                }}
              />
            ) : adMode === "category" && selectedCategory ? (
              <div style={{
                width: 130, height: 130, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "4px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.12)",
                position: "relative", zIndex: 1,
                animation: "adFloat 5s ease-in-out infinite",
              }}>
                <MdCategory size={52} style={{ color: "rgba(255,255,255,0.7)" }} />
              </div>
            ) : (
              <div style={{
                width: 130, height: 130, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px dashed rgba(255,255,255,0.2)",
                position: "relative", zIndex: 1,
              }}>
                <MdMedication size={40} style={{ color: "rgba(255,255,255,0.2)" }} />
              </div>
            )}

            {/* Ground shadow */}
            <div style={{
              position: "absolute", bottom: 0,
              width: "45%", height: 16,
              background: "rgba(0,0,0,0.2)",
              filter: "blur(8px)", borderRadius: "50%",
            }} />
          </div>
        </div>

        {/* ── Progress bar — pauses on hover, same as Hero.jsx ── */}
        <AdProgressBar duration={6000} running={!isPaused && isReady} slideIndex={0} />

        {/* Watermark */}
        <span style={{ position: "absolute", bottom: 8, right: 12, fontSize: 10, color: "rgba(255,255,255,0.15)", pointerEvents: "none", userSelect: "none" }}>
          Rujta™
        </span>
      </div>
    </>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────

export default function Ads() {
  const { medicines, loading: medsLoading, error: medsError, fetchAll: fetchMeds } = useMedicines();
  const { create: createAd } = useCampaigns();
  const { initiate, paymentResult, loading: initiatingPayment, reset: resetPayment } = usePayment();
  const { pharmacyCategories, loading: catsLoading, fetchPharmacyCategories } = useCategory();
  const { pricing, fetchPricing } = usePricing(); // ✅ INSIDE component

  const [adMode,           setAdMode]          = useState("medicine");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedProduct,  setSelectedProduct]  = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [palette,          setPalette]          = useState(colorPalettes[0]);
  const [font,             setFont]             = useState(fontOptions[0]);
  const [query,            setQuery]            = useState("");
  const [customHeadline,   setCustomHeadline]   = useState("");
  const [customSubtext,    setCustomSubtext]    = useState("");
  const [customCta,        setCustomCta]        = useState("");
  const [pngSaved,         setPngSaved]         = useState(false);
  const [publishing,       setPublishing]       = useState(false);
  const [toast,            setToast]            = useState(null);
  const [publishError,     setPublishError]     = useState(null);
  const [showPlanModal,    setShowPlanModal]    = useState(false);
  const [showIframe,       setShowIframe]       = useState(false);

  const canvasRef = useRef(null);

  // ✅ ALL useEffects INSIDE component
  useEffect(() => { fetchMeds(); },               [fetchMeds]);
  useEffect(() => { fetchPharmacyCategories(); }, [fetchPharmacyCategories]);
  useEffect(() => { fetchPricing(); },            [fetchPricing]);
  useEffect(() => { fontOptions.forEach(f => loadFont(f.url)); }, []);
  useEffect(() => {
    if (paymentResult?.iframeUrl) {
      setShowPlanModal(false);
      setShowIframe(true);
    }
  }, [paymentResult]);

  // ✅ AD_PLANS built inside component from live pricing
  const AD_PLANS = pricing ? [
    { days: 7,  price: pricing.adWeeklyPrice,   label: "1 Week",  description: "Great for short promotions" },
    { days: 14, price: pricing.adBiweeklyPrice, label: "2 Weeks", description: "Most popular choice"        },
    { days: 30, price: pricing.adMonthlyPrice,  label: "1 Month", description: "Best value for visibility"  },
  ] : [];

  const filteredMeds = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return medicines;
    return medicines.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q) ||
      m.category?.toLowerCase().includes(q)
    );
  }, [medicines, query]);

  const isReady = selectedTemplate && (adMode === "medicine" ? !!selectedProduct : !!selectedCategory);

  const previewHeadline = customHeadline || (adMode === "medicine" ? (selectedProduct?.name || "Product Name") : (selectedCategory ? `${selectedCategory} Collection` : "Category Name"));
  const previewSubtext  = customSubtext  || (adMode === "medicine" ? (selectedProduct?.description || "Tagline appears here") : (selectedCategory ? `Explore our full range of ${selectedCategory}` : "Subtext appears here"));
  const previewCta      = customCta || (adMode === "category" ? "Shop Category" : "View Product");

  const renderToDataURL = () =>
    new Promise((resolve) => {
      const src = adMode === "medicine" ? getImgSrc(selectedProduct) : null;
      const go = (imgEl) => {
        drawCanvas({ canvas: canvasRef.current, template: selectedTemplate, adMode, product: selectedProduct, category: selectedCategory, palette, font, imgEl, customHeadline, customSubtext, customCta });
        resolve(canvasRef.current.toDataURL("image/png"));
      };
      if (src) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload  = () => go(img);
        img.onerror = () => go(null);
        img.src = src;
      } else { go(null); }
    });

  const handleDownload = async () => {
    if (!canvasRef.current || !isReady) return;
    const dataURL = await renderToDataURL();
    const link = document.createElement("a");
    const name = adMode === "medicine" ? selectedProduct.name.replace(/\s+/g, "-") : selectedCategory.replace(/\s+/g, "-");
    link.download = `ad-${name}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    setPngSaved(true);
    setTimeout(() => setPngSaved(false), 2500);
  };

  const handlePublishClick = () => {
    if (!isReady || publishing) return;
    setPublishError(null);
    setShowPlanModal(true);
  };

  const handlePlanSelect = async (plan) => {
    setPublishing(true);
    setPublishError(null);
    try {
      const payload = {
        templateName:  selectedTemplate.name,
        badge:         selectedTemplate.badge,
        adMode,
        medicineId:    adMode === "medicine" ? selectedProduct?.id   : null,
        medicineName:  adMode === "medicine" ? selectedProduct?.name : null,
        medicineImage: adMode === "medicine" ? getImgSrc(selectedProduct) : null,
        category:      adMode === "category" ? selectedCategory : null,
        headline:      previewHeadline,
        subtext:       previewSubtext,
        ctaLabel:      previewCta,
        colorFrom:     palette.from,
        colorTo:       palette.to,
        colorAccent:   palette.accent,
        fontLabel:     font.label,
        price:         plan.price,
        durationDays:  plan.days,
      };
      const createdAd = await createAd(payload);
      const adId = createdAd?.id ?? createdAd?.Id;
      if (!adId) throw new Error("Ad creation failed — no ID returned.");
      await initiate({
        type:     "Ad",
        adId,
        amount:   plan.price,
        currency: "EGP",
        billingData: {
          firstName: "Pharmacy", lastName: "Admin",
          email: "admin@pharmacy.com", phoneNumber: "01000000000",
          apartment: "N/A", floor: "N/A", street: "N/A", building: "N/A",
          shippingMethod: "PKG", postalCode: "NA",
          city: "Cairo", country: "EG", state: "Cairo",
        },
      });
    } catch (err) {
      setPublishError(err?.response?.data?.message || err?.message || "Failed to publish");
      setShowPlanModal(false);
    } finally {
      setPublishing(false);
    }
  };

  const handleCloseIframe = () => {
    setShowIframe(false);
    resetPayment();
    setToast({ message: "Ad submitted! It will activate once payment is confirmed." });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}

      {showPlanModal && AD_PLANS.length > 0 && (
        <PlanModal
          plans={AD_PLANS}          // ✅ passed as prop
          loading={publishing || initiatingPayment}
          onSelect={handlePlanSelect}
          onClose={() => setShowPlanModal(false)}
        />
      )}

      {showIframe && paymentResult?.iframeUrl && (
        <PaymentIframeModal iframeUrl={paymentResult.iframeUrl} onClose={handleCloseIframe} />
      )}

      <div className="flex items-center gap-3 pb-3 border-b">
        <MdCampaign size={30} className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold leading-tight">Ad Designer</h1>
          <p className="text-sm text-gray-400">Create, style, and publish pharmacy ads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <div className="space-y-7">

          <section>
            <SectionHeader icon={MdCampaign} label="1 · Ad Template" />
            <div className="grid grid-cols-3 gap-3">
              {adTemplates.map(t => {
                const active = selectedTemplate?.id === t.id;
                return (
                  <div key={t.id} onClick={() => setSelectedTemplate(t)}
                    className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 select-none
                      ${active ? "border-primary bg-primary/5 shadow-md" : "border-gray-200 hover:border-primary/40 hover:shadow-sm"}`}>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white mb-2">{t.badge}</span>
                    <p className="font-semibold text-sm leading-tight">{t.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{t.description}</p>
                    {active && <FiCheckCircle className="absolute top-3 right-3 text-primary" size={16} />}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <SectionHeader icon={MdCategory} label="2 · Advertise What?" />
            <div className="flex gap-3">
              <ModeTab active={adMode === "medicine"} onClick={() => { setAdMode("medicine"); setSelectedCategory(""); }} icon={MdMedication} label="A Medicine" sub="Feature a specific product" />
              <ModeTab active={adMode === "category"} onClick={() => { setAdMode("category"); setSelectedProduct(null); }} icon={MdCategory} label="A Category" sub="Promote an entire category" />
            </div>
          </section>

          <section>
            {adMode === "medicine" ? (
              <>
                <SectionHeader icon={MdMedication} label="3 · Choose Medicine" />
                <div className="relative mb-3">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" placeholder="Search by name, category…" value={query} onChange={e => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary/50 text-sm transition" />
                </div>
                {medsLoading && <div className="flex items-center gap-2 text-sm text-gray-400 py-4"><span className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />Loading…</div>}
                {medsError   && <p className="text-sm text-red-400 py-2">{medsError}</p>}
                {!medsLoading && (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {filteredMeds.length === 0 && <p className="text-sm text-gray-400 py-6 text-center">No medicines found.</p>}
                    {filteredMeds.map(med => {
                      const active = selectedProduct?.id === med.id;
                      const imgSrc = getImgSrc(med);
                      return (
                        <div key={med.id} onClick={() => setSelectedProduct(med)}
                          className={`flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 border-2 transition-all duration-150
                            ${active ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/30 hover:bg-gray-50"}`}>
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                            {imgSrc ? <img src={imgSrc} alt={med.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><MdMedication size={24} /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{med.name}</p>
                            <p className="text-[11px] text-gray-400 truncate">{med.category || med.description || "—"}</p>
                          </div>
                          {active && <FiCheckCircle className="text-primary flex-shrink-0" size={18} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <SectionHeader icon={MdCategory} label="3 · Choose Category" />
                {catsLoading && <div className="flex items-center gap-2 text-sm text-gray-400 py-4"><span className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />Loading categories…</div>}
                {!catsLoading && pharmacyCategories.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No categories found.</p>}
                {!catsLoading && pharmacyCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {pharmacyCategories.map(cat => {
                      const active = selectedCategory === cat.name;
                      return (
                        <button key={cat.id} onClick={() => setSelectedCategory(cat.name)}
                          className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all
                            ${active ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-600 hover:border-primary/40"}`}>
                          {active && <FiCheckCircle className="inline mr-1.5 mb-0.5" size={13} />}{cat.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>

          <section>
            <SectionHeader icon={MdPalette} label="4 · Color Theme" />
            <div className="flex flex-wrap gap-2">
              {colorPalettes.map(p => (
                <button key={p.label} title={p.label} onClick={() => setPalette(p)}
                  className={`w-9 h-9 rounded-full border-4 transition-all duration-150 ${palette.label === p.label ? "border-gray-700 scale-110 shadow-md" : "border-transparent hover:scale-105"}`}
                  style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Selected: <span className="font-medium text-gray-600">{palette.label}</span></p>
          </section>

          <section>
            <SectionHeader icon={MdTextFields} label="5 · Font Style" />
            <div className="grid grid-cols-3 gap-2">
              {fontOptions.map(f => (
                <button key={f.label} onClick={() => setFont(f)} style={{ fontFamily: f.value }}
                  className={`rounded-xl px-3 py-2.5 border-2 text-sm transition-all ${font.label === f.label ? "border-primary bg-primary/5 font-semibold" : "border-gray-200 hover:border-primary/40"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader icon={MdEdit} label="6 · Custom Text (optional)" />
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Headline</label>
                <input type="text" placeholder="e.g. Best Pain Relief This Season" value={customHeadline} onChange={e => setCustomHeadline(e.target.value)} maxLength={50}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary/50 text-sm transition" />
                <p className="text-[10px] text-gray-300 mt-0.5 text-right">{customHeadline.length}/50</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Subtext / Tagline</label>
                <textarea rows={2} placeholder="e.g. Get 20% off this week only!" value={customSubtext} onChange={e => setCustomSubtext(e.target.value)} maxLength={120}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary/50 text-sm transition resize-none" />
                <p className="text-[10px] text-gray-300 mt-0.5 text-right">{customSubtext.length}/120</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Button Text</label>
                <input type="text" placeholder="e.g. Order Today" value={customCta} onChange={e => setCustomCta(e.target.value)} maxLength={30}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary/50 text-sm transition" />
              </div>
              {(customHeadline || customSubtext || customCta) && (
                <button onClick={() => { setCustomHeadline(""); setCustomSubtext(""); setCustomCta(""); }}
                  className="text-xs text-gray-400 hover:text-red-400 transition underline">
                  Clear custom text
                </button>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5 sticky top-6">
          <SectionHeader icon={MdCampaign} label="Live Preview & Export" />
          <HeroPreview adMode={adMode} selectedProduct={selectedProduct} selectedCategory={selectedCategory}
            palette={palette} font={font} selectedTemplate={selectedTemplate}
            previewHeadline={previewHeadline} previewSubtext={previewSubtext} previewCta={previewCta} />
          {(customHeadline || customSubtext || customCta) && (
            <p className="text-xs text-primary/70 flex items-center gap-1"><MdEdit size={13} /> Custom text is active.</p>
          )}
          <canvas ref={canvasRef} width={900} height={420} className="hidden" />
          {publishError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{publishError}</div>
          )}
          <div className="flex gap-3 flex-wrap">
            <button disabled={!isReady || publishing || initiatingPayment || AD_PLANS.length === 0} onClick={handlePublishClick}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition">
              {publishing || initiatingPayment
                ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Processing…</>
                : <><MdCampaign size={20} /> Publish Ad</>}
            </button>
            <button disabled={!isReady} onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-primary text-primary font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/5 transition">
              <MdDownload size={20} />
              {pngSaved ? "Downloaded!" : "Download PNG"}
            </button>
          </div>
          {!isReady && <p className="text-xs text-gray-400">↑ Pick a template and {adMode === "medicine" ? "a medicine" : "a category"} to enable.</p>}
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-600 space-y-1">
            <p className="font-semibold">How does publishing work?</p>
            <p>✅ Choose a plan (7, 14, or 30 days)</p>
            <p>✅ Pay via Paymob — ad activates automatically</p>
            <p>✅ Ad deactivates automatically when plan expires</p>
          </div>
        </div>
      </div>
    </div>
  );
}