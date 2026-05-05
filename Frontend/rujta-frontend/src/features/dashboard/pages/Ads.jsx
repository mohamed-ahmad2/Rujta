// src/features/dashboard/pages/Ads.jsx
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

// ─── Static Data ──────────────────────────────────────────────────────────────

const adTemplates = [
  { id: 1, name: "Discount Banner", description: "Highlight discounts and offers", badge: "SALE" },
  { id: 2, name: "New Arrival",     description: "Promote new products",           badge: "NEW"  },
  { id: 3, name: "Best Seller",     description: "Show top selling medicines",     badge: "HOT"  },
];

const colorPalettes = [
  { label: "Ocean",   from: "#0ea5e9", to: "#0369a1", accent: "#38bdf8" },
  { label: "Emerald", from: "#10b981", to: "#065f46", accent: "#6ee7b7" },
  { label: "Crimson", from: "#ef4444", to: "#7f1d1d", accent: "#fca5a5" },
  { label: "Amber",   from: "#f59e0b", to: "#78350f", accent: "#fde68a" },
  { label: "Violet",  from: "#8b5cf6", to: "#4c1d95", accent: "#c4b5fd" },
  { label: "Rose",    from: "#f43f5e", to: "#881337", accent: "#fda4af" },
  { label: "Slate",   from: "#334155", to: "#0f172a", accent: "#94a3b8" },
  { label: "Coral",   from: "#fb923c", to: "#9a3412", accent: "#fed7aa" },
];

const fontOptions = [
  { label: "Modern Sans",   value: "'DM Sans', sans-serif",     url: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;800&display=swap"         },
  { label: "Elegant Serif", value: "'Playfair Display', serif", url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap" },
  { label: "Bold Display",  value: "'Sora', sans-serif",        url: "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;800&display=swap"              },
  { label: "Medical Clean", value: "'Nunito', sans-serif",      url: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;800&display=swap"            },
  { label: "Retro Pharma",  value: "'Bebas Neue', cursive",     url: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"                        },
  { label: "Rounded Soft",  value: "'Poppins', sans-serif",     url: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap"          },
];

// ─── Ad Plans ─────────────────────────────────────────────────────────────────

const AD_PLANS = [
  { days: 7,  price: 99,  label: "1 Week",  description: "Great for short promotions" },
  { days: 14, price: 179, label: "2 Weeks", description: "Most popular choice"        },
  { days: 30, price: 299, label: "1 Month", description: "Best value for visibility"  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function PlanModal({ onSelect, onClose, loading }) {
  const [selected, setSelected] = useState(AD_PLANS[1]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-1 text-xl font-semibold">Choose Ad Plan</h2>
        <p className="mb-5 text-sm text-gray-500">
          Your ad will go live immediately after payment and deactivate automatically when the plan ends.
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {AD_PLANS.map((plan) => (
            <label
              key={plan.days}
              className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition ${
                selected.days === plan.days
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={selected.days === plan.days}
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
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSelect(selected)}
            disabled={loading}
            className="rounded-lg bg-primary px-5 py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Processing..." : `Pay ${selected.price} EGP →`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hero-Style Live Preview ──────────────────────────────────────────────────

function HeroPreview({ adMode, selectedProduct, selectedCategory, palette, font, selectedTemplate, previewHeadline, previewSubtext, previewCta }) {
  const imgSrc = adMode === "medicine" ? getImgSrc(selectedProduct) : null;
  const isReady = selectedTemplate && (adMode === "medicine" ? !!selectedProduct : !!selectedCategory);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
      style={{
        minHeight: 420,
        background: `radial-gradient(circle at top left, ${palette.to}, ${palette.from})`,
        fontFamily: font.value,
      }}
    >
      {/* Ambient glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-black/20 blur-[60px] pointer-events-none" />

      {/* Corner ribbon */}
      <div style={{ position: "absolute", top: 0, left: 0, zIndex: 30, width: 140, height: 140, overflow: "hidden", pointerEvents: "none", userSelect: "none" }}>
        <div style={{
          position: "absolute", top: 32, left: -38, width: 170,
          padding: "8px 0",
          background: "linear-gradient(135deg, #1a5c2a 0%, #2d8c45 100%)",
          transform: "rotate(-45deg)",
          textAlign: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", whiteSpace: "nowrap" }}>
            {selectedTemplate?.badge || "NEW"}
          </span>
        </div>
      </div>

      {/* Main content grid */}
      <div className="relative z-10 w-full h-full flex items-center px-8 py-10 gap-6">

        {/* Left: Text */}
        <div className="flex-1 space-y-5">
          <div className="space-y-2">
            <h1
              className="text-white font-extrabold leading-tight drop-shadow-md"
              style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)" }}
            >
              {isReady ? previewHeadline : <span className="opacity-30">Headline here</span>}
            </h1>
            <div className="h-1 w-16 bg-white/40 rounded-full" />
          </div>

          {/* 3D Subtext — like Hero */}
          {isReady && previewSubtext && (
            <div className="relative">
              <style>{`
                @keyframes adFloat {
                  0%, 100% { transform: perspective(800px) rotateX(12deg) rotateY(-4deg) translateY(0px); }
                  50%       { transform: perspective(800px) rotateX(12deg) rotateY(-4deg) translateY(-8px); }
                }
              `}</style>
              <p
                className="text-white font-black leading-none select-none"
                style={{
                  fontSize: "clamp(1.1rem, 2.5vw, 1.8rem)",
                  textTransform: "uppercase",
                  letterSpacing: "-0.01em",
                  transform: "perspective(800px) rotateX(12deg) rotateY(-4deg)",
                  textShadow: `
                    1px 1px 0px rgba(0,0,0,0.2),
                    2px 2px 0px rgba(0,0,0,0.18),
                    3px 3px 0px rgba(0,0,0,0.14),
                    4px 4px 8px rgba(0,0,0,0.25)
                  `,
                  WebkitTextStroke: "0.5px rgba(255,255,255,0.1)",
                  animation: "adFloat 4s ease-in-out infinite",
                  maxWidth: "80%",
                }}
              >
                {previewSubtext}
              </p>
            </div>
          )}

          {!isReady && (
            <p className="text-white/30 text-sm">Select a template &amp; {adMode === "medicine" ? "medicine" : "category"} to preview</p>
          )}

          {/* CTA Button */}
          <button
            className="group relative bg-white px-8 py-3 rounded-full font-black text-sm overflow-hidden transition-all hover:pl-12 active:scale-95 shadow-xl"
            style={{ color: palette.from }}
          >
            <span className="relative z-10">{previewCta}</span>
            <span className="absolute left-4 opacity-0 transition-all group-hover:opacity-100 group-hover:left-5 text-xs">→</span>
          </button>
        </div>

        {/* Right: Product image with spinning ring */}
        <div className="relative flex items-center justify-center flex-shrink-0 w-[180px] h-[180px]">
          {/* Spinning ring */}
          <div
            className="absolute w-full h-full rounded-full border-2 border-white/20"
            style={{
              animation: "spin 10s linear infinite",
              boxShadow: `0 0 30px ${palette.from}44`,
            }}
          />
          {/* Inner glow */}
          <div className="absolute w-[70%] h-[70%] rounded-full bg-white/10 blur-xl" />

          {/* Bouncing image */}
          <div
            className="relative z-10"
            style={{ animation: "bounce 4s ease-in-out infinite" }}
          >
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={selectedProduct?.name}
                className="w-[130px] h-[130px] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110"
                style={{ filter: "drop-shadow(0 20px 20px rgba(0,0,0,0.45))" }}
              />
            ) : adMode === "category" && selectedCategory ? (
              <div className="w-[130px] h-[130px] rounded-full flex items-center justify-center border-4 border-white/30"
                style={{ background: "rgba(255,255,255,0.12)" }}>
                <MdCategory size={52} style={{ color: "rgba(255,255,255,0.7)" }} />
              </div>
            ) : (
              <div className="w-[130px] h-[130px] rounded-full flex items-center justify-center border-2 border-dashed border-white/20">
                <MdMedication size={40} style={{ color: "rgba(255,255,255,0.2)" }} />
              </div>
            )}
          </div>

          {/* Ground shadow */}
          <div className="absolute bottom-0 w-[60%] h-4 bg-black/20 blur-xl rounded-full" />
        </div>
      </div>

      {/* Watermark */}
      <span className="absolute bottom-2 right-3 text-[10px] text-white/15 pointer-events-none select-none">Rujta™</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Ads() {
  const { medicines, loading: medsLoading, error: medsError, fetchAll: fetchMeds } = useMedicines();
  const { create: createAd } = useCampaigns();
  const { initiate, paymentResult, loading: initiatingPayment, reset: resetPayment } = usePayment();

  // ── Category hook ──────────────────────────────────────────────
  const {
    pharmacyCategories,
    loading: catsLoading,
    fetchPharmacyCategories,
  } = useCategory();

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

  useEffect(() => { fetchMeds(); }, [fetchMeds]);
  // ── Fetch pharmacy's own categories on mount ──
  useEffect(() => { fetchPharmacyCategories(); }, [fetchPharmacyCategories]);
  useEffect(() => { fontOptions.forEach(f => loadFont(f.url)); }, []);

  useEffect(() => {
    if (paymentResult?.iframeUrl) {
      setShowPlanModal(false);
      setShowIframe(true);
    }
  }, [paymentResult]);

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

  const previewHeadline = customHeadline ||
    (adMode === "medicine" ? (selectedProduct?.name || "Product Name") : (selectedCategory ? `${selectedCategory} Collection` : "Category Name"));
  const previewSubtext  = customSubtext  ||
    (adMode === "medicine" ? (selectedProduct?.description || "Tagline appears here") : (selectedCategory ? `Explore our full range of ${selectedCategory}` : "Subtext appears here"));
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
      } else {
        go(null);
      }
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
    const now = new Date();
    const expires = new Date(now.getTime() + plan.days * 86_400_000);

    const payload = {
      templateName:  selectedTemplate.name,
      badge:         selectedTemplate.badge,
      adMode,
      medicineId:    adMode === "medicine" ? selectedProduct?.id   : null,
      medicineName:  adMode === "medicine" ? selectedProduct?.name : null,
      medicineImage: adMode === "medicine" ? getImgSrc(selectedProduct) : null,
      category:      adMode === "category" ? selectedCategory      : null,
      headline:      previewHeadline,
      subtext:       previewSubtext,
      ctaLabel:      previewCta,
      colorFrom:     palette.from,
      colorTo:       palette.to,
      colorAccent:   palette.accent,
      fontLabel:     font.label,
      price:         plan.price,
      durationDays:  plan.days,
      startsAt:      now.toISOString(),
      expiresAt:     expires.toISOString(),
      isActive:      false,
    };

    console.log("📤 payload →", JSON.stringify(payload, null, 2)); // verify in console

    const createdAd = await createAd(payload);
    // ...rest unchanged
      await initiate({
        Type:    "Ad",
        AdId:    createdAd.id,
        Amount:  plan.price,
        Currency: "EGP",
        BillingData: {
          FirstName:      "Pharmacy",
          LastName:       "Admin",
          Email:          "admin@pharmacy.com",
          PhoneNumber:    "01000000000",
          Apartment:      "N/A",
          Floor:          "N/A",
          Street:         "N/A",
          Building:       "N/A",
          ShippingMethod: "PKG",
          PostalCode:     "NA",
          City:           "Cairo",
          Country:        "EG",
          State:          "Cairo",
        },
      });

    } catch (err) {
      setPublishError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to publish"
      );
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

      {showPlanModal && (
        <PlanModal
          loading={publishing || initiatingPayment}
          onSelect={handlePlanSelect}
          onClose={() => setShowPlanModal(false)}
        />
      )}

      {showIframe && paymentResult?.iframeUrl && (
        <PaymentIframeModal
          iframeUrl={paymentResult.iframeUrl}
          onClose={handleCloseIframe}
        />
      )}

      <div className="flex items-center gap-3 pb-3 border-b">
        <MdCampaign size={30} className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold leading-tight">Ad Designer</h1>
          <p className="text-sm text-gray-400">Create, style, and publish pharmacy ads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

        {/* ══ LEFT PANEL ══ */}
        <div className="space-y-7">

          {/* 1. Template */}
          <section>
            <SectionHeader icon={MdCampaign} label="1 · Ad Template" />
            <div className="grid grid-cols-3 gap-3">
              {adTemplates.map(t => {
                const active = selectedTemplate?.id === t.id;
                return (
                  <div key={t.id} onClick={() => setSelectedTemplate(t)}
                    className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 select-none
                      ${active ? "border-primary bg-primary/5 shadow-md" : "border-gray-200 hover:border-primary/40 hover:shadow-sm"}`}
                  >
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white mb-2">{t.badge}</span>
                    <p className="font-semibold text-sm leading-tight">{t.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{t.description}</p>
                    {active && <FiCheckCircle className="absolute top-3 right-3 text-primary" size={16} />}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Mode */}
          <section>
            <SectionHeader icon={MdCategory} label="2 · Advertise What?" />
            <div className="flex gap-3">
              <ModeTab active={adMode === "medicine"} onClick={() => { setAdMode("medicine"); setSelectedCategory(""); }} icon={MdMedication} label="A Medicine" sub="Feature a specific product" />
              <ModeTab active={adMode === "category"} onClick={() => { setAdMode("category"); setSelectedProduct(null); }} icon={MdCategory} label="A Category" sub="Promote an entire category" />
            </div>
          </section>

          {/* 3. Pick medicine or category */}
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
                            ${active ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/30 hover:bg-gray-50"}`}
                        >
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
                {catsLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                    Loading categories…
                  </div>
                )}
                {!catsLoading && pharmacyCategories.length === 0 && (
                  <p className="text-sm text-gray-400 py-4 text-center">No categories found. Add some in your pharmacy settings.</p>
                )}
                {!catsLoading && pharmacyCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {pharmacyCategories.map(cat => {
                      const active = selectedCategory === cat.name;
                      return (
                        <button key={cat.id} onClick={() => setSelectedCategory(cat.name)}
                          className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all
                            ${active ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-600 hover:border-primary/40"}`}
                        >
                          {active && <FiCheckCircle className="inline mr-1.5 mb-0.5" size={13} />}{cat.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>

          {/* 4. Color */}
          <section>
            <SectionHeader icon={MdPalette} label="4 · Color Theme" />
            <div className="flex flex-wrap gap-2">
              {colorPalettes.map(p => (
                <button key={p.label} title={p.label} onClick={() => setPalette(p)}
                  className={`w-9 h-9 rounded-full border-4 transition-all duration-150
                    ${palette.label === p.label ? "border-gray-700 scale-110 shadow-md" : "border-transparent hover:scale-105"}`}
                  style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Selected: <span className="font-medium text-gray-600">{palette.label}</span></p>
          </section>

          {/* 5. Font */}
          <section>
            <SectionHeader icon={MdTextFields} label="5 · Font Style" />
            <div className="grid grid-cols-3 gap-2">
              {fontOptions.map(f => (
                <button key={f.label} onClick={() => setFont(f)} style={{ fontFamily: f.value }}
                  className={`rounded-xl px-3 py-2.5 border-2 text-sm transition-all
                    ${font.label === f.label ? "border-primary bg-primary/5 font-semibold" : "border-gray-200 hover:border-primary/40"}`}
                >{f.label}</button>
              ))}
            </div>
          </section>

          {/* 6. Custom Text */}
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

        {/* ══ RIGHT PANEL — Hero-Style Preview ══ */}
        <div className="space-y-5 sticky top-6">
          <SectionHeader icon={MdCampaign} label="Live Preview & Export" />

          {/* Hero-style preview */}
          <HeroPreview
            adMode={adMode}
            selectedProduct={selectedProduct}
            selectedCategory={selectedCategory}
            palette={palette}
            font={font}
            selectedTemplate={selectedTemplate}
            previewHeadline={previewHeadline}
            previewSubtext={previewSubtext}
            previewCta={previewCta}
          />

          {(customHeadline || customSubtext || customCta) && (
            <p className="text-xs text-primary/70 flex items-center gap-1"><MdEdit size={13} /> Custom text is active.</p>
          )}

          <canvas ref={canvasRef} width={900} height={420} className="hidden" />

          {publishError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{publishError}</div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button disabled={!isReady || publishing || initiatingPayment} onClick={handlePublishClick}
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
