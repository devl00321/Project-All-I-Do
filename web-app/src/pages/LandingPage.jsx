import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
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
    <Component ref={ref} className={`reveal ${isVisible ? 'visible' : ''} ${className}`} style={style} aria-hidden={!isVisible}>
      {children}
    </Component>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  
  // Dispatch Card State
  const dispatchStates = [
    {badge:'REQUESTED',badgeBg:'rgba(47,191,143,.15)',badgeCol:'#1F9971',fill:'10%',icon:<Icons.Wrench size={20}/>,iconBg:'rgba(56,189,248,.2)',name:'Leaking kitchen tap',eta:'—',step:0,worker:false},
    {badge:'MATCHED',badgeBg:'rgba(245,158,11,.15)',badgeCol:'#b5790b',fill:'38%',icon:<Icons.Wrench size={20}/>,iconBg:'rgba(56,189,248,.2)',name:'Leaking kitchen tap',eta:'18 min',step:1,worker:true},
    {badge:'EN ROUTE',badgeBg:'rgba(56,189,248,.15)',badgeCol:'#0e7fae',fill:'70%',icon:<Icons.Wrench size={20}/>,iconBg:'rgba(47,191,143,.2)',name:'Leaking kitchen tap',eta:'6 min',step:2,worker:true},
    {badge:'DONE ✓',badgeBg:'rgba(47,191,143,.2)',badgeCol:'#1F9971',fill:'100%',icon:<Icons.CheckCircle2 size={20}/>,iconBg:'rgba(47,191,143,.15)',name:'Leaking kitchen tap',eta:'Arrived',step:3,worker:true},
  ];
  const [dcStateIdx, setDcStateIdx] = useState(0);

  // Page Transition State
  const [transitionState, setTransitionState] = useState({ active: false, x: 0, y: 0, color: '', target: '' });

  // Dark Mode State
  const { isDark, setIsDark } = useTheme();

  useEffect(() => {
    // Dispatch Card Loop
    const interval = setInterval(() => {
      setDcStateIdx(prev => (prev + 1) % dispatchStates.length);
    }, 2800);
    return () => clearInterval(interval);
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
    <div className={`landing-page-container ${transitionState.active ? 'exiting' : ''}`}>
      {/* TRANSITION OVERLAY */}
      <div 
        className={`transition-overlay ${transitionState.active ? 'active' : ''}`}
        style={{
          left: transitionState.x,
          top: transitionState.y,
          background: transitionState.color
        }}
      />

      {/* HEADER */}
      <header className="site-header">
        <div className="wrap header-row">
          <a href="#top" className="brand" aria-label="ALLIDO home">
            <div style={{width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--mint) 0%, var(--mint-deep) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Icons.ShieldCheck color="#fff" size={18} />
            </div>
            ALLIDO
          </a>
          <nav aria-label="Primary">
            <ul className="nav-links">
              <li><a href="#services">Services</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#trust">Trust &amp; safety</a></li>
              <li><a href="#dealers">Partner with us</a></li>
              <li><a href="#coverage">Coverage</a></li>
            </ul>
          </nav>
          <div className="header-actions">
            <button 
              onClick={() => setIsDark(!isDark)} 
              className="theme-toggle" 
              aria-label="Toggle dark mode"
            >
              {isDark ? <Icons.Sun size={18}/> : <Icons.Moon size={18}/>}
            </button>
            <span className="locale-pill"><span className="locale-dot"></span> Suri, Birbhum</span>
            <a href="#book" onClick={handleBook} className="btn btn-primary btn-sm">Get early access</a>
            <button className="nav-toggle" aria-label="Open menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow"><span className="pulse"></span> Now onboarding founding dealers in Suri</span>
              <h1>Every trusted hand in Suri, <em>one app away.</em></h1>
              <p className="hero-sub">ALLIDO connects your household to plumbers, electricians, cleaners and drivers who are personally vetted by a local dealer — not an anonymous listing. Book once, and someone accountable shows up.</p>
              <div className="hero-ctas">
                <a href="#book" onClick={handleBook} className="btn btn-mint">Book a service</a>
                <a href="#dealers" onClick={handlePartner} className="btn btn-ghost">Become a founding dealer</a>
              </div>
              <p className="hero-note">Available in Bengali, Hindi and English · Pay by UPI, card or cash</p>

              <div className="trust-row">
                <div className="trust-item">
                  <span className="num mono">100%</span>
                  <span className="lbl">ID-verified before dispatch</span>
                </div>
                <div className="trust-item">
                  <span class="num mono">1</span>
                  <span className="lbl">Dealer accountable per job</span>
                </div>
                <div className="trust-item">
                  <span className="num mono">9</span>
                  <span className="lbl">Service categories at launch</span>
                </div>
              </div>
            </div>

            {/* Re-integrated Dispatch Card for the Hero */}
            <div className="dispatch-stage">
              {/* Floating badges */}
              <div className="float-badge float-badge-1">
                <Icons.ShieldCheck size={16} color="var(--mint-deep)" />
                Background verified
              </div>
              <div className="float-badge float-badge-2">
                <Icons.Star size={14} fill="var(--amber)" stroke="none" />
                4.9 rated · 314 jobs
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
        </section>

        {/* TRUST STRIP */}
        <div className="strip">
          <div className="wrap strip-row">
            <div className="strip-item"><Icons.UserCheck size={16}/> Aadhaar / Voter ID checked</div>
            <div className="strip-item"><Icons.Shield size={16}/> One dealer, one point of accountability</div>
            <div className="strip-item"><Icons.Navigation size={16}/> Live tracking from dispatch to done</div>
            <div className="strip-item"><Icons.CreditCard size={16}/> UPI, card or cash on completion</div>
            <div className="strip-item"><Icons.Languages size={16}/> বাংলা · हिंदी · English</div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section id="how-it-works">
          <div className="wrap">
            <Reveal className="section-head">
              <span className="section-eyebrow">How it works</span>
              <h2>Four steps, one accountable dealer throughout.</h2>
              <p>You never deal with an anonymous gig worker. Every booking is reviewed and assigned by a dealer who has personally verified the person coming to your door.</p>
            </Reveal>

            <Reveal className="steps">
              <div className="step">
                <span className="step-index mono">01 / BOOK</span>
                <h3>Describe the job</h3>
                <p>Pick a category, describe the problem, add photos if useful, and choose a time slot. Pay by UPI or choose pay-after-service.</p>
                <span className="step-arrow"><Icons.ArrowRight size={14}/></span>
              </div>
              <div className="step">
                <span className="step-index mono">02 / ASSIGN</span>
                <h3>Dealer assigns a worker</h3>
                <p>Your local dealer reviews the job and hand-picks a verified worker from their own team based on skill and availability.</p>
                <span className="step-arrow"><Icons.ArrowRight size={14}/></span>
              </div>
              <div className="step">
                <span className="step-index mono">03 / TRACK</span>
                <h3>Watch them arrive</h3>
                <p>See the worker's name, photo and live location the moment they're assigned. Their number stays private until then.</p>
                <span className="step-arrow"><Icons.ArrowRight size={14}/></span>
              </div>
              <div className="step">
                <span className="step-index mono">04 / RATE</span>
                <h3>Pay and review</h3>
                <p>Confirm the job is done, settle payment, and rate the worker. Low ratings are flagged straight to the dealer.</p>
              </div>
            </Reveal>

            <Reveal className="status-track">
              <div className="status-node done"><span className="status-line"></span><span className="status-dot"></span><span className="lbl">CONFIRMED</span></div>
              <div className="status-node done"><span className="status-line"></span><span className="status-dot"></span><span className="lbl">ASSIGNED</span></div>
              <div className="status-node done"><span className="status-line"></span><span className="status-dot"></span><span className="lbl">EN ROUTE</span></div>
              <div className="status-node"><span className="status-line"></span><span className="status-dot"></span><span className="lbl">IN PROGRESS</span></div>
              <div className="status-node"><span className="status-line"></span><span className="status-dot"></span><span className="lbl">COMPLETED</span></div>
            </Reveal>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="band">
          <div className="wrap">
            <Reveal className="section-head">
              <span className="section-eyebrow">Services</span>
              <h2>Everything a household needs, launching together in Suri.</h2>
              <p>Nine categories at launch, each staffed by workers a dealer already knows and trusts. More categories will open as the dealer network grows.</p>
            </Reveal>

            <Reveal className="service-grid">
              <div className="service-card" onClick={handleBook}>
                <div className="service-photo"><img src="/services/plumber.png" alt="Plumber" /></div>
                <div className="service-body"><h3>Plumber</h3><span className="arrow"><Icons.ArrowRight size={14}/></span></div>
              </div>
              <div className="service-card" onClick={handleBook}>
                <div className="service-photo"><img src="/services/electrician.png" alt="Electrician" /></div>
                <div className="service-body"><h3>Electrician</h3><span className="arrow"><Icons.ArrowRight size={14}/></span></div>
              </div>
              <div className="service-card" onClick={handleBook}>
                <div className="service-photo"><img src="/services/carpenter.png" alt="Carpenter" /></div>
                <div className="service-body"><h3>Carpenter</h3><span className="arrow"><Icons.ArrowRight size={14}/></span></div>
              </div>
              <div className="service-card" onClick={handleBook}>
                <div className="service-photo"><img src="/services/ac_repair.png" alt="AC Repair" /></div>
                <div className="service-body"><h3>AC Repair</h3><span className="arrow"><Icons.ArrowRight size={14}/></span></div>
              </div>
              <div className="service-card" onClick={handleBook}>
                <div className="service-photo"><img src="/services/cleaning.png" alt="Home Cleaning" /></div>
                <div className="service-body"><h3>Home Cleaning</h3><span className="arrow"><Icons.ArrowRight size={14}/></span></div>
              </div>
              <div className="service-card" onClick={handleBook}>
                <div className="service-photo"><img src="/services/rental.png" alt="Car & Bike Rental" /></div>
                <div className="service-body"><h3>Car &amp; Bike Rental</h3><span className="arrow"><Icons.ArrowRight size={14}/></span></div>
              </div>
              <div className="service-card" onClick={handleBook}>
                <div className="service-photo"><img src="/services/driver.png" alt="Driver on Demand" /></div>
                <div className="service-body"><h3>Driver on Demand</h3><span className="arrow"><Icons.ArrowRight size={14}/></span></div>
              </div>
              <div className="service-card" onClick={handleBook}>
                <div className="service-photo"><img src="/services/laundry.png" alt="Laundry" /></div>
                <div className="service-body"><h3>Laundry</h3><span className="arrow"><Icons.ArrowRight size={14}/></span></div>
              </div>
              <div className="service-card" onClick={handleBook}>
                <div className="service-photo"><img src="/services/pest_control.png" alt="Pest Control" /></div>
                <div className="service-body"><h3>Pest Control</h3><span className="arrow"><Icons.ArrowRight size={14}/></span></div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* TRUST ARCHITECTURE */}
        <section id="trust">
          <div className="wrap">
            <Reveal className="section-head">
              <span className="section-eyebrow">Why ALLIDO is different</span>
              <h2>We didn't build an open marketplace. We built a chain of accountability.</h2>
              <p>Most service apps let anyone with a smartphone list themselves as a professional. ALLIDO doesn't. Every worker on the platform is brought on, vetted and managed by a dealer — a local operator who stakes their reputation on the team they field.</p>
            </Reveal>

            <div className="arch-grid">
              <Reveal className="arch-list">
                <div className="arch-item">
                  <span className="arch-num mono">01</span>
                  <div>
                    <h4>Workers can't self-list</h4>
                    <p>There's no open sign-up for workers. Every profile is created and ID-verified by a dealer who has met them in person before they ever appear in the system.</p>
                  </div>
                </div>
                <div className="arch-item">
                  <span className="arch-num mono">02</span>
                  <div>
                    <h4>Bookings go to a dealer, not a queue</h4>
                    <p>Your job is reviewed by a human who assigns it to the right person for the task — not an algorithm matching you to the nearest available stranger.</p>
                  </div>
                </div>
                <div className="arch-item">
                  <span className="arch-num mono">03</span>
                  <div>
                    <h4>Contact stays private until assigned</h4>
                    <p>A worker's number is never shared with a customer before the dealer confirms the assignment, and workers never bypass the dealer to deal directly.</p>
                  </div>
                </div>
                <div className="arch-item">
                  <span className="arch-num mono">04</span>
                  <div>
                    <h4>One rating, one responsible party</h4>
                    <p>Every job carries a rating. A poor review reaches the dealer directly and follows the worker's trust score — not lost in an anonymous review feed.</p>
                  </div>
                </div>
              </Reveal>

              <Reveal className="arch-diagram">
                <div className="chain-wrap" role="img" aria-label="Diagram showing the accountability chain">
                  <svg className="chain-svg" viewBox="0 0 460 460" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <path id="chainArc" d="M 100 340 A 220 220 0 0 1 360 340" fill="none"/>
                    </defs>
                    <line x1="118" y1="118" x2="230" y2="230" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="4 6"/>
                    <line x1="342" y1="118" x2="230" y2="230" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="4 6"/>
                    <line x1="230" y1="230" x2="230" y2="360" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="4 6"/>

                    {/* Customer seal */}
                    <g transform="translate(118,118) rotate(-6)">
                      <circle r="52" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5"/>
                      <circle r="44" fill="none" stroke="var(--terracotta)" strokeWidth="1.4" strokeDasharray="2.4 3.4"/>
                      <text textAnchor="middle" y="-4" fontFamily="IBM Plex Mono" fontSize="9" fill="var(--ink-faint)" letterSpacing="1">STEP 01</text>
                      <text textAnchor="middle" y="14" fontFamily="Fraunces" fontWeight="600" fontSize="15" fill="var(--ink)">Customer</text>
                    </g>

                    {/* Dealer seal */}
                    <g transform="translate(230,230)">
                      <circle r="64" fill="var(--ink)"/>
                      <circle r="54" fill="none" stroke="var(--mint)" strokeWidth="1.6" strokeDasharray="2.6 3.6"/>
                      <text textAnchor="middle" y="-8" fontFamily="IBM Plex Mono" fontSize="9" fill="var(--surface)" opacity="0.6" letterSpacing="1">VERIFIES + ASSIGNS</text>
                      <text textAnchor="middle" y="14" fontFamily="Fraunces" fontWeight="600" fontSize="17" fill="var(--surface)">Dealer</text>
                    </g>

                    {/* Worker seal */}
                    <g transform="translate(342,118) rotate(6)">
                      <circle r="52" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5"/>
                      <circle r="44" fill="none" stroke="var(--terracotta)" strokeWidth="1.4" strokeDasharray="2.4 3.4"/>
                      <text textAnchor="middle" y="-4" fontFamily="IBM Plex Mono" fontSize="9" fill="var(--ink-faint)" letterSpacing="1">STEP 02</text>
                      <text textAnchor="middle" y="14" fontFamily="Fraunces" fontWeight="600" fontSize="15" fill="var(--ink)">Worker</text>
                    </g>

                    {/* Completed seal */}
                    <g transform="translate(230,360)">
                      <circle r="46" fill="var(--mint-tint)" stroke="var(--mint)" strokeWidth="1.5"/>
                      <path d="M -12 0 L -3 10 L 14 -12" fill="none" stroke="var(--mint-deep)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <text textAnchor="middle" y="34" fontFamily="IBM Plex Mono" fontSize="9.5" fill="var(--ink-soft)" letterSpacing="0.5">JOB COMPLETE &amp; RATED</text>
                    </g>
                  </svg>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* COMMITMENTS */}
        <section className="band-mint">
          <div className="wrap">
            <Reveal className="section-head">
              <span className="section-eyebrow">Our commitments</span>
              <h2>What we promise every time you book.</h2>
            </Reveal>
            <Reveal className="commit-grid">
              <div className="commit-card">
                <div className="commit-icon"><Icons.ShieldCheck size={18}/></div>
                <h4>Verified before dispatch</h4>
                <p>Aadhaar or Voter ID checked by the dealer for every worker, before their first job.</p>
              </div>
              <div className="commit-card">
                <div className="commit-icon"><Icons.Clock size={18}/></div>
                <h4>Under 45 minutes</h4>
                <p>Our target time from a confirmed booking to a worker being assigned and en route.</p>
              </div>
              <div className="commit-card">
                <div className="commit-icon"><Icons.Banknote size={18}/></div>
                <h4>Transparent pricing</h4>
                <p>Visit charges shown upfront. Labour and material costs agreed with you on-site — no surprises.</p>
              </div>
              <div className="commit-card">
                <div className="commit-icon"><Icons.Star size={18}/></div>
                <h4>Every rating reviewed</h4>
                <p>A rating of two stars or below alerts the dealer immediately for follow-up and, if needed, suspension.</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* DEALERS */}
        <section id="dealers">
          <div className="wrap">
            <Reveal className="dealer-section">
              <div>
                <span className="section-eyebrow">For local operators</span>
                <h2>Bring your team of workers. Run them on ALLIDO.</h2>
                <p>If you already manage a group of trusted plumbers, electricians, drivers or cleaners, ALLIDO gives you a steady stream of bookings and a dashboard built for a basic Android phone — no office, no call centre required.</p>
                <ul className="dealer-list">
                  <li><Icons.Check size={16}/> Live booking feed with customer, address and time slot</li>
                  <li><Icons.Check size={16}/> One-tap worker assignment and reassignment</li>
                  <li><Icons.Check size={16}/> Full worker roster: skills, ID status, ratings, job history</li>
                  <li><Icons.Check size={16}/> Daily and monthly earnings reports by category</li>
                </ul>
              </div>
              <div className="dealer-card">
                <form onSubmit={(e) => { e.preventDefault(); handlePartner(e); }}>
                  <div className="field">
                    <label htmlFor="d-name">Your name</label>
                    <input id="d-name" type="text" placeholder="Full name" required />
                  </div>
                  <div className="field">
                    <label htmlFor="d-phone">Phone number</label>
                    <input id="d-phone" type="tel" placeholder="10-digit mobile number" required />
                  </div>
                  <div className="field">
                    <label htmlFor="d-area">Area of operation</label>
                    <input id="d-area" type="text" placeholder="e.g. Suri town, Rajbari area" required />
                  </div>
                  <div className="field">
                    <label htmlFor="d-workers">Workers you currently manage</label>
                    <select id="d-workers">
                      <option>1–5</option>
                      <option>6–15</option>
                      <option>16–30</option>
                      <option>30+</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-mint" style={{width: '100%', justifyContent: 'center'}}>Sign up to partner</button>
                </form>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ACCESS / DOWNLOAD */}
        <section id="access" className="band">
          <div className="wrap">
            <Reveal className="section-head">
              <span className="section-eyebrow">Get the app</span>
              <h2>Available wherever you are in Suri.</h2>
              <p>The Android app is our primary experience. No app store on your device? Use the web app straight from your browser — no install needed.</p>
            </Reveal>
            <Reveal className="access-grid">
              <div className="access-card">
                <div className="plat-icon"><Icons.Smartphone size={22}/></div>
                <h3>Android</h3>
                <p>Our primary app — built first, updated first, and covering the widest range of devices in Suri.</p>
                <span className="status-tag">Available now</span>
              </div>
              <div className="access-card">
                <div className="plat-icon"><Icons.Monitor size={22}/></div>
                <h3>Web app</h3>
                <p>No installation required. Open it in any mobile or desktop browser and book in under a minute.</p>
                <span className="status-tag">Available now</span>
              </div>
              <div className="access-card">
                <div className="plat-icon"><Icons.Apple size={22}/></div>
                <h3>iOS</h3>
                <p>Coming as demand grows — join early access and we'll notify you the moment it's ready.</p>
                <span className="status-tag soon">Coming soon</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* COVERAGE */}
        <section id="coverage">
          <div className="wrap">
            <div className="coverage-grid">
              <Reveal>
                <span className="section-eyebrow">Coverage</span>
                <h2 style={{fontSize: 'clamp(26px,3vw,36px)', maxWidth: 420}}>Starting in Suri. Built to expand across Birbhum.</h2>
                <p style={{marginTop: 16, color: 'var(--ink-soft)', fontSize: 15.5, lineHeight: 1.65, maxWidth: 440}}>We launch one city at a time, on purpose. A new city only opens once we've onboarded a dealer we trust and a starting roster of verified workers.</p>

                <div className="coverage-list" style={{marginTop: 36}}>
                  <div className="coverage-row">
                    <div><div className="city">Suri</div><div className="region">District HQ, Birbhum — launch city</div></div>
                    <span className="status-tag">Live</span>
                  </div>
                  <div className="coverage-row">
                    <div><div className="city">Bolpur</div><div className="region">Birbhum — next in the expansion plan</div></div>
                    <span className="status-tag soon">Planned</span>
                  </div>
                  <div className="coverage-row">
                    <div><div className="city">Rampurhat</div><div className="region">Birbhum — next in the expansion plan</div></div>
                    <span className="status-tag soon">Planned</span>
                  </div>
                </div>
              </Reveal>

              <Reveal className="coverage-map" aria-hidden="true">
                <div className="pin">
                  <div className="pin-dot"></div>
                  <div className="pin-label">Suri — live</div>
                </div>
                <div className="pin-next" style={{top: '24%', left: '68%'}}>
                  <div className="pin-dot-sm"></div>
                  <div className="pin-label">Bolpur</div>
                </div>
                <div className="pin-next" style={{top: '66%', left: '22%'}}>
                  <div className="pin-dot-sm"></div>
                  <div className="pin-label">Rampurhat</div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section>
          <div className="wrap">
            <Reveal className="cta-banner">
              <h2>Something needs fixing. Let's get someone over.</h2>
              <p>Average match time under 2 minutes. Anywhere we operate.</p>
              <div className="hero-ctas">
                <a href="#book" onClick={handleBook} className="btn btn-mint">Book a service now</a>
                <a href="#dealers" onClick={handlePartner} className="btn btn-ghost" style={{borderColor: 'rgba(255,255,255,0.2)', color: '#fff'}}>Become a partner</a>
              </div>
            </Reveal>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="footer-top">
            <div>
              <div className="footer-brand">
                <div style={{width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--mint) 0%, var(--mint-deep) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Icons.ShieldCheck color="#fff" size={16} />
                </div>
                ALLIDO
              </div>
              <p>ALLIDO connects households in Suri, Birbhum with dealer-verified plumbers, electricians, cleaners, drivers and more. Every worker is vetted and every job is accountable.</p>
            </div>
            
            <div className="footer-col">
              <h5>Services</h5>
              <ul>
                <li><a href="#services">Plumbing</a></li>
                <li><a href="#services">Electrical</a></li>
                <li><a href="#services">Cleaning</a></li>
                <li><a href="#services">AC Repair</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Company</h5>
              <ul>
                <li><a href="#how-it-works">How it works</a></li>
                <li><a href="#dealers">Partner with us</a></li>
                <li><a href="#trust">Trust &amp; safety</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Legal</h5>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Refund Policy</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Contact</h5>
              <ul>
                <li><a href="mailto:hello@allido.com">hello@allido.com</a></li>
                <li><a href="#">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div>&copy; 2026 ALLIDO. All rights reserved.</div>
            <div style={{display: 'flex', gap: 16}}>
              <span>Built for Birbhum.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
