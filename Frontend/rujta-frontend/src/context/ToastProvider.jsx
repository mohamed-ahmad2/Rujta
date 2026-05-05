// src/context/ToastProvider.jsx
import React, { useState, useCallback } from "react";
import { ToastContext } from "./ToastContext";

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ title, message }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, title, message, visible: true }]);

    // auto dismiss after 4s
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
      );
      // remove from DOM after animation
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 400);
    }, 4000);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — fixed top right */}
      <div style={{
        position: "fixed", top: 20, right: 20,
        display: "flex", flexDirection: "column", gap: 10,
        zIndex: 9999, pointerEvents: "none",
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            pointerEvents: "all",
            background: "#fff",
            border: "1.5px solid #E5E7EB",
            borderLeft: "4px solid #9DC873",
            borderRadius: 12,
            padding: "14px 16px",
            minWidth: 300, maxWidth: 360,
            display: "flex", gap: 12, alignItems: "flex-start",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            position: "relative", overflow: "hidden",
            transform: t.visible ? "translateX(0)" : "translateX(120%)",
            opacity: t.visible ? 1 : 0,
            transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease",
          }}>
            {/* Icon */}
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "#EAF3DE", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <BellIcon />
            </div>

            {/* Body */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 3 }}>
                {t.title}
              </p>
              <p style={{
                fontSize: 12, color: "#6B7280", lineHeight: 1.45,
                display: "-webkit-box", WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {t.message}
              </p>
            </div>

            {/* Close */}
            <button onClick={() => dismiss(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#6B7280", fontSize: 16, lineHeight: 1,
              padding: 0, flexShrink: 0, marginTop: -2,
            }}>✕</button>

            {/* Progress bar */}
            <div style={{
              position: "absolute", bottom: 0, left: 0,
              height: 3, background: "#9DC873", borderRadius: "0 0 0 8px",
              animation: "toastProgress 4s linear forwards",
            }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3C623C" strokeWidth="2.5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}