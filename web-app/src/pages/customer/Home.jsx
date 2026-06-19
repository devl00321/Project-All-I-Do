import React, { useEffect, useRef, useState } from 'react';
import { B, SERVICES, STATS } from '../../constants';
import { Badge } from '../../components/Common';
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
        .from(".suggestions-section", { opacity: 0, y: 15, duration: 0.4 }, "-=0.2")
        .from(".recent-section", { opacity: 0, y: 15, duration: 0.4 }, "-=0.3")
        .from(".category-grid-title", { opacity: 0, y: 15, duration: 0.3 }, "-=0.3")
        .from(".category-card", { opacity: 0, scale: 0.95, duration: 0.4, stagger: 0.04, ease: "power2.out" }, "-=0.2")
        .from(".stat-card", { opacity: 0, y: 20, duration: 0.4, stagger: 0.08, ease: "power2.out" }, "-=0.2");
    }, homeRef);
    return () => ctx.revert();
  }, []);

  const filtered = SERVICES.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase()) ||
    s.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleInstantRide = () => {
    const driverService = SERVICES.find(s => s.id === 'driver');
    if (driverService) onBook(driverService);
  };

  const handleEmergencyRepair = () => {
    const electricianService = SERVICES.find(s => s.id === 'electrician');
    if (electricianService) onBook(electricianService);
  };

  return (
    <div className="page" ref={homeRef}>
      {/* Active Booking Banner */}
      {hasActive && (
        <div className="home-banner-active mb-6">
          <button
            onClick={() => onTab("track")}
            className="w-full bg-gradient-to-r from-mint to-mint-dark border-none rounded-2xl p-4 flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg transition duration-200"
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
        <h1 className="text-3xl font-bold text-ink mb-2">Find Reliable Services in Suri</h1>
        <p className="text-ink-light text-sm mb-6">Verified local professionals at your doorstep within 45 minutes.</p>
        <div className="relative w-full shadow-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted">🔍</span>
          <input
            type="text"
            className="fi pl-12 pr-4 py-3.5 rounded-2xl text-[15px] border border-brd focus:border-mint"
            placeholder="Search for plumber, electrician, AC repair..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* SEARCH MODE vs HOME MODE */}
      {search ? (
        /* Category Discovery Grid for Searches */
        <div className="mb-8">
          <h2 className="category-grid-title text-[18px] font-bold text-ink mb-4 text-left">
            Search Results ({filtered.length})
          </h2>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map(s => (
                <div
                  key={s.id}
                  onClick={() => onBook(s)}
                  className="category-card"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
                    style={{ backgroundColor: `${s.color}15`, border: `1.5px solid ${s.color}25` }}
                  >
                    <ServiceIcon iconName={s.icon} color={s.color} size={26} />
                  </div>
                  <div className="text-sm font-bold text-ink">{s.label}</div>
                  <div className="text-[11px] text-muted">{s.eta}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-brd rounded-2xl text-muted text-sm">
              No services matching "{search}" found. Try another search.
            </div>
          )}
        </div>
      ) : (
        /* PERSONALIZED HOME SECTIONS */
        <>
          {/* Section: Suggestions for You */}
          <div className="suggestions-section mb-8">
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: B.ink, marginBottom: '14px', textAlign: 'left' }}>Suggestions For You</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SUGGESTIONS.map(item => {
                const targetService = SERVICES.find(s => s.id === item.id);
                return (
                  <div 
                    key={item.id} 
                    className="card" 
                    style={{ 
                      padding: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start', 
                      textAlign: 'left',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Badge */}
                    <div style={{ position: 'absolute', top: '16px', right: '16px', background: `${item.color}15`, color: item.color, fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px' }}>
                      {item.badge}
                    </div>

                    {/* Icon */}
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                      <ServiceIcon iconName={item.icon} color={item.color} size={20} />
                    </div>

                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: B.ink, marginBottom: '6px' }}>{item.title}</h3>
                    <p style={{ fontSize: '11px', color: B.muted, lineHeight: '1.5', flex: 1, marginBottom: '16px' }}>{item.desc}</p>
                    
                    <button 
                      onClick={() => targetService && onBook(targetService)}
                      className="pbtn outline"
                      style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', width: '100%' }}
                    >
                      {item.actionText} →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Recent Bookings */}
          <div className="recent-section mb-8">
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: B.ink, marginBottom: '14px', textAlign: 'left' }}>Recent Bookings</h2>
            {bookingHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bookingHistory.slice(0, 3).map(bk => {
                  const s = SERVICES.find(srv => srv.id === bk.serviceId) || SERVICES.find(srv => srv.label === bk.service);
                  return (
                    <div 
                      key={bk.id} 
                      className="booking-row" 
                      style={{ 
                        justifyContent: 'space-between', 
                        padding: '16px 20px', 
                        background: '#fff' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s?.color || B.mint}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ServiceIcon iconName={s?.icon || "Wrench"} color={s?.color || B.mint} size={20} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: B.ink }}>{bk.service}</span>
                            <span style={{ fontSize: '10px', background: B.bg, color: B.muted, padding: '2px 6px', borderRadius: '4px' }}>{bk.id}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: B.muted, marginTop: '2px' }}>
                            {bk.date} · Partner: {bk.worker || "Assigned Partner"}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: B.mint }}>{bk.amount}</div>
                          <div style={{ fontSize: '10px', color: B.muted }}>Paid via {bk.paymentMethod || "UPI"}</div>
                        </div>
                        <button 
                          onClick={() => s && onBook(s)}
                          className="pbtn" 
                          style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px' }}
                        >
                          Rebook
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card text-center" style={{ padding: '32px 20px' }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📋</span>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: B.ink }}>No past bookings found</h3>
                <p style={{ fontSize: '11px', color: B.muted, marginTop: '4px' }}>Your completed and re-booked services will appear here.</p>
              </div>
            )}
          </div>

          {/* Section: Explore All Services */}
          <div className="mb-8">
            <h2 className="category-grid-title text-[18px] font-bold text-ink mb-4 text-left">Explore Categories</h2>
            <div className="grid grid-cols-3 gap-4">
              {SERVICES.map(s => (
                <div
                  key={s.id}
                  onClick={() => onBook(s)}
                  className="category-card animate-hover"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
                    style={{ backgroundColor: `${s.color}15`, border: `1.5px solid ${s.color}25` }}
                  >
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

      {/* Quick Stats Summary */}
      <div className="stat-cards-container grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="stat-card bg-white border border-brd rounded-2xl p-5 flex flex-col items-center text-center">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', background: `${s.color}15`, marginBottom: '10px' }}>
              <ServiceIcon iconName={s.icon} color={s.color} size={22} />
            </div>
            <span className="text-[20px] font-bold text-ink">{s.val}</span>
            <span className="text-xs text-muted mt-1">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
