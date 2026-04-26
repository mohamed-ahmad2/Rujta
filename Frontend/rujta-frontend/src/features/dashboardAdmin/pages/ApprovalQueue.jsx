import React, { useState } from 'react'

const drugs = [
  { name:"Ceftriaxone Sodium", sku:"SKU-99283-A", mfr:"Sandoz Pharma", category:"ANTIBIOTIC", categoryClass:"antibiotic", submittedBy:"Pharmacist Lee", strength:"1g Injection", storage:"Store at 2°C to 8°C (Refrigerate)", storageColor:"#2e7d32", notes:'"Requested for central database addition. We have received several orders for this specific manufacturer\'s variant. Clinical efficacy verified against hospital formulary."', pharmacist:"Pharmacist Daniel Lee", time:"Submitted 18 hours ago", avatar:"DL", pillColor:"#c8956a" },
  { name:"Metformin HCL", sku:"SKU-44102-M", mfr:"Novartis", category:"ANTIDIABETIC", categoryClass:"antidiabetic", submittedBy:"Pharmacist Chen", strength:"500mg Tablet", storage:"Store below 25°C (Room Temperature)", storageColor:"#1565c0", notes:'"High demand antidiabetic medication. Multiple branches have requested this formulation. Standard first-line treatment for Type 2 Diabetes per clinical guidelines."', pharmacist:"Pharmacist Chen Wei", time:"Submitted 5 hours ago", avatar:"CW", pillColor:"#7cb3e0" },
  { name:"Lisinopril", sku:"SKU-11094-B", mfr:"Pfizer", category:"ACE INHIBITOR", categoryClass:"ace", submittedBy:"Pharmacist Wright", strength:"10mg Tablet", storage:"Store below 30°C, protect from moisture", storageColor:"#e65100", notes:'"ACE inhibitor for hypertension management. Pfizer variant requested specifically due to patient tolerability data from our cardiology unit."', pharmacist:"Pharmacist Wright", time:"Submitted 2 days ago", avatar:"PW", pillColor:"#f0b070" },
  { name:"Atorvastatin Calcium", sku:"SKU-66382-L", mfr:"Mylan", category:"STATIN", categoryClass:"statin", submittedBy:"Pharmacist Lee", strength:"20mg Tablet", storage:"Store at 20°C to 25°C (Room Temperature)", storageColor:"#6a1b9a", notes:'"Statin therapy essential addition. Mylan generic requested to reduce patient cost burden. Bioequivalence verified against brand-name Lipitor."', pharmacist:"Pharmacist Daniel Lee", time:"Submitted 3 days ago", avatar:"DL", pillColor:"#b39ddb" }
]

const badgeStyles = {
  antibiotic:  { background:"#e8f5e0", color:"#3a7d1c" },
  antidiabetic:{ background:"#e3f2fd", color:"#1565c0" },
  ace:         { background:"#fff3e0", color:"#e65100" },
  statin:      { background:"#f3e5f5", color:"#6a1b9a" },
}

export default function ApprovalQueue() {
  const [selected, setSelected] = useState(null)

  const handleRowClick = (i) => setSelected(i)
  const handleClose = () => setSelected(null)

  const d = selected !== null ? drugs[selected] : null

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"620px", background:"#f5f5f0", borderRadius:"12px", overflow:"hidden", border:"0.5px solid #e0e0d8", fontFamily:"-apple-system,'Helvetica Neue',sans-serif" }}>

      {/* Topbar */}
      <div style={{ background:"#fff", borderBottom:"0.5px solid #e0e0d8", padding:"10px 20px", display:"flex", alignItems:"center", gap:"12px" }}>
        <div style={{ flex:1, background:"#f5f5f0", border:"0.5px solid #e0e0d8", borderRadius:"8px", padding:"7px 12px", fontSize:"12px", color:"#999", display:"flex", alignItems:"center", gap:"8px" }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="#bbb" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Search requests...
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:"30px", height:"30px", borderRadius:"6px", border:"0.5px solid #e0e0d8", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", background:"#fff" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2a5 5 0 00-5 5v3l-1 1v1h12v-1l-1-1V7a5 5 0 00-5-5z" stroke="#666" strokeWidth="1.2"/><path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="#666" strokeWidth="1.2"/></svg>
            <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#e53935", position:"absolute", top:"5px", right:"5px" }}/>
          </div>
          <div style={{ width:"30px", height:"30px", borderRadius:"6px", border:"0.5px solid #e0e0d8", display:"flex", alignItems:"center", justifyContent:"center", background:"#fff" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#666" strokeWidth="1.2"/><path d="M8 7v4M8 5v.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div style={{ padding:"5px 12px", border:"0.5px solid #e0e0d8", borderRadius:"6px", fontSize:"12px", color:"#555", background:"#fff" }}>Support</div>
          <div style={{ padding:"5px 12px", border:"1.5px solid #e53935", borderRadius:"6px", fontSize:"12px", color:"#e53935", fontWeight:500, background:"#fff" }}>Emergency Override</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* Queue Panel */}
        <div style={{ flex:1, padding:"20px", overflowY:"auto" }}>
          <div style={{ fontSize:"22px", fontWeight:700, color:"#1a1a1a", marginBottom:"4px" }}>Approval Queue</div>
          <div style={{ fontSize:"12px", color:"#888", marginBottom:"18px" }}>Review and approve new medication requests to add them to the central database.</div>

          <div style={{ background:"#fff", borderRadius:"10px", border:"0.5px solid #e0e0d8", overflow:"hidden" }}>
            {/* Table Header */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 1.3fr 1.3fr", padding:"10px 16px", background:"#fafaf7", borderBottom:"0.5px solid #e0e0d8" }}>
              {["Drug Name","Manufacturer","Category","Submitted By"].map(h => (
                <div key={h} style={{ fontSize:"10px", fontWeight:600, color:"#999", letterSpacing:"0.8px", textTransform:"uppercase" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {drugs.map((drug, i) => (
              <div key={i} onClick={() => handleRowClick(i)}
                style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 1.3fr 1.3fr", padding:"14px 16px", borderBottom: i < drugs.length-1 ? "0.5px solid #f0f0e8" : "none", cursor:"pointer", alignItems:"center", background: selected===i ? "#f0f8e8" : "transparent", transition:"background 0.12s" }}>
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

            {/* Footer */}
            <div style={{ padding:"10px 16px", background:"#fafaf7", borderTop:"0.5px solid #e0e0d8", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:"11px", color:"#aaa", letterSpacing:"0.5px", textTransform:"uppercase" }}>Showing 4 of 24 pending requests</div>
              <div style={{ display:"flex", gap:"4px" }}>
                {["‹","›"].map(ch => (
                  <div key={ch} style={{ width:"24px", height:"24px", border:"0.5px solid #e0e0d8", borderRadius:"4px", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"12px", color:"#666" }}>{ch}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Details Panel — shows only when a drug is selected */}
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
                <div style={{ fontSize:"11px", color:"#555", lineHeight:1.6, fontStyle:"italic", marginBottom:"10px" }}>{d.notes}</div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <div style={{ width:"26px", height:"26px", borderRadius:"50%", background:"#c8e6a0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", fontWeight:700, color:"#3a7d1c" }}>{d.avatar}</div>
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:500, color:"#333" }}>{d.pharmacist}</div>
                    <div style={{ fontSize:"10px", color:"#bbb" }}>{d.time}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding:"12px 16px", borderTop:"0.5px solid #e0e0d8" }}>
              <button style={{ width:"100%", padding:"12px", background:"#4caf50", border:"none", borderRadius:"8px", color:"#fff", fontSize:"14px", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                <div style={{ width:"18px", height:"18px", borderRadius:"50%", background:"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px" }}>✓</div>
                Approve & Add to Database
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}