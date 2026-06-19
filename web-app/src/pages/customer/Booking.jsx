import React, { useState, useEffect, useRef } from 'react';
import { B, SERVICES, TIME_SLOTS } from '../../constants';
import { Badge, Spinner } from '../../components/Common';
import RideBooking from './RideBooking';
import * as Icons from 'lucide-react';
import gsap from 'gsap';

const renderServiceIcon = (iconName, color, size = 22) => {
  const IconComponent = Icons[iconName];
  if (!IconComponent) return null;
  return <IconComponent size={size} style={{ color }} />;
};

export default function Booking({ preService, onConfirm, onCancel, setCatState }) {
  const [selSvc, setSelSvc] = useState(preService || null);
  const [step, setStep] = useState(preService ? 1 : 0);
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState([]);
  const [addr, setAddr] = useState("");
  const [coords, setCoords] = useState(null);
  const [gpsLoad, setGpsLoad] = useState(false);
  const [slot, setSlot] = useState(null);
  const [date, setDate] = useState("Today");
  const [pay, setPay] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // Monitor booking steps to update the cat companion state
  useEffect(() => {
    if (setCatState) {
      if (step === 4) {
        setCatState('smile');
      } else {
        setCatState('sitting_right');
      }
    }
  }, [step, setCatState]);

  const [urgency, setUrgency] = useState('standard');
  const [complexity, setComplexity] = useState('medium');
  const [workerPref, setWorkerPref] = useState('none');
  const [calculatedFare, setCalculatedFare] = useState(350);

  const [showMapSel, setShowMapSel] = useState(false);
  const mapSelRef = useRef(null);
  const mapSelInstanceRef = useRef(null);
  const mapSelMarkerRef = useRef(null);

  const [fuelDistance, setFuelDistance] = useState(1.5);

  const calculateHaversine = (p1, p2) => {
    const R = 6371; // km
    const dLat = (p2[0] - p1[0]) * Math.PI / 180;
    const dLon = (p2[1] - p1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(p1[0]*Math.PI/180) * Math.cos(p2[0]*Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (selSvc?.id === 'emergency_fuel' && coords) {
      const stationLat = coords[0] + 0.012;
      const stationLng = coords[1] + 0.012;

      const fetchFuelRoute = async () => {
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${stationLng},${stationLat};${coords[1]},${coords[0]}?overview=false`);
          const data = await res.json();
          if (data.code === 'Ok' && data.routes[0]) {
            setFuelDistance(data.routes[0].distance / 1000);
          } else {
            setFuelDistance(calculateHaversine(coords, [stationLat, stationLng]));
          }
        } catch (err) {
          console.error("OSRM call error for fuel distance:", err);
          setFuelDistance(calculateHaversine(coords, [stationLat, stationLng]));
        }
      };
      fetchFuelRoute();
    }
  }, [coords, selSvc]);

  // Dynamic Fare Calculation
  useEffect(() => {
    const baseFare = selSvc?.basePrice || 350;
    const urgencyFee = urgency === 'express' ? 100 : 0;
    const multiplier = complexity === 'minor' ? 1.0 : complexity === 'medium' ? 1.5 : 2.5;
    if (selSvc?.id === 'emergency_fuel') {
      const distFee = fuelDistance * 25; // ₹25 per km delivery fee
      setCalculatedFare(Math.round(baseFare + urgencyFee + distFee));
    } else {
      setCalculatedFare(Math.round((baseFare + urgencyFee) * multiplier));
    }
  }, [urgency, complexity, selSvc, fuelDistance]);

  const handleGPSLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoad(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords([latitude, longitude]);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`);
          const data = await res.json();
          setAddr(data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          setAddr(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        setGpsLoad(false);
      },
      (error) => {
        console.error("Geolocation failed:", error);
        if (!silent) alert("Failed to retrieve GPS location. Please enter manually.");
        setGpsLoad(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    handleGPSLocation(true);
  }, []);

  // Map click selector effect
  useEffect(() => {
    if (showMapSel && window.L && mapSelRef.current && !mapSelInstanceRef.current) {
      const initialCenter = coords || [23.9113, 87.5284];
      mapSelInstanceRef.current = window.L.map(mapSelRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(initialCenter, 14);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapSelInstanceRef.current);

      if (coords) {
        const pinIcon = window.L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="background:${B.mint};width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`
        });
        mapSelMarkerRef.current = window.L.marker(coords, { icon: pinIcon }).addTo(mapSelInstanceRef.current);
      }

      mapSelInstanceRef.current.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        setCoords([lat, lng]);

        if (mapSelMarkerRef.current) {
          mapSelMarkerRef.current.setLatLng([lat, lng]);
        } else {
          const pinIcon = window.L.divIcon({
            className: 'custom-map-pin',
            html: `<div style="background:${B.mint};width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`
          });
          mapSelMarkerRef.current = window.L.marker([lat, lng], { icon: pinIcon }).addTo(mapSelInstanceRef.current);
        }

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
          const data = await res.json();
          setAddr(data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          setAddr(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      });
    }

    return () => {
      if (!showMapSel && mapSelInstanceRef.current) {
        mapSelInstanceRef.current.remove();
        mapSelInstanceRef.current = null;
        mapSelMarkerRef.current = null;
      }
    };
  }, [showMapSel]);

  const bookingRef = useRef(null);
  const formRef = useRef(null);

  if (selSvc && (selSvc.id === 'car_rental' || selSvc.id === 'driver')) {
    return (
      <RideBooking 
        service={selSvc} 
        onConfirm={onConfirm} 
        onBack={() => {
          if (preService) {
            onCancel();
          } else {
            setSelSvc(null);
            setStep(0);
          }
        }} 
        setCatState={setCatState}
      />
    );
  }

  const STEPS_LIST = ["Service","Describe","Address","Schedule","Payment"];
  const canNext = [selSvc!==null, desc.trim().length>0, addr.trim().length>0, slot!==null, pay!==null];

  const PAYMENTS = [
    { id:"upi",  label:"UPI",             icon:"📱", sub:"Google Pay · PhonePe · Paytm" },
    { id:"card", label:"Card",            icon:"💳", sub:"Debit / Credit via Razorpay" },
    { id:"cash", label:"Cash on Service", icon:"💵", sub:"Pay after work is done" },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(".bk-header", { opacity: 0, y: -20, duration: 0.4 })
        .from(".bk-steps", { opacity: 0, y: -10, duration: 0.4 }, "-=0.2")
        .from(".bk-form", { opacity: 0, x: -30, duration: 0.5, ease: "power2.out" }, "-=0.2")
        .from(".bk-sidebar", { opacity: 0, x: 30, duration: 0.5, ease: "power2.out" }, "-=0.4");
    }, bookingRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [step]);

  return (
    <div className="page" style={{ maxWidth:820 }} ref={bookingRef}>
      <div className="bk-header">
        <div className="section-title">New Booking</div>
        <div className="section-sub">Complete the steps to book a service</div>
      </div>

      {/* Step bar */}
      <div className="bk-steps" style={{ display:"flex", alignItems:"center", gap:0, marginBottom:40 }}>
        {STEPS_LIST.map((s,i) => (
          <div key={s} style={{ display:"flex", alignItems:"center", flex:i<STEPS_LIST.length-1?1:"none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              <div style={{ width:34, height:34, borderRadius:12,
                background:i<step?B.ok:i===step?B.mint:"#fff",
                border:`2px solid ${i<step?B.ok:i===step?B.mint:B.brd}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:700, transition:"all .3s",
                color:i<=step?"#fff":B.muted }}>
                {i<step?"✓":i+1}
              </div>
              <div style={{ fontSize:10, fontWeight:600,
                color:i===step?B.mint:B.muted, whiteSpace:"nowrap" }}>{s}</div>
            </div>
            {i<STEPS_LIST.length-1&&<div style={{ flex:1, height:2, margin:"0 8px 18px",
              background:i<step?B.ok:B.brd, borderRadius:2, transition:"background .3s" }}/>}
          </div>
        ))}
      </div>

      <div className="booking-layout-grid">
        {/* Main form */}
        <div className="card bk-form" style={{ padding:"28px 32px" }}>
          <div ref={formRef}>
            {/* Step 0: Choose service */}
            {step===0&&(
              <div>
                <div style={{ fontWeight:700, fontSize:17, color:B.ink, marginBottom:16 }}>Choose a Service</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                  {SERVICES.map(s=>(
                    <button key={s.id} onClick={()=>setSelSvc(s)} style={{
                      padding:"16px 12px", borderRadius:16, cursor:"pointer",
                      background:selSvc?.id===s.id?B.mintLight:"#fff",
                      border:`1.5px solid ${selSvc?.id===s.id?B.mint:B.brd}`,
                      display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                      transition:"all .18s",
                    }}>
                      <div style={{ width:44, height:44, borderRadius:14,
                        background:`${s.color}18`, border:`1.5px solid ${s.color}33`,
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {renderServiceIcon(s.icon, s.color)}
                      </div>
                      <div style={{ fontSize:11, fontWeight:700, color:selSvc?.id===s.id?B.mint:B.inkLight, textAlign:"center" }}>{s.label}</div>
                      {selSvc?.id===s.id&&<span style={{ color:B.mint, fontSize:14 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Describe */}
            {step===1&&(
              <div>
                <div style={{ fontWeight:700, fontSize:17, color:B.ink, marginBottom:4 }}>Describe the Problem</div>
                <div style={{ color:B.inkLight, fontSize:13, marginBottom:18 }}>
                  Be as detailed as possible so the worker can come prepared.
                </div>
                <textarea className="fi" style={{ minHeight:130, resize:"none", lineHeight:1.65, marginBottom:20 }}
                  placeholder={selSvc?.placeholder || "Describe your problem in detail..."}
                  value={desc} onChange={e=>setDesc(e.target.value)}/>
                <div style={{ fontWeight:600, fontSize:14, color:B.inkLight, marginBottom:12 }}>
                  Add Photos <span style={{ fontWeight:400, color:B.muted }}>(optional · up to 3)</span>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  {photos.map((p,i)=>(
                    <div key={p} style={{ width:80, height:80, borderRadius:16,
                      background:B.mintLight, border:`1.5px solid ${B.brd}`,
                      display:"flex", flexDirection:"column", alignItems:"center",
                      justifyContent:"center", fontSize:24, position:"relative" }}>
                      📷
                      <button onClick={()=>setPhotos(ps=>ps.filter((_,j)=>j!==i))} style={{
                        position:"absolute", top:-6, right:-6, width:20, height:20,
                        borderRadius:"50%", background:B.err, border:"none",
                        color:"#fff", fontSize:11, cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                    </div>
                  ))}
                  {photos.length<3&&(
                    <button onClick={()=>setPhotos(p=>[...p,`p${Date.now()}`])} style={{
                      width:80, height:80, borderRadius:16, background:"#fff",
                      border:`2px dashed ${B.brd}`, cursor:"pointer",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
                      <span style={{ fontSize:24, color:B.muted }}>+</span>
                      <span style={{ fontSize:10, color:B.muted }}>Add Photo</span>
                    </button>
                  )}
                </div>
                
                {/* Custom Options */}
                <div style={{ marginTop: '24px', borderTop: `1.5px solid ${B.brd}`, paddingTop: '20px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: B.inkLight, marginBottom: '12px', textAlign: 'left' }}>Choose Urgency</div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button type="button" onClick={() => setUrgency('standard')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1.5px solid ${urgency === 'standard' ? B.mint : B.brd}`, background: urgency === 'standard' ? B.mintLight : '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: B.ink, textAlign: 'left', transition: 'all 0.2s' }}>
                      <div style={{ fontWeight: 700 }}>Standard</div>
                      <div style={{ fontSize: '11px', color: B.muted, fontWeight: 500, marginTop: '2px' }}>
                        {selSvc?.id === 'emergency_fuel' ? "No extra fee · Arrives under 30 min" : "No extra fee · Arrives 2-4 hrs"}
                      </div>
                    </button>
                    <button type="button" onClick={() => setUrgency('express')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1.5px solid ${urgency === 'express' ? B.mint : B.brd}`, background: urgency === 'express' ? B.mintLight : '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: B.ink, textAlign: 'left', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Express</span><span style={{ color: B.mint }}>+₹100</span></div>
                      <div style={{ fontSize: '11px', color: B.muted, fontWeight: 500, marginTop: '2px' }}>
                        {selSvc?.id === 'emergency_fuel' ? "Emergency · Arrives under 10 min" : "Emergency · Arrives under 45 min"}
                      </div>
                    </button>
                  </div>

                  {selSvc?.id !== 'emergency_fuel' && (
                    <>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: B.inkLight, marginBottom: '12px', textAlign: 'left' }}>Job Complexity</div>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button type="button" onClick={() => setComplexity('minor')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: `1.5px solid ${complexity === 'minor' ? B.mint : B.brd}`, background: complexity === 'minor' ? B.mintLight : '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: B.ink, transition: 'all 0.2s' }}>
                          <div style={{ fontWeight: 700 }}>Minor Repair</div>
                          <div style={{ fontSize: '10px', color: B.muted, fontWeight: 500, marginTop: '2px' }}>1.0x Base</div>
                        </button>
                        <button type="button" onClick={() => setComplexity('medium')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: `1.5px solid ${complexity === 'medium' ? B.mint : B.brd}`, background: complexity === 'medium' ? B.mintLight : '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: B.ink, transition: 'all 0.2s' }}>
                          <div style={{ fontWeight: 700 }}>Standard Fix</div>
                          <div style={{ fontSize: '10px', color: B.muted, fontWeight: 500, marginTop: '2px' }}>1.5x Base</div>
                        </button>
                        <button type="button" onClick={() => setComplexity('major')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: `1.5px solid ${complexity === 'major' ? B.mint : B.brd}`, background: complexity === 'major' ? B.mintLight : '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: B.ink, transition: 'all 0.2s' }}>
                          <div style={{ fontWeight: 700 }}>Installation</div>
                          <div style={{ fontSize: '10px', color: B.muted, fontWeight: 500, marginTop: '2px' }}>2.5x Base</div>
                        </button>
                      </div>
                    </>
                  )}

                  <div style={{ fontWeight: 600, fontSize: '14px', color: B.inkLight, marginBottom: '8px', textAlign: 'left' }}>Partner Preference</div>
                  <select className="fi" value={workerPref} onChange={e => setWorkerPref(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', marginBottom: '10px', background: '#fff', border: `1.5px solid ${B.brd}`, width: '100%', fontSize: '13px', fontWeight: 600 }}>
                    <option value="none">No preference (Auto-assign closest)</option>
                    <option value="rated">Highly Rated (4.8★+ only)</option>
                    <option value="female">Female Partner preferred</option>
                    <option value="male">Male Partner preferred</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {step===2&&(
              <div>
                <div style={{ fontWeight:700, fontSize:17, color:B.ink, marginBottom:18 }}>Service Location</div>
                
                <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                  <button onClick={() => { setShowMapSel(false); handleGPSLocation(); }} style={{
                    flex: 1, background: !showMapSel ? B.mintLight : "#fff", border: `1.5px solid ${!showMapSel ? B.mint : B.brd}`,
                    borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center",
                    gap:10, cursor:"pointer", transition: "all 0.2s" }}>
                    {gpsLoad?<Spinner/>:<span style={{ fontSize:18 }}>📍</span>}
                    <div style={{ textAlign:"left" }}>
                      <div style={{ color: !showMapSel ? B.mint : B.ink, fontWeight:700, fontSize:13 }}>
                        {gpsLoad?"Detecting...":"Use GPS"}
                      </div>
                      <div style={{ color:B.muted, fontSize:10 }}>GPS auto-detect</div>
                    </div>
                  </button>

                  <button onClick={() => setShowMapSel(prev => !prev)} style={{
                    flex: 1, background: showMapSel ? B.mintLight : "#fff", border: `1.5px solid ${showMapSel ? B.mint : B.brd}`,
                    borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center",
                    gap:10, cursor:"pointer", transition: "all 0.2s" }}>
                    <span style={{ fontSize:18 }}>🗺️</span>
                    <div style={{ textAlign:"left" }}>
                      <div style={{ color: showMapSel ? B.mint : B.ink, fontWeight:700, fontSize:13 }}>
                        Choose on Map
                      </div>
                      <div style={{ color:B.muted, fontSize:10 }}>Pin exact address</div>
                    </div>
                  </button>
                </div>

                {showMapSel ? (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: B.muted, marginBottom: 6, textAlign: 'left' }}>Click anywhere on the map to set your pin location:</div>
                    <div ref={mapSelRef} style={{ width: '100%', height: '220px', borderRadius: '14px', border: `1.5px solid ${B.brd}`, zIndex: 1, position: 'relative' }}></div>
                  </div>
                ) : (
                  <>
                    <div style={{ textAlign:"center", color:B.muted, fontSize:11, marginBottom:10 }}>— or enter manually —</div>
                    <textarea className="fi" style={{ minHeight:80, resize:"none" }}
                      placeholder="Full address with landmark, PIN code…"
                      value={addr} onChange={e=>setAddr(e.target.value)}/>
                  </>
                )}

                {addr&&(
                  <div style={{ marginTop:12, padding:"11px 16px",
                    background:`${B.ok}12`, border:`1.5px solid ${B.ok}44`,
                    borderRadius:12, display:"flex", alignItems:"center", gap:10 }}>
                    <span>✅</span>
                    <span style={{ fontSize:13, color:B.ok, fontWeight:600, textAlign:"left" }}>{addr}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Schedule */}
            {step===3&&(
              <div>
                <div style={{ fontWeight:700, fontSize:17, color:B.ink, marginBottom:18 }}>Choose a Time Slot</div>
                <div style={{ display:"flex", gap:10, marginBottom:20 }}>
                  {["Today","Tomorrow","Day After"].map(d=>(
                    <button key={d} onClick={()=>setDate(d)} style={{
                      padding:"8px 20px", borderRadius:12,
                      background:date===d?B.mint:"#fff",
                      border:`1.5px solid ${date===d?B.mint:B.brd}`,
                      color:date===d?"#fff":B.inkLight,
                      fontWeight:600, fontSize:13, cursor:"pointer", transition:"all .18s" }}>{d}</button>
                  ))}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {TIME_SLOTS.map((s,i)=>{
                    const dis=date==="Today"&&i<2;
                    return (
                      <button key={s} onClick={()=>!dis&&setSlot(s)} style={{
                        padding:"13px 16px", borderRadius:14,
                        background:slot===s?B.mintLight:"#fff",
                        border:`1.5px solid ${slot===s?B.mint:B.brd}`,
                        display:"flex", justifyContent:"space-between", alignItems:"center",
                        cursor:dis?"not-allowed":"pointer", opacity:dis?0.4:1, transition:"all .18s" }}>
                        <span style={{ fontWeight:600, fontSize:13, color:slot===s?B.mint:B.ink }}>{s}</span>
                        {dis
                          ? <Badge color={B.muted}>Passed</Badge>
                          : <Badge color={B.ok}>{slot===s?"✓ Chosen":"Available"}</Badge>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {step===4&&(
              <div>
                <div style={{ fontWeight:700, fontSize:17, color:B.ink, marginBottom:20 }}>Payment Method</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {PAYMENTS.map(m=>(
                    <button key={m.id} onClick={()=>setPay(m.id)} style={{
                      padding:"16px 18px", borderRadius:16,
                      background:pay===m.id?B.mintLight:"#fff",
                      border:`1.5px solid ${pay===m.id?B.mint:B.brd}`,
                      display:"flex", alignItems:"center", gap:16,
                      cursor:"pointer", transition:"all .18s" }}>
                      <span style={{ fontSize:26 }}>{m.icon}</span>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontWeight:700, fontSize:15, color:pay===m.id?B.mint:B.ink }}>{m.label}</div>
                        <div style={{ color:B.muted, fontSize:12 }}>{m.sub}</div>
                      </div>
                      {pay===m.id&&<span style={{ marginLeft:"auto", color:B.mint, fontSize:18 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div style={{ display:"flex", gap:12, marginTop:28 }}>
              {step>0
                ? <button className="gbtn" style={{ flex:1 }} onClick={()=>setStep(s=>s-1)}>← Back</button>
                : onCancel && <button className="gbtn" style={{ flex:1 }} onClick={onCancel}>Cancel</button>}
              {step<4
                ? <button className="pbtn" style={{ flex:2 }} disabled={!canNext[step]}
                    onClick={()=>setStep(s=>s+1)}>Continue →</button>
                : <button className="pbtn" style={{ flex:2 }} disabled={!canNext[4]||confirming}
                    onClick={()=>{setConfirming(true);setTimeout(()=>{setConfirming(false);onConfirm({ ...selSvc, calculatedFare, urgency, complexity, workerPref, desc, addr, coords, slot, date, paymentMethod: pay });},1400);}}>
                    {confirming?<Spinner color="#fff"/>:`Confirm Booking · ₹${calculatedFare}`}
                  </button>}
            </div>
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="bk-sidebar" style={{ display:"flex", flexDirection:"column", gap:16, position:"sticky", top:0 }}>
          <div className="card" style={{ padding:"22px 24px" }}>
            <div style={{ fontWeight:700, fontSize:14, color:B.ink, marginBottom:16 }}>Booking Summary</div>
            {[
              ["Service",  selSvc?.label || "—"],
              ["Address",  addr||"—"],
              ["Slot",     slot||"—"],
              ["Payment",  pay||"—"],
            ].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between",
                paddingBottom:10, marginBottom:10,
                borderBottom:`1px solid ${B.brd}`, alignItems:"flex-start" }}>
                <span style={{ color:B.muted, fontSize:12 }}>{l}</span>
                <span style={{ fontWeight:600, fontSize:13, color:v==="—"?B.faint:B.ink,
                  textAlign:"right", maxWidth:160, wordBreak:"break-word" }}>{v}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
              <span style={{ fontWeight:700, fontSize:14, color:B.ink }}>Est. Total</span>
              <span style={{ fontWeight:700, fontSize:14, color:B.mint }}>₹{calculatedFare}</span>
            </div>
            <div style={{ marginTop:6, fontSize:11, color:B.muted }}>
              * Confirmed after service completion
            </div>
          </div>
          <div style={{ background:B.mintFog, border:`1.5px solid ${B.brd}`,
            borderRadius:16, padding:"16px 18px" }}>
            <div style={{ fontWeight:700, fontSize:13, color:B.ink, marginBottom:10 }}>Why ALLIDO?</div>
            {["Verified local workers","Live tracking","No hidden charges","Pay after service"].map(t=>(
              <div key={t} style={{ display:"flex", alignItems:"center", gap:10,
                color:B.inkLight, fontSize:13, marginBottom:8 }}>
                <span style={{ width:18, height:18, borderRadius:"50%", background:B.mint,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:9, color:"#fff", flexShrink:0 }}>✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
