import React, { useEffect, useRef } from 'react';
import { B, STATS, STEPS, REVIEWS } from '../../constants';
import { Badge, MockMap } from '../../components/Common';
import gsap from 'gsap';

export default function Home({ onBook, onTab, hasActive }) {
  const homeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(".hero-badge", { opacity: 0, y: -10, duration: 0.4 })
        .from(".hero-title", { opacity: 0, y: 40, duration: 0.6, ease: "power3.out" }, "-=0.2")
        .from(".hero-sub", { opacity: 0, y: 20, duration: 0.4 }, "-=0.4")
        .from(".hero-btns", { opacity: 0, y: 15, duration: 0.4 }, "-=0.2")
        .from(".hero-map", { opacity: 0, scale: 0.92, duration: 0.5, ease: "back.out(1.2)" }, "-=0.4")
        .from(".stat-card", { opacity: 0, y: 24, duration: 0.4, stagger: 0.08, ease: "power2.out" }, "-=0.2")
        .from(".step-card", { opacity: 0, x: -24, duration: 0.4, stagger: 0.1, ease: "power2.out" }, "-=0.2")
        .from(".review-card", { opacity: 0, y: 20, duration: 0.4, stagger: 0.09, ease: "power2.out" }, "-=0.2");
    }, homeRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="page" ref={homeRef}>
      {/* Hero */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, marginBottom:40,
        background:`linear-gradient(135deg, ${B.mintLight} 0%, #fff 100%)`,
        border:`1.5px solid ${B.brd}`, borderRadius:24, padding:"40px 44px", alignItems:"center" }}>
        <div>
          <div className="hero-badge" style={{ display: 'inline-block' }}><Badge color={B.mint}>🚀 Now live in Suri, Birbhum</Badge></div>
          <div className="hero-title" style={{ fontFamily:"'Lexend',sans-serif", fontSize:40, fontWeight:600, color:B.ink,
            lineHeight:1.15, margin:"16px 0 14px", letterSpacing:-.5 }}>
            Every home service,<br/>
            <span style={{ color:B.mint }}>on demand.</span>
          </div>
          <div className="hero-sub" style={{ color:B.inkLight, fontSize:15, lineHeight:1.7, marginBottom:28, maxWidth:380 }}>
            Book plumbers, electricians, cleaners, AC technicians and more.
            Verified workers, live tracking, transparent pricing.
          </div>
          <div className="hero-btns" style={{ display:"flex", gap:12 }}>
            <button className="pbtn lg" onClick={()=>onTab("book")}>Book a Service →</button>
            <button className="pbtn outline lg" onClick={()=>onTab("services")}>Browse Services</button>
          </div>
        </div>
        <div className="hero-map">
          <MockMap height={260} workerActive/>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:40 }}>
        {STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
            <div style={{ fontFamily:"'Lexend',sans-serif", fontSize:28, fontWeight:600, color:B.ink }}>{s.val}</div>
            <div style={{ color:B.inkLight, fontSize:13, marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active booking banner */}
      {hasActive && (
        <div style={{ marginBottom:40 }}>
          <button onClick={()=>onTab("track")} style={{
            width:"100%", background:`linear-gradient(135deg, ${B.mint}, ${B.mintDark})`,
            border:"none", borderRadius:18, padding:"18px 28px",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            cursor:"pointer", boxShadow:`0 6px 24px ${B.mint}44`,
            animation:"pulse 2.5s ease-in-out infinite",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,.2)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🔨</div>
              <div style={{ textAlign:"left" }}>
                <div style={{ color:"#fff", fontSize:16, fontWeight:700 }}>Booking In Progress — Plumber</div>
                <div style={{ color:"rgba(255,255,255,.8)", fontSize:13 }}>Rajesh Kumar · En Route · 12 min away</div>
              </div>
            </div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:14,
              background:"rgba(255,255,255,.2)", borderRadius:10, padding:"8px 18px" }}>
              Live Track →
            </div>
          </button>
        </div>
      )}

      {/* How it works */}
      <div style={{ marginBottom:40 }}>
        <div className="section-title">How ALLIDO works</div>
        <div className="section-sub">Book a service in under 2 minutes</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
          {STEPS.map(s => (
            <div key={s.n} className="step-card">
              <div style={{ width:48, height:48, borderRadius:14, flexShrink:0,
                background:B.mintLight, border:`1.5px solid ${B.brd}`,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontFamily:"'Lexend',sans-serif", fontSize:18, fontWeight:600, color:B.mint }}>{s.n}</span>
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:B.ink, marginBottom:4 }}>{s.title}</div>
                <div style={{ color:B.inkLight, fontSize:13 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <div className="section-title">Customer Reviews</div>
        <div className="section-sub">What our customers say</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {REVIEWS.map(r => (
            <div key={r.name} className="review-card">
              <div style={{ display:"flex", gap:2, marginBottom:10 }}>
                {[1,2,3,4,5].map(n=><span key={n} style={{ fontSize:14 }}>⭐</span>)}
              </div>
              <div style={{ color:B.ink, fontSize:14, lineHeight:1.65, marginBottom:14,
                fontStyle:"italic" }}>"{r.text}"</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:B.ink }}>{r.name}</div>
                  <div style={{ color:B.muted, fontSize:11 }}>📍 {r.loc}</div>
                </div>
                <Badge color={B.mint}>{r.svc}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
