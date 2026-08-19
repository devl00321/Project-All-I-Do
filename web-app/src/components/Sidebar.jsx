import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Home, Wrench, PlusSquare, FileText, MapPin, User, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Sidebar({ tab, onTab, hasActive, userName = "User", onLogout, isOpen, onClose }) {
  const sidebarRef = useRef(null);
  const { isDark, setIsDark } = useTheme();
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(".sidebar-brand", { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" })
        .fromTo(".sidebar-section-label", { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, "-=0.2")
        .fromTo(".nav-link", { x: -15, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }, "-=0.1")
        .fromTo(".sidebar-footer", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "-=0.1");
    }, sidebarRef);
    return () => ctx.revert();
  }, []);

  const links = [
    { id: "home",     icon: <Home size={18} />, label: "Overview" },
    { id: "bookings", icon: <FileText size={18} />, label: "My Bookings" },
    { id: "track",    icon: <MapPin size={18} />, label: "Live Track" },
    { id: "profile",  icon: <User size={18} />, label: "Profile" },
  ];

  return (
    <>
    <aside className="customer-sidebar" ref={sidebarRef}>
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '24px 20px', borderBottom: '1px solid var(--brd)' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--mint), var(--mintDeep))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(93,202,165,.35)' }}>
          A
        </div>
        <span style={{ fontFamily: 'Fraunces, serif', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.04em', color: 'var(--ink)' }}>
          ALLIDO
        </span>
      </div>

      <div className="sidebar-section-label" style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.65rem', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', padding: '20px 20px 8px' }}>
        Customer Portal
      </div>
      
      <nav style={{ flex: 1, padding: '10px 0' }}>
        {links.map(l => (
          <button key={l.id} className={`nav-link ${tab === l.id ? 'active' : ''}`} onClick={() => onTab(l.id)}>
            <span className="icon">{l.icon}</span>
            {l.label}
            {l.id === "track" && hasActive && (
              <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: 'var(--mint)', display: "inline-block", position: "relative" }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: 'var(--mint)', animation: "ping 1.5s ease-out infinite" }}/>
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid var(--brd)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          onClick={() => setIsDark(!isDark)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: 'transparent', border: '1.5px solid var(--brd)', cursor: 'pointer', color: 'var(--ink)' }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div 
          onClick={onLogout || (() => onTab('profile'))}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px', borderRadius: '12px', transition: 'background 0.2s', background: 'var(--bg)' }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--mintLight)', color: 'var(--mintDark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontFamily: 'Fraunces, serif' }}>
            {userName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--ink)' }}>{userName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{onLogout ? 'Sign Out' : 'View Profile'}</div>
          </div>
          {onLogout && <LogOut size={16} color="var(--muted)" />}
        </div>
      </div>
    </aside>
    {isOpen && <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />}
    </>
  );
}
