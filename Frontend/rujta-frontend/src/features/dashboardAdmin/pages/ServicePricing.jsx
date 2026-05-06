import React, { useState } from 'react'

const PRIMARY = "#9DC873"

// ── Responsive styles via inline + CSS-in-JS approach ──
const baseStyles = {
  page: { minHeight: "100vh", background: "#f3f4f6", padding: "24px 16px 100px" },
  title: { fontSize: 24, fontWeight: 800, marginBottom: 6, color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 24 },
  card: { background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 20, overflow: "hidden" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" },
  cardHeaderLeft: { display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 700, color: "#111827" },
  badge: { background: "#e8f5da", color: "#4a7c2f", fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999, whiteSpace: 'nowrap' },
  cardBody: { padding: "20px" },
  rateLabel: { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 },
  rateNote: { fontSize: 12, color: "#6b7280", marginTop: 5, fontStyle: "italic" },
  rateNoteGreen: { fontSize: 12, color: PRIMARY, marginTop: 5, fontWeight: 600 },
  advTitle: { fontSize: 15, fontWeight: 700, marginBottom: 4 },
  advDesc: { fontSize: 12.5, color: "#6b7280", lineHeight: 1.5 },
  advRateLabel: { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
  btnSave: { display: "flex", alignItems: "center", gap: 8, background: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" },
  btnDiscard: { background: "none", border: `1px solid ${PRIMARY}`, color: PRIMARY, fontWeight: 600, fontSize: 14, cursor: "pointer", borderRadius: 8, padding: "12px 16px", width: "100%" },
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
      <span style={{ color: "#9b9b9b", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>EGP</span>
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
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDiscard = () => {
    setMonthlyRate("199.00")
    setYearlyRate("1990.00")
    setDailyRate("45.00")
    setMonthlySponsorship("850.00")
  }

  return (
    <div style={baseStyles.page}>
      <style>{`
        @media (min-width: 640px) {
          .pricing-page { padding: 40px 24px 100px !important; }
          .pricing-title { font-size: 28px !important; }
          .sub-plan-layout { flex-direction: row !important; align-items: flex-start !important; }
          .sub-rates { flex-direction: row !important; }
          .adv-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-row { flex-direction: row !important; justify-content: space-between !important; align-items: center !important; }
          .footer-actions { flex-direction: row !important; width: auto !important; }
          .btn-save { width: auto !important; }
          .btn-discard { width: auto !important; }
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
      `}</style>

      <h1 className="pricing-title" style={baseStyles.title}>Service Pricing Control</h1>
      <p style={baseStyles.subtitle}>Configure network-wide pricing for subscriptions and localized advertising.</p>

      {/* Subscription Pricing */}
      <div style={baseStyles.card}>
        <div style={baseStyles.cardHeader}>
          <div style={baseStyles.cardHeaderLeft}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={PRIMARY} strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 15 }}>Subscription Pricing</span>
          </div>
          <span style={baseStyles.badge}>Active Plan</span>
        </div>
        <div style={baseStyles.cardBody}>
          {/* Plan info */}
          <div className="sub-plan-layout" style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
            <div style={{ flex:1 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Standard Care</h3>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                The foundational membership tier for independent pharmacies. Includes core inventory management and e-prescription routing.
              </p>
            </div>
            <div className="sub-rates" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <div style={baseStyles.rateLabel}>Monthly Rate</div>
                <InputField value={monthlyRate} onChange={setMonthlyRate} />
                <div style={baseStyles.rateNote}>Billed every 30 days</div>
              </div>
              <div>
                <div style={baseStyles.rateLabel}>Yearly Rate</div>
                <InputField value={yearlyRate} onChange={setYearlyRate} />
                <div style={baseStyles.rateNoteGreen}>Saves pharmacies 17% annually</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advertising Pricing */}
      <div style={baseStyles.card}>
        <div style={baseStyles.cardHeader}>
          <div style={baseStyles.cardHeaderLeft}>
            <svg width="18" height="18" fill={PRIMARY} viewBox="0 0 24 24">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
            <span style={{ fontSize: 15 }}>Advertising Pricing</span>
          </div>
        </div>
        <div style={baseStyles.cardBody}>
          <div className="adv-grid" style={{ display:'grid', gridTemplateColumns:'1fr', gap:'24px' }}>

            {/* Daily Placement */}
            <div>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'14px', marginBottom:'14px' }}>
                <div style={{ width:44, height:44, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:'#e5e7eb' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M16.9 16.9l1.4 1.4M5.6 18.4l1.4-1.4M16.9 7.1l1.4-1.4" />
                  </svg>
                </div>
                <div>
                  <div style={baseStyles.advTitle}>Daily Placement</div>
                  <div style={baseStyles.advDesc}>Rotating banner slot in the regional marketplace dashboard.</div>
                </div>
              </div>
              <div style={baseStyles.advRateLabel}>Rate per 24h</div>
              <InputField value={dailyRate} onChange={setDailyRate} />
            </div>

            {/* Monthly Sponsorship */}
            <div>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'14px', marginBottom:'14px' }}>
                <div style={{ width:44, height:44, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:'#fde8d8' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#c2612a" strokeWidth="1.8" />
                    <path d="M9 12l2 2 4-4" stroke="#c2612a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div style={baseStyles.advTitle}>Monthly Sponsorship</div>
                  <div style={baseStyles.advDesc}>Exclusive 'Featured Network' badge and top-tier listing for 30 days.</div>
                </div>
              </div>
              <div style={baseStyles.advRateLabel}>Monthly Fixed Rate</div>
              <InputField value={monthlySponsorship} onChange={setMonthlySponsorship} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="footer-row" style={{ display:'flex', flexDirection:'column', gap:'12px', paddingBottom:'8px' }}>
        <div className="footer-actions" style={{ display:'flex', flexDirection:'column', gap:'10px', width:'100%' }}>
          <button className="btn-save" style={baseStyles.btnSave} onClick={handleSave}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
          <button className="btn-discard" style={baseStyles.btnDiscard} onClick={handleDiscard}>
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServicePricing