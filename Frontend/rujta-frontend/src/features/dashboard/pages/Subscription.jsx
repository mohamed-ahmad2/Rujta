// src/features/dashboard/pages/Subscription.jsx
import React, { useEffect, useState } from "react";
import { useSubscription } from "../../subscriptions/hooks/useSubscription";
import { usePayment } from "../../payment/hooks/usePayment";
import PaymentIframeModal from "../../user/components/checkout/PaymentIframeModal";
import { useAuth } from "../../auth/hooks/useAuth";
import { toast } from "react-toastify";

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
      {isSelected && (
        <div className="absolute top-2.5 left-2.5 bg-[#3C623C] text-white text-[10px] px-2.5 py-1 rounded-full font-bold">
          ✓ Selected
        </div>
      )}
      {item.ribbon && (
        <div className="absolute top-0 right-0 w-[90px] h-[90px] overflow-hidden rounded-tr-2xl pointer-events-none">
          <span className="absolute top-[20px] right-[-22px] bg-[#3C623C] text-white text-[10px] font-extrabold py-1 px-7 rotate-45 whitespace-nowrap shadow-md tracking-wide">
            {item.ribbon}
          </span>
        </div>
      )}
      <p className="text-xl font-black text-[#3C623C] tracking-wide mt-1">{item.label}</p>
      <p className="text-xs text-gray-400 mb-2">{item.sublabel}</p>
      {item.equiv && (
        <div className="text-[11px] text-[#9DC873] font-bold bg-[#f0f7e8] rounded-full px-3 py-1 inline-block mb-2 mx-auto">
          {item.equiv}
        </div>
      )}
      <p className="text-4xl font-black text-[#2d4a2d] leading-tight mt-2">{item.price}</p>
      <p className="text-[13px] text-[#7aaa50] font-semibold mb-3">{item.unit}</p>
      <div className="flex-1" />
      <hr className="border-dashed border-[#d4eabb] my-3" />
      <button
        className={`w-full py-3 rounded-xl text-white text-sm font-bold transition-all
          ${isSelected ? "bg-[#3C623C]" : "bg-[#9DC873] hover:bg-[#3C623C]"}`}
      >
        {isSelected ? "✓ Selected" : `Choose ${item.label} Plan`}
      </button>
    </div>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-green-100 text-green-700",
    Expired: "bg-red-100 text-red-600",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

// ── Current Subscription Card ─────────────────────────────────────────────
const CurrentSubscriptionCard = ({ status }) => {
  if (!status) return null;
  const isActive = status.status === "Active";
  const isExpired = status.status === "Expired";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e8f2e0] p-6 mb-5">
      <h2 className="text-base font-bold text-[#2d4a2d] pb-3 border-b-2 border-[#f0f5f0] mb-5 flex items-center gap-2">
        Current Subscription
        <StatusBadge status={status.status} />
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Plan", value: status.plan ?? "—" },
          {
            label: "Start Date",
            value: status.startDate
              ? new Date(status.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
              : "—",
          },
          {
            label: "End Date",
            value: status.endDate
              ? new Date(status.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
              : "—",
          },
          {
            label: "Days Remaining",
            value: isActive ? `${status.daysRemaining} days` : "Expired",
            className: isActive ? "text-[#3C623C]" : "text-red-500",
          },
        ].map(({ label, value, className }) => (
          <div key={label} className="bg-[#f8fcf4] rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9DC873] mb-1">{label}</p>
            <p className={`text-sm font-bold ${className ?? "text-[#2d4a2d]"}`}>{value}</p>
          </div>
        ))}
      </div>
      {isExpired && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <span className="text-red-400">⚠️</span>
          <p className="text-sm text-red-600 font-medium">
            Your subscription has expired. Renew below to restore access.
          </p>
        </div>
      )}
    </div>
  );
};

// ── Plan config ───────────────────────────────────────────────────────────
// These must match your C# SubscriptionPlan enum integer values
const PLAN_ENUM = { monthly: 0, yearly: 1 };
const PLAN_AMOUNT = { monthly: 1500, yearly: 14400 };

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

// ── Main Page ─────────────────────────────────────────────────────────────
export default function Subscription() {
  const { user } = useAuth();

  // ⚠️ If nothing fires when you click, this is the #1 suspect.
  // Log user and check the exact claim name your JWT uses.
  // It might be: user?.PharmacyId, user?.pharmacy_id, user?.pharmacy?.id, etc.
  const pharmacyId = user?.pharmacyId;

  const {
    loading: subLoading,
    error: subError,
    status,
    create,
    renew,
    fetchStatus,
  } = useSubscription();

  const {
    paymentResult,
    loading: payLoading,
    error: payError,
    initiate,
    reset: resetPayment,
  } = usePayment();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showIframe, setShowIframe] = useState(false);

  // Fetch current subscription on mount
  useEffect(() => {
    if (pharmacyId) fetchStatus(pharmacyId);
  }, [pharmacyId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open iframe the moment we get a payment URL back
  useEffect(() => {
    if (paymentResult?.iframeUrl) setShowIframe(true);
  }, [paymentResult]);

  // Surface errors as toasts
  useEffect(() => { if (subError) toast.error(subError); }, [subError]);
  useEffect(() => { if (payError) toast.error(payError); }, [payError]);

  const hasExisting = !!status;
  const isLoading = subLoading || payLoading;
  const selected = subPlans.find((p) => p.id === selectedPlan);

  const handleConfirm = async () => {
    // Guard — if either is missing the button should already be disabled,
    // but this is a safety net and also helps debug
    if (!selectedPlan) {
      toast.error("Please select a plan first.");
      return;
    }
    if (!pharmacyId) {
      toast.error("Pharmacy ID not found. Please log out and back in.");
      console.error("pharmacyId is missing. user object:", user);
      return;
    }

    const planEnum = PLAN_ENUM[selectedPlan];

    try {
      // Step 1 — persist subscription on the backend (create or renew)
      if (hasExisting) {
        await renew(pharmacyId, planEnum);
      } else {
        await create(pharmacyId, planEnum);
      }

      // Step 2 — initiate Paymob payment
      // PaymentType.Subscription = 1  ← adjust this integer if your enum order differs
      // BillingData fields default to "NA" on the backend so only fill what you have
      await initiate({
        type: 1,                          // PaymentType enum value for Subscription
        subscriptionId: null,             // backend links via pharmacyId from JWT, not needed here
        orderId: null,
        adId: null,
        amount: PLAN_AMOUNT[selectedPlan],
        currency: "EGP",
        billingData: {
          firstName:      user?.firstName   ?? "NA",
          lastName:       user?.lastName    ?? "NA",
          email:          user?.email       ?? "NA",
          phoneNumber:    user?.phoneNumber ?? user?.phone ?? "NA", // C# field is PhoneNumber
          apartment:      "NA",
          floor:          "NA",
          street:         "NA",
          building:       "NA",
          shippingMethod: "NA",
          postalCode:     "NA",
          city:           "NA",
          country:        "EG",
          state:          "NA",
        },
      });

      toast.success("Subscription saved! Complete payment in the window to activate.");
    } catch {
      // Errors are already set in the hooks and toasted via useEffects above
    }
  };

  const handleCloseIframe = () => {
    setShowIframe(false);
    resetPayment();
    // Re-fetch so the UI reflects whatever the payment callback updated
    if (pharmacyId) fetchStatus(pharmacyId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      {/* Current subscription info — hidden when there's no subscription yet */}
      <CurrentSubscriptionCard status={status} />

      {/* Plan picker */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e8f2e0] p-6 mb-5">
        <h2 className="text-base font-bold text-[#2d4a2d] pb-3 border-b-2 border-[#f0f5f0] mb-5 flex items-center gap-2">
          {hasExisting ? "Renew / Change Plan" : "Choose a Plan"}
          <span className="text-xs font-medium text-[#9DC873] bg-[#f0f7e8] px-3 py-0.5 rounded-full">
            {hasExisting ? "Renew your subscription" : "Get started"}
          </span>
        </h2>
        <div className="flex gap-5 items-stretch">
          {subPlans.map((item) => (
            <PlanCard
              key={item.id}
              item={item}
              selectedId={selectedPlan}
              onSelect={setSelectedPlan}
            />
          ))}
        </div>
      </div>

      {/* Summary + confirm button */}
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
          disabled={!selectedPlan || isLoading}
          onClick={handleConfirm}
          className={`px-7 py-3 rounded-xl text-white text-sm font-bold transition-all flex items-center gap-2
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

      {/* Paymob payment iframe modal */}
      {showIframe && paymentResult?.iframeUrl && (
        <PaymentIframeModal
          iframeUrl={paymentResult.iframeUrl}
          onClose={handleCloseIframe}
        />
      )}
    </div>
  );
}