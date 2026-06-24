import React, { useEffect, useRef, useState } from 'react';
import { B, SERVICES, STATS } from '../../constants';
import * as Icons from 'lucide-react';
import gsap from 'gsap';

const ServiceIcon = ({ iconName, color, size = 24 }) => {
  const IconComponent = Icons[iconName];
  if (!IconComponent) return null;
  return <IconComponent size={size} style={{ color }} />;
};

const SUGGESTIONS = [
  {
    id: "ac_repair",
    title: "Summer Special AC Servicing",
    desc: "Blowing warm air? Professional sanitization & gas refilling at flat rates.",
    badge: "15% OFF",
    color: "#0EA5E9",
    actionText: "Book AC Repair",
    icon: "Wind"
  },
  {
    id: "driver",
    title: "Verified Personal Driver",
    desc: "Need a driver for shopping or outstation? Hire a professional in minutes.",
    badge: "Top Rated",
    color: "#EC4899",
    actionText: "Book Ride Service",
    icon: "Compass"
  },
  {
    id: "cleaning",
    title: "Deep Kitchen Cleaning",
    desc: "Greasy chimney or dirty tiles? Get a thorough, sparkling chemical deep clean.",
    badge: "Best Seller",
    color: "#10B981",
    actionText: "Book Cleaning",
    icon: "Sparkles"
  }
];

export default function Home({ onBook, onTab, hasActive, bookingHistory = [] }) {
  const [search, setSearch] = useState("");
  const homeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(".home-banner-active", { opacity: 0, y: -20, duration: 0.4 })
        .from(".search-section", { opacity: 0, y: 10, duration: 0.4 }, "-=0.2")
        .from(".dash-card", { opacity: 0, y: 15, duration: 0.4, stagger: 0.1 }, "-=0.2")
        .from(".category-card", { opacity: 0, scale: 0.95, duration: 0.4, stagger: 0.04, ease: "power2.out" }, "-=0.2")
        .from(".metric-card", { opacity: 0, y: 20, duration: 0.4, stagger: 0.08, ease: "power2.out" }, "-=0.2");
    }, homeRef);
    return () => ctx.revert();
  }, []);

  const filtered = SERVICES.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase()) ||
    s.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={homeRef}>
      {/* Active Booking Banner */}
      {hasActive && (
        <div className="home-banner-active mb-6">
          <button
            onClick={() => onTab("track")}
            className="w-full bg-gradient-to-r border-none rounded-2xl p-4 flex justify-between items-center cursor-pointer shadow-md transition duration-200"
            style={{ boxShadow: `0 6px 20px rgba(93, 202, 165, 0.25)` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🛠️</div>
              <div className="text-left">
                <div className="text-white font-bold text-[15px]">Active Booking in Progress</div>
                <div className="text-white/80 text-[12px]">Your local service expert is en route. Tap to track live status.</div>
              </div>
            </div>
            <div className="text-white font-bold text-[13px] bg-white/20 rounded-lg px-4 py-2 hover:bg-white/30 transition duration-150">
              Track Live →
            </div>
          </button>
        </div>
      )}

      {/* Hero Header & Search Bar */}
      <div className="search-section text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2" style={{fontFamily:"'Fraunces', serif"}}>Find Reliable Services</h1>
        <p className="text-ink-light text-sm mb-6">Verified local professionals at your doorstep within 45 minutes.</p>
        <div className="relative w-full shadow-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted">🔍</span>
          <input
            type="text"
            className="field-input pl-12 pr-4 py-3.5"
            style={{ borderRadius: 'var(--r-xl)', fontSize: '15px' }}
            placeholder="Search for plumber, electrician, AC repair..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {search ? (
        /* Category Discovery Grid for Searches */
        <div className="mb-8 dash-card" style={{padding: '24px'}}>
          <div className="dash-card-head" style={{padding: 0, borderBottom: 'none', marginBottom: '16px'}}>
            <h3>Search Results ({filtered.length})</h3>
          </div>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map(s => (
                <div key={s.id} onClick={() => onBook(s)} className="category-card">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1" style={{ backgroundColor: `${s.color}15`, border: `1.5px solid ${s.color}25` }}>
                    <ServiceIcon iconName={s.icon} color={s.color} size={26} />
                  </div>
                  <div className="text-sm font-bold text-ink">{s.label}</div>
                  <div className="text-[11px] text-muted">{s.eta}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icons.Search />
              <p>No services matching "{search}" found. Try another search.</p>
            </div>
          )}
        </div>
      ) : (
        /* PERSONALIZED HOME SECTIONS */
        <>
          <div className="dash-two-col mb-8" style={{gridTemplateColumns: '2fr 1fr'}}>
            {/* Section: Suggestions for You */}
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>Suggestions For You</h3>
              </div>
              <div style={{padding: '20px', display: 'flex', gap: '16px', overflowX: 'auto'}}>
                {SUGGESTIONS.map(item => {
                  const targetService = SERVICES.find(s => s.id === item.id);
                  return (
                    <div key={item.id} className="card" style={{ padding: '20px', flex: '0 0 260px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                      <div className="badge" style={{ position: 'absolute', top: '16px', right: '16px', background: `${item.color}15`, color: item.color }}>
                        {item.badge}
                      </div>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                        <ServiceIcon iconName={item.icon} color={item.color} size={20} />
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>{item.title}</h3>
                      <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: '1.5', flex: 1, marginBottom: '16px' }}>{item.desc}</p>
                      <button onClick={() => targetService && onBook(targetService)} className="gbtn" style={{ width: '100%' }}>
                        {item.actionText} →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section: Recent Bookings */}
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>Recent Bookings</h3>
              </div>
              <div className="activity-feed">
                {bookingHistory.length > 0 ? (
                  bookingHistory.slice(0, 3).map(bk => {
                    const s = SERVICES.find(srv => srv.id === bk.serviceId) || SERVICES.find(srv => srv.label === bk.service);
                    return (
                      <div key={bk.id} className="activity-item" style={{alignItems: 'center'}}>
                        <div className="metric-icon-wrap" style={{width: 36, height: 36, marginBottom: 0, background: `${s?.color || B.mint}15`}}>
                          <ServiceIcon iconName={s?.icon || "Wrench"} color={s?.color || B.mint} size={18} />
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">{bk.service}</div>
                          <div className="activity-sub">{bk.date} · {bk.worker}</div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <div style={{fontWeight: 700, fontSize: '13px', color: 'var(--mint-dark)'}}>{bk.amount}</div>
                          <button onClick={() => s && onBook(s)} className="assign-btn" style={{padding: '2px 8px', fontSize: '10px', marginTop: '4px'}}>Rebook</button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <Icons.FileText />
                    <p>No past bookings found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Explore All Services */}
          <div className="dash-card mb-8">
            <div className="dash-card-head">
              <h3>Explore Categories</h3>
            </div>
            <div style={{padding: '20px'}} className="grid grid-cols-4 gap-4">
              {SERVICES.map(s => (
                <div key={s.id} onClick={() => onBook(s)} className="category-card animate-hover">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1" style={{ backgroundColor: `${s.color}15`, border: `1.5px solid ${s.color}25` }}>
                    <ServiceIcon iconName={s.icon} color={s.color} size={26} />
                  </div>
                  <div className="text-sm font-bold text-ink">{s.label}</div>
                  <div className="text-[11px] text-muted">{s.eta}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Quick Stats Summary using metric-grid */}
      <div className="metric-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
        {STATS.map((s, idx) => {
          const mColors = [
            { c: 'var(--sky)', bg: 'rgba(56,189,248,.15)' },
            { c: 'var(--mint)', bg: 'rgba(93,202,165,.15)' },
            { c: 'var(--amber)', bg: 'rgba(245,158,11,.15)' },
            { c: 'var(--coral)', bg: 'rgba(226,114,91,.15)' },
          ];
          const mc = mColors[idx % mColors.length];
          return (
            <div key={s.label} className="metric-card" style={{'--mc-color': mc.c, '--mc-bg': mc.bg}}>
              <div className="metric-icon-wrap"><ServiceIcon iconName={s.icon} color={mc.c} size={18}/></div>
              <div className="metric-label">{s.label}</div>
              <div className="metric-value" style={{fontSize: '1.5rem'}}>{s.val}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
