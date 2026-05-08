import { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    borderColor: "border-l-green-500",
    iconColor: "text-green-500",
    bgDetail: "bg-green-50",
    textDetail: "text-green-700",
    title: "Success",
  },
  error: {
    icon: XCircle,
    borderColor: "border-l-red-500",
    iconColor: "text-red-500",
    bgDetail: "bg-red-50",
    textDetail: "text-red-700",
    title: "Error",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-l-amber-500",
    iconColor: "text-amber-500",
    bgDetail: "bg-amber-50",
    textDetail: "text-amber-700",
    title: "Warning",
  },
};

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, toast.details?.length > 0 ? 7000 : 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const config = TOAST_CONFIG[toast.type] ?? TOAST_CONFIG.error;
  const Icon = config.icon;

  return (
    <div className="animate-slide-in fixed bottom-5 right-5 z-[9999] w-full max-w-sm">
      <div
        className={`relative flex gap-3 rounded-xl border-l-4 bg-white p-4 shadow-xl ring-1 ring-black/5 ${config.borderColor}`}
      >
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-gray-800">{toast.message}</p>

          {/* Subtitle based on type */}
          {toast.type === "warning" && (
            <p className="text-xs text-gray-500">
              Please fill in all required fields before submitting.
            </p>
          )}

          {/* Validation error list from backend */}
          {toast.details && toast.details.length > 0 && (
            <div className={`mt-2 rounded-lg p-3 ${config.bgDetail}`}>
              <p
                className={`mb-1.5 text-xs font-semibold ${config.textDetail}`}
              >
                Please fix the following:
              </p>
              <ul className="space-y-1">
                {toast.details.map((detail, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-1.5 text-xs ${config.textDetail}`}
                  >
                    <span className="mt-0.5 flex-shrink-0">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Toast;
