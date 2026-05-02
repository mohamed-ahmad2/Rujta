// src/features/dashboard/components/Toast.jsx
import React, { useEffect } from "react";

const TOAST_CONFIG = {
  success: {
    bg: "from-green-50 to-emerald-50",
    border: "border-green-200",
    bar: "bg-green-400",
    iconBg: "bg-green-100",
    icon: "✅",
    titleColor: "text-green-800",
    bodyColor: "text-green-700",
    progressBg: "bg-green-100",
    progressBar: "bg-green-400",
    btnBg: "bg-green-500 hover:bg-green-600",
    defaultTitle: "Success!",
    defaultBtn: "Great! 🎉",
  },
  error: {
    bg: "from-red-50 to-rose-50",
    border: "border-red-200",
    bar: "bg-red-400",
    iconBg: "bg-red-100",
    icon: "⚠️",
    titleColor: "text-red-800",
    bodyColor: "text-red-700",
    progressBg: "bg-red-100",
    progressBar: "bg-red-400",
    btnBg: "bg-red-500 hover:bg-red-600",
    defaultTitle: "Something went wrong",
    defaultBtn: "Close",
  },
  warning: {
    bg: "from-amber-50 to-yellow-50",
    border: "border-amber-200",
    bar: "bg-amber-400",
    iconBg: "bg-amber-100",
    icon: "⚡",
    titleColor: "text-amber-800",
    bodyColor: "text-amber-700",
    progressBg: "bg-amber-100",
    progressBar: "bg-amber-400",
    btnBg: "bg-amber-500 hover:bg-amber-600",
    defaultTitle: "Heads up!",
    defaultBtn: "Got it",
  },
  info: {
    bg: "from-sky-50 to-blue-50",
    border: "border-sky-200",
    bar: "bg-sky-400",
    iconBg: "bg-sky-100",
    icon: "ℹ️",
    titleColor: "text-sky-800",
    bodyColor: "text-sky-700",
    progressBg: "bg-sky-100",
    progressBar: "bg-sky-400",
    btnBg: "bg-sky-500 hover:bg-sky-600",
    defaultTitle: "Info",
    defaultBtn: "OK",
  },
};

const Toast = ({ toast, onClose, autoCloseMs = 4000 }) => {
  const cfg = toast ? TOAST_CONFIG[toast.type] || TOAST_CONFIG.info : null;

  useEffect(() => {
    if (!toast) return;
    if (toast.type === "success" && autoCloseMs > 0) {
      const timer = setTimeout(() => onClose?.(), autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [toast, autoCloseMs, onClose]);

  useEffect(() => {
    if (!toast) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toast, onClose]);

  if (!toast || !cfg) return null;

  const title = toast.title || cfg.defaultTitle;
  const btnLabel = toast.btnLabel || cfg.defaultBtn;
  const icon = toast.icon || cfg.icon;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[99999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="toast-title"
    >
      {/* ✅ Subtle backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        style={{ animation: "fadeIn 0.25s ease-out" }}
        onClick={onClose}
      />

      <div
        className={`pointer-events-auto relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border bg-gradient-to-br shadow-2xl ${cfg.bg} ${cfg.border}`}
        style={{
          animation: "fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Top color bar */}
        <div className={`h-1.5 w-full ${cfg.bar}`} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl ${cfg.iconBg}`}
              style={{ animation: "iconPop 0.5s ease-out" }}
            >
              {icon}
            </div>

            <div className="flex-1 pt-1">
              <h3
                id="toast-title"
                className={`text-lg font-bold ${cfg.titleColor}`}
              >
                {title}
              </h3>
              <p className={`mt-1 text-sm leading-relaxed ${cfg.bodyColor}`}>
                {toast.message}
              </p>

              {/* Optional details list (e.g. validation errors) */}
              {Array.isArray(toast.details) && toast.details.length > 0 && (
                <ul className={`mt-3 space-y-1 text-xs ${cfg.bodyColor}`}>
                  {toast.details.map((d, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-xl leading-none text-gray-400 transition hover:text-gray-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {toast.type === "success" && autoCloseMs > 0 && (
            <div
              className={`mt-4 h-1 w-full overflow-hidden rounded-full ${cfg.progressBg}`}
            >
              <div
                className={`h-full rounded-full ${cfg.progressBar}`}
                style={{
                  animation: `shrink ${autoCloseMs}ms linear forwards`,
                }}
              />
            </div>
          )}

          <div className="mt-5 flex justify-end gap-2">
            {toast.secondaryAction && (
              <button
                onClick={() => {
                  toast.secondaryAction.onClick?.();
                  onClose?.();
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                {toast.secondaryAction.label}
              </button>
            )}
            <button
              onClick={onClose}
              className={`rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-105 active:scale-95 ${cfg.btnBg}`}
            >
              {btnLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.85) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes iconPop {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
