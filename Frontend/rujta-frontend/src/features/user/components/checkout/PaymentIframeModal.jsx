import React, { useEffect, useRef, useState } from "react";

const PaymentIframeModal = ({ iframeUrl, onClose, onPaymentSuccess, onPaymentFailed }) => {
  const iframeRef = useRef(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Method 1: postMessage from iframe
    const handleMessage = (e) => {
      try {
        const url = new URL(typeof e.data === "string" ? e.data : e.data?.url || "");
        const success = url.searchParams.get("success");
        if (success === "true")  { onPaymentSuccess?.(); }
        if (success === "false") { onPaymentFailed?.();  }
      } catch { /* not a URL */ }
    };

    // Method 2: poll iframe location (same-origin only, but catches redirect)
    const interval = setInterval(() => {
      try {
        const loc = iframeRef.current?.contentWindow?.location?.href;
        if (!loc) return;
        const url = new URL(loc);
        const success = url.searchParams.get("success");
        if (success === "true")  { clearInterval(interval); onPaymentSuccess?.(); }
        if (success === "false") { clearInterval(interval); onPaymentFailed?.();  }
      } catch { /* cross-origin — ignore */ }
    }, 800);

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(interval);
    };
  }, [onPaymentSuccess, onPaymentFailed]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-60">
      <div className="relative mx-4 flex h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">💳</span>
            <span className="font-semibold text-gray-800">Secure Payment</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Powered by Paymob</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition text-xl font-light leading-none" aria-label="Close payment">✕</button>
        </div>
        <iframe ref={iframeRef} src={iframeUrl} title="Paymob Payment" className="flex-1 w-full border-0" allow="payment" />
      </div>
    </div>
  );
};

export default PaymentIframeModal;