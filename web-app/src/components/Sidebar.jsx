import React, { useEffect, useRef } from 'react';
import { B } from '../constants';
import { AllidoLogo } from './Common';
import gsap from 'gsap';

export function Sidebar({ tab, onTab, hasActive }) {
  const sidebarRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(".logo-area", { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" })
        .fromTo(".location-pill", { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, "-=0.2")
        .fromTo(".nav-link", { x: -15, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }, "-=0.1")
        .fromTo(".footer-area", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "-=0.1");
    }, sidebarRef);
    return () => ctx.revert();
  }, []);

  const links = [
    { id:"home",     icon:"🏠", label:"Home" },
    { id:"services", icon:"🔧", label:"Services" },
    { id:"book",     icon:"➕", label:"New Booking" },
    { id:"bookings", icon:"📋", label:"My Bookings" },
    { id:"track",    icon:"📍", label:"Live Track" },
    { id:"profile",  icon:"👤", label:"Profile" },
  ];
  return (
    <aside className="sidebar" ref={sidebarRef}>
      {/* Logo */}
      <div className="logo-area" style={{ padding:"24px 20px 16px", display:"flex", alignItems:"center", gap:12,
        borderBottom:`1.5px solid ${B.brd}` }}>
        <AllidoLogo size={38}/>
        <div>
          <div style={{ fontFamily:"'Lexend',sans-serif", fontSize:22, fontWeight:600, color:B.ink, letterSpacing:-.5 }}>
            All<span style={{ color: B.mint }}>i</span>Do
          </div>
        </div>
      </div>

      {/* Location pill */}
      <div className="location-pill" style={{ margin:"16px 12px 8px",
        background:B.mintLight, borderRadius:12, padding:"9px 14px",
        display:"flex", alignItems:"center", gap:8, border:`1.5px solid ${B.brd}` }}>
        <span style={{ fontSize:16 }}>📍</span>
        <div>
          <div style={{ fontWeight:600, fontSize:12, color:B.ink }}>Suri, Birbhum</div>
          <div style={{ color:B.inkLight, fontSize:10 }}>West Bengal · 731101</div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding:"8px 0", flex:1 }}>
        {links.map(l => (
          <button key={l.id} className={`nav-link ${tab===l.id?"active":""}`}
            onClick={()=>onTab(l.id)}>
            <span className="icon">{l.icon}</span>
            {l.label}
            {l.id==="track"&&hasActive&&(
              <span style={{ marginLeft:"auto", width:8, height:8, borderRadius:"50%",
                background:B.mint, display:"inline-block", position:"relative" }}>
                <span style={{ position:"absolute", inset:0, borderRadius:"50%",
                  background:B.mint, animation:"ping 1.5s ease-out infinite" }}/>
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="footer-area" style={{ padding:"16px 20px", borderTop:`1.5px solid ${B.brd}`,
        fontSize:11, color:B.muted, lineHeight:1.6 }}>
        ALLIDO v1.0<br/>Made with ❤️ in Birbhum
      </div>
    </aside>
  );
}
