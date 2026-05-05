import React from "react";

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const isSuccess = toast.type === "success";

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] flex items-center justify-center">
      <div
        className={`pointer-events-auto mx-4 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ${
          isSuccess
            ? "border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
            : "border border-red-200 bg-gradient-to-br from-red-50 to-rose-50"
        }`}
        style={{ animation: "fadeInScale 0.3s ease-out" }}
      >
        <div
          className={`h-1.5 w-full ${isSuccess ? "bg-green-400" : "bg-red-400"}`}
        />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl ${isSuccess ? "bg-green-100" : "bg-red-100"}`}
            >
              {isSuccess ? "✅" : "❌"}
            </div>

            <div className="flex-1">
              <h3
                className={`text-lg font-bold ${isSuccess ? "text-green-800" : "text-red-800"}`}
              >
                {isSuccess
                  ? "Order Placed Successfully!"
                  : "Something went wrong"}
              </h3>
              <p
                className={`mt-1 text-sm ${isSuccess ? "text-green-700" : "text-red-700"}`}
              >
                {toast.message}
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-xl leading-none text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {isSuccess && (
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-green-100">
              <div
                className="h-full rounded-full bg-green-400"
                style={{ animation: "shrink 3s linear forwards" }}
              />
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className={`rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 ${
                isSuccess
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isSuccess ? "Great! 🎉" : "Close"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
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
