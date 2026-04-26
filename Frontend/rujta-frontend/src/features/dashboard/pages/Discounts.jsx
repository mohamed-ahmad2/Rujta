import React, { useState, useEffect, useRef } from 'react'

const drugList = [
  { id: 'd1', name: 'Panadol 500mg', icon: '💊', bg: '#fff0f0' },
  { id: 'd2', name: 'Amoxicillin 250mg', icon: '🧪', bg: '#f0fff4' },
  { id: 'd3', name: 'Loratadine 10mg', icon: '🌿', bg: '#f0f8ff' },
  { id: 'd4', name: 'Metformin 500mg', icon: '💉', bg: '#fffdf0' },
  { id: 'd5', name: 'Amlodipine 5mg', icon: '❤️', bg: '#fff0f5' },
  { id: 'd6', name: 'Omeprazole 20mg', icon: '🫙', bg: '#f5f0ff' },
]

const categoryList = [
  { id: 'all', name: 'All', icon: '🌐', bg: '#e8f0ff' },
  { id: 'pain', name: 'Pain Relief', icon: '🩹', bg: '#fff0f0' },
  { id: 'antibiotics', name: 'Antibiotics', icon: '🧬', bg: '#f0fff4' },
  { id: 'allergy', name: 'Allergy & Respiratory', icon: '🌬️', bg: '#f0f8ff' },
  { id: 'diabetes', name: 'Diabetes & Vitamins', icon: '💉', bg: '#fffdf0' },
  { id: 'heart', name: 'Heart & Blood Pressure', icon: '❤️', bg: '#fff0f5' },
]

const brandList = [
  { id: 'b1', name: 'GlaxoSmithKline', icon: '🏭', bg: '#f0f4ff' },
  { id: 'b2', name: 'Novartis', icon: '🔬', bg: '#fff4f0' },
  { id: 'b3', name: 'Pfizer', icon: '🧫', bg: '#f0fff8' },
  { id: 'b4', name: 'Roche', icon: '💡', bg: '#fefff0' },
  { id: 'b5', name: 'AstraZeneca', icon: '🌡️', bg: '#f5f0ff' },
  { id: 'b6', name: 'Sanofi', icon: '⚕️', bg: '#fff0f5' },
  { id: 'b7', name: 'Johnson & Johnson', icon: '🏥', bg: '#f0faff' },
  { id: 'b8', name: 'Abbott', icon: '🧬', bg: '#fffdf0' },
]

const TEAL = '#9DC873'
const TEAL_DARK = '#7ab355'
const TEAL_LIGHT = '#f3fbef'
const TEAL_BORDER = '#c3e89a'

const Discounts = () => {
  const [selectedType, setSelectedType] = useState('drug')
  const [selectedItem, setSelectedItem] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [discountValue, setDiscountValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    setSelectedItem(null)
    setErrors({})
    setDropdownOpen(false)
  }, [selectedType])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const list =
    selectedType === 'drug'
      ? drugList
      : selectedType === 'category'
      ? categoryList
      : brandList

  const validate = () => {
    const errs = {}
    const labels = { drug: 'drug', category: 'category', brand: 'brand' }
    if (!selectedItem) errs.item = `Please select a ${labels[selectedType]}`
    if (!discountValue) errs.discount = 'Discount value is required'
    else if (Number(discountValue) < 1 || Number(discountValue) > 100)
      errs.discount = 'Discount must be between 1 and 100'
    if (!startDate) errs.startDate = 'Start date is required'
    if (startDate && endDate && endDate < startDate)
      errs.endDate = 'End date must be after start date'
    return errs
  }

  const handleConfirm = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setSelectedItem(null)
      setDiscountValue('')
      setStartDate('')
      setEndDate('')
    }, 2500)
  }

  const typeOptions = [
    { key: 'drug',     icon: '💊', label: 'Specific Drug',    sub: 'Apply to single SKU' },
    { key: 'category', icon: '🗂️', label: 'Entire Category',  sub: 'Apply to drug class' },
    { key: 'brand',    icon: '🏷️', label: 'By Brand',         sub: 'Apply to all brand products' },
  ]

  const dropPlaceholder =
    selectedType === 'drug'
      ? 'Search drugs...'
      : selectedType === 'category'
      ? 'Search categories...'
      : 'Search brands...'

  const dropLabel =
    selectedType === 'drug'
      ? 'Select Drug'
      : selectedType === 'category'
      ? 'Select Category'
      : 'Select Brand'

  return (
    <div style={s.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .drop-item:hover { background: #f4fced !important; }
      `}</style>

      {/* Page Header */}
      <h2 style={s.title}>Create New Discount Strategy</h2>
      <p style={s.sub}>Define precision parameters for new medical pricing rules.</p>

      {/* Type Cards — 3 columns */}
      <div style={s.typeCards}>
        {typeOptions.map(t => (
          <div
            key={t.key}
            style={{ ...s.typeCard, ...(selectedType === t.key ? s.typeCardActive : {}) }}
            onClick={() => setSelectedType(t.key)}
          >
            <div style={{
              ...s.iconCircle,
              ...(selectedType === t.key ? s.iconCircleActive : s.iconCircleDefault),
            }}>{t.icon}</div>
            <div>
              <div style={s.cardLabel}>{t.label}</div>
              <div style={s.cardSub}>{t.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW: Dropdown + Discount Value ── */}
      <div style={s.row2}>

        {/* Dropdown */}
        <div style={{ ...s.formGroup, flex: 1 }}>
          <label style={s.label}>{dropLabel}</label>
          <div style={s.dropWrap} ref={dropRef}>
            <div
              style={{
                ...s.dropTrigger,
                ...(dropdownOpen ? { borderColor: TEAL } : {}),
                ...(errors.item ? { borderColor: '#fc8181' } : {}),
              }}
              onClick={() => setDropdownOpen(p => !p)}
            >
              {selectedItem ? (
                <span style={s.selectedDisplay}>
                  <span style={{ ...s.itemIcon, background: selectedItem.bg }}>{selectedItem.icon}</span>
                  <span style={{ color: '#1a202c', fontSize: 14 }}>{selectedItem.name}</span>
                </span>
              ) : (
                <span style={{ color: '#9ca3af', fontSize: 14 }}>{dropPlaceholder}</span>
              )}
              <span style={{
                fontSize: 11, color: '#9ca3af',
                transition: 'transform .2s',
                display: 'inline-block',
                transform: dropdownOpen ? 'rotate(180deg)' : 'none',
              }}>▼</span>
            </div>
            {errors.item && <span style={s.errorMsg}>{errors.item}</span>}

            {dropdownOpen && (
              <div style={s.dropMenu}>
                {list.map(item => (
                  <div
                    key={item.id}
                    className="drop-item"
                    style={{
                      ...s.dropItem,
                      ...(selectedItem?.id === item.id ? s.dropItemSelected : {}),
                    }}
                    onClick={() => {
                      setSelectedItem(item)
                      setDropdownOpen(false)
                      setErrors(p => ({ ...p, item: null }))
                    }}
                  >
                    <span style={{ ...s.itemIcon, background: item.bg }}>{item.icon}</span>
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Discount Value */}
        <div style={{ ...s.formGroup, width: 160 }}>
          <label style={s.label}>Discount Value</label>
          <div style={s.discountWrap}>
            <input
              type="number"
              min={1} max={100}
              value={discountValue}
              placeholder="0"
              onChange={e => {
                setDiscountValue(e.target.value)
                setErrors(p => ({ ...p, discount: null }))
              }}
              style={{
                ...s.discountInput,
                ...(errors.discount ? { borderColor: '#fc8181' } : {}),
              }}
            />
            <span style={s.discountSuffix}>%</span>
          </div>
          {errors.discount && <span style={s.errorMsg}>{errors.discount}</span>}
        </div>

      </div>

      {/* Dates */}
      <div style={s.row2}>
        <div style={{ ...s.formGroup, flex: 1 }}>
          <label style={s.label}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setErrors(p => ({ ...p, startDate: null })) }}
            style={{ ...s.dateInput, ...(errors.startDate ? { borderColor: '#fc8181' } : {}) }}
          />
          {errors.startDate && <span style={s.errorMsg}>{errors.startDate}</span>}
        </div>
        <div style={{ ...s.formGroup, flex: 1 }}>
          <label style={s.label}>
            End Date <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={e => { setEndDate(e.target.value); setErrors(p => ({ ...p, endDate: null })) }}
            style={{ ...s.dateInput, ...(errors.endDate ? { borderColor: '#fc8181' } : {}) }}
          />
          {errors.endDate && <span style={s.errorMsg}>{errors.endDate}</span>}
        </div>
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <button
          style={{
            ...s.confirmBtn,
            ...(loading ? s.confirmBtnLoading : {}),
            ...(success ? s.confirmBtnSuccess : {}),
          }}
          onClick={handleConfirm}
          disabled={loading}
          onMouseEnter={e => {
            if (!loading && !success) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(157,200,115,0.45)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {success
            ? '✓ Discount Created!'
            : loading
              ? <span style={s.spinnerWrap}><span style={s.spinner} /> Processing...</span>
              : 'Confirm Discount'
          }
        </button>
      </div>
    </div>
  )
}

const s = {
  page: {
    padding: '32px 36px',
    minHeight: '100vh',
    background: '#f4f6f9',
  },
  title: { fontSize: 22, fontWeight: 700, color: '#1a202c', marginBottom: 4 },
  sub: { fontSize: 13, color: '#718096', marginBottom: 24 },

  /* 3 columns now */
  typeCards: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 22 },
  typeCard: {
    border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '14px 18px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
    transition: 'all .2s', background: '#fff',
  },
  typeCardActive: {
    border: `2px solid ${TEAL}`, background: TEAL_LIGHT,
    boxShadow: '0 4px 10px rgba(157,200,115,0.15)',
  },
  iconCircle: {
    width: 42, height: 42, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, flexShrink: 0,
  },
  iconCircleActive: { background: '#dff5c8' },
  iconCircleDefault: { background: '#f1f5f9' },
  cardLabel: { fontWeight: 600, fontSize: 14, color: '#1a202c' },
  cardSub: { fontSize: 12, color: '#718096', marginTop: 2 },

  row2: { display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  errorMsg: { fontSize: 12, color: '#e53e3e', marginTop: 2 },

  dropWrap: { position: 'relative' },
  dropTrigger: {
    border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0 14px',
    height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    cursor: 'pointer', background: '#fff', userSelect: 'none', transition: 'border-color .2s',
  },
  selectedDisplay: { display: 'flex', alignItems: 'center', gap: 8 },
  dropMenu: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
    background: '#fff', border: '1.5px solid #e8e8e8',
    borderRadius: 10, overflow: 'hidden', zIndex: 300,
    boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
    maxHeight: 220, overflowY: 'auto',
  },
  dropItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', cursor: 'pointer',
    fontSize: 14, color: '#374151', transition: 'background .12s',
  },
  dropItemSelected: { background: '#e8f7d8', color: '#1f7a5e', fontWeight: 500 },
  itemIcon: {
    width: 28, height: 28, borderRadius: 7,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, flexShrink: 0,
  },

  discountWrap: { position: 'relative' },
  discountInput: {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10,
    padding: '0 36px 0 14px', height: 44,
    fontSize: 18, fontWeight: 600, color: '#1a202c', outline: 'none',
    transition: 'border-color .2s', boxSizing: 'border-box',
  },
  discountSuffix: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    color: '#9ca3af', fontSize: 15, fontWeight: 500,
  },

  dateInput: {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10,
    padding: '0 12px', height: 44, fontSize: 14, color: '#1a202c',
    outline: 'none', transition: 'border-color .2s', background: '#fff',
    boxSizing: 'border-box',
  },

  footer: { display: 'flex', justifyContent: 'flex-end' },
  confirmBtn: {
    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '12px 32px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    transition: 'transform .2s, box-shadow .2s',
    display: 'flex', alignItems: 'center', gap: 8,
    minWidth: 180, justifyContent: 'center',
  },
  confirmBtnLoading: { opacity: 0.85, cursor: 'not-allowed' },
  confirmBtnSuccess: { background: '#38a169' },
  spinnerWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  spinner: {
    width: 15, height: 15,
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: '#fff', borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
}

export default Discounts