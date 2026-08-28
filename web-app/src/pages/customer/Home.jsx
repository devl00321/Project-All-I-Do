import React, { useEffect, useRef, useState } from 'react';
import { B, SERVICES, STATS } from '../../constants';
import * as Icons from 'lucide-react';
import gsap from 'gsap';



const SUGGESTIONS = [
  {
    id: "ac_repair",
    title: "Summer Special AC Servicing",
    desc: "Professional sanitization & gas refilling at flat rates.",
    badge: "15% OFF",
    actionText: "Book AC Repair",
  },
  {
    id: "cleaning",
    title: "Deep Kitchen Cleaning",
    desc: "Thorough, sparkling chemical deep clean for your kitchen.",
    badge: "Best Seller",
    actionText: "Book Cleaning",
  },
  {
    id: "pest_control",
    title: "Complete Pest Control",
    desc: "Safeguard your home with our premium pest treatments.",
    badge: "Top Rated",
    actionText: "Book Pest Control",
  }
];

export default function Home({ onBook, onTab, hasActive, bookingHistory = [] }) {
  const [search, setSearch] = useState("");
  const homeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(".home-banner-active", { opacity: 0, y: -20, duration: 0.4 })
        .from(".hero-content", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" })
        .from(".categories-container", { opacity: 0, y: 30, duration: 0.5, ease: "power3.out" }, "-=0.4")
        .from(".category-item", { opacity: 0, scale: 0.95, duration: 0.4, stagger: 0.05, ease: "power2.out" }, "-=0.2")
        .from(".sections-animate", { opacity: 0, y: 20, duration: 0.5, stagger: 0.1, ease: "power2.out" }, "-=0.2");
    }, homeRef);
    return () => ctx.revert();
  }, []);

  const filtered = SERVICES.filter(s =>
    s.label.toLowerCase().includes(search.toLowerCase()) ||
    s.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: 'transparent' }} ref={homeRef}>
      
      {/* Active Booking Banner */}
      {hasActive && (
        <div className="home-banner-active sticky top-0 z-50 p-4">
          <button
            onClick={() => onTab("track")}
            className="w-full flex items-center justify-between p-4 rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-[1.01]"
            style={{ backgroundColor: 'var(--ink)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <Icons.Activity className="text-white" size={24} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm sm:text-base tracking-wide" style={{ color: 'var(--surface)' }}>Booking in Progress</div>
                <div className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--surface)', opacity: 0.7 }}>Your professional is en route. Tap to track live.</div>
              </div>
            </div>
            <div className="flex items-center gap-2 font-semibold text-sm px-4 py-2 rounded-lg" style={{ color: 'var(--surface)', background: 'rgba(255,255,255,0.1)' }}>
              Track <Icons.ChevronRight size={16} />
            </div>
          </button>
        </div>
      )}

      {/* Hero Section with Video Background */}
      <div className="relative w-full h-[380px] sm:h-[480px] flex flex-col justify-center items-center px-4 overflow-hidden bg-[var(--ink)]">
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
        >
          {/* REPLACE this src with your actual advertisement video, e.g., src="/videos/ad.mp4" */}
          <source src="https://cdn.pixabay.com/vimeo/328940142/cleaning-22687.mp4?width=1280&hash=8e0638531cc2e374be2e0df4a78d2b9921e54911" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-[#242e47]/80 via-[#242e47]/50 to-[#242e47]/90 z-0"></div>
        
        <div className="hero-content relative z-10 w-full max-w-3xl text-center mt-[-40px]">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            Professional Services, <br className="sm:hidden" />Delivered to You.
          </h1>
          <p className="text-base sm:text-lg text-white/90 mb-8 font-medium drop-shadow-md max-w-xl mx-auto">
            Experience verified, top-tier professionals for every home need.
          </p>
          
          <div className="relative w-full max-w-2xl mx-auto shadow-2xl rounded-2xl overflow-hidden flex items-center p-1.5 border-[4px] border-white/20" style={{ background: 'var(--surface)' }}>
            <div className="pl-4" style={{ color: 'var(--inkLight)' }}>
              <Icons.Search size={24} />
            </div>
            <input 
              type="text" 
              className="w-full pl-3 pr-4 py-3.5 sm:py-4 text-base sm:text-lg outline-none font-medium bg-transparent"
              style={{ color: 'var(--ink)' }}
              placeholder="Search for AC repair, plumbing, cleaning..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button 
              className="hidden sm:flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-white transition-colors"
              style={{ backgroundColor: 'var(--mint)' }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 sm:-mt-24 relative z-20">
        
        {/* Categories Section */}
        <div className="categories-container rounded-2xl shadow-xl p-6 sm:p-8 mb-10 border" style={{ background: 'var(--surface)', borderColor: 'var(--brd)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--ink)' }}>
              {search ? `Search Results (${filtered.length})` : 'Explore Premium Services'}
            </h2>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {filtered.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => onBook(s)} 
                  className="category-item group cursor-pointer flex flex-col"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-lg transition-all duration-300 relative" style={{ background: 'var(--mintLight)' }}>
                    <img 
                      src={s.image} 
                      alt={s.label} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                      <span className="text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm border border-white/30" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        Book Now
                      </span>
                    </div>
                  </div>
                  <span className="text-[15px] font-bold text-center transition-colors group-hover:text-[var(--mint)]" style={{ color: 'var(--ink)' }}>
                    {s.label}
                  </span>
                  <span className="text-[12px] font-medium text-center mt-0.5" style={{ color: 'var(--muted)' }}>
                    {s.eta}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Icons.SearchX size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-600">No services found for "{search}"</h3>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms.</p>
            </div>
          )}
        </div>

        {!search && (
          <>
            {/* Value Proposition / Stats */}
            <div className="sections-animate grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 mt-8">
              {STATS.map((s, idx) => {
                const IconComponent = Icons[s.icon] || Icons.CheckCircle;
                return (
                  <div key={idx} className="rounded-xl p-5 flex flex-col items-center justify-center shadow-sm border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--brd)' }}>
                    <div className="w-12 h-12 rounded-full mb-3 flex items-center justify-center" style={{ backgroundColor: 'var(--mintLight)', color: 'var(--mint)' }}>
                      <IconComponent size={24} strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-extrabold" style={{ color: 'var(--ink)' }}>{s.val}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--muted)' }}>{s.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Premium Suggestions */}
            <div className="sections-animate mb-10">
              <h2 className="text-xl sm:text-2xl font-extrabold mb-6" style={{ color: 'var(--ink)' }}>Curated For You</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {SUGGESTIONS.map(item => {
                  const targetService = SERVICES.find(s => s.id === item.id);
                  if (!targetService) return null;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border flex flex-col"
                      style={{ background: 'var(--surface)', borderColor: 'var(--brd)' }}
                    >
                      <div className="h-40 w-full relative overflow-hidden" style={{ background: 'var(--mintLight)' }}>
                        <img src={targetService.image} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: 'var(--ink)', color: 'var(--surface)' }}>
                          {item.badge}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--ink)' }}>{item.title}</h3>
                        <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: 'var(--muted)' }}>{item.desc}</p>
                        <button 
                          onClick={() => onBook(targetService)}
                          className="w-full py-3 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                          style={{ backgroundColor: 'var(--mint)' }}
                        >
                          {item.actionText} <Icons.ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Bookings (Corporate Style) */}
            <div className="sections-animate mb-10">
              <h2 className="text-xl sm:text-2xl font-extrabold mb-6" style={{ color: 'var(--ink)' }}>Your Recent Activity</h2>
              {bookingHistory.length > 0 ? (
                <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--brd)' }}>
                  {bookingHistory.slice(0, 3).map((bk, idx) => {
                    const s = SERVICES.find(srv => srv.id === bk.serviceId) || SERVICES.find(srv => srv.label === bk.service);
                    return (
                      <div 
                        key={bk.id} 
                        className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${idx !== 0 ? 'border-t' : ''}`}
                        style={{ borderColor: 'var(--brd)' }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--mintLight)' }}>
                            {s?.image ? (
                              <img src={s.image} alt={bk.service} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--mintLight)', color: 'var(--mint)' }}>
                                <Icons.CheckCircle size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold text-base" style={{ color: 'var(--ink)' }}>{bk.service}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider" style={{ color: 'var(--inkLight)', background: 'var(--bg)' }}>{bk.id}</span>
                            </div>
                            <div className="text-[13px] font-medium" style={{ color: 'var(--muted)' }}>
                              <Icons.Calendar size={12} className="inline mr-1 -mt-0.5" /> {bk.date} 
                              <span className="mx-2" style={{ color: 'var(--brdMid)' }}>|</span> 
                              <Icons.User size={12} className="inline mr-1 -mt-0.5" /> {bk.worker || "Assigned Partner"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t sm:border-t-0 pt-4 sm:pt-0" style={{ borderColor: 'var(--brd)' }}>
                          <div className="text-left sm:text-right">
                            <div className="font-extrabold text-lg" style={{ color: 'var(--ink)' }}>{bk.amount}</div>
                            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--inkLight)' }}>Paid via {bk.paymentMethod || "UPI"}</div>
                          </div>
                          <button 
                            onClick={() => s && onBook(s)}
                            className="px-5 py-2.5 rounded-lg font-bold text-sm transition-colors border-2"
                            style={{ borderColor: 'var(--mint)', color: 'var(--mint)' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--mint)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--mint)'; }}
                          >
                            Rebook
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl shadow-sm border p-12 text-center flex flex-col items-center justify-center" style={{ background: 'var(--surface)', borderColor: 'var(--brd)' }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--mintLight)' }}>
                    <Icons.History size={28} style={{ color: 'var(--mint)' }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>No past bookings</h3>
                  <p className="text-sm mt-2 max-w-sm" style={{ color: 'var(--muted)' }}>
                    When you book your first premium service, it will appear here for easy rebooking.
                  </p>
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </div>
  );
}
