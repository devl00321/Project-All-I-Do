import React, { useState } from 'react';
import { B, SERVICES } from '../../constants';
import { Badge } from '../../components/Common';

export default function Services({ onBook }) {
  const [search, setSearch] = useState("");
  const filtered = SERVICES.filter(s => s.label.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="page">
      <div className="section-title">Our Services</div>
      <div className="section-sub">9 categories · Verified local workers</div>
      <div style={{ position:"relative", maxWidth:400, marginBottom:28 }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
          fontSize:16, color:B.muted }}>🔍</span>
        <input className="fi" placeholder="Search services…" value={search}
          style={{ paddingLeft:46 }} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {filtered.map(s => (
          <div key={s.id} className="svc-card" onClick={()=>onBook(s)}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ width:52, height:52, borderRadius:16,
                background:`${s.color}18`, border:`1.5px solid ${s.color}33`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{s.emoji}</div>
              <Badge color={B.ok}>⚡ {s.eta}</Badge>
            </div>
            <div style={{ fontWeight:700, fontSize:16, color:B.ink }}>{s.label}</div>
            <div style={{ color:B.inkLight, fontSize:13, lineHeight:1.55 }}>{s.desc}</div>
            <button className="pbtn" style={{ width:"100%", marginTop:4 }}
              onClick={e=>{e.stopPropagation();onBook(s);}}>
              Book Now →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
