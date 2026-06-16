// STATUS: READY FOR DEPLOY
import React, { useState, useEffect, useRef } from 'react';
import { B, SERVICES, TIME_SLOTS } from '../../constants';
import { Badge, Spinner } from '../../components/Common';
import CheckoutPayment from './CheckoutPayment';
import gsap from 'gsap';

export default function Booking({ preService, onConfirm }) {
  const [selSvc, setSelSvc] = useState(preService || null);
  const [step, setStep] = useState(preService ? 1 : 0);
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState([]);
  const [addr, setAddr] = useState("");
  const [gpsLoad, setGpsLoad] = useState(false);
  const [slot, setSlot] = useState(null);
  const [date, setDate] = useState("Today");
  const [pay, setPay] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const bookingRef = useRef(null);
  const formRef = useRef(null);

  const STEPS_LIST = ["Service","Describe","Address","Schedule","Payment"];
  const canNext = [selSvc!==null, desc.trim().length>0, addr.trim().length>0, slot!==null, pay!==null];

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

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:28, alignItems:"start" }}>
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
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{s.emoji}</div>
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
                  placeholder={`e.g. "Bathroom tap is leaking continuously, water dripping from the joint…"`}
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
              </div>
            )}

            {/* Step 2: Address */}
            {step===2&&(
              <div>
                <div style={{ fontWeight:700, fontSize:17, color:B.ink, marginBottom:18 }}>Service Location</div>
                <button onClick={()=>{setGpsLoad(true);setTimeout(()=>{setAddr("Lal Bazar Road, Ward 5, Suri, Birbhum – 731101");setGpsLoad(false);},1000);}} style={{
                  width:"100%", background:B.mintLight, border:`1.5px solid ${B.brd}`,
                  borderRadius:14, padding:"14px 18px", display:"flex", alignItems:"center",
                  gap:14, marginBottom:14, cursor:"pointer" }}>
                  {gpsLoad?<Spinner/>:<span style={{ fontSize:22 }}>📍</span>}
                  <div style={{ textAlign:"left" }}>
                    <div style={{ color:B.mint, fontWeight:700, fontSize:14 }}>
                      {gpsLoad?"Detecting your location…":"Use Current Location"}
                    </div>
                    <div style={{ color:B.muted, fontSize:12 }}>GPS auto-detect</div>
                  </div>
                </button>
                <div style={{ textAlign:"center", color:B.muted, fontSize:12, marginBottom:14 }}>— or enter manually —</div>
                <textarea className="fi" style={{ minHeight:80, resize:"none" }}
                  placeholder="Full address with landmark, PIN code…"
                  value={addr} onChange={e=>setAddr(e.target.value)}/>
                {addr&&(
                  <div style={{ marginTop:12, padding:"11px 16px",
                    background:`${B.ok}12`, border:`1.5px solid ${B.ok}44`,
                    borderRadius:12, display:"flex", alignItems:"center", gap:10 }}>
                    <span>✅</span>
                    <span style={{ fontSize:13, color:B.ok, fontWeight:600 }}>{addr}</span>
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
            {step===4 && <CheckoutPayment pay={pay} setPay={setPay} />}

            {/* Nav buttons */}
            <div style={{ display:"flex", gap:12, marginTop:28 }}>
              {step>0&&<button className="gbtn" style={{ flex:1 }} onClick={()=>setStep(s=>s-1)}>← Back</button>}
              {step<4
                ? <button className="pbtn" style={{ flex:2 }} disabled={!canNext[step]}
                    onClick={()=>setStep(s=>s+1)}>Continue →</button>
                : <button className="pbtn" style={{ flex:2 }} disabled={!canNext[4]||confirming}
                    onClick={async () => {
                      setConfirming(true);
                      if (pay === 'card' || pay === 'upi') {
                        try {
                          const res = await fetch('http://localhost:5000/api/create-razorpay-order', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ amount: 499 }) // mock amount
                          });
                          const order = await res.json();
                          const options = {
                            key: "rzp_test_T2C2aD1TZMX8tV",
                            amount: order.amount,
                            currency: order.currency,
                            name: "ALLIDO Services",
                            description: "Payment for " + (selSvc?.label || "Service"),
                            order_id: order.id,
                            handler: function (response) {
                              setConfirming(false);
                              onConfirm(selSvc);
                            },
                            prefill: {
                              name: "Wahid User",
                              email: "user@example.com",
                              contact: "9999999999"
                            },
                            theme: { color: "#5DCAA5" }
                          };
                          const rzp = new window.Razorpay(options);
                          rzp.on('payment.failed', function (response){
                            alert("Payment Failed");
                            setConfirming(false);
                          });
                          rzp.open();
                        } catch (err) {
                          console.error(err);
                          alert("Error initiating payment");
                          setConfirming(false);
                        }
                      } else {
                        // Cash on Delivery and Internal Wallet skip Razorpay
                        setTimeout(() => {
                          setConfirming(false);
                          onConfirm(selSvc);
                        }, 1400);
                      }
                    }}>
                    {confirming?<Spinner color="#fff"/>:"Confirm Booking · ₹349–₹599"}
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
              <span style={{ fontWeight:700, fontSize:14, color:B.mint }}>₹349–₹599</span>
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
