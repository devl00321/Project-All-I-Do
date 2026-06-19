import React, { useState, useRef, useEffect } from 'react';
import { B } from '../../constants';
import { AllidoLogo, Spinner } from '../../components/Common';
import gsap from 'gsap';

export default function Auth({ onLogin }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["","","",""]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [cd, setCd] = useState(0);
  
  const refs = useRef([]);
  const stepRef = useRef(null);

  useEffect(() => { if(cd>0){const t=setTimeout(()=>setCd(c=>c-1),1000);return()=>clearTimeout(t);} }, [cd]);

  useEffect(() => {
    if (stepRef.current) {
      gsap.fromTo(stepRef.current, 
        { opacity: 0, y: 18 }, 
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [step]);

  const sendOTP = () => {
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("otp"); setCd(30); }, 1200);
  };
  const handleOtp = (val, i) => {
    const d = val.replace(/\D/,"");
    const n = [...otp]; n[i] = d; setOtp(n);
    if (d && i < 3) refs.current[i+1]?.focus();
    if (n.every(v=>v)) { setLoading(true); setTimeout(()=>{setLoading(false);setStep("name");},700); }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:`linear-gradient(135deg, ${B.mintLight} 0%, #fff 50%)` }}>
      {/* Left panel */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"60px 80px", background:`linear-gradient(160deg, ${B.mintLight} 0%, ${B.surface} 100%)`,
        borderRight:`1.5px solid ${B.brd}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:48 }}>
          <AllidoLogo size={52}/>
          <div>
            <div style={{ fontFamily:"'Lexend',sans-serif", fontSize:32, fontWeight:600, color:B.ink, letterSpacing:-1 }}>All<span style={{ color: B.mint }}>i</span>Do</div>
            <div style={{ color:B.inkLight, fontSize:13 }}>All I Do</div>
          </div>
        </div>
        <div style={{ fontFamily:"'Lexend',sans-serif", fontSize:42, fontWeight:600, color:B.ink,
          lineHeight:1.15, marginBottom:20, maxWidth:420 }}>
          Every home service,<br/>
          <span style={{ color:B.mint }}>at your doorstep.</span>
        </div>
        <div style={{ color:B.inkLight, fontSize:16, lineHeight:1.7, maxWidth:400, marginBottom:48 }}>
          Book verified local workers for plumbing, electrical, cleaning, AC repair and more —
          in Suri, Birbhum and nearby areas.
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {["Verified & trained local workers","Live tracking on every booking","Transparent pricing, no hidden charges"].map(t=>(
            <div key={t} style={{ display:"flex", alignItems:"center", gap:12, color:B.inkLight, fontSize:14 }}>
              <span style={{ width:22, height:22, borderRadius:"50%", background:B.mint,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", flexShrink:0 }}>✓</span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width:480, display:"flex", alignItems:"center", justifyContent:"center",
        padding:48, background:"#fff" }}>
        <div style={{ width:"100%", maxWidth:360 }} ref={stepRef}>
          {step==="phone" && (
            <div>
              <div style={{ fontFamily:"'Lexend',sans-serif", fontSize:28, fontWeight:600,
                color:B.ink, marginBottom:6 }}>Sign in</div>
              <div style={{ color:B.inkLight, fontSize:14, marginBottom:32 }}>
                Enter your mobile number to continue
              </div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:B.inkLight, marginBottom:8 }}>
                Mobile Number
              </label>
              <div style={{ display:"flex", alignItems:"center", background:B.bg,
                border:`1.5px solid ${B.brd}`, borderRadius:13, padding:"4px 4px 4px 16px",
                marginBottom:20, gap:8, transition:"border-color .2s" }}>
                <span style={{ color:B.inkLight, fontWeight:600, fontSize:13, flexShrink:0 }}>🇮🇳 +91</span>
                <input className="fi" type="tel" maxLength={10} placeholder="98765 43210"
                  style={{ background:"transparent", border:"none", boxShadow:"none", padding:"10px 8px", flex:1 }}
                  value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/,""))}
                  onKeyDown={e=>e.key==="Enter"&&sendOTP()} />
              </div>
              <button className="pbtn" style={{ width:"100%" }}
                disabled={phone.length<10||loading} onClick={sendOTP}>
                {loading ? <Spinner color="#fff"/> : "Send OTP →"}
              </button>
              <p style={{ textAlign:"center", color:B.muted, fontSize:12, marginTop:16 }}>
                By continuing you agree to ALLIDO's Terms of Service
              </p>
            </div>
          )}
          {step==="otp" && (
            <div>
              <div style={{ fontFamily:"'Lexend',sans-serif", fontSize:28, fontWeight:600, color:B.ink, marginBottom:6 }}>
                Verify OTP
              </div>
              <div style={{ color:B.inkLight, fontSize:14, marginBottom:32 }}>Sent to +91 {phone}</div>
              <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:24 }}>
                {otp.map((v,i)=>(
                  <input key={i} ref={el=>refs.current[i]=el} className="otp-inp"
                    maxLength={1} value={v}
                    onChange={e=>handleOtp(e.target.value,i)}
                    onKeyDown={e=>{if(e.key==="Backspace"&&!v&&i>0)refs.current[i-1]?.focus();}}/>
                ))}
              </div>
              {loading && <div style={{ textAlign:"center", marginBottom:16 }}><Spinner/></div>}
              <div style={{ textAlign:"center", marginBottom:24 }}>
                {cd>0
                  ? <span style={{ color:B.muted, fontSize:13 }}>Resend in {cd}s</span>
                  : <button onClick={()=>{setCd(30);setOtp(["","","",""]);}}
                      style={{ background:"none", border:"none", color:B.mint, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                      Resend OTP
                    </button>}
              </div>
              <button className="gbtn" style={{ width:"100%" }} onClick={()=>setStep("phone")}>← Change number</button>
            </div>
          )}
          {step==="name" && (
            <div>
              <div style={{ fontFamily:"'Lexend',sans-serif", fontSize:28, fontWeight:600, color:B.ink, marginBottom:6 }}>
                Almost there!
              </div>
              <div style={{ color:B.inkLight, fontSize:14, marginBottom:28 }}>What should we call you?</div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:B.inkLight, marginBottom:8 }}>Your Name</label>
              <input className="fi" placeholder="Full name" value={name} style={{ marginBottom:20 }}
                onChange={e=>setName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&name.trim()&&onLogin(name, phone)}/>
              <button className="pbtn" style={{ width:"100%" }} disabled={!name.trim()||loading}
                onClick={()=>{setLoading(true);setTimeout(()=>{setLoading(false);onLogin(name, phone);},600);}}>
                {loading ? <Spinner color="#fff"/> : "Enter Dashboard →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
