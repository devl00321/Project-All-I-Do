import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Home, Wrench, PlusSquare, FileText, MapPin, User, LogOut } from 'lucide-react';

export function Sidebar({ tab, onTab, hasActive, userName = "John Doe", onLogout }) {
  const sidebarRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(".sidebar-brand", { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" })
        .fromTo(".sidebar-section-label", { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, "-=0.2")
        .fromTo(".sidebar-link", { x: -15, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }, "-=0.1")
        .fromTo(".sidebar-footer", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "-=0.1");
    }, sidebarRef);
    return () => ctx.revert();
  }, []);

  const links = [
    { id: "home",     icon: <Home />, label: "Overview" },
    { id: "services", icon: <Wrench />, label: "Services" },
    { id: "book",     icon: <PlusSquare />, label: "New Booking" },
    { id: "bookings", icon: <FileText />, label: "My Bookings" },
    { id: "track",    icon: <MapPin />, label: "Live Track" },
    { id: "profile",  icon: <User />, label: "Profile" },
  ];

  return (
    <aside className="sidebar" ref={sidebarRef}>
      <div className="sidebar-brand">
        <div className="sb-icon">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 13L12 5L20 13M7 11V19H17V11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span className="sb-brand-name">ALLIDO</span>
      </div>

      <div className="sidebar-section-label">Customer Portal</div>
      
      <nav className="sidebar-nav">
        {links.map(l => (
          <div key={l.id} className={`sidebar-link ${tab === l.id ? 'active' : ''}`} onClick={() => onTab(l.id)}>
            {l.icon} 
            {l.label}
            {l.id === "track" && hasActive && (
              <span style={{ marginLeft:"auto", width:8, height:8, borderRadius:"50%",
                background:'var(--mint)', display:"inline-block", position:"relative" }}>
                <span style={{ position:"absolute", inset:0, borderRadius:"50%",
                  background:'var(--mint)', animation:"ping 1.5s ease-out infinite" }}/>
              </span>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={onLogout || (() => onTab('profile'))}>
          <div className="sidebar-user-av">{userName.charAt(0)}</div>
          <div>
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-role">{onLogout ? 'Sign Out' : 'View Profile'}</div>
          </div>
          {onLogout && <LogOut size={14} color="var(--muted-2)" style={{marginLeft:'auto', opacity: 0.7}} />}
        </div>
      </div>
    </aside>
  );
}
