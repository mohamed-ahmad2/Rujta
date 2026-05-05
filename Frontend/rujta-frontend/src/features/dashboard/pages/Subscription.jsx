// src/features/dashboard/pages/Subscription.jsx
import React, { useEffect, useState } from "react";
import {
  MdCreditCard, MdCalendarToday, MdAutorenew,
  MdCheckCircle, MdStar, MdTimelapse,
} from "react-icons/md";
import { FiCheckCircle } from "react-icons/fi";
import { useSubscription } from "../../subscriptions/hooks/useSubscription";
import { usePayment } from "../../payment/hooks/usePayment";
import PaymentIframeModal from "../../user/components/checkout/PaymentIframeModal";
import { useAuth } from "../../auth/hooks/useAuth";
import { toast } from "react-toastify";

// ─── Static Data ──────────────────────────────────────────────────────────────

const PLAN_ENUM   = { monthly: 0, yearly: 1 };
const PLAN_AMOUNT = { monthly: 1500, yearly: 14400 };

const subPlans = [
  {
    id: "monthly",
    enumVal: 0,
    label: "MONTHLY",
    sublabel: "Simple monthly billing.",
    price: "1,500",
    rawPrice: 1500,
    unit: "EGP / month",
    features: ["Cancel anytime", "Full platform access", "Standard support"],
  },
  {
    id: "yearly",
    enumVal: 1,
    label: "YEARLY",
    sublabel: "Best annual deal.",
    price: "14,400",
    rawPrice: 14400,
    unit: "EGP / year",
    equiv: "Equiv. to 1,200 EGP/month",
    ribbon: "SAVE 20%",
    features: ["Best value", "Full platform access", "Priority support", "Dedicated account manager"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={18} className="text-[#3C623C]" />
      <h2 className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
        {label}
      </h2>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({ item, selectedId, onSelect }) {
  const isSelected = selectedId === item.id;
  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`relative cursor-pointer flex flex-col flex-1 rounded-2xl border-2 p-5 text-center
        transition-all duration-300 overflow-hidden select-none
        ${isSelected
          ? "border-[#3C623C] -translate-y-1 shadow-xl bg-gradient-to-br from-[#f8fcf4] to-[#edf6e0]"
          : "border-gray-200 hover:-translate-y-1 hover:border-[#3C623C] hover:shadow-lg bg-white"
        }`}
    >
      {isSelected && (
        <div className="absolute top-2.5 left-2.5 bg-[#3C623C] text-white text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wide">
          ✓ Selected
        </div>
      )}

      {item.ribbon && (
        <div className="absolute top-0 right-0 w-[80px] h-[80px] overflow-hidden rounded-tr-2xl pointer-events-none">
          <span className="absolute top-[18px] right-[-20px] bg-[#3C623C] text-white text-[9px] font-extrabold py-1 px-6 rotate-45 whitespace-nowrap shadow tracking-wide">
            {item.ribbon}
          </span>
        </div>
      )}

      <p className="text-sm font-black text-[#3C623C] tracking-widest mt-1">{item.label}</p>
      <p className="text-[10px] text-gray-400 mb-2">{item.sublabel}</p>

      {item.equiv && (
        <div className="text-[10px] text-[#9DC873] font-bold bg-[#f0f7e8] rounded-full px-3 py-1 inline-block mb-2 mx-auto">
          {item.equiv}
        </div>
      )}

      <p className="text-3xl font-black text-[#2d4a2d] leading-tight mt-1">{item.price}</p>
      <p className="text-[11px] text-[#7aaa50] font-semibold mb-2">{item.unit}</p>

      <div className="flex-1" />
      <hr className="border-dashed border-[#d4eabb] my-3" />

      <div className="text-left space-y-1.5 mb-4">
        {item.features.map((f) => (
          <div key={f} className="flex items-center gap-2 text-[11px] text-gray-500">
            <MdCheckCircle size={13} className="text-[#9DC873] flex-shrink-0" />
            {f}
          </div>
        ))}
      </div>

      <button
        className={`w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all
          ${isSelected ? "bg-[#3C623C]" : "bg-[#9DC873] hover:bg-[#3C623C]"}`}
      >
        {isSelected ? "✓ Selected" : `Choose ${item.label}`}
      </button>
    </div>
  );
}

// ─── Live Preview ─────────────────────────────────────────────────────────────

function SubscriptionPreview({ selectedPlan, status }) {
  const plan = subPlans.find((p) => p.id === selectedPlan);
  const hasStatus = !!status;
  const isActive  = status?.status === "Active";

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
      style={{
        minHeight: 380,
        background: plan
          ? "radial-gradient(circle at top left, #065f46, #3C623C)"
          : "radial-gradient(circle at top left, #374151, #1f2937)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-black/20 blur-[60px] pointer-events-none" />

      {plan?.ribbon && (
        <div style={{ position: "absolute", top: 0, left: 0, zIndex: 30, width: 130, height: 130, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: 30, left: -36, width: 160,
            padding: "7px 0",
            background: "linear-gradient(135deg, #1a5c2a, #2d8c45)",
            transform: "rotate(-45deg)",
            textAlign: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
          }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", whiteSpace: "nowrap" }}>
              {plan.ribbon}
            </span>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full h-full flex flex-col justify-between px-8 py-8 gap-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/20 text-white tracking-widest uppercase">
              {plan ? plan.label : "No Plan Selected"}
            </span>
            {hasStatus && (
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isActive ? "bg-green-500/30 text-green-200" : "bg-red-500/30 text-red-200"}`}>
                {status.status}
              </span>
            )}
          </div>

          <h1 className="text-white font-extrabold leading-tight drop-shadow-md" style={{ fontSize: "clamp(1.5rem, 3vw, 2.4rem)" }}>
            {plan ? `${plan.price} EGP` : <span className="opacity-30">Select a plan</span>}
          </h1>

          {plan && <p className="text-white/70 text-sm">{plan.unit}</p>}

          {plan?.equiv && (
            <div className="inline-block bg-white/10 rounded-full px-4 py-1 text-[11px] text-green-200 font-semibold">
              {plan.equiv}
            </div>
          )}
        </div>

        {plan ? (
          <div className="space-y-2.5">
            {plan.features.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-white/85">
                <FiCheckCircle size={15} className="text-green-300 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm">Pick a plan on the left to see details here.</p>
        )}

        {hasStatus && (
          <div className="border-t border-white/15 pt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Start Date",     value: fmt(status.startDate) },
              { label: "End Date",       value: fmt(status.endDate) },
              { label: "Plan",           value: status.plan ?? "—" },
              { label: "Days Remaining", value: isActive ? `${status.daysRemaining} days` : "Expired",
                highlight: isActive ? "text-green-300" : "text-red-300" },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="bg-white/10 rounded-xl px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">{label}</p>
                <p className={`text-xs font-bold ${highlight ?? "text-white"}`}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <span className="absolute bottom-2 right-3 text-[10px] text-white/10 pointer-events-none select-none">Rujta™</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Subscription() {
  const { user } = useAuth();

  const {
    loading: subLoading,
    error: subError,
    status,
    fetchStatus,
    create,    
    renew,
  } = useSubscription();

  const {
    paymentResult,
    loading: payLoading,
    error: payError,
    initiate,
    reset: resetPayment,
  } = usePayment();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showIframe,   setShowIframe]   = useState(false);

  // Fetch current subscription on mount — no pharmacyId, backend reads JWT
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Open iframe the moment we get a payment URL back
  useEffect(() => {
    if (paymentResult?.iframeUrl) setShowIframe(true);
  }, [paymentResult]);

  // Surface errors as toasts
  useEffect(() => { if (subError) toast.error(subError); }, [subError]);
  useEffect(() => { if (payError) toast.error(payError); }, [payError]);

  const hasExisting = !!status;
  const isLoading   = subLoading || payLoading;
  const selected    = subPlans.find((p) => p.id === selectedPlan);

  const handleConfirm = async () => {
  if (!selectedPlan) { toast.error("Please select a plan first."); return; }

  try {
    const subResult = hasExisting
      ? await renew(PLAN_ENUM[selectedPlan])
      : await create(PLAN_ENUM[selectedPlan]);

    await initiate({
      Type: 2,
      SubscriptionId: subResult.subscriptionId,
      Amount: PLAN_AMOUNT[selectedPlan],
      Currency: "EGP",
      BillingData: {
        FirstName:      user?.firstName   ?? "NA",
        LastName:       user?.lastName    ?? "NA",
        Email:          user?.email       ?? "NA",
        PhoneNumber:    user?.phoneNumber ?? user?.phone ?? "01000000000",
        Apartment:      "NA",
        Floor:          "NA",
        Street:         "NA",
        Building:       "NA",
        ShippingMethod: "PKG",
        PostalCode:     "11511",
        City:           "Cairo",
        Country:        "EG",
        State:          "Cairo",
      },
    });

    toast.info("Complete payment in the window to activate your subscription.");
  } catch {
    // already toasted via useEffects
  }
};

  const handleCloseIframe = () => {
    setShowIframe(false);
    resetPayment();
    // Re-fetch so UI reflects whatever the payment callback updated
    fetchStatus();
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {showIframe && paymentResult?.iframeUrl && (
        <PaymentIframeModal
          iframeUrl={paymentResult.iframeUrl}
          onClose={handleCloseIframe}
        />
      )}

      <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
        <MdCreditCard size={30} className="text-[#3C623C]" />
        <div>
          <h1 className="text-2xl font-bold leading-tight">Subscription</h1>
          <p className="text-sm text-gray-400">Manage your pharmacy subscription plan</p>
        </div>
      </div>

      {/* Loading state on initial fetch */}
      {subLoading && !status && (
        <div className="flex items-center gap-3 text-sm text-gray-400 py-4">
          <span className="h-4 w-4 rounded-full border-2 border-[#3C623C] border-t-transparent animate-spin" />
          Loading subscription...
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

        {/* ══ LEFT PANEL ══ */}
        <div className="space-y-7">

          {status && (
            <section>
              <SectionHeader icon={MdCalendarToday} label="1 · Current Subscription" />
              <div className="bg-white rounded-2xl border border-[#e8f2e0] p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-[#2d4a2d]">Active subscription</p>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full
                    ${status.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"}`}>
                    {status.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Plan",           value: status.plan ?? "—",       icon: MdStar },
                    { label: "Days Remaining",
                      value: status.status === "Active" ? `${status.daysRemaining} days` : "Expired",
                      icon: MdTimelapse,
                      className: status.status === "Active" ? "text-[#3C623C]" : "text-red-500" },
                    { label: "Start Date",     value: fmt(status.startDate),    icon: MdCalendarToday },
                    { label: "End Date",       value: fmt(status.endDate),      icon: MdCalendarToday },
                  ].map(({ label, value, icon: Icon, className }) => (
                    <div key={label} className="bg-[#f8fcf4] rounded-xl p-3 flex items-start gap-2.5">
                      <Icon size={15} className="text-[#9DC873] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#9DC873] mb-0.5">{label}</p>
                        <p className={`text-sm font-bold ${className ?? "text-[#2d4a2d]"}`}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {status.status === "Expired" && (
                  <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
                    <span className="text-red-400 text-sm">⚠</span>
                    <p className="text-xs text-red-600 font-medium">
                      Your subscription has expired. Renew below to restore access.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section>
            <SectionHeader
              icon={MdAutorenew}
              label={`${status ? "2" : "1"} · ${hasExisting ? "Renew / Change Plan" : "Choose a Plan"}`}
            />
            <div className="flex gap-4 items-stretch">
              {subPlans.map((item) => (
                <PlanCard
                  key={item.id}
                  item={item}
                  selectedId={selectedPlan}
                  onSelect={setSelectedPlan}
                />
              ))}
            </div>
          </section>

        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="space-y-5 sticky top-6">
          <SectionHeader icon={MdCreditCard} label="Plan Preview & Checkout" />

          <SubscriptionPreview selectedPlan={selectedPlan} status={status} />

          <div className="bg-white rounded-2xl border border-[#e0f0cc] shadow-sm px-5 py-4 flex justify-between items-center gap-4">
            <div className="min-w-0">
              <p className="text-[10px] text-[#7a9a7a] uppercase tracking-wider font-semibold">Selected Plan</p>
              <p className="text-base font-black text-[#3C623C] truncate">
                {selected
                  ? `${selected.label} — ${selected.price} ${selected.unit}`
                  : "Not selected yet"}
              </p>
            </div>
            <button
              disabled={!selectedPlan || isLoading}
              onClick={handleConfirm}
              className={`flex-shrink-0 px-6 py-3 rounded-xl text-white text-sm font-bold
                transition-all flex items-center gap-2
                ${selectedPlan && !isLoading
                  ? "bg-[#3C623C] hover:bg-[#2d4a2d]"
                  : "bg-[#c5ddb0] cursor-default"}`}
            >
              {isLoading && (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              )}
              {hasExisting ? "Renew & Pay" : "Subscribe & Pay"}
            </button>
          </div>

          {!selectedPlan && (
            <p className="text-xs text-gray-400">↑ Pick a plan to enable checkout.</p>
          )}

        
        </div>

      </div>
    </div>
  );
}