// src/features/pharmacies/components/checkout/PaymentModal.jsx
import React from "react";

const PAYMENT_OPTIONS = [
  {
    value: "Cash",
    label: "💵 Cash on Delivery",
    desc: "Pay when your order arrives",
  },
  {
    value: "Online",
    label: "💳 Online Payment",
    desc: "Visa / Mastercard via Paymob",
  },
];

const PaymentModal = ({
  paymentMethod,
  setPaymentMethod,
  creatingOrder,
  initiatingPayment, // ← new: true while calling Paymob initiate
  onConfirm,
  onClose,
}) => {
  const isLoading = creatingOrder || initiatingPayment;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
      <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-1 text-xl font-semibold">Select Payment Method</h2>
        <p className="mb-4 text-sm text-gray-500">
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

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-secondary px-5 py-2 font-medium text-white hover:bg-secondary-dark disabled:opacity-50"
          >
            {initiatingPayment
              ? "Opening Payment..."
              : creatingOrder
              ? "Processing..."
              : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
