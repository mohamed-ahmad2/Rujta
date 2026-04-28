import React, { useState, useMemo } from 'react'

const ALL_DRUGS = [
  { name:"Ceftriaxone Sodium", sku:"SKU-99283-A", mfr:"Sandoz Pharma", category:"ANTIBIOTIC", categoryClass:"antibiotic", submittedBy:"Pharmacist Lee", strength:"1g Injection", storage:"Store at 2°C to 8°C (Refrigerate)", storageColor:"#2e7d32", notes:'Requested for central database addition. We have received several orders for this specific manufacturer\'s variant. Clinical efficacy verified against hospital formulary.', pharmacist:"Pharmacist Daniel Lee", time:"Submitted 18 hours ago", avatar:"DL", pillColor:"#c8956a" },
  { name:"Metformin HCL", sku:"SKU-44102-M", mfr:"Novartis", category:"ANTIDIABETIC", categoryClass:"antidiabetic", submittedBy:"Pharmacist Chen", strength:"500mg Tablet", storage:"Store below 25°C (Room Temperature)", storageColor:"#1565c0", notes:'High demand antidiabetic medication. Multiple branches have requested this formulation. Standard first-line treatment for Type 2 Diabetes per clinical guidelines.', pharmacist:"Pharmacist Chen Wei", time:"Submitted 5 hours ago", avatar:"CW", pillColor:"#7cb3e0" },
  { name:"Lisinopril", sku:"SKU-11094-B", mfr:"Pfizer", category:"ACE INHIBITOR", categoryClass:"ace", submittedBy:"Pharmacist Wright", strength:"10mg Tablet", storage:"Store below 30°C, protect from moisture", storageColor:"#e65100", notes:'ACE inhibitor for hypertension management. Pfizer variant requested specifically due to patient tolerability data from our cardiology unit.', pharmacist:"Pharmacist Wright", time:"Submitted 2 days ago", avatar:"PW", pillColor:"#f0b070" },
  { name:"Atorvastatin Calcium", sku:"SKU-66382-L", mfr:"Mylan", category:"STATIN", categoryClass:"statin", submittedBy:"Pharmacist Lee", strength:"20mg Tablet", storage:"Store at 20°C to 25°C (Room Temperature)", storageColor:"#6a1b9a", notes:'Statin therapy essential addition. Mylan generic requested to reduce patient cost burden. Bioequivalence verified against brand-name Lipitor.', pharmacist:"Pharmacist Daniel Lee", time:"Submitted 3 days ago", avatar:"DL", pillColor:"#b39ddb" },
  { name:"Amoxicillin Trihydrate", sku:"SKU-33291-C", mfr:"GSK", category:"ANTIBIOTIC", categoryClass:"antibiotic", submittedBy:"Pharmacist Nour", strength:"500mg Capsule", storage:"Store below 25°C in dry place", storageColor:"#2e7d32", notes:'Broad-spectrum antibiotic commonly requested across all branches. GSK formulation preferred for consistent quality control.', pharmacist:"Pharmacist Nour Ali", time:"Submitted 1 day ago", avatar:"NA", pillColor:"#a5d6a7" },
  { name:"Amlodipine Besylate", sku:"SKU-77103-D", mfr:"Pfizer", category:"CALCIUM BLOCKER", categoryClass:"ace", submittedBy:"Pharmacist Hassan", strength:"5mg Tablet", storage:"Store below 30°C", storageColor:"#e65100", notes:'Calcium channel blocker for hypertension. High patient demand reported in multiple branches. Well-tolerated with minimal side effects.', pharmacist:"Pharmacist Hassan Omar", time:"Submitted 4 days ago", avatar:"HO", pillColor:"#ffcc80" },
]

const badgeStyles = {
  antibiotic:   { background:"#e8f5e0", color:"#3a7d1c" },
  antidiabetic: { background:"#e3f2fd", color:"#1565c0" },
  ace:          { background:"#fff3e0", color:"#e65100" },
  statin:       { background:"#f3e5f5", color:"#6a1b9a" },
}

const PER_PAGE = 4

