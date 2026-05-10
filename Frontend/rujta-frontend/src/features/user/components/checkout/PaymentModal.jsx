// src/features/pharmacies/components/checkout/PaymentModal.jsx
import React, { useState } from "react";

const PAYMENT_OPTIONS = [
  {
    value: "Cash",
    label: "💵 Cash on Delivery",
    desc: "Pay when your order arrives — PaymentStatus updates to Paid on delivery",
  },
  {
    value: "Online",
    label: "💳 Online Payment",
    desc: "Visa / Mastercard via Paymob — Pay now, order confirmed immediately",
  },
];

/**
 * PaymentModal
 *
 * Step 1: choose Cash or Online
 * Step 2 (Online only): collect billing data required by Paymob
 *
 * Props:
 *  paymentMethod        string         "Cash" | "Online"
 *  setPaymentMethod     fn(string)
 *  creatingOrder        bool
 *  initiatingPayment    bool
 *  onConfirm            fn(billingData | null)   — billingData is null for Cash
 *  onClose              fn()
 */
const PaymentModal = ({
  paymentMethod,
  setPaymentMethod,
  creatingOrder,
  initiatingPayment,
  onConfirm,
  onClose,
}) => {
  const isLoading = creatingOrder || initiatingPayment;

  // ── Billing form state (only needed for Online) ──────────────────────────
  const [step, setStep] = useState(1); // 1 = choose method, 2 = billing form
  const [billing, setBilling] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    apartment: "NA",
    floor: "NA",
    street: "",
    building: "NA",
    shippingMethod: "PKG",
    postalCode: "NA",
    city: "",
    country: "EG",
    state: "NA",
  });
  const [billingErrors, setBillingErrors] = useState({});

  const updateBilling = (k, v) => setBilling((b) => ({ ...b, [k]: v }));

  const validateBilling = () => {
    const errs = {};
    if (!billing.firstName.trim()) errs.firstName = "Required";
    if (!billing.lastName.trim()) errs.lastName = "Required";
    if (!billing.email.trim()) errs.email = "Required";
    if (!billing.phoneNumber.trim()) errs.phoneNumber = "Required";
    if (!billing.street.trim()) errs.street = "Required";
    if (!billing.city.trim()) errs.city = "Required";
    setBillingErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (paymentMethod === "Online") {
      setStep(2);
    } else {
      // Cash — no billing needed
      onConfirm(null);
    }
  };

  const handleBillingConfirm = () => {
    if (!validateBilling()) return;
    onConfirm(billing);
  };

  const inputCls = (field) =>
    `w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 ${
      billingErrors[field]
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-gray-50"
    }`;

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 — Choose method
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
        <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <h2 className="mb-1 text-xl font-semibold text-gray-800">
            Select Payment Method
          </h2>
          <p className="mb-5 text-sm text-gray-500">
            Choose how you'd like to pay for your order.
          </p>

          <div className="flex flex-col gap-3">
            {PAYMENT_OPTIONS.map(({ value, label, desc }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                  paymentMethod === value
                    ? "border-secondary bg-secondary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  value={value}
                  checked={paymentMethod === value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-secondary"
                  disabled={isLoading}
                />
                <div>
                  <p className="font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Info banner for Online */}
          {paymentMethod === "Online" && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
              💡 Your order is created <strong>after</strong> payment is
              confirmed. If payment fails, no order is created and no charge is
              applied.
            </div>
          )}

          {/* Info banner for Cash */}
          {paymentMethod === "Cash" && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-700">
              💡 Your order is created immediately. Payment is collected when
              the delivery arrives.
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="rounded-lg bg-secondary px-5 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {isLoading
                ? "Processing..."
                : paymentMethod === "Online"
                  ? "Continue →"
                  : "Place Order →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2 — Billing data (Online only)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
      <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <button
            onClick={() => setStep(1)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Billing Details
            </h2>
            <p className="text-xs text-gray-400">
              Required for Paymob secure payment
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                value={billing.firstName}
                onChange={(e) => updateBilling("firstName", e.target.value)}
                placeholder="Ahmed"
                className={inputCls("firstName")}
              />
              {billingErrors.firstName && (
                <p className="mt-0.5 text-[11px] text-red-500">
                  {billingErrors.firstName}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                value={billing.lastName}
                onChange={(e) => updateBilling("lastName", e.target.value)}
                placeholder="Mohamed"
                className={inputCls("lastName")}
              />
              {billingErrors.lastName && (
                <p className="mt-0.5 text-[11px] text-red-500">
                  {billingErrors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={billing.email}
              onChange={(e) => updateBilling("email", e.target.value)}
              placeholder="ahmed@example.com"
              className={inputCls("email")}
            />
            {billingErrors.email && (
              <p className="mt-0.5 text-[11px] text-red-500">
                {billingErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              value={billing.phoneNumber}
              onChange={(e) => updateBilling("phoneNumber", e.target.value)}
              placeholder="+201XXXXXXXXX"
              className={inputCls("phoneNumber")}
            />
            {billingErrors.phoneNumber && (
              <p className="mt-0.5 text-[11px] text-red-500">
                {billingErrors.phoneNumber}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Street <span className="text-red-500">*</span>
              </label>
              <input
                value={billing.street}
                onChange={(e) => updateBilling("street", e.target.value)}
                placeholder="Tahrir St."
                className={inputCls("street")}
              />
              {billingErrors.street && (
                <p className="mt-0.5 text-[11px] text-red-500">
                  {billingErrors.street}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                City <span className="text-red-500">*</span>
              </label>
              <input
                value={billing.city}
                onChange={(e) => updateBilling("city", e.target.value)}
                placeholder="Cairo"
                className={inputCls("city")}
              />
              {billingErrors.city && (
                <p className="mt-0.5 text-[11px] text-red-500">
                  {billingErrors.city}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          🔒 Your payment is processed securely by Paymob. We never store your
          card details.
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleBillingConfirm}
            disabled={isLoading}
            className="rounded-lg bg-secondary px-5 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {initiatingPayment
              ? "Opening Payment Gateway..."
              : creatingOrder
                ? "Processing..."
                : "Pay Now 🔒"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
