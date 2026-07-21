import React, { useState, useRef, useEffect } from 'react';
import { B } from '../../constants';
import { Spinner } from '../../components/Common';
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
    <div className="login-screen">
      <div className="login-dots"></div>
      <div className="login-orb login-orb-1"></div>
      <div className="login-orb login-orb-2"></div>

      <div className="login-card" style={{ width: 480 }}>
        <div className="login-brand">
          <div className="login-brand-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M4 13L12 5L20 13M7 11V19H17V11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="login-brand-name">ALLIDO</span>
        </div>

        <div ref={stepRef}>
          {step === "phone" && (
            <div>
              <div className="login-head">
                <h1>Welcome Back</h1>
                <p>Every home service, at your doorstep.</p>
              </div>
              
              <div className="field-group">
                <label className="field-label">Mobile Number</label>
                <div style={{ display:"flex", alignItems:"center", background:'var(--paper)',
                  border:`1.5px solid var(--border-2)`, borderRadius:'var(--r-md)', padding:"4px 4px 4px 16px",
                  marginBottom:20, gap:8, transition:"border-color .2s", outline: 'none' }}
                  className="focus-within:border-mint"
                >
                  <span style={{ color:'var(--muted)', fontWeight:600, fontSize:14, flexShrink:0 }}>🇮🇳 +91</span>
                  <input type="tel" maxLength={10} placeholder="98765 43210"
                    style={{ background:"transparent", border:"none", boxShadow:"none", padding:"10px 8px", flex:1, outline:'none', fontSize:15, color:'var(--ink)', fontWeight:500 }}
                    value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/,""))}
                    onKeyDown={e=>e.key==="Enter"&&sendOTP()} />
                </div>
              </div>

              <button className="btn-full btn-mint" disabled={phone.length<10||loading} onClick={sendOTP}>
                {loading ? <Spinner color="#fff"/> : "Send OTP →"}
              </button>
              <p className="login-footer-text">
                By continuing you agree to ALLIDO's Terms of Service
              </p>
            </div>
          )}

          {step === "otp" && (
            <div>
              <div className="login-head">
                <h1>Verify OTP</h1>
                <p>Sent to +91 {phone}</p>
              </div>
              
              <div style={{ display:"flex", gap:14, justifyContent:"center", marginBottom:28 }}>
                {otp.map((v,i)=>(
                  <input key={i} ref={el=>refs.current[i]=el} 
                    style={{ width: 64, height: 64, background: 'var(--paper)', border: '1.5px solid var(--border-2)', borderRadius: 'var(--r-md)', textAlign: 'center', fontSize: 24, fontWeight: 700, color: 'var(--ink)', outline: 'none', transition: 'border-color .2s' }}
                    className="focus:border-mint"
                    maxLength={1} value={v}
                    onChange={e=>handleOtp(e.target.value,i)}
                    onKeyDown={e=>{if(e.key==="Backspace"&&!v&&i>0)refs.current[i-1]?.focus();}}/>
                ))}
              </div>
              {loading && <div style={{ textAlign:"center", marginBottom:16 }}><Spinner/></div>}
              
              <div style={{ textAlign:"center", marginBottom:24 }}>
                {cd>0
                  ? <span style={{ color:'var(--muted)', fontSize:13 }}>Resend in {cd}s</span>
                  : <button onClick={()=>{setCd(30);setOtp(["","","",""]);}}
                      style={{ background:"none", border:"none", color:'var(--mint-deep)', fontSize:13, fontWeight:600, cursor:"pointer" }}>
                      Resend OTP
                    </button>}
              </div>
              <button className="btn-full" style={{ background:'var(--paper)', color:'var(--ink)', border:'1.5px solid var(--border-2)' }} onClick={()=>setStep("phone")}>← Change number</button>
            </div>
          )}

          {step === "name" && (
            <div>
              <div className="login-head">
                <h1>Almost there!</h1>
                <p>What should we call you?</p>
              </div>
              
              <div className="field-group">
                <label className="field-label">Your Name</label>
                <input className="field-input" placeholder="Full name" value={name} 
                  onChange={e=>setName(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&name.trim()&&onLogin(name, phone)}/>
              </div>

              <button className="btn-full btn-mint" disabled={!name.trim()||loading}
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