// ─── Notification Toast ───────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = type === 'success'
    ? { bg: '#f0fdf4', border: '#86efac', icon: '✓', iconBg: '#22c55e', text: '#166534' }
    : type === 'error'
    ? { bg: '#fef2f2', border: '#fca5a5', icon: '!', iconBg: '#ef4444', text: '#991b1b' }
    : { bg: '#fffbeb', border: '#fcd34d', icon: '⚠', iconBg: '#f59e0b', text: '#92400e' }

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '10px',
      background: colors.bg, border: `1px solid ${colors.border}`,
      borderRadius: '10px', padding: '12px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      animation: 'slideIn 0.3s ease',
      maxWidth: '320px',
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(60px); opacity:0 } to { transform: translateX(0); opacity:1 } }`}</style>
      <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:colors.iconBg, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, flexShrink:0 }}>{colors.icon}</div>
      <span style={{ fontSize:'13px', color:colors.text, fontWeight:500 }}>{message}</span>
      <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:colors.text, fontSize:'16px', lineHeight:1, marginLeft:'4px', opacity:0.6 }}>×</button>
    </div>
  )
}

// ─── Notifications Panel ──────────────────────────────────────────────────────
function NotificationsPanel({ notifications, onClose }) {
  return (
    <div style={{
      position: 'absolute', top: '48px', right: '0', zIndex: 100,
      background: '#fff', border: '0.5px solid #e0e0d8', borderRadius: '10px',
      width: '300px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #f0f0e8', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:'13px', fontWeight:600, color:'#1a1a1a' }}>Notifications</span>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#aaa', fontSize:'18px' }}>×</button>
      </div>
      {notifications.length === 0 ? (
        <div style={{ padding:'24px', textAlign:'center', color:'#bbb', fontSize:'12px' }}>No notifications yet</div>
      ) : (
        notifications.map((n, i) => (
          <div key={i} style={{ padding:'12px 16px', borderBottom: i < notifications.length-1 ? '0.5px solid #f0f0e8' : 'none', display:'flex', gap:'10px', alignItems:'flex-start' }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: n.type==='success'?'#22c55e':'#ef4444', marginTop:'4px', flexShrink:0 }}/>
            <div>
              <div style={{ fontSize:'12px', color:'#333', fontWeight:500 }}>{n.message}</div>
              <div style={{ fontSize:'10px', color:'#bbb', marginTop:'2px' }}>{n.time}</div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ApprovalQueue() {
  const [drugs, setDrugs] = useState(ALL_DRUGS)
  const [selected, setSelected] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const [approving, setApproving] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [emergencyText, setEmergencyText] = useState('')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const addNotification = (message, type) => {
    const time = new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })
    setNotifications(prev => [{ message, type, time }, ...prev])
  }

  // ── Search + Filter ──
  const filtered = useMemo(() => {
    if (!searchQ.trim()) return drugs
    const q = searchQ.toLowerCase()
    return drugs.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.mfr.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.submittedBy.toLowerCase().includes(q) ||
      d.sku.toLowerCase().includes(q)
    )
  }, [drugs, searchQ])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const d = selected !== null ? drugs.find(dr => dr.sku === selected) : null

  const handleRowClick = (sku) => setSelected(sku)
  const handleClose = () => setSelected(null)

  // ── Approve ──
  const handleApprove = async () => {
    if (!d) return
    setApproving(true)
    await new Promise(r => setTimeout(r, 900))
    setDrugs(prev => prev.filter(dr => dr.sku !== d.sku))
    setSelected(null)
    showToast(`✅ "${d.name}" approved and added to database!`, 'success')
    addNotification(`"${d.name}" approved and added to database`, 'success')
    setApproving(false)
  }

  // ── Emergency Override ──
  const handleEmergencySubmit = () => {
    if (!emergencyText.trim()) return
    showToast('⚠️ Emergency override submitted for review', 'warning')
    addNotification('Emergency override request submitted', 'warning')
    setEmergencyText('')
    setShowEmergency(false)
  }

  const handleSearchChange = (e) => {
    setSearchQ(e.target.value)
    setPage(1)
    setSelected(null)
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"620px", background:"#f5f5f0", borderRadius:"12px", overflow:"hidden", border:"0.5px solid #e0e0d8", fontFamily:"-apple-system,'Helvetica Neue',sans-serif", position:'relative' }}>

      {/* ── Topbar ── */}
      <div style={{ background:"#fff", borderBottom:"0.5px solid #e0e0d8", padding:"10px 20px", display:"flex", alignItems:"center", gap:"12px" }}>
        {/* Search — شغال */}
        <div style={{ flex:1, background:"#f5f5f0", border:"0.5px solid #e0e0d8", borderRadius:"8px", padding:"7px 12px", fontSize:"12px", color:"#999", display:"flex", alignItems:"center", gap:"8px" }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#bbb" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input
            value={searchQ}
            onChange={handleSearchChange}
            placeholder="Search requests..."
            style={{ background:'transparent', border:'none', outline:'none', fontSize:'12px', color:'#333', width:'100%' }}
          />
          {searchQ && (
            <button onClick={() => { setSearchQ(''); setPage(1) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#bbb', fontSize:'14px', lineHeight:1, padding:0 }}>×</button>
          )}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"8px", position:'relative' }}>
          {/* Notification Bell — شغال */}
          <div style={{ position:'relative' }}>
            <button
              onClick={() => setShowNotif(v => !v)}
              style={{ width:"30px", height:"30px", borderRadius:"6px", border:"0.5px solid #e0e0d8", display:"flex", alignItems:"center", justifyContent:"center", background:"#fff", cursor:'pointer' }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2a5 5 0 00-5 5v3l-1 1v1h12v-1l-1-1V7a5 5 0 00-5-5z" stroke="#666" strokeWidth="1.2"/><path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="#666" strokeWidth="1.2"/></svg>
              {notifications.length > 0 && (
                <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#e53935", position:"absolute", top:"5px", right:"5px" }}/>
              )}
            </button>
            {showNotif && (
              <NotificationsPanel notifications={notifications} onClose={() => setShowNotif(false)} />
            )}
          </div>

          {/* Info icon — شغال */}
          <button
            title="About this queue"
            onClick={() => showToast('Approval Queue v2.1 — Medication Database Management', 'success')}
            style={{ width:"30px", height:"30px", borderRadius:"6px", border:"0.5px solid #e0e0d8", display:"flex", alignItems:"center", justifyContent:"center", background:"#fff", cursor:'pointer' }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#666" strokeWidth="1.2"/><path d="M8 7v4M8 5v.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>

          <div style={{ padding:"5px 12px", border:"0.5px solid #e0e0d8", borderRadius:"6px", fontSize:"12px", color:"#555", background:"#fff" }}>Support</div>

          {/* Emergency Override — شغال */}
          <button
            onClick={() => setShowEmergency(true)}
            style={{ padding:"5px 12px", border:"1.5px solid #e53935", borderRadius:"6px", fontSize:"12px", color:"#e53935", fontWeight:500, background:"#fff", cursor:'pointer' }}
          >
            Emergency Override
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* Queue Panel */}
        <div style={{ flex:1, padding:"20px", overflowY:"auto" }}>
          <div style={{ fontSize:"22px", fontWeight:700, color:"#1a1a1a", marginBottom:"4px" }}>Approval Queue</div>
          <div style={{ fontSize:"12px", color:"#888", marginBottom:"18px" }}>
            Review and approve new medication requests to add them to the central database.
            {searchQ && <span style={{ color:'#4caf50', marginLeft:'8px' }}>Showing results for "{searchQ}"</span>}
          </div>

          <div style={{ background:"#fff", borderRadius:"10px", border:"0.5px solid #e0e0d8", overflow:"hidden" }}>
            {/* Table Header */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 1.3fr 1.3fr", padding:"10px 16px", background:"#fafaf7", borderBottom:"0.5px solid #e0e0d8" }}>
              {["Drug Name","Manufacturer","Category","Submitted By"].map(h => (
                <div key={h} style={{ fontSize:"10px", fontWeight:600, color:"#999", letterSpacing:"0.8px", textTransform:"uppercase" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {pageData.length === 0 ? (
              <div style={{ padding:'40px', textAlign:'center', color:'#bbb', fontSize:'13px' }}>
                No results found for "{searchQ}"
              </div>
            ) : pageData.map((drug, i) => (
              <div key={drug.sku} onClick={() => handleRowClick(drug.sku)}
                style={{
                  display:"grid", gridTemplateColumns:"2fr 1.5fr 1.3fr 1.3fr",
                  padding:"14px 16px",
                  borderBottom: i < pageData.length-1 ? "0.5px solid #f0f0e8" : "none",
                  cursor:"pointer", alignItems:"center",
                  background: selected === drug.sku ? "#f0f8e8" : "transparent",
                  transition:"background 0.12s"
                }}>
                <div>
                  <div style={{ fontSize:"13px", fontWeight:500, color:"#1a1a1a" }}>{drug.name}</div>
                  <div style={{ fontSize:"10px", color:"#bbb", marginTop:"2px" }}>{drug.sku}</div>
                </div>
                <div style={{ fontSize:"12px", color:"#555" }}>{drug.mfr}</div>
                <div>
                  <span style={{ display:"inline-block", padding:"3px 8px", borderRadius:"4px", fontSize:"10px", fontWeight:600, letterSpacing:"0.5px", ...badgeStyles[drug.categoryClass] }}>{drug.category}</span>
                </div>
                <div style={{ fontSize:"12px", color:"#555" }}>{drug.submittedBy}</div>
              </div>
            ))}

            {/* Footer + Pagination */}
            <div style={{ padding:"10px 16px", background:"#fafaf7", borderTop:"0.5px solid #e0e0d8", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:"11px", color:"#aaa", letterSpacing:"0.5px", textTransform:"uppercase" }}>
                Showing {pageData.length} of {filtered.length} {searchQ ? 'results' : 'pending requests'}
              </div>
              <div style={{ display:"flex", gap:"4px", alignItems:'center' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p-1))}
                  disabled={page === 1}
                  style={{ width:"24px", height:"24px", border:"0.5px solid #e0e0d8", borderRadius:"4px", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor: page===1?"default":"pointer", fontSize:"12px", color: page===1?"#ddd":"#666", opacity: page===1?0.5:1 }}
                >‹</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i}
                    onClick={() => setPage(i+1)}
                    style={{ width:"22px", height:"22px", border:"0.5px solid #e0e0d8", borderRadius:"4px", background: page===i+1?"#4caf50":"#fff", color: page===i+1?"#fff":"#666", fontSize:"11px", cursor:"pointer", fontWeight: page===i+1?600:400 }}
                  >{i+1}</button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p+1))}
                  disabled={page === totalPages}
                  style={{ width:"24px", height:"24px", border:"0.5px solid #e0e0d8", borderRadius:"4px", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor: page===totalPages?"default":"pointer", fontSize:"12px", color: page===totalPages?"#ddd":"#666", opacity: page===totalPages?0.5:1 }}
                >›</button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        {d && (
          <div style={{ width:"320px", background:"#fff", borderLeft:"0.5px solid #e0e0d8", display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ padding:"14px 16px", borderBottom:"0.5px solid #e0e0d8", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:"14px", fontWeight:500, color:"#1a1a1a" }}>Request Details</div>
              <button onClick={handleClose} style={{ width:"22px", height:"22px", border:"none", background:"none", cursor:"pointer", color:"#aaa", fontSize:"18px", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>×</button>
            </div>

            {/* Pill Image */}
            <div style={{ margin:"12px 12px 0", borderRadius:"8px", overflow:"hidden", height:"140px", background:"linear-gradient(135deg,#d4c4b0,#b8a090)", position:"relative" }}>
              <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"6px", padding:"16px" }}>
                  {Array(15).fill(0).map((_,i) => (
                    <div key={i} style={{ width:"28px", height:"28px", borderRadius:"50%", background:d.pillColor, boxShadow:"inset -3px -3px 6px rgba(0,0,0,0.2)" }}/>
                  ))}
                </div>
              </div>
              <div style={{ position:"absolute", bottom:"8px", right:"8px", background:"rgba(0,0,0,0.55)", color:"#fff", fontSize:"9px", letterSpacing:"0.8px", padding:"3px 7px", borderRadius:"4px", textTransform:"uppercase" }}>High Resolution Original</div>
            </div>

            {/* Body */}
            <div style={{ flex:1, overflowY:"auto", padding:"14px 16px" }}>
              <div style={{ fontSize:"10px", color:"#aaa", letterSpacing:"0.5px", marginBottom:"3px" }}>Drug Name</div>
              <div style={{ fontSize:"18px", fontWeight:700, color:"#1a1a1a", marginBottom:"14px" }}>{d.name}</div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                <div>
                  <div style={{ fontSize:"10px", color:"#aaa" }}>Manufacturer</div>
                  <div style={{ fontSize:"13px", fontWeight:500, color:"#1a1a1a", marginTop:"2px" }}>{d.mfr}</div>
                </div>
                <div>
                  <div style={{ fontSize:"10px", color:"#aaa" }}>Strength</div>
                  <div style={{ fontSize:"13px", fontWeight:500, color:"#1a1a1a", marginTop:"2px" }}>{d.strength}</div>
                </div>
              </div>

              <div style={{ marginBottom:"14px" }}>
                <div style={{ fontSize:"10px", color:"#aaa" }}>Storage Requirements</div>
                <div style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"13px", fontWeight:500, color:d.storageColor, marginTop:"3px" }}>
                  <span style={{ fontSize:"14px" }}>✳</span>
                  {d.storage}
                </div>
              </div>

              <div style={{ background:"#f8fbf4", borderRadius:"8px", padding:"12px", marginBottom:"14px" }}>
                <div style={{ fontSize:"10px", color:"#aaa", letterSpacing:"0.5px", marginBottom:"8px" }}>Pharmacist Notes</div>
                <div style={{ fontSize:"11px", color:"#555", lineHeight:1.6, fontStyle:"italic", marginBottom:"10px" }}>"{d.notes}"</div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <div style={{ width:"26px", height:"26px", borderRadius:"50%", background:"#c8e6a0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", fontWeight:700, color:"#3a7d1c" }}>{d.avatar}</div>
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:500, color:"#333" }}>{d.pharmacist}</div>
                    <div style={{ fontSize:"10px", color:"#bbb" }}>{d.time}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Approve Button */}
            <div style={{ padding:"12px 16px", borderTop:"0.5px solid #e0e0d8" }}>
              <button
                onClick={handleApprove}
                disabled={approving}
                style={{ width:"100%", padding:"12px", background: approving ? "#a5d6a7" : "#4caf50", border:"none", borderRadius:"8px", color:"#fff", fontSize:"14px", fontWeight:600, cursor: approving ? "default" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", transition:"background 0.2s" }}
              >
                {approving ? (
                  <>
                    <div style={{ width:'16px', height:'16px', border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
                    Approving...
                  </>
                ) : (
                  <>
                    <div style={{ width:"18px", height:"18px", borderRadius:"50%", background:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px" }}>✓</div>
                    Approve & Add to Database
                  </>
                )}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          </div>
        )}
      </div>

      {/* ── Emergency Override Modal ── */}
      {showEmergency && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'400px', boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <div>
                <div style={{ fontSize:'16px', fontWeight:700, color:'#c62828' }}>Emergency Override</div>
                <div style={{ fontSize:'11px', color:'#aaa', marginTop:'2px' }}>This will be logged and reviewed by management</div>
              </div>
              <button onClick={() => setShowEmergency(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'20px', color:'#aaa' }}>×</button>
            </div>
            <textarea
              value={emergencyText}
              onChange={e => setEmergencyText(e.target.value)}
              placeholder="Describe the emergency reason for override..."
              style={{ width:'100%', border:'1px solid #e0e0d8', borderRadius:'8px', padding:'10px', fontSize:'12px', height:'100px', resize:'none', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
            />
            <div style={{ display:'flex', gap:'8px', marginTop:'12px', justifyContent:'flex-end' }}>
              <button onClick={() => setShowEmergency(false)} style={{ padding:'8px 16px', border:'1px solid #e0e0d8', borderRadius:'8px', fontSize:'12px', cursor:'pointer', background:'#fff', color:'#555' }}>Cancel</button>
              <button
                onClick={handleEmergencySubmit}
                disabled={!emergencyText.trim()}
                style={{ padding:'8px 16px', background: emergencyText.trim() ? '#e53935':'#ffcdd2', border:'none', borderRadius:'8px', fontSize:'12px', color:'#fff', fontWeight:600, cursor: emergencyText.trim() ? 'pointer':'default' }}
              >Submit Override</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Close notifications panel on outside click */}
      {showNotif && <div style={{ position:'fixed', inset:0, zIndex:99 }} onClick={() => setShowNotif(false)} />}
    </div>
  )
}