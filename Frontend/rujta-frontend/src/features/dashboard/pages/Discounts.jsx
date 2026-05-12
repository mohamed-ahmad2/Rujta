// src/features/dashboard/pages/Discount.jsx
import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  useDiscountForm,
  DiscountScope,
  DiscountType,
  scopeLabel,
  scopePlaceholder,
  nowAsLocalInput,
} from "../../discounts/hooks/useDiscountForm";
import Toast from "../components/Toast";
import DateTimePicker from "../components/DateTimePicker";

const TEAL = "#9DC873";
const TEAL_DARK = "#7ab355";
const TEAL_LIGHT = "#f3fbef";

const getIcon = (scope) =>
  scope === DiscountScope.Medicine
    ? "💊"
    : scope === DiscountScope.Category
      ? "🗂️"
      : "🏷️";

const Discounts = () => {
  const dropRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    currentList,
    loadingData,
    fetchError,
    selectedScope,
    handleScopeChange,
    selectedItem,
    setSelectedItem,
    selectedMedicinePrice,
    discountName,
    setDiscountName,
    discountValue,
    setDiscountValue,
    discountType,
    setDiscountType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    submitting,
    toast,
    setToast,
    errors,
    setErrors,
    handleSubmit,
  } = useDiscountForm();

  const minDateTime = useMemo(() => nowAsLocalInput(), []);
  const success = toast?.type === "success";

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
  }, [selectedScope]);

  const typeOptions = [
    {
      key: DiscountScope.Medicine,
      icon: "💊",
      label: "Specific Drug",
      sub: "Apply to single SKU",
    },
    {
      key: DiscountScope.Category,
      icon: "🗂️",
      label: "Entire Category",
      sub: "Apply to drug class",
    },
    {
      key: DiscountScope.Company,
      icon: "🏷️",
      label: "By Company",
      sub: "Apply to all company products",
    },
  ];

  const maxValue =
    discountType === DiscountType.Percentage
      ? 99.99
      : selectedScope === DiscountScope.Medicine && selectedMedicinePrice > 0
        ? Number((selectedMedicinePrice - 0.01).toFixed(2))
        : undefined;

  const valueHint = (() => {
    if (discountType === DiscountType.Percentage)
      return "Must be less than 100%";
    if (
      discountType === DiscountType.Fixed &&
      selectedScope === DiscountScope.Medicine &&
      selectedItem
    ) {
      return `Medicine price: ${selectedMedicinePrice.toFixed(2)} (discount must be less)`;
    }
    if (discountType === DiscountType.Fixed)
      return "Must be less than medicine price";
    return null;
  })();

  return (
    <div style={s.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { opacity:0.55; cursor:pointer; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        .drop-item:hover { background:#f4fced !important; }
      `}</style>

      <Toast toast={toast} onClose={() => setToast(null)} />

      <h2 style={s.title}>Create New Discount Strategy</h2>
      <p style={s.sub}>
        Define precision parameters for new medical pricing rules.
      </p>

      {fetchError && (
        <div style={s.alertError}>⚠️ Failed to load data: {fetchError}</div>
      )}

      <div style={s.typeCards}>
        {typeOptions.map((t) => (
          <div
            key={t.key}
            style={{
              ...s.typeCard,
              ...(selectedScope === t.key ? s.typeCardActive : {}),
            }}
            onClick={() => handleScopeChange(t.key)}
          >
            <div
              style={{
                ...s.iconCircle,
                ...(selectedScope === t.key
                  ? s.iconCircleActive
                  : s.iconCircleDefault),
              }}
            >
              {t.icon}
            </div>
            <div>
              <div style={s.cardLabel}>{t.label}</div>
              <div style={s.cardSub}>{t.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...s.formGroup, marginBottom: 20 }}>
        <label style={s.label}>Discount Name</label>
        <input
          type="text"
          placeholder="e.g. Summer Sale 20%"
          value={discountName}
          onChange={(e) => {
            setDiscountName(e.target.value);
            setErrors((p) => ({ ...p, name: null }));
          }}
          style={{
            ...s.dateInput,
            ...(errors.name ? s.inputError : {}),
          }}
        />
      </div>

      <div style={{ ...s.row2, flexWrap: "wrap" }}>
        {/* Dropdown */}
        <div style={{ ...s.formGroup, flex: 2, minWidth: 200 }}>
          <label style={s.label}>Select {scopeLabel(selectedScope)}</label>
          <div style={s.dropWrap} ref={dropRef}>
            <div
              style={{
                ...s.dropTrigger,
                ...(dropdownOpen ? { borderColor: TEAL } : {}),
                ...(errors.item ? s.inputError : {}),
                ...(loadingData ? { opacity: 0.6 } : {}),
              }}
              onClick={() => !loadingData && setDropdownOpen((p) => !p)}
            >
              {loadingData ? (
                <span style={{ color: "#9ca3af", fontSize: 14 }}>
                  Loading...
                </span>
              ) : selectedItem ? (
                <span style={s.selectedDisplay}>
                  <span style={{ ...s.itemIcon, background: "#dff5c8" }}>
                    {getIcon(selectedScope)}
                  </span>
                  <span style={{ color: "#1a202c", fontSize: 14 }}>
                    {selectedItem.name}
                    {selectedScope === DiscountScope.Medicine &&
                      selectedMedicinePrice > 0 && (
                        <span
                          style={{
                            color: "#7ab355",
                            fontWeight: 600,
                            marginLeft: 8,
                            fontSize: 13,
                          }}
                        >
                          ({selectedMedicinePrice.toFixed(2)})
                        </span>
                      )}
                  </span>
                </span>
              ) : (
                <span style={{ color: "#9ca3af", fontSize: 14 }}>
                  {scopePlaceholder(selectedScope)}
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  transition: "transform .2s",
                  display: "inline-block",
                  transform: dropdownOpen ? "rotate(180deg)" : "none",
                }}
              >
                ▼
              </span>
            </div>

            {dropdownOpen && (
              <div style={s.dropMenu}>
                {currentList.length === 0 ? (
                  <div
                    style={{
                      padding: "12px 16px",
                      color: "#9ca3af",
                      fontSize: 13,
                    }}
                  >
                    No items found
                  </div>
                ) : (
                  currentList.map((item) => (
                    <div
                      key={item.id}
                      className="drop-item"
                      style={{
                        ...s.dropItem,
                        ...(selectedItem?.id === item.id
                          ? s.dropItemSelected
                          : {}),
                      }}
                      onClick={() => {
                        setSelectedItem(item);
                        setDropdownOpen(false);
                        setErrors((p) => ({ ...p, item: null }));
                      }}
                    >
                      <span style={{ ...s.itemIcon, background: "#dff5c8" }}>
                        {getIcon(selectedScope)}
                      </span>
                      <span style={{ flex: 1 }}>{item.name}</span>
                      {selectedScope === DiscountScope.Medicine &&
                        (item.price ?? item.Price) && (
                          <span
                            style={{
                              fontSize: 12,
                              color: "#7ab355",
                              fontWeight: 600,
                            }}
                          >
                            ${Number(item.price ?? item.Price).toFixed(2)}
                          </span>
                        )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ ...s.formGroup, width: 160 }}>
          <label style={s.label}>Value</label>
          <div style={s.discountWrap}>
            <input
              type="number"
              min={0}
              max={maxValue}
              step={discountType === DiscountType.Percentage ? "1" : "0.01"}
              value={discountValue}
              placeholder="0"
              onChange={(e) => {
                setDiscountValue(e.target.value);
                setErrors((p) => ({ ...p, discount: null }));
              }}
              style={{
                ...s.discountInput,
                ...(errors.discount ? s.inputError : {}),
              }}
            />
            <span style={s.discountSuffix}>
              {discountType === DiscountType.Percentage ? "%" : ""}
            </span>
          </div>

          {valueHint && !errors.discount && (
            <span style={s.hintMsg}>{valueHint}</span>
          )}
        </div>

        {/* Type Toggle */}
        <div style={{ ...s.formGroup, width: 160 }}>
          <label style={s.label}>Discount Type</label>
          <div style={s.toggleGroup}>
            <button
              style={{
                ...s.toggleBtn,
                ...(discountType === DiscountType.Percentage
                  ? s.toggleBtnActive
                  : {}),
              }}
              onClick={() => {
                setDiscountType(DiscountType.Percentage);
                setErrors((p) => ({ ...p, discount: null }));
              }}
            >
              % Percentage
            </button>
            <button
              style={{
                ...s.toggleBtn,
                ...(discountType === DiscountType.Fixed
                  ? s.toggleBtnActive
                  : {}),
              }}
              onClick={() => {
                setDiscountType(DiscountType.Fixed);
                setErrors((p) => ({ ...p, discount: null }));
              }}
            >
               Fixed
            </button>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div style={s.row2}>
        <div style={{ ...s.formGroup, flex: 1 }}>
          <label style={s.label}>Start Date &amp; Time</label>
          <DateTimePicker
            value={startDate}
            min={minDateTime}
            hasError={!!errors.startDate}
            placeholder="Pick start date & time"
            onChange={(val) => {
              setStartDate(val);
              setErrors((p) => ({ ...p, startDate: null }));
            }}
          />
          {!errors.startDate && (
            <span style={s.hintMsg}>You can pick the exact hour & minute</span>
          )}
        </div>

        <div style={{ ...s.formGroup, flex: 1 }}>
          <label style={s.label}>End Date &amp; Time</label>
          <DateTimePicker
            value={endDate}
            min={startDate || minDateTime}
            hasError={!!errors.endDate}
            placeholder="Pick end date & time"
            onChange={(val) => {
              setEndDate(val);
              setErrors((p) => ({ ...p, endDate: null }));
            }}
          />
          {!errors.endDate && (
            <span style={s.hintMsg}>Must be after start date</span>
          )}
        </div>
      </div>

      <div style={s.footer}>
        <button
          style={{
            ...s.confirmBtn,
            ...(submitting ? s.confirmBtnLoading : {}),
            ...(success ? s.confirmBtnSuccess : {}),
          }}
          onClick={handleSubmit}
          disabled={submitting || loadingData}
          onMouseEnter={(e) => {
            if (!submitting && !success) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(157,200,115,0.45)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {success ? (
            "✓ Discount Created!"
          ) : submitting ? (
            <span style={s.spinnerWrap}>
              <span style={s.spinner} /> Processing...
            </span>
          ) : (
            "Confirm Discount"
          )}
        </button>
      </div>
    </div>
  );
};

const s = {
  page: { padding: "32px 36px", minHeight: "100vh", background: "#f4f6f9" },
  title: { fontSize: 22, fontWeight: 700, color: "#1a202c", marginBottom: 4 },
  sub: { fontSize: 13, color: "#718096", marginBottom: 24 },

  alertError: {
    background: "#fff5f5",
    border: "1px solid #fc8181",
    borderRadius: 8,
    padding: "10px 16px",
    color: "#c53030",
    fontSize: 13,
    marginBottom: 16,
  },

  inputError: {
    borderColor: "#fc8181",
    boxShadow: "0 0 0 3px rgba(252,129,129,0.12)",
  },

  typeCards: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
    marginBottom: 22,
  },
  typeCard: {
    border: "1.5px solid #e2e8f0",
    borderRadius: 12,
    padding: "14px 18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 12,
    transition: "all .2s",
    background: "#fff",
  },
  typeCardActive: {
    border: `2px solid ${TEAL}`,
    background: TEAL_LIGHT,
    boxShadow: "0 4px 10px rgba(157,200,115,0.15)",
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  iconCircleActive: { background: "#dff5c8" },
  iconCircleDefault: { background: "#f1f5f9" },
  cardLabel: { fontWeight: 600, fontSize: 14, color: "#1a202c" },
  cardSub: { fontSize: 12, color: "#718096", marginTop: 2 },

  row2: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 20,
  },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  hintMsg: { fontSize: 11, color: "#718096", marginTop: 2 },

  dropWrap: { position: "relative" },
  dropTrigger: {
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 14px",
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    background: "#fff",
    userSelect: "none",
    transition: "border-color .2s, box-shadow .2s",
  },
  selectedDisplay: { display: "flex", alignItems: "center", gap: 8 },
  dropMenu: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1.5px solid #e8e8e8",
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 300,
    boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
    maxHeight: 220,
    overflowY: "auto",
  },
  dropItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 14,
    color: "#374151",
    transition: "background .12s",
  },
  dropItemSelected: {
    background: "#e8f7d8",
    color: "#1f7a5e",
    fontWeight: 500,
  },
  itemIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
  },

  discountWrap: { position: "relative" },
  discountInput: {
    width: "100%",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 36px 0 14px",
    height: 44,
    fontSize: 18,
    fontWeight: 600,
    color: "#1a202c",
    outline: "none",
    transition: "border-color .2s, box-shadow .2s",
    boxSizing: "border-box",
  },
  discountSuffix: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    fontSize: 15,
    fontWeight: 500,
  },

  toggleGroup: {
    display: "flex",
    borderRadius: 8,
    overflow: "hidden",
    border: "1.5px solid #e2e8f0",
  },
  toggleBtn: {
    flex: 1,
    padding: "0 10px",
    height: 44,
    border: "none",
    background: "#fff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
    color: "#374151",
    transition: "all .15s",
  },
  toggleBtnActive: {
    background: TEAL_LIGHT,
    color: TEAL_DARK,
    fontWeight: 700,
  },

  dateInput: {
    width: "100%",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    padding: "0 12px",
    height: 44,
    fontSize: 14,
    color: "#1a202c",
    outline: "none",
    transition: "border-color .2s, box-shadow .2s",
    background: "#fff",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  footer: { display: "flex", justifyContent: "flex-end" },
  confirmBtn: {
    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 32px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform .2s, box-shadow .2s",
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 180,
    justifyContent: "center",
  },
  confirmBtnLoading: { opacity: 0.85, cursor: "not-allowed" },
  confirmBtnSuccess: { background: "#38a169" },
  spinnerWrap: { display: "flex", alignItems: "center", gap: 8 },
  spinner: {
    width: 15,
    height: 15,
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
};

export default Discounts;
