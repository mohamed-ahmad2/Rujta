import React, { useState, useEffect } from 'react'
import { usePricing } from '../../pricing/hooks/usePricing'

const PRIMARY = "#9DC873"

const styles = {
  page:          { minHeight: "100vh", background: "#f3f4f6", padding: "40px 24px 100px" },
  title:         { fontSize: 28, fontWeight: 800, marginBottom: 6, color: "#111827" },
  subtitle:      { fontSize: 14, color: "#6b7280", marginBottom: 32 },
  card:          { background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 24, overflow: "hidden" },
  cardHeader:    { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" },
  cardHeaderLeft:{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 700, color: "#111827" },
  badge:         { background: "#e8f5da", color: "#4a7c2f", fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 999 },
  cardBody:      { padding: 24 },
  subPlan:       { display: "flex", alignItems: "flex-start", gap: 32, flexWrap: "wrap" },
  subPlanInfo:   { flex: 1, minWidth: 200 },
  subPlanTitle:  { fontSize: 22, fontWeight: 800, marginBottom: 8 },
  subPlanDesc:   { fontSize: 13, color: "#6b7280", lineHeight: 1.6 },
  subRates:      { display: "flex", gap: 20, flexWrap: "wrap" },
  rateBox:       { minWidth: 200 },
  rateLabel:     { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 },
  rateNote:      { fontSize: 12, color: "#6b7280", marginTop: 5, fontStyle: "italic" },
  rateNoteGreen: { fontSize: 12, color: PRIMARY, marginTop: 5, fontWeight: 600 },
  advGrid:       { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 },
  advItem:       { display: "flex", flexDirection: "column", gap: 12 },
  advItemHeader: { display: "flex", alignItems: "flex-start", gap: 14 },
  advIconGray:   { width: 48, height: 48, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#e5e7eb" },
  advTitle:      { fontSize: 15, fontWeight: 700, marginBottom: 4 },
  advDesc:       { fontSize: 12.5, color: "#6b7280", lineHeight: 1.5 },
  advRateLabel:  { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
  btnSave:       { display: "flex", alignItems: "center", gap: 8, background: PRIMARY, color: "#fff", border: "none", borderRadius: 8, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  btnDiscard:    { background: "none", border: "none", color: PRIMARY, fontWeight: 600, fontSize: 14, cursor: "pointer", marginRight: 16 },
  successBanner: { background: "#e8f5da", border: "1px solid #9DC873", borderRadius: 8, padding: "12px 18px", marginBottom: 20, color: "#3a6b1a", fontWeight: 600, fontSize: 14 },
  errorBanner:   { background: "#fde8e8", border: "1px solid #f87171", borderRadius: 8, padding: "12px 18px", marginBottom: 20, color: "#b91c1c", fontWeight: 600, fontSize: 14 },
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

export default function ServicePricing() {
  const { pricing, loading, error, fetchPricing, savePricing, clearError } = usePricing()

  const [monthlyRate,     setMonthlyRate]     = useState("")
  const [yearlyRate,      setYearlyRate]      = useState("")
  const [adWeeklyPrice,   setAdWeeklyPrice]   = useState("")
  const [adBiweeklyPrice, setAdBiweeklyPrice] = useState("")
  const [adMonthlyPrice,  setAdMonthlyPrice]  = useState("")
  const [saved,           setSaved]           = useState(false)
  const [localError,      setLocalError]      = useState(null)

  useEffect(() => { fetchPricing() }, [fetchPricing])

  useEffect(() => {
    if (!pricing) return
    setMonthlyRate(pricing.subscriptionMonthlyPrice.toString())
    setYearlyRate(pricing.subscriptionYearlyPrice.toString())
    setAdWeeklyPrice(pricing.adWeeklyPrice.toString())
    setAdBiweeklyPrice(pricing.adBiweeklyPrice.toString())
    setAdMonthlyPrice(pricing.adMonthlyPrice.toString())
  }, [pricing])

  const resetFields = () => {
    if (!pricing) return
    setMonthlyRate(pricing.subscriptionMonthlyPrice.toString())
    setYearlyRate(pricing.subscriptionYearlyPrice.toString())
    setAdWeeklyPrice(pricing.adWeeklyPrice.toString())
    setAdBiweeklyPrice(pricing.adBiweeklyPrice.toString())
    setAdMonthlyPrice(pricing.adMonthlyPrice.toString())
  }

  const handleSave = async () => {
    setLocalError(null)
    const fields = { monthlyRate, yearlyRate, adWeeklyPrice, adBiweeklyPrice, adMonthlyPrice }
    const hasInvalid = Object.values(fields).some(v => v === "" || isNaN(parseFloat(v)) || parseFloat(v) < 0)
    if (hasInvalid) {
      setLocalError("All prices must be valid positive numbers.")
      return
    }
    try {
      await savePricing({
        subscriptionMonthlyPrice: parseFloat(monthlyRate),
        subscriptionYearlyPrice:  parseFloat(yearlyRate),
        adWeeklyPrice:            parseFloat(adWeeklyPrice),
        adBiweeklyPrice:          parseFloat(adBiweeklyPrice),
        adMonthlyPrice:           parseFloat(adMonthlyPrice),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // error already set inside usePricing
    }
  }

  const handleDiscard = () => {
    resetFields()
    setSaved(false)
    setLocalError(null)
    clearError()
  }

  const displayError = localError || error

  if (loading && !pricing) return (
    <div style={{ padding: 60, textAlign: "center", color: "#6b7280" }}>Loading pricing...</div>
  )

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Service Pricing Control</h1>
      <p style={styles.subtitle}>Configure network-wide pricing for subscriptions and advertising.</p>

      {saved        && <div style={styles.successBanner}>✅ Prices saved successfully!</div>}
      {displayError && <div style={styles.errorBanner}>❌ {displayError}</div>}

      {/* Subscription Pricing */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderLeft}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={PRIMARY} strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 15 }}>Subscription Pricing</span>
          </div>
          <span style={baseStyles.badge}>Active Plan</span>
        </div>
        <div style={styles.cardBody}>
          <div style={styles.subPlan}>
            <div style={styles.subPlanInfo}>
              <h3 style={styles.subPlanTitle}>Standard Care</h3>
              <p style={styles.subPlanDesc}>
                The foundational membership tier. Includes core inventory management and e-prescription routing.
              </p>
            </div>
            <div style={styles.subRates}>
              <div style={styles.rateBox}>
                <div style={styles.rateLabel}>Monthly Rate</div>
                <InputField value={monthlyRate} onChange={setMonthlyRate} />
                <div style={baseStyles.rateNote}>Billed every 30 days</div>
              </div>
              <div style={styles.rateBox}>
                <div style={styles.rateLabel}>Yearly Rate</div>
                <InputField value={yearlyRate} onChange={setYearlyRate} />
                <div style={styles.rateNoteGreen}>Saves pharmacies annually</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advertising Pricing */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderLeft}>
            <svg width="18" height="18" fill={PRIMARY} viewBox="0 0 24 24">
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
            <span style={{ fontSize: 15 }}>Advertising Pricing</span>
          </div>
        </div>
        <div style={styles.cardBody}>
          <div style={styles.advGrid}>

            {/* 1 Week */}
            <div style={styles.advItem}>
              <div style={styles.advItemHeader}>
                <div style={styles.advIconGray}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                </div>
                <div>
                  <div style={styles.advTitle}>1 Week</div>
                  <div style={styles.advDesc}>Great for short promotions. 7-day visibility.</div>
                </div>
              </div>
              <div>
                <div style={styles.advRateLabel}>Rate (7 days)</div>
                <InputField value={adWeeklyPrice} onChange={setAdWeeklyPrice} />
              </div>
            </div>

            {/* 2 Weeks */}
            <div style={styles.advItem}>
              <div style={styles.advItemHeader}>
                <div style={styles.advIconGray}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>
                  </svg>
                </div>
                <div>
                  <div style={styles.advTitle}>2 Weeks</div>
                  <div style={styles.advDesc}>Most popular choice. 14-day visibility.</div>
                </div>
              </div>
              <div>
                <div style={styles.advRateLabel}>Rate (14 days)</div>
                <InputField value={adBiweeklyPrice} onChange={setAdBiweeklyPrice} />
              </div>
            </div>

            {/* 1 Month */}
            <div style={styles.advItem}>
              <div style={styles.advItemHeader}>
                <div style={styles.advIconGray}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#6b7280" strokeWidth="1.8"/>
                    <path d="M9 12l2 2 4-4" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div style={styles.advTitle}>1 Month</div>
                  <div style={styles.advDesc}>Best value for visibility. 30-day campaign.</div>
                </div>
              </div>
              <div>
                <div style={styles.advRateLabel}>Rate (30 days)</div>
                <InputField value={adMonthlyPrice} onChange={setAdMonthlyPrice} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <button style={styles.btnDiscard} onClick={handleDiscard} disabled={loading}>
          Discard Changes
        </button>
        <button style={styles.btnSave} onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : (
            <>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}