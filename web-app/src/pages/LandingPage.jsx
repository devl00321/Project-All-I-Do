import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';

const Reveal = ({ children, className = '', style = {}, as: Component = 'div' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Component ref={ref} className={`reveal ${isVisible ? 'visible' : ''} ${className}`} style={style}>
      {children}
    </Component>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [preloaderGone, setPreloaderGone] = useState(false);
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [countDone, setCountDone] = useState(false);
  
  // Dispatch Card State
  const dispatchStates = [
    {badge:'REQUESTED',badgeBg:'rgba(93,202,165,.15)',badgeCol:'#07845a',fill:'10%',icon:'🔧',iconBg:'rgba(56,189,248,.2)',name:'Leaking kitchen tap',eta:'—',step:0,worker:false},
    {badge:'MATCHED',badgeBg:'rgba(245,158,11,.15)',badgeCol:'#b5790b',fill:'38%',icon:'🔧',iconBg:'rgba(56,189,248,.2)',name:'Leaking kitchen tap',eta:'18 min',step:1,worker:true},
    {badge:'EN ROUTE',badgeBg:'rgba(56,189,248,.15)',badgeCol:'#0e7fae',fill:'70%',icon:'🔧',iconBg:'rgba(93,202,165,.2)',name:'Leaking kitchen tap',eta:'6 min',step:2,worker:true},
    {badge:'DONE ✓',badgeBg:'rgba(93,202,165,.2)',badgeCol:'#07845a',fill:'100%',icon:'✅',iconBg:'rgba(93,202,165,.15)',name:'Leaking kitchen tap',eta:'Arrived',step:3,worker:true},
  ];
  const [dcStateIdx, setDcStateIdx] = useState(0);

  // How It Works State
  const hiwRef = useRef(null);
  const [hiwActive, setHiwActive] = useState(false);
  
  // Page Transition State
  const [transitionState, setTransitionState] = useState({ active: false, x: 0, y: 0, color: '', target: '' });

  // Dark Mode State
  const [isDark, setIsDark] = useState(false);

  // Marquee Reviews
  const reviews = [
    {name:'Priya Mukherjee',loc:'Suri, Birbhum',text:'The plumber tracked like a food delivery app. Fixed my leak in 20 minutes — didn\'t expect that level of polish.',initials:'PM',color:'#0E9F72'},
    {name:'Arjun Mehta',loc:'Bolpur, West Bengal',text:'Booked an electrician at 11pm for a tripped circuit and someone was at my door in 25 minutes. Genuinely impressive.',initials:'AM',color:'#38BDF8'},
    {name:'Sneha Reddy',loc:'Rampurhat',text:'AC stopped working in a heatwave. ALLIDO had a tech out same-day with a transparent quote upfront.',initials:'SR',color:'#F59E0B'},
    {name:'Karthik Das',loc:'Suri Ward 3',text:'I manage a few properties and finding reliable cleaners used to be a nightmare. Now I just tap a button.',initials:'KD',color:'#E2725B'},
    {name:'Ravi Sen',loc:'Kolkata',text:'My car battery died and a mechanic came over and jump-started it. Super professional service.',initials:'RS',color:'#7C6DE8'},
    {name:'Ananya Roy',loc:'Asansol',text:'The app interface is flawless. The whole process feels incredibly premium yet the pricing is very reasonable.',initials:'AR',color:'#07845a'},
  ];

  useEffect(() => {
    // Preloader timeout
    setTimeout(() => setPreloaderGone(true), 700);
  }, []);

  useEffect(() => {
    // Count-up observer
    if (!countRef.current) return;
    const cntIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !countDone) {
          setCountDone(true);
          let start = 0, target = 12400, duration = 1800;
          let step = target / duration * 16;
          const tick = () => {
            start = Math.min(start + step, target);
            setCount(Math.floor(start));
            if (start < target) requestAnimationFrame(tick);
          };
          tick();
        }
      });
    });
    cntIO.observe(countRef.current);
    return () => cntIO.disconnect();
  }, [countDone]);

  useEffect(() => {
    // Dispatch Card Loop
    const interval = setInterval(() => {
      setDcStateIdx(prev => (prev + 1) % dispatchStates.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // How It Works observer
    if (!hiwRef.current) return;
    const hiwIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setHiwActive(true);
          hiwIO.disconnect();
        }
      });
    }, { threshold: 0.25 });
    hiwIO.observe(hiwRef.current);
    return () => hiwIO.disconnect();
  }, []);

  const startTransition = (e, targetUrl, color) => {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    
    setTransitionState({ active: true, x, y, color, target: targetUrl });
    
    setTimeout(() => {
      navigate(targetUrl);
    }, 700); // Wait for transition to mostly finish before route change
  };

  const handleBook = (e) => {
    startTransition(e, '/book', 'var(--mint)');
  };

  const handlePartner = (e) => {
    startTransition(e, '/admin/register', 'var(--ink)');
  };

  const dc = dispatchStates[dcStateIdx];

  return (
    <div className={`landing-page-container ${transitionState.active ? 'exiting' : ''} ${isDark ? 'dark-theme' : ''}`}>
      {/* TRANSITION OVERLAY */}
      <div 
        className={`transition-overlay ${transitionState.active ? 'active' : ''}`}
        style={{
          left: transitionState.x,
          top: transitionState.y,
          background: transitionState.color
        }}
      />

      {/* PRELOADER */}
      {!preloaderGone && (
        <div id="preloader" className={preloaderGone ? 'gone' : ''}>
          <div className="preloader-logo">ALL<span>IDO</span></div>
        </div>
      )}

      {/* NAVIGATION */}
      <div className="nav-shell" id="navShell">
        <div className="wrap">
          <nav className="nav-inner">
            <a href="#top" className="brand">
              <span className="brand-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 13L12 5L20 13M7 11V19H17V11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              ALLIDO
            </a>
            <div className="nav-links">
              <a href="#services">Services</a>
              <a href="#how-it-works">How it works</a>
              <a href="#operators">For operators</a>
              <a href="#reviews">Reviews</a>
            </div>
            <div className="nav-actions">
              <button 
                onClick={() => setIsDark(!isDark)} 
                className="theme-toggle" 
                aria-label="Toggle dark mode"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <a href="#operators" onClick={handlePartner} className="btn btn-ghost hide-mobile">Become a partner</a>
              <a href="#book" onClick={handleBook} className="btn btn-primary">Book a service</a>
            </div>
          </nav>
        </div>
      </div>

      {/* HERO */}
      <header className="hero" id="top">
        <div className="hero-bg"></div>
        <div className="hero-grid-dots"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <div className="wrap">
          <div className="hero-content">
            {/* Copy */}
            <div className="hero-copy">
              <div className="eyebrow-pill">
                <span className="pulse-dot"></span>
                Live in Suri &amp; expanding across West Bengal
              </div>

              <h1 className="hero-headline">
                <span className="word"><span>Your</span></span>
                <span className="word"><span>city's</span></span>
                <span className="word"><span className="hero-accent">best</span></span>
                <span className="word"><span>experts</span></span>
                <br />
                <span className="word"><span className="hero-accent-line">at your doorstep</span></span>
              </h1>

              <p className="hero-sub">Book verified plumbers, electricians, AC techs, and cleaners in under 2 minutes. Track them live. Pay in-app. No surprises.</p>

              <div className="hero-ctas">
                <a href="#book" onClick={handleBook} className="btn btn-primary btn-lg">
                  Book a service
                  <svg className="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#operators" onClick={handlePartner} className="btn btn-ghost btn-lg">Become a partner</a>
              </div>

              <div className="trust-bar">
                <div className="trust-item">
                  <strong ref={countRef}>{count.toLocaleString()}{countDone && count >= 12400 ? '+' : ''}</strong>
                  <span>Jobs completed</span>
                </div>
                <div className="trust-divider"></div>
                <div className="trust-item">
                  <strong>4.9/5</strong>
                  <span>Average rating</span>
                </div>
                <div className="trust-divider"></div>
                <div className="trust-item">
                  <strong>&lt;18 min</strong>
                  <span>Avg. arrival time</span>
                </div>
              </div>
            </div>

            {/* Dispatch Card */}
            <div className="dispatch-stage">
              <div className="card-glow"></div>

              {/* Floating badges */}
              <div className="float-badge float-badge-1">
                <span className="check-circle">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Background verified
              </div>
              <div className="float-badge float-badge-2">
                ⭐ 4.9 rated · 314 jobs
              </div>

              {/* Main card */}
              <div className="dispatch-card">
                <div className="dc-head">
                  <span className="dc-id">JOB #AL-20294</span>
                  <span className="dc-badge" style={{ background: dc.badgeBg, color: dc.badgeCol }}>{dc.badge}</span>
                </div>
                <div className="dc-service">
                  <div className="dc-icon" style={{ background: dc.iconBg }}>{dc.icon}</div>
                  <div>
                    <div className="dc-service-name">{dc.name}</div>
                    <div className="dc-service-loc">Suri, Birbhum District</div>
                  </div>
                </div>
                <div className="dc-progress">
                  <div className="dc-track"><div className="dc-fill" style={{ width: dc.fill }}></div></div>
                  <div className="dc-steps">
                    <span className={dc.step >= 0 ? 'active' : ''}>Requested</span>
                    <span className={dc.step >= 1 ? 'active' : ''}>Matched</span>
                    <span className={dc.step >= 2 ? 'active' : ''}>En route</span>
                    <span className={dc.step >= 3 ? 'active' : ''}>Done</span>
                  </div>
                </div>
                <div className="dc-eta">
                  <div>
                    <div className="dc-eta-lbl">Worker arrives in</div>
                    <div className="dc-eta-val">{dc.eta}</div>
                  </div>
                  <div className="dc-worker" style={{ opacity: dc.worker ? 1 : 0 }}>
                    <div className="dc-avatar">RK</div>
                    <div style={{ fontSize: '.78rem' }}>Rajesh K.</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* TRUST STRIP */}
      <section className="trust-strip">
        <div className="wrap">
          <div className="trust-strip-inner">
            <span className="strip-label">Now serving</span>
            <div className="strip-cities">
              <span className="strip-city">Suri</span>
              <span className="strip-city">Bolpur</span>
              <span className="strip-city">Rampurhat</span>
              <span className="strip-city">Kolkata</span>
              <span className="strip-city">Siliguri</span>
              <span className="strip-city">Asansol</span>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" id="services">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="section-tag">What we do</span>
            <h2>One platform, every fix your home needs</h2>
            <p>Pick a service — we match you with the nearest verified professional in minutes.</p>
          </Reveal>

          <div className="services-grid">
            {[
              { color: 'var(--sky)', bg: 'rgba(56,189,248,.12)', icon: '🔧', title: 'Plumbing', desc: 'Leaks, clogs, fittings, and full bathroom installs handled fast.' },
              { color: 'var(--amber)', bg: 'rgba(245,158,11,.12)', icon: '⚡', title: 'Electrical', desc: 'Wiring, switchboards, fan & appliance installs by certified techs.' },
              { color: 'var(--mint-deep)', bg: 'var(--mint-pale)', icon: '❄️', title: 'AC Repair', desc: 'Servicing, gas refills, and emergency cooling fixes — same day.' },
              { color: 'var(--coral)', bg: 'rgba(226,114,91,.1)', icon: '🧹', title: 'Cleaning', desc: 'Deep cleans, move-in/out, and weekly upkeep by trained teams.' },
              { color: 'var(--violet)', bg: 'rgba(124,109,232,.1)', icon: '🪚', title: 'Carpentry', desc: 'Furniture repair, modular fittings, and door & lock work.' },
              { color: 'var(--sky)', bg: 'rgba(56,189,248,.1)', icon: '🚗', title: 'Auto & Mechanic', desc: 'Doorstep car & bike servicing, batteries, and breakdowns.' },
              { color: 'var(--amber)', bg: 'rgba(245,158,11,.1)', icon: '🎨', title: 'Painting', desc: 'Touch-ups to full-home paint jobs, interior & exterior.' },
              { color: 'var(--mint-deep)', bg: 'var(--mint-pale)', icon: '🛠️', title: 'Appliance Repair', desc: 'Washing machines, fridges, microwaves, and more.' }
            ].map((svc, i) => (
              <Reveal key={i} className="svc-card" style={{ '--i': i, transitionDelay: `${i * 0.05}s` }}>
                <div className="svc-bar" style={{ background: svc.color }}></div>
                <div className="svc-icon" style={{ background: svc.bg }}>{svc.icon}</div>
                <h3>{svc.title}</h3>
                <p>{svc.desc}</p>
                <span className="svc-link" style={{ color: svc.color }} onClick={handleBook}>
                  Explore
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12H19M19 12L13 6M19 12L13 18"/></svg>
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section hiw-bg" id="how-it-works">
        <div className="wrap">
          <Reveal className="section-head section-head-center">
            <span className="section-tag">How it works</span>
            <h2>From "it's broken" to "it's fixed" — four steps</h2>
          </Reveal>

          <div className="hiw-grid" id="hiwGrid" ref={hiwRef}>
            <div className="hiw-line">
              <div className="hiw-fill" style={{ width: hiwActive ? '100%' : '0%' }}></div>
            </div>

            {[
              { num: '01', title: 'Choose a service', desc: "Tell us what's wrong or just pick a category. No call centers, no hold music." },
              { num: '02', title: 'Pick a time', desc: "See real availability near you and book the slot that works for you." },
              { num: '03', title: 'Track your pro live', desc: "Watch them move toward you on the map with an ETA that updates in real time." },
              { num: '04', title: 'Job done, rated', desc: "Pay in-app, rate the work, keep a record. No haggling, ever." }
            ].map((step, i) => (
                <div key={i} className={`hiw-step ${hiwActive ? 'active' : ''}`} style={{ '--i': i }}>
                  <div className="hiw-num">{step.num}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPERATOR SECTION */}
      <section className="section" id="operators" style={{ paddingTop: '40px' }}>
        <div>
          <Reveal className="operator-wrap">
            <div className="op-glow-1"></div>
            <div className="op-glow-2"></div>
            <div className="op-grid">
              <div>
                <span className="op-tag">For city operators</span>
                <h2>Run your city's home-services fleet — we built the backend so you don't have to.</h2>
                <p>Become an ALLIDO City Operator. Manage your own roster of workers, assign jobs as they land, and grow a territory you control — without writing a line of code.</p>
                <div className="op-metrics">
                  <div className="op-metric"><strong>50+</strong><span>Workers managed per city</span></div>
                  <div className="op-metric"><strong>₹0</strong><span>Tech setup required</span></div>
                  <div className="op-metric"><strong>24/7</strong><span>Automated job dispatch</span></div>
                  <div className="op-metric"><strong>30%</strong><span>Avg. operator margin</span></div>
                </div>
                <a href="#operators" onClick={handlePartner} className="btn btn-primary btn-lg">
                  Apply to operate your city
                  <svg className="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>

              <div className="op-cards">
                <div className="op-card op-card-1">
                  <div className="op-card-name">Birbhum Fleet</div>
                  <div className="op-row"><span className="op-row-lbl">Active workers</span><span className="op-row-val">58</span></div>
                  <div className="op-row"><span className="op-row-lbl">Jobs today</span><span className="op-row-val">142</span></div>
                </div>
                <div className="op-card op-card-2">
                  <div className="op-card-name">New assignment</div>
                  <div className="op-row"><span className="op-row-lbl">AC Repair · Suri Ward 4</span><span className="op-row-val">📍 1.2 km</span></div>
                </div>
                <div className="op-card op-card-3">
                  <div className="op-card-name">This month's payout</div>
                  <div className="op-row"><span className="op-row-lbl">Operator margin</span><span className="op-row-val">₹2,84,000</span></div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* REVIEWS (MARQUEE) */}
      <section className="reviews-section" id="reviews">
        <div className="wrap">
          <Reveal className="section-head section-head-center">
            <span className="section-tag">Social proof</span>
            <h2>Neighbors, not strangers</h2>
            <p>Every rating below is from a real booked job — nothing curated, nothing paid for.</p>
          </Reveal>
        </div>

        <Reveal className="marquee-outer" style={{ padding: '0 0 100px' }}>
          <div className="marquee-track">
            {/* Duplicate array for seamless looping */}
            {[...reviews, ...reviews, ...reviews].map((rev, i) => (
              <div key={i} className="review-card">
                <div className="review-stars">
                  {[...Array(5)].map((_, idx) => (
                    <svg key={idx} viewBox="0 0 24 24"><path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/></svg>
                  ))}
                </div>
                <p>{rev.text}</p>
                <div className="reviewer">
                  <div className="reviewer-av" style={{ background: rev.color }}>{rev.initials}</div>
                  <div>
                    <b>{rev.name}</b>
                    <span>{rev.loc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="wrap">
          <Reveal as="h2">Something needs fixing.<br/>Let's get someone over.</Reveal>
          <Reveal as="p" style={{ transitionDelay: '.1s' }}>Average match time under 2 minutes. Anywhere we operate.</Reveal>
          <Reveal className="final-ctas" style={{ transitionDelay: '.2s' }}>
            <a href="#book" onClick={handleBook} className="btn btn-primary btn-lg">Book a service now</a>
            <a href="#operators" onClick={handlePartner} className="btn btn-dark btn-lg">Become a partner</a>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <a href="#top" className="brand" style={{ color: '#fff' }}>
                <span className="brand-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 13L12 5L20 13M7 11V19H17V11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                ALLIDO
              </a>
              <p className="footer-brand-tag">On-demand, hyper-local home services. Verified pros, tracked live, booked in minutes.</p>
              <div className="footer-social">
                <a href="#" aria-label="Instagram">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="#fff"/></svg>
                </a>
                <a href="#" aria-label="Twitter">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M4 4L20 20M20 4L4 20"/></svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="8" y1="11" x2="8" y2="16"/><line x1="8" y1="8" x2="8" y2="8.2"/><line x1="12" y1="11" x2="12" y2="16"/><path d="M12 13c0-1.2 1-2 2-2s2 .8 2 2v3"/></svg>
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Services</h4>
              <a href="#services">Plumbing</a>
              <a href="#services">Electrical</a>
              <a href="#services">AC Repair</a>
              <a href="#services">Cleaning</a>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#operators">Become a partner</a>
              <a href="#">Careers</a>
              <a href="#">Press</a>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <a href="#">Help center</a>
              <a href="#">Safety</a>
              <a href="#">Contact us</a>
              <a href="#">Trust &amp; verification</a>
            </div>

            <div className="footer-newsletter">
              <h4>Stay in the loop</h4>
              <p style={{ fontSize: '.84rem', color: '#8A9893' }}>New cities, operator spots, seasonal offers.</p>
              <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <input type="email" placeholder="you@email.com" required aria-label="Email address" />
                <button type="submit" className="sub-btn">Join</button>
              </form>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 ALLIDO Technologies. All rights reserved.</span>
            <div className="footer-legal">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
