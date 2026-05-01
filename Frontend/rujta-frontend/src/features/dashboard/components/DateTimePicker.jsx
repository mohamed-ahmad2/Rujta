// src/features/dashboard/components/DateTimePicker.jsx
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

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const pad = (n) => String(n).padStart(2, "0");

const parseLocalValue = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const toLocalString = (date) => {
  if (!date) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDisplay = (date) => {
  if (!date) return "";
  const day = pad(date.getDate());
  const month = MONTHS[date.getMonth()].slice(0, 3);
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day} ${month} ${year} • ${pad(hours)}:${minutes} ${ampm}`;
};

const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// تقدير ارتفاع الـ popover (للحساب قبل ما يترسم)
const ESTIMATED_POPOVER_HEIGHT = 460;
const POPOVER_GAP = 6;

const DateTimePicker = ({
  value,
  onChange,
  min,
  hasError = false,
  placeholder = "Select date & time",
}) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const selectedDate = useMemo(() => parseLocalValue(value), [value]);
  const minDate = useMemo(() => parseLocalValue(min), [min]);

  const [viewMonth, setViewMonth] = useState(() => {
    const base = selectedDate || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const [draft, setDraft] = useState(selectedDate || new Date());

  useEffect(() => {
    if (selectedDate) {
      setDraft(selectedDate);
      setViewMonth(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
      );
    }
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // ✅ Smart Positioning: يحسب أحسن مكان (فوق/تحت) قبل ما الـ popover يترسم
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const calcPosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // لو المساحة تحت أقل من المطلوب والمساحة فوق أكبر → افتح فوق
      const shouldOpenUpward =
        spaceBelow < ESTIMATED_POPOVER_HEIGHT + POPOVER_GAP &&
        spaceAbove > spaceBelow;

      setOpenUpward(shouldOpenUpward);
    };

    calcPosition();

    // إعادة الحساب لو حصل scroll أو resize
    window.addEventListener("scroll", calcPosition, true);
    window.addEventListener("resize", calcPosition);

    return () => {
      window.removeEventListener("scroll", calcPosition, true);
      window.removeEventListener("resize", calcPosition);
    };
  }, [open]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const lastDay = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth() + 1,
      0,
    );
    const startWeekday = firstDay.getDay();

    const days = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(firstDay);
      d.setDate(d.getDate() - i - 1);
      days.push({ date: d, currentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i),
        currentMonth: true,
      });
    }
    while (days.length < 42) {
      const last = days[days.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      days.push({ date: next, currentMonth: false });
    }
    return days;
  }, [viewMonth]);

  const isDisabled = (date) => {
    if (!minDate) return false;
    return startOfDay(date) < startOfDay(minDate);
  };

  const handlePickDate = (date) => {
    if (isDisabled(date)) return;
    const updated = new Date(draft);
    updated.setFullYear(date.getFullYear());
    updated.setMonth(date.getMonth());
    updated.setDate(date.getDate());
    if (minDate && updated < minDate) {
      updated.setHours(minDate.getHours());
      updated.setMinutes(minDate.getMinutes());
    }
    setDraft(updated);
  };

  const handleHourChange = (h) => {
    const updated = new Date(draft);
    let newHours = h;
    const isPM = draft.getHours() >= 12;
    if (isPM && h < 12) newHours = h + 12;
    if (!isPM && h === 12) newHours = 0;
    updated.setHours(newHours);
    setDraft(updated);
  };

  const handleMinuteChange = (m) => {
    const updated = new Date(draft);
    updated.setMinutes(m);
    setDraft(updated);
  };

  const handleAmPmToggle = (ampm) => {
    const updated = new Date(draft);
    const h = updated.getHours();
    if (ampm === "AM" && h >= 12) updated.setHours(h - 12);
    if (ampm === "PM" && h < 12) updated.setHours(h + 12);
    setDraft(updated);
  };

  const handleApply = () => {
    onChange?.(toLocalString(draft));
    setOpen(false);
  };

  const handleClear = () => {
    onChange?.("");
    setOpen(false);
  };

  const handleNow = () => {
    const now = new Date();
    setDraft(now);
    setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const prevMonth = () =>
    setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const displayHour12 = ((draft.getHours() + 11) % 12) + 1;
  const displayAmPm = draft.getHours() >= 12 ? "PM" : "AM";

  // ✅ Dynamic popover position styles
  const popoverPositionStyle = openUpward
    ? {
        bottom: `calc(100% + ${POPOVER_GAP}px)`,
        top: "auto",
        boxShadow:
          "0 -12px 40px rgba(0,0,0,0.12), 0 -2px 10px rgba(0,0,0,0.06)",
        animationName: "dtpFadeInUp",
      }
    : {
        top: `calc(100% + ${POPOVER_GAP}px)`,
        bottom: "auto",
        boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.06)",
        animationName: "dtpFadeInDown",
      };

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
        <span style={styles.triggerIcon}>📅</span>
        <span style={styles.triggerText(selectedDate)}>
          {selectedDate ? formatDisplay(selectedDate) : placeholder}
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
          style={{
            ...styles.popover,
            ...popoverPositionStyle,
          }}
        >
          {/* Header */}
          <div style={styles.header}>
            <button onClick={prevMonth} style={styles.navBtn} type="button">
              ‹
            </button>
            <div style={styles.monthLabel}>
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </div>
            <button onClick={nextMonth} style={styles.navBtn} type="button">
              ›
            </button>
          </div>

          {/* Weekdays */}
          <div style={styles.weekdays}>
            {WEEKDAYS.map((w, i) => (
              <div key={i} style={styles.weekday}>
                {w}
              </div>
            ))}
          </div>

          {/* Days */}
          <div style={styles.daysGrid}>
            {calendarDays.map((d, idx) => {
              const disabled = isDisabled(d.date);
              const selected = isSameDay(d.date, draft);
              const today = isSameDay(d.date, new Date());

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePickDate(d.date)}
                  disabled={disabled}
                  style={{
                    ...styles.dayBtn,
                    ...(d.currentMonth ? {} : styles.dayMuted),
                    ...(today && !selected ? styles.dayToday : {}),
                    ...(selected ? styles.daySelected : {}),
                    ...(disabled ? styles.dayDisabled : {}),
                  }}
                >
                  {d.date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Time */}
          <div style={styles.timeSection}>
            <div style={styles.timeRow}>
              <span style={styles.timeLabelInline}>🕐 Time</span>

              <div style={styles.timeControls}>
                {/* Hour */}
                <div style={styles.timeBox}>
                  <button
                    type="button"
                    onClick={() =>
                      handleHourChange(
                        displayHour12 === 12 ? 1 : displayHour12 + 1,
                      )
                    }
                    style={styles.timeArrow}
                  >
                    ▲
                  </button>
                  <div style={styles.timeValue}>{pad(displayHour12)}</div>
                  <button
                    type="button"
                    onClick={() =>
                      handleHourChange(
                        displayHour12 === 1 ? 12 : displayHour12 - 1,
                      )
                    }
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
                    onClick={() =>
                      handleMinuteChange((draft.getMinutes() + 1) % 60)
                    }
                    style={styles.timeArrow}
                  >
                    ▲
                  </button>
                  <div style={styles.timeValue}>{pad(draft.getMinutes())}</div>
                  <button
                    type="button"
                    onClick={() =>
                      handleMinuteChange((draft.getMinutes() + 59) % 60)
                    }
                    style={styles.timeArrow}
                  >
                    ▼
                  </button>
                </div>

                {/* AM/PM */}
                <div style={styles.ampmGroup}>
                  <button
                    type="button"
                    onClick={() => handleAmPmToggle("AM")}
                    style={{
                      ...styles.ampmBtn,
                      ...(displayAmPm === "AM" ? styles.ampmBtnActive : {}),
                    }}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAmPmToggle("PM")}
                    style={{
                      ...styles.ampmBtn,
                      ...(displayAmPm === "PM" ? styles.ampmBtnActive : {}),
                    }}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Quick minutes */}
            <div style={styles.quickMinutes}>
              {[0, 15, 30, 45].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteChange(m)}
                  style={{
                    ...styles.quickMinBtn,
                    ...(draft.getMinutes() === m
                      ? styles.quickMinBtnActive
                      : {}),
                  }}
                >
                  :{pad(m)}
                </button>
              ))}
            </div>
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
            <button
              type="button"
              onClick={handleNow}
              style={styles.footerBtnGhost}
            >
              Now
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

// ─────────────────────────────────────────────
// 🎨 Compact Styles
// ─────────────────────────────────────────────
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
    height: 44,
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
  triggerText: (selected) => ({
    flex: 1,
    color: selected ? "#1a202c" : "#9ca3af",
    fontWeight: selected ? 500 : 400,
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

  // ✅ Compact popover - عرض ثابت 280px
  // top/bottom/boxShadow/animationName بتتحدد ديناميكياً من popoverPositionStyle
  popover: {
    position: "absolute",
    left: 0,
    width: 280,
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 12,
    zIndex: 500,
    padding: 12,
    animationDuration: "0.2s",
    animationTimingFunction: "ease-out",
    animationFillMode: "both",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  navBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    border: "none",
    background: TEAL_LIGHT,
    color: TEAL_DEEP,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1a202c",
  },

  weekdays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: 4,
  },
  weekday: {
    fontSize: 10,
    fontWeight: 700,
    color: "#9ca3af",
    textAlign: "center",
    padding: "4px 0",
    textTransform: "uppercase",
  },

  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 1,
    marginBottom: 8,
  },
  dayBtn: {
    height: 30,
    width: "100%",
    border: "none",
    borderRadius: 6,
    background: "transparent",
    color: "#1a202c",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all .12s",
    fontFamily: "inherit",
    padding: 0,
  },
  dayMuted: { color: "#cbd5e0" },
  dayToday: {
    background: TEAL_LIGHT,
    color: TEAL_DEEP,
    fontWeight: 700,
    boxShadow: `inset 0 0 0 1.5px ${TEAL}`,
  },
  daySelected: {
    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
    color: "#fff",
    fontWeight: 700,
    boxShadow: "0 2px 6px rgba(157,200,115,0.4)",
  },
  dayDisabled: {
    color: "#e2e8f0",
    cursor: "not-allowed",
    background: "transparent",
  },

  timeSection: {
    borderTop: "1px dashed #e2e8f0",
    paddingTop: 10,
    marginBottom: 8,
  },
  timeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  timeLabelInline: {
    fontSize: 10,
    fontWeight: 700,
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    flexShrink: 0,
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
    fontSize: 8,
    cursor: "pointer",
    padding: 0,
    width: 36,
    height: 14,
    lineHeight: 1,
  },
  timeValue: {
    width: 36,
    height: 28,
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
    gap: 4,
    justifyContent: "center",
  },
  quickMinBtn: {
    border: "1px solid #e2e8f0",
    background: "#fff",
    borderRadius: 5,
    padding: "3px 8px",
    fontSize: 10,
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

export default DateTimePicker;

// ─────────────────────────────────────────────
// 🎬 Keyframes (مرة واحدة فقط)
// ─────────────────────────────────────────────
if (
  typeof document !== "undefined" &&
  !document.getElementById("dtp-keyframes")
) {
  const style = document.createElement("style");
  style.id = "dtp-keyframes";
  style.textContent = `
    @keyframes dtpFadeInDown {
      from { opacity: 0; transform: translateY(-6px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes dtpFadeInUp {
      from { opacity: 0; transform: translateY(6px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);
}
