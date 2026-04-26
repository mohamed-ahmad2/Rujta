// src/features/pharmacies/components/checkout/PaymentIframeModal.jsx
import React from "react";

const PaymentIframeModal = ({ iframeUrl, onClose }) => (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-60">
    <div className="relative mx-4 flex h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-lg">💳</span>
          <span className="font-semibold text-gray-800">Secure Payment</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            Powered by Paymob
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition text-xl font-light leading-none"
          aria-label="Close payment"
        >
          ✕
        </button>
      </div>

      {/* Iframe */}
      <iframe
        src={iframeUrl}
        title="Paymob Payment"
        className="flex-1 w-full border-0"
        allow="payment"
      />
    </div>
  </div>
);

export default PaymentIframeModal;
