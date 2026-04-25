import React, { useState } from 'react'

const PRIMARY = "#9DC873"

const styles = {
  page: { minHeight: "100vh", background: "#f3f4f6", padding: "40px 24px 100px" },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 6, color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 32 },
  card: { background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 24, overflow: "hidden" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" },
  cardHeaderLeft: { display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 700, color: "#111827" },
  badge: { background: "#e8f5da", color: "#4a7c2f", fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 999 },
  cardBody: { padding: 24 },
  subPlan: { display: "flex", alignItems: "flex-start", gap: 32, flexWrap: "wrap" },
  subPlanInfo: { flex: 1, minWidth: 200 },
  subPlanTitle: { fontSize: 22, fontWeight: 800, marginBottom: 8 },
  subPlanDesc: { fontSize: 13, color: "#6b7280", lineHeight: 1.6 },
  subRates: { display: "flex", gap: 20, flexWrap: "wrap" },
  rateBox: { minWidth: 200 },
  rateLabel: { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 },
  rateNote: { fontSize: 12, color: "#6b7280", marginTop: 5, fontStyle: "italic" },
  rateNoteGreen: { fontSize: 12, color: PRIMARY, marginTop: 5, fontWeight: 600 },
  advGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  advItem: { display: "flex", flexDirection: "column", gap: 12 },
  advItemHeader: { display: "flex", alignItems: "flex-start", gap: 14 },
  advIconGray: { width: 48, height: 48, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#e5e7eb" },
  advIconOrange: { width: 48, height: 48, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fde8d8" },
  advTitle: { fontSize: 15, fontWeight: 700, marginBottom: 4 },
  advDesc: { fontSize: 12.5, color: "#6b7280", lineHeight: 1.5 },
  advRateLabel: { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
  footer: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", zIndex: 10 },
  footerNote: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280" },
  footerActions: { display: "flex", alignItems: "center", gap: 20 },
  btnDiscard: { background: "none", border: "none", color: PRIMARY, fontWeight: 600, fontSize: 14, cursor: "pointer" },
  btnSave: { display: "flex", alignItems: "center", gap: 8, background: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
}

function InputField({ value, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: "flex", alignItems: "center",
      border: `1.5px solid ${focused ? PRIMARY : "#d1d5db"}`,
      borderRadius: 8, padding: "0 14px", height: 48,
      background: "#fff", gap: 6,
      boxShadow: focused ? `0 0 0 3px rgba(157,200,115,0.15)` : "none",
      transition: "border-color 0.2s, box-shadow 0.2s"
    }}>
      <span style={{ color: "#9b9b9b", fontSize: 14 }}>$</span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        step="0.01"
        style={{ border: "none", outline: "none", fontSize: 15, fontWeight: 500, color: "#111827", background: "transparent", width: "100%" }}
      />
    </div>
  )
}

const ServicePricing = () => {
  const [monthlyRate, setMonthlyRate] = useState("199.00")
  const [yearlyRate, setYearlyRate] = useState("1990.00")
  const [dailyRate, setDailyRate] = useState("45.00")
  const [monthlySponsorship, setMonthlySponsorship] = useState("850.00")

  const handleSave = () => alert("Changes saved successfully!")
  const handleDiscard = () => {
    setMonthlyRate("199.00")
    setYearlyRate("1990.00")
    setDailyRate("45.00")
    setMonthlySponsorship("850.00")
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Service Pricing Control</h1>
      <p style={styles.subtitle}>Configure network-wide pricing for subscriptions and localized advertising.</p>

      {/* Subscription Pricing */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderLeft}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={PRIMARY} strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" strokeLinecap="round" />
            </svg>
            Subscription Pricing
          </div>
          <span style={styles.badge}>Active Plan</span>
        </div>
        <div style={styles.cardBody}>
          <div style={styles.subPlan}>
            <div style={styles.subPlanInfo}>
              <h3 style={styles.subPlanTitle}>Standard Care</h3>
              <p style={styles.subPlanDesc}>
                The foundational membership tier for independent pharmacies. Includes core inventory management and e-prescription routing.
              </p>
            </div>
            <div style={styles.subRates}>
              <div style={styles.rateBox}>
                <div style={styles.rateLabel}>Monthly Rate </div>
                <InputField value={monthlyRate} onChange={setMonthlyRate} />
                <div style={styles.rateNote}>Billed every 30 days</div>
              </div>
              <div style={styles.rateBox}>
                <div style={styles.rateLabel}>Yearly Rate </div>
                <InputField value={yearlyRate} onChange={setYearlyRate} />
                <div style={styles.rateNoteGreen}>Saves pharmacies 17% annually</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advertising Pricing */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderLeft}>
            <svg width="20" height="20" fill={PRIMARY} viewBox="0 0 24 24">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
            Advertising Pricing
          </div>
        </div>
        <div style={styles.cardBody}>
          <div style={styles.advGrid}>
            {/* Daily Placement */}
            <div style={styles.advItem}>
              <div style={styles.advItemHeader}>
                <div style={styles.advIconGray}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M16.9 16.9l1.4 1.4M5.6 18.4l1.4-1.4M16.9 7.1l1.4-1.4" />
                  </svg>
                </div>
                <div>
                  <div style={styles.advTitle}>Daily Placement</div>
                  <div style={styles.advDesc}>Rotating banner slot in the regional marketplace dashboard.</div>
                </div>
              </div>
              <div>
                <div style={styles.advRateLabel}>Rate per 24h </div>
                <InputField value={dailyRate} onChange={setDailyRate} />
              </div>
            </div>

            {/* Monthly Sponsorship */}
            <div style={styles.advItem}>
              <div style={styles.advItemHeader}>
                <div style={styles.advIconOrange}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#c2612a" strokeWidth="1.8" />
                    <path d="M9 12l2 2 4-4" stroke="#c2612a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div style={styles.advTitle}>Monthly Sponsorship</div>
                  <div style={styles.advDesc}>Exclusive 'Featured Network' badge and top-tier listing for 30 days.</div>
                </div>
              </div>
              <div>
                <div style={styles.advRateLabel}>Monthly Fixed Rate </div>
                <InputField value={monthlySponsorship} onChange={setMonthlySponsorship} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div >
        
        <div >
          
          <button style={styles.btnSave} onClick={handleSave}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServicePricing