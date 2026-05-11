import React, { useState, useMemo, useEffect, useCallback } from "react";
import useDrugRequest from "../../drugRequests/hook/useDrugRequest";
import { useAdminNotifications } from "../../dashboard/notifications/hook/useAdminNotifications";

const badgeStyles = {
  antibiotic: { background: "#e8f5e0", color: "#3a7d1c" },
  antidiabetic: { background: "#e3f2fd", color: "#1565c0" },
  ace: { background: "#fff3e0", color: "#e65100" },
  statin: { background: "#f3e5f5", color: "#6a1b9a" },
  general: { background: "#f5f5f5", color: "#555" },
};

const getCategoryClass = (category = "") => {
  const c = category.toLowerCase();
  if (c.includes("antibiotic")) return "antibiotic";
  if (c.includes("diabet")) return "antidiabetic";
  if (c.includes("ace") || c.includes("calcium") || c.includes("hypert"))
    return "ace";
  if (c.includes("statin") || c.includes("lipid")) return "statin";
  return "general";
};

const PER_PAGE = 4;

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors =
    type === "success"
      ? {
          bg: "#f0fdf4",
          border: "#86efac",
          icon: "✓",
          iconBg: "#22c55e",
          text: "#166534",
        }
      : type === "error"
        ? {
            bg: "#fef2f2",
            border: "#fca5a5",
            icon: "!",
            iconBg: "#ef4444",
            text: "#991b1b",
          }
        : {
            bg: "#fffbeb",
            border: "#fcd34d",
            icon: "⚠",
            iconBg: "#f59e0b",
            text: "#92400e",
          };

  return (
    <div
      className="toast-wrapper"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "16px",
        left: "16px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "10px",
        padding: "12px 16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        animation: "slideIn 0.3s ease",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <style>{`
        @keyframes slideIn { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }
        @media (min-width: 640px) {
          .toast-wrapper { left: auto !important; right: 24px !important; max-width: 320px !important; }
        }
      `}</style>
      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: colors.iconBg,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {colors.icon}
      </div>
      <span style={{ fontSize: "13px", color: colors.text, fontWeight: 500, flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: colors.text,
          fontSize: "16px",
          lineHeight: 1,
          marginLeft: "4px",
          opacity: 0.6,
        }}
      >
        ×
      </button>
    </div>
  );
}

function NotificationsPanel({ notifications, onClose }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "48px",
        right: "0",
        zIndex: 100,
        background: "#fff",
        border: "0.5px solid #e0e0d8",
        borderRadius: "10px",
        width: "300px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "0.5px solid #f0f0e8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a" }}>
          Notifications
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#aaa",
            fontSize: "18px",
          }}
        >
          ×
        </button>
      </div>
      {notifications.length === 0 ? (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: "#bbb",
            fontSize: "12px",
          }}
        >
          No notifications yet
        </div>
      ) : (
        notifications.map((n, i) => (
          <div
            key={n.id ?? `notif-${i}`}
            style={{
              padding: "12px 16px",
              borderBottom:
                i < notifications.length - 1 ? "0.5px solid #f0f0e8" : "none",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: n.type === "success" ? "#22c55e" : "#ef4444",
                marginTop: "4px",
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: "12px", color: "#333", fontWeight: 500 }}>
                {n.message}
              </div>
              <div
                style={{ fontSize: "10px", color: "#bbb", marginTop: "2px" }}
              >
                {n.time}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function RejectModal({ drug, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          width: "400px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <div
              style={{ fontSize: "16px", fontWeight: 700, color: "#c62828" }}
            >
              Reject Request
            </div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
              Provide a reason for rejecting "{drug?.drugName}"
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "#aaa",
            }}
          >
            ×
          </button>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe the reason for rejection..."
          style={{
            width: "100%",
            border: "1px solid #e0e0d8",
            borderRadius: "8px",
            padding: "10px",
            fontSize: "12px",
            height: "100px",
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              border: "1px solid #e0e0d8",
              borderRadius: "8px",
              fontSize: "12px",
              cursor: "pointer",
              background: "#fff",
              color: "#555",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            style={{
              padding: "8px 16px",
              background: reason.trim() && !loading ? "#e53935" : "#ffcdd2",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#fff",
              fontWeight: 600,
              cursor: reason.trim() && !loading ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {loading && (
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTop: "2px solid #fff",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            )}
            {loading ? "Rejecting..." : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalQueue() {
  const { requests, loading, error, fetchAll, review } = useDrugRequest();

  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyText, setEmergencyText] = useState("");

  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const showToast = useCallback(
    (message, type = "success") => setToast({ message, type }),
    [],
  );

  const addNotification = useCallback((message, type) => {
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setNotifications((prev) => [
      { id: `${Date.now()}-${Math.random()}`, message, type, time },
      ...prev,
    ]);
  }, []);

  const handleNewDrugRequest = useCallback(
    (data) => {
      triggerRefresh();
      showToast(
        `💊 New request: "${data.drugName}" from Pharmacy #${data.pharmacyId}`,
        "success",
      );
      addNotification(
        `New drug request: "${data.drugName}" from Pharmacy #${data.pharmacyId}`,
        "success",
      );
    },
    [triggerRefresh, showToast, addNotification],
  );

  const handleDrugRequestReviewed = useCallback(
    (data) => {
      console.log("✅ Review complete, refreshing queue:", data);
      triggerRefresh();
      setSelected(null);
    },
    [triggerRefresh],
  );

  useAdminNotifications({
    onNewDrugRequest: handleNewDrugRequest,
    onDrugRequestReviewed: handleDrugRequestReviewed,
  });

  useEffect(() => {
    fetchAll("Pending");
  }, [fetchAll, refreshKey]);

  const filtered = useMemo(() => {
    if (!searchQ.trim()) return requests;
    const q = searchQ.toLowerCase();
    return requests.filter(
      (r) =>
        r.drugName?.toLowerCase().includes(q) ||
        r.manufacturer?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.pharmacyId?.toString().includes(q),
    );
  }, [requests, searchQ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const d = selected !== null ? requests.find((r) => r.id === selected) : null;

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleRowClick = (id) => setSelected(id);
  const handleClose = () => setSelected(null);

  const handleApprove = async () => {
    if (!d) return;
    setApproving(true);
    setSelected(null);
    try {
      await review(d.id, true);
      triggerRefresh();
      showToast(
        `✅ "${d.drugName}" approved and added to database!`,
        "success",
      );
      addNotification(
        `"${d.drugName}" approved and added to database`,
        "success",
      );
    } catch {
      showToast("Failed to approve request. Please try again.", "error");
      triggerRefresh();
    } finally {
      setApproving(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!d) return;
    setRejecting(true);
    setSelected(null);
    setShowRejectModal(false);
    try {
      await review(d.id, false, reason);
      triggerRefresh();
      showToast(`❌ "${d.drugName}" has been rejected.`, "error");
      addNotification(`"${d.drugName}" rejected`, "error");
    } catch {
      showToast("Failed to reject request. Please try again.", "error");
      triggerRefresh();
    } finally {
      setRejecting(false);
    }
  };

  const handleEmergencySubmit = () => {
    if (!emergencyText.trim()) return;
    showToast("⚠️ Emergency override submitted for review", "warning");
    addNotification("Emergency override request submitted", "warning");
    setEmergencyText("");
    setShowEmergency(false);
  };

  const handleSearchChange = (e) => {
    setSearchQ(e.target.value);
    setPage(1);
    setSelected(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "620px",
        background: "#f5f5f0",
        borderRadius: "12px",
        overflow: "hidden",
        border: "0.5px solid #e0e0d8",
        fontFamily: "-apple-system,'Helvetica Neue',sans-serif",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(60px); opacity: 0 }
          to   { transform: translateX(0);    opacity: 1 }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* ── Topbar ── */}
      <div
        style={{
          background: "#fff",
          borderBottom: "0.5px solid #e0e0d8",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Search */}
        <div
          style={{
            flex: 1,
            background: "#f5f5f0",
            border: "0.5px solid #e0e0d8",
            borderRadius: "8px",
            padding: "7px 12px",
            fontSize: "12px",
            color: "#999",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#bbb" strokeWidth="1.5" />
            <path
              d="M11 11l3 3"
              stroke="#bbb"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            value={searchQ}
            onChange={handleSearchChange}
            placeholder="Search requests..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "12px",
              color: "#333",
              width: "100%",
            }}
          />
          {searchQ && (
            <button
              onClick={() => {
                setSearchQ("");
                setPage(1);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#bbb",
                fontSize: "14px",
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            position: "relative",
          }}
        >
          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotif((v) => !v)}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                border: "0.5px solid #e0e0d8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2a5 5 0 00-5 5v3l-1 1v1h12v-1l-1-1V7a5 5 0 00-5-5z"
                  stroke="#666"
                  strokeWidth="1.2"
                />
                <path
                  d="M6.5 13.5a1.5 1.5 0 003 0"
                  stroke="#666"
                  strokeWidth="1.2"
                />
              </svg>
              {notifications.length > 0 && (
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#e53935",
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                  }}
                />
              )}
            </button>
            {showNotif && (
              <NotificationsPanel
                notifications={notifications}
                onClose={() => setShowNotif(false)}
              />
            )}
          </div>

          

          
          
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Queue Panel */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: "4px",
            }}
          >
            Approval Queue
          </div>
          <div
            style={{ fontSize: "12px", color: "#888", marginBottom: "18px" }}
          >
            Review and approve new medication requests to add them to the
            central database.
            {searchQ && (
              <span style={{ color: "#4caf50", marginLeft: "8px" }}>
                Showing results for "{searchQ}"
              </span>
            )}
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              border: "0.5px solid #e0e0d8",
              overflow: "hidden",
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.5fr 1.3fr 1.3fr 1fr",
                padding: "10px 16px",
                background: "#fafaf7",
                borderBottom: "0.5px solid #e0e0d8",
              }}
            >
              {[
                "Drug Name",
                "Manufacturer",
                "Category",
                "Submitted By",
                "Date",
              ].map((h) => (
                <div
                  key={h}
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#999",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </div>
              ))}
            </div>

            {loading ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#bbb",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #e0e0d8",
                    borderTop: "2px solid #4caf50",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Loading requests...
              </div>
            ) : error ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#e53935",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            ) : pageData.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#bbb",
                  fontSize: "13px",
                }}
              >
                {searchQ
                  ? `No results found for "${searchQ}"`
                  : "No pending requests."}
              </div>
            ) : (
              pageData.map((req, i) => (
                <div
                  key={req.id}
                  onClick={() => handleRowClick(req.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.5fr 1.3fr 1.3fr 1fr",
                    padding: "14px 16px",
                    borderBottom:
                      i < pageData.length - 1 ? "0.5px solid #f0f0e8" : "none",
                    cursor: "pointer",
                    alignItems: "center",
                    background: selected === req.id ? "#f0f8e8" : "transparent",
                    transition: "background 0.12s",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#1a1a1a",
                      }}
                    >
                      {req.drugName}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#bbb",
                        marginTop: "2px",
                      }}
                    >
                      ID: {req.id}
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#555" }}>
                    {req.manufacturer}
                  </div>
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        ...badgeStyles[getCategoryClass(req.category)],
                      }}
                    >
                      {req.category}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#555" }}>
                    Pharmacy #{req.pharmacyId}
                  </div>
                  <div style={{ fontSize: "11px", color: "#aaa" }}>
                    {req.createdAt}
                  </div>
                </div>
              ))
            )}

            {/* Pagination */}
            <div
              style={{
                padding: "10px 16px",
                background: "#fafaf7",
                borderTop: "0.5px solid #e0e0d8",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#aaa",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Showing {pageData.length} of {filtered.length}{" "}
                {searchQ ? "results" : "pending requests"}
              </div>
              <div
                style={{ display: "flex", gap: "4px", alignItems: "center" }}
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "0.5px solid #e0e0d8",
                    borderRadius: "4px",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: page === 1 ? "default" : "pointer",
                    fontSize: "12px",
                    color: page === 1 ? "#ddd" : "#666",
                    opacity: page === 1 ? 0.5 : 1,
                  }}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={`page-${i + 1}`}
                    onClick={() => setPage(i + 1)}
                    style={{
                      width: "22px",
                      height: "22px",
                      border: "0.5px solid #e0e0d8",
                      borderRadius: "4px",
                      background: page === i + 1 ? "#4caf50" : "#fff",
                      color: page === i + 1 ? "#fff" : "#666",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontWeight: page === i + 1 ? 600 : 400,
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "0.5px solid #e0e0d8",
                    borderRadius: "4px",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: page === totalPages ? "default" : "pointer",
                    fontSize: "12px",
                    color: page === totalPages ? "#ddd" : "#666",
                    opacity: page === totalPages ? 0.5 : 1,
                  }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        {d && (
          <div
            style={{
              width: "320px",
              background: "#fff",
              borderLeft: "0.5px solid #e0e0d8",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "0.5px solid #e0e0d8",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#1a1a1a",
                }}
              >
                Request Details
              </div>
              <button
                onClick={handleClose}
                style={{
                  width: "22px",
                  height: "22px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#aaa",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                margin: "12px 12px 0",
                borderRadius: "8px",
                overflow: "hidden",
                height: "120px",
                background: "linear-gradient(135deg,#d4c4b0,#b8a090)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5,1fr)",
                    gap: "6px",
                    padding: "16px",
                  }}
                >
                  {Array.from({ length: 15 }, (_, i) => (
                    <div
                      key={`pill-${i}`}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#c8956a",
                        boxShadow: "inset -3px -3px 6px rgba(0,0,0,0.2)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
              <div
                style={{
                  fontSize: "10px",
                  color: "#aaa",
                  letterSpacing: "0.5px",
                  marginBottom: "3px",
                }}
              >
                Drug Name
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  marginBottom: "14px",
                }}
              >
                {d.drugName}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <div style={{ fontSize: "10px", color: "#aaa" }}>
                    Manufacturer
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      marginTop: "2px",
                    }}
                  >
                    {d.manufacturer}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#aaa" }}>
                    Category
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      marginTop: "2px",
                    }}
                  >
                    {d.category}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#aaa" }}>
                    Price / Unit
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      marginTop: "2px",
                    }}
                  >
                    {d.price}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#aaa" }}>
                    Quantity
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      marginTop: "2px",
                    }}
                  >
                    {d.quantity}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#aaa" }}>
                    Expiry Date
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      marginTop: "2px",
                    }}
                  >
                    {d.expiryDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#aaa" }}>
                    Submitted
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      marginTop: "2px",
                    }}
                  >
                    {d.createdAt}
                  </div>
                </div>
              </div>

              {d.raw?.description && (
                <div
                  style={{
                    background: "#f8fbf4",
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#aaa",
                      letterSpacing: "0.5px",
                      marginBottom: "6px",
                    }}
                  >
                    Notes / Description
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#555",
                      lineHeight: 1.6,
                      fontStyle: "italic",
                    }}
                  >
                    "{d.raw.description}"
                  </div>
                </div>
              )}

              {d.raw?.supplier && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "10px", color: "#aaa" }}>
                    Supplier
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      marginTop: "2px",
                    }}
                  >
                    {d.raw.supplier}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                padding: "12px 16px",
                borderTop: "0.5px solid #e0e0d8",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <button
                onClick={handleApprove}
                disabled={approving || rejecting}
                style={{
                  width: "100%",
                  padding: "11px",
                  background: approving ? "#a5d6a7" : "#4caf50",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: approving ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background 0.2s",
                  opacity: approving || rejecting ? 0.5 : 1,
                }}
              >
                {approving ? (
                  <>
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTop: "2px solid #fff",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Approving...
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                      }}
                    >
                      ✓
                    </div>
                    Approve & Add to Database
                  </>
                )}
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={approving || rejecting}
                style={{
                  width: "100%",
                  padding: "11px",
                  background: "#fff",
                  border: "1.5px solid #e53935",
                  borderRadius: "8px",
                  color: "#e53935",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: approving || rejecting ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  opacity: approving || rejecting ? 0.5 : 1,
                }}
              >
                <span>✕</span> Reject Request
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Emergency Modal ── */}
      {showEmergency && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "400px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#c62828",
                  }}
                >
                  Emergency Override
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#aaa",
                    marginTop: "2px",
                  }}
                >
                  This will be logged and reviewed by management
                </div>
              </div>
              <button
                onClick={() => setShowEmergency(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#aaa",
                }}
              >
                ×
              </button>
            </div>
            <textarea
              value={emergencyText}
              onChange={(e) => setEmergencyText(e.target.value)}
              placeholder="Describe the emergency reason for override..."
              style={{
                width: "100%",
                border: "1px solid #e0e0d8",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "12px",
                height: "100px",
                resize: "none",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowEmergency(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #e0e0d8",
                  borderRadius: "8px",
                  fontSize: "12px",
                  cursor: "pointer",
                  background: "#fff",
                  color: "#555",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencySubmit}
                disabled={!emergencyText.trim()}
                style={{
                  padding: "8px 16px",
                  background: emergencyText.trim() ? "#e53935" : "#ffcdd2",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: emergencyText.trim() ? "pointer" : "default",
                }}
              >
                Submit Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {showRejectModal && d && (
        <RejectModal
          drug={d}
          onConfirm={handleRejectConfirm}
          onCancel={() => setShowRejectModal(false)}
          loading={rejecting}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showNotif && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => setShowNotif(false)}
        />
      )}
    </div>
  );
}