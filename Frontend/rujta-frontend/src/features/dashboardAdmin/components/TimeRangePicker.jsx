// src/features/dashboardAdmin/components/TimeRangePicker.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useLayoutEffect,
} from "react";

const TEAL = "#9DC873";
const TEAL_DARK = "#7ab355";
const TEAL_LIGHT = "#f3fbef";
const TEAL_DEEP = "#5a8a1f";

const pad = (n) => String(n).padStart(2, "0");

/* ─────────────────────────────────────────────
   PARSING & FORMATTING
───────────────────────────────────────────── */
// Parse "9AM - 11PM" or "09:00 - 23:00" → { from: {h,m}, to: {h,m} }
const parseRange = (text) => {
  if (!text || typeof text !== "string") return null;

  const parts = text.split(/[-–—]/).map((s) => s.trim());
  if (parts.length !== 2) return null;

  const parseSingle = (str) => {
    if (!str) return null;
    const cleaned = str.replace(/\s+/g, "").toUpperCase();

    // Match formats: 9AM, 9:30AM, 09:00, 23:00
    const ampmMatch = cleaned.match(/^(\d{1,2})(?::(\d{1,2}))?(AM|PM)$/);
    if (ampmMatch) {
      let h = parseInt(ampmMatch[1], 10);
      const m = parseInt(ampmMatch[2] || "0", 10);
      const ampm = ampmMatch[3];
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return { h, m };
    }

    const h24Match = cleaned.match(/^(\d{1,2}):(\d{1,2})$/);
    if (h24Match) {
      return { h: parseInt(h24Match[1], 10), m: parseInt(h24Match[2], 10) };
    }

    const hOnly = cleaned.match(/^(\d{1,2})$/);
    if (hOnly) return { h: parseInt(hOnly[1], 10), m: 0 };

    return null;
  };

  const from = parseSingle(parts[0]);
  const to = parseSingle(parts[1]);
  if (!from || !to) return null;
  return { from, to };
};

// Format { h, m } → "9AM" or "9:30AM"
const formatTime = (t) => {
  if (!t) return "";
  let h = t.h % 12;
  if (h === 0) h = 12;
  const ampm = t.h >= 12 ? "PM" : "AM";
  if (t.m === 0) return `${h}${ampm}`;
  return `${h}:${pad(t.m)}${ampm}`;
};

const formatRange = (from, to) =>
  from && to ? `${formatTime(from)} - ${formatTime(to)}` : "";

const ESTIMATED_POPOVER_HEIGHT = 320;
const POPOVER_GAP = 6;

/* ═══════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════ */
const TimeRangePicker = ({
  value,
  onChange,
  hasError = false,
  placeholder = "Select open hours",
}) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const parsed = useMemo(() => parseRange(value), [value]);

  // ✅ default: 9 AM - 11 PM
  const [draftFrom, setDraftFrom] = useState(parsed?.from || { h: 9, m: 0 });
  const [draftTo, setDraftTo] = useState(parsed?.to || { h: 23, m: 0 });

  useEffect(() => {
    if (parsed) {
      setDraftFrom(parsed.from);
      setDraftTo(parsed.to);
    }
  }, [value]);

  // ✅ click outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ✅ ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // ✅ smart positioning
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const calcPosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const shouldOpenUpward =
        spaceBelow < ESTIMATED_POPOVER_HEIGHT + POPOVER_GAP &&
        spaceAbove > spaceBelow;
      setOpenUpward(shouldOpenUpward);
    };
    calcPosition();
    window.addEventListener("scroll", calcPosition, true);
    window.addEventListener("resize", calcPosition);
    return () => {
      window.removeEventListener("scroll", calcPosition, true);
      window.removeEventListener("resize", calcPosition);
    };
  }, [open]);

  /* ──── handlers for hour/minute/ampm ──── */
  const updateField = (which, updater) => {
    if (which === "from") {
      setDraftFrom((prev) => updater(prev));
    } else {
      setDraftTo((prev) => updater(prev));
    }
  };

  const incHour = (which) =>
    updateField(which, (prev) => {
      const display12 = ((prev.h + 11) % 12) + 1;
      const next12 = display12 === 12 ? 1 : display12 + 1;
      const isPM = prev.h >= 12;
      let newH = next12 % 12;
      if (isPM) newH += 12;
      return { ...prev, h: newH };
    });

  const decHour = (which) =>
    updateField(which, (prev) => {
      const display12 = ((prev.h + 11) % 12) + 1;
      const next12 = display12 === 1 ? 12 : display12 - 1;
      const isPM = prev.h >= 12;
      let newH = next12 % 12;
      if (isPM) newH += 12;
      return { ...prev, h: newH };
    });

  const incMin = (which) =>
    updateField(which, (prev) => ({ ...prev, m: (prev.m + 1) % 60 }));

  const decMin = (which) =>
    updateField(which, (prev) => ({ ...prev, m: (prev.m + 59) % 60 }));

  const setQuickMin = (which, m) =>
    updateField(which, (prev) => ({ ...prev, m }));

  const toggleAmPm = (which, ampm) =>
    updateField(which, (prev) => {
      const isPM = prev.h >= 12;
      let newH = prev.h;
      if (ampm === "AM" && isPM) newH = prev.h - 12;
      if (ampm === "PM" && !isPM) newH = prev.h + 12;
      return { ...prev, h: newH };
    });

  /* ──── footer actions ──── */
  const handleApply = () => {
    onChange?.(formatRange(draftFrom, draftTo));
    setOpen(false);
  };

  const handleClear = () => {
    onChange?.("");
    setOpen(false);
  };

  const handleReset = () => {
    setDraftFrom({ h: 9, m: 0 });
    setDraftTo({ h: 23, m: 0 });
  };

  const handle247 = () => {
    setDraftFrom({ h: 0, m: 0 });
    setDraftTo({ h: 23, m: 59 });
  };

  /* ──── popover position ──── */
  const popoverPositionStyle = openUpward
    ? {
        bottom: `calc(100% + ${POPOVER_GAP}px)`,
        top: "auto",
        boxShadow:
          "0 -12px 40px rgba(0,0,0,0.12), 0 -2px 10px rgba(0,0,0,0.06)",
        animationName: "trpFadeInUp",
      }
    : {
        top: `calc(100% + ${POPOVER_GAP}px)`,
        bottom: "auto",
        boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.06)",
        animationName: "trpFadeInDown",
      };

  /* ──── render single time block ──── */
  const renderTimeBlock = (label, draft, which) => {
    const display12 = ((draft.h + 11) % 12) + 1;
    const ampm = draft.h >= 12 ? "PM" : "AM";

    return (
      <div style={styles.block}>
        <div style={styles.blockLabel}>{label}</div>

        <div style={styles.timeControls}>
          {/* Hour */}
          <div style={styles.timeBox}>
            <button
              type="button"
              onClick={() => incHour(which)}
              style={styles.timeArrow}
            >
              ▲
            </button>
            <div style={styles.timeValue}>{pad(display12)}</div>
            <button
              type="button"
              onClick={() => decHour(which)}
              style={styles.timeArrow}
            >
              ▼
            </button>
          </div>

          <div style={styles.timeColon}>:</div>

          {/* Minute */}
          <div style={styles.timeBox}>
            <button
              type="button"
              onClick={() => incMin(which)}
              style={styles.timeArrow}
            >
              ▲
            </button>
            <div style={styles.timeValue}>{pad(draft.m)}</div>
            <button
              type="button"
              onClick={() => decMin(which)}
              style={styles.timeArrow}
            >
              ▼
            </button>
          </div>

          {/* AM/PM */}
          <div style={styles.ampmGroup}>
            <button
              type="button"
              onClick={() => toggleAmPm(which, "AM")}
              style={{
                ...styles.ampmBtn,
                ...(ampm === "AM" ? styles.ampmBtnActive : {}),
              }}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => toggleAmPm(which, "PM")}
              style={{
                ...styles.ampmBtn,
                ...(ampm === "PM" ? styles.ampmBtnActive : {}),
              }}
            >
              PM
            </button>
          </div>
        </div>

        {/* Quick minutes */}
        <div style={styles.quickMinutes}>
          {[0, 15, 30, 45].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setQuickMin(which, m)}
              style={{
                ...styles.quickMinBtn,
                ...(draft.m === m ? styles.quickMinBtnActive : {}),
              }}
            >
              :{pad(m)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const previewText = formatRange(draftFrom, draftTo);
  const hasValue = !!parsed;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          ...styles.trigger,
          ...(open ? styles.triggerOpen : {}),
          ...(hasError ? styles.triggerError : {}),
        }}
      >
        <span style={styles.triggerIcon}>🕐</span>
        <span style={styles.triggerText(hasValue)}>
          {hasValue ? value : placeholder}
        </span>
        <span
          style={{
            ...styles.triggerChevron,
            transform: open
              ? openUpward
                ? "rotate(0deg)"
                : "rotate(180deg)"
              : openUpward
                ? "rotate(180deg)"
                : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>

      {/* Popover */}
      {open && (
        <div
          ref={popoverRef}
          style={{ ...styles.popover, ...popoverPositionStyle }}
        >
          {/* Preview */}
          <div style={styles.preview}>
            <span style={styles.previewLabel}>Preview:</span>
            <span style={styles.previewValue}>{previewText || "—"}</span>
          </div>

          {/* Two time blocks */}
          <div style={styles.blocksRow}>
            {renderTimeBlock("Open", draftFrom, "from")}
            <div style={styles.divider} />
            {renderTimeBlock("Close", draftTo, "to")}
          </div>

          {/* Quick presets */}
          <div style={styles.presets}>
            <button
              type="button"
              onClick={handleReset}
              style={styles.presetBtn}
            >
              9AM - 11PM
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftFrom({ h: 8, m: 0 });
                setDraftTo({ h: 22, m: 0 });
              }}
              style={styles.presetBtn}
            >
              8AM - 10PM
            </button>
            <button type="button" onClick={handle247} style={styles.presetBtn}>
              24/7
            </button>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              type="button"
              onClick={handleClear}
              style={styles.footerBtnGhost}
            >
              Clear
            </button>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={styles.footerBtnSecondary}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              style={styles.footerBtnPrimary}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles = {
  wrap: { position: "relative", width: "100%" },

  trigger: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 12px",
    height: 40,
    background: "#fff",
    cursor: "pointer",
    fontSize: 13,
    color: "#1a202c",
    transition: "border-color .2s, box-shadow .2s",
    fontFamily: "inherit",
    textAlign: "left",
  },
  triggerOpen: {
    borderColor: TEAL,
    boxShadow: `0 0 0 3px ${TEAL_LIGHT}`,
  },
  triggerError: {
    borderColor: "#fc8181",
    boxShadow: "0 0 0 3px rgba(252,129,129,0.12)",
  },
  triggerIcon: { fontSize: 14 },
  triggerText: (hasValue) => ({
    flex: 1,
    color: hasValue ? "#1a202c" : "#9ca3af",
    fontWeight: hasValue ? 500 : 400,
    fontSize: 13,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  triggerChevron: {
    fontSize: 9,
    color: "#9ca3af",
    transition: "transform .2s",
  },

  popover: {
    position: "absolute",
    left: 0,
    width: 360,
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 12,
    zIndex: 500,
    padding: 14,
    animationDuration: "0.2s",
    animationTimingFunction: "ease-out",
    animationFillMode: "both",
  },

  preview: {
    background: TEAL_LIGHT,
    border: `1px solid ${TEAL}`,
    borderRadius: 8,
    padding: "8px 12px",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: TEAL_DEEP,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  previewValue: {
    fontSize: 14,
    fontWeight: 700,
    color: TEAL_DEEP,
    fontVariantNumeric: "tabular-nums",
  },

  blocksRow: {
    display: "flex",
    alignItems: "stretch",
    gap: 8,
    marginBottom: 12,
  },
  divider: {
    width: 1,
    background: "#e2e8f0",
    alignSelf: "stretch",
  },
  block: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  blockLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  timeControls: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  timeBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 1,
  },
  timeArrow: {
    border: "none",
    background: "transparent",
    color: TEAL_DEEP,
    fontSize: 9,
    cursor: "pointer",
    padding: 0,
    width: 36,
    height: 14,
    lineHeight: 1,
  },
  timeValue: {
    width: 36,
    height: 30,
    background: TEAL_LIGHT,
    border: `1.5px solid ${TEAL}`,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    color: TEAL_DEEP,
    fontVariantNumeric: "tabular-nums",
  },
  timeColon: {
    fontSize: 16,
    fontWeight: 700,
    color: TEAL_DEEP,
    margin: "0 1px",
  },

  ampmGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginLeft: 4,
  },
  ampmBtn: {
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#718096",
    borderRadius: 5,
    padding: "2px 6px",
    fontSize: 10,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all .15s",
    fontFamily: "inherit",
    minWidth: 32,
    lineHeight: 1.4,
  },
  ampmBtnActive: {
    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
    color: "#fff",
    borderColor: TEAL_DARK,
  },

  quickMinutes: {
    display: "flex",
    gap: 3,
    width: "100%",
  },
  quickMinBtn: {
    border: "1px solid #e2e8f0",
    background: "#fff",
    borderRadius: 5,
    padding: "3px 4px",
    fontSize: 9,
    fontWeight: 600,
    color: "#718096",
    cursor: "pointer",
    transition: "all .12s",
    fontFamily: "inherit",
    flex: 1,
  },
  quickMinBtnActive: {
    background: TEAL_LIGHT,
    color: TEAL_DEEP,
    borderColor: TEAL,
  },

  presets: {
    display: "flex",
    gap: 6,
    marginBottom: 10,
  },
  presetBtn: {
    flex: 1,
    border: `1px solid ${TEAL}`,
    background: "#fff",
    color: TEAL_DEEP,
    borderRadius: 6,
    padding: "5px 8px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .15s",
    fontFamily: "inherit",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    paddingTop: 8,
    borderTop: "1px solid #f1f5f9",
  },
  footerBtnGhost: {
    border: "none",
    background: "transparent",
    color: "#718096",
    fontSize: 11,
    fontWeight: 600,
    padding: "5px 8px",
    borderRadius: 5,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  footerBtnSecondary: {
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#374151",
    fontSize: 11,
    fontWeight: 600,
    padding: "5px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  footerBtnPrimary: {
    border: "none",
    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    padding: "5px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 2px 6px rgba(157,200,115,0.4)",
  },
};

export default TimeRangePicker;

/* ─────────────────────────────────────────────
   KEYFRAMES
───────────────────────────────────────────── */
if (
  typeof document !== "undefined" &&
  !document.getElementById("trp-keyframes")
) {
  const style = document.createElement("style");
  style.id = "trp-keyframes";
  style.textContent = `
    @keyframes trpFadeInDown {
      from { opacity: 0; transform: translateY(-6px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes trpFadeInUp {
      from { opacity: 0; transform: translateY(6px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);
}
