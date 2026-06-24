import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, MapPin, Phone, ShieldCheck, Mail, Lock, User, FileText, Fingerprint } from 'lucide-react';
import { B } from '../../constants';
import { Spinner } from '../../components/Common';
import api from '../../utils/api';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', city: '',
    aadhaar_id: '', pan_id: '', voter_id: ''
  });

  // Files
  const [facePhoto, setFacePhoto] = useState(null);
  const [aadhaarPhoto, setAadhaarPhoto] = useState(null);
  const [panPhoto, setPanPhoto] = useState(null);

  // Camera State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      alert("Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 320, 240);
      canvasRef.current.toBlob(blob => {
        const file = new File([blob], 'face_capture.jpg', { type: 'image/jpeg' });
        setFacePhoto(file);
        stopCamera();
      }, 'image/jpeg');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!facePhoto || !aadhaarPhoto || !panPhoto) {
      setError("Please complete all document uploads including Face Verification.");
      return;
    }
    
    setLoading(true);
    setError('');

    const fd = new FormData();
    Object.keys(formData).forEach(key => fd.append(key, formData[key]));
    fd.append('face_photo', facePhoto);
    fd.append('aadhaar_photo', aadhaarPhoto);
    fd.append('pan_photo', panPhoto);

    try {
      await api.post('/dealer/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Registration successful! HQ will review your profile. You can now login.");
      navigate('/admin');
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-screen">
      <div className="login-dots"></div>
      <div className="login-orb login-orb-1"></div>
      <div className="login-orb login-orb-2"></div>

      <div className="register-card">
        <div className="register-card-head">
          <div className="login-brand">
            <div className="login-brand-icon">
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 13L12 5L20 13M7 11V19H17V11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="login-brand-name">ALLIDO</span>
          </div>
          <h1>Dealer Partner Application</h1>
          <p>Join ALLIDO as a city operator to manage fleets and bookings.</p>

          <div className="step-progress">
            <div className={`step-seg ${step > 1 ? 'done' : step === 1 ? 'active' : ''}`}><div className="step-seg-fill"></div></div>
            <div className={`step-seg ${step > 2 ? 'done' : step === 2 ? 'active' : ''}`}><div className="step-seg-fill"></div></div>
            <div className={`step-seg ${step === 3 ? 'active' : ''}`}><div className="step-seg-fill"></div></div>
          </div>
          <div className="step-labels">
            <div className={`step-label ${step >= 1 ? 'active' : ''}`}>Basic Info</div>
            <div className={`step-label ${step >= 2 ? 'active' : ''}`}>KYC Details</div>
            <div className={`step-label ${step >= 3 ? 'active' : ''}`}>Identity</div>
          </div>
        </div>

        <div className="register-body">
          {error && <div style={{ background: 'var(--errBg)', color: 'var(--err)', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500, marginBottom: 20 }}>{error}</div>}

          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="register-section-title">Step 1: Account Creation</h2>
              
              <div className="info-box">
                <ShieldCheck />
                <p>Your data is securely encrypted. We only use this to set up your operator dashboard and verify your franchise eligibility.</p>
              </div>

              <div className="field-group">
                <label className="field-label">Full Legal Name</label>
                <div style={{position:'relative'}}>
                  <User style={{position:'absolute', left:16, top:13, width:16, height:16, color:'var(--muted-2)'}} />
                  <input className="field-input" style={{paddingLeft:44}} type="text" placeholder="As per government ID" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Business Email</label>
                  <div style={{position:'relative'}}>
                    <Mail style={{position:'absolute', left:16, top:13, width:16, height:16, color:'var(--muted-2)'}} />
                    <input className="field-input" style={{paddingLeft:44}} type="email" placeholder="you@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Password</label>
                  <div style={{position:'relative'}}>
                    <Lock style={{position:'absolute', left:16, top:13, width:16, height:16, color:'var(--muted-2)'}} />
                    <input className="field-input" style={{paddingLeft:44}} type="password" placeholder="Min 8 chars" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Operating City</label>
                <div style={{position:'relative'}}>
                  <MapPin style={{position:'absolute', left:16, top:13, width:16, height:16, color:'var(--muted-2)'}} />
                  <input className="field-input" style={{paddingLeft:44}} type="text" placeholder="e.g. Suri" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
              </div>

              <button className="btn-full btn-mint" onClick={() => setStep(2)}>Continue to KYC →</button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="register-section-title">Step 2: KYC Documents</h2>
              
              <div className="info-box">
                <Fingerprint />
                <p>As an ALLIDO Dealer, you will handle worker assignments and payouts. Government verification is mandatory.</p>
              </div>

              <div className="field-group">
                <label className="field-label">Aadhaar Number <span className="tag-inline" style={{marginLeft:8}}>Required</span></label>
                <div style={{position:'relative'}}>
                  <FileText style={{position:'absolute', left:16, top:13, width:16, height:16, color:'var(--muted-2)'}} />
                  <input className="field-input" style={{paddingLeft:44, letterSpacing:'2px'}} type="text" placeholder="0000 0000 0000" value={formData.aadhaar_id} onChange={e => setFormData({...formData, aadhaar_id: e.target.value.replace(/[^0-9]/g, '').slice(0, 12)})} />
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">PAN Number <span className="tag-inline" style={{marginLeft:8}}>Required</span></label>
                  <input className="field-input" style={{letterSpacing:'1px', textTransform:'uppercase'}} type="text" placeholder="ABCDE1234F" value={formData.pan_id} onChange={e => setFormData({...formData, pan_id: e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()})} />
                </div>
                <div className="field-group">
                  <label className="field-label">Voter ID <span style={{color:'var(--muted-2)', fontWeight:400, marginLeft:4}}>(Optional)</span></label>
                  <input className="field-input" style={{letterSpacing:'1px', textTransform:'uppercase'}} type="text" placeholder="ABC1234567" value={formData.voter_id} onChange={e => setFormData({...formData, voter_id: e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase()})} />
                </div>
              </div>

              <div style={{display:'flex', gap:14, marginTop:24}}>
                <button className="btn-full" style={{background:'var(--paper)', border:'1.5px solid var(--border-2)', color:'var(--ink)', flex:1}} onClick={() => setStep(1)}>Back</button>
                <button className="btn-full btn-mint" style={{flex:2, marginTop:0}} onClick={() => setStep(3)}>Proceed to Identity →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="register-section-title">Step 3: Identity Verification</h2>
              
              <div style={{marginBottom: 24}}>
                <div className="field-label" style={{marginBottom:10}}>1. Live Face Verification</div>
                {!facePhoto ? (
                  <div style={{ border: `2px dashed var(--border-2)`, borderRadius: 'var(--r-md)', padding: 20, textAlign: 'center', background: 'var(--paper)' }}>
                    <div style={{ display: cameraActive ? 'block' : 'none' }}>
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: 12, border:'1px solid var(--border)', marginBottom: 12 }} />
                      <button className="btn-full" style={{background:'var(--ink)', color:'#fff', padding:'10px'}} onClick={capturePhoto}>Capture Photo</button>
                    </div>
                    {!cameraActive && (
                      <div>
                        <div style={{width:50, height:50, borderRadius:'50%', background:'var(--mint-pale)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px'}}>
                          <Camera size={24} color="var(--mint-dark)" />
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>Please look straight into the camera in a well-lit area.</p>
                        <button className="btn-full" style={{background:'white', border:'1.5px solid var(--border-2)'}} onClick={startCamera}>Start Camera</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--mint-pale)', borderRadius: 'var(--r-md)', border: `1px solid rgba(93,202,165,.3)` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--mint-dark)', fontWeight: 600, fontSize: 13 }}>
                      <CheckCircle2 size={18} /> Face Verified Successfully
                    </div>
                    <button onClick={() => setFacePhoto(null)} style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', display:'flex', alignItems:'center' }}><X size={16} /></button>
                  </div>
                )}
                <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
              </div>

              <div style={{marginBottom: 24}}>
                <div className="field-label" style={{marginBottom:10}}>2. Document Uploads</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', padding: 20, textAlign: 'center', border: `2px dashed ${aadhaarPhoto ? 'rgba(93,202,165,.4)' : 'var(--border-2)'}`, borderRadius: 'var(--r-md)', cursor: 'pointer', background: aadhaarPhoto ? 'var(--mint-pale)' : 'var(--paper)', transition:'all .2s' }}>
                      <Upload size={24} color={aadhaarPhoto ? 'var(--mint-dark)' : 'var(--muted-2)'} style={{margin:'0 auto'}} />
                      <div style={{ fontSize: 12, marginTop: 10, fontWeight: 600, color: aadhaarPhoto ? 'var(--mint-dark)' : 'var(--muted)' }}>{aadhaarPhoto ? 'Aadhaar Ready' : 'Upload Aadhaar'}</div>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setAadhaarPhoto(e.target.files[0])} />
                    </label>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', padding: 20, textAlign: 'center', border: `2px dashed ${panPhoto ? 'rgba(93,202,165,.4)' : 'var(--border-2)'}`, borderRadius: 'var(--r-md)', cursor: 'pointer', background: panPhoto ? 'var(--mint-pale)' : 'var(--paper)', transition:'all .2s' }}>
                      <Upload size={24} color={panPhoto ? 'var(--mint-dark)' : 'var(--muted-2)'} style={{margin:'0 auto'}} />
                      <div style={{ fontSize: 12, marginTop: 10, fontWeight: 600, color: panPhoto ? 'var(--mint-dark)' : 'var(--muted)' }}>{panPhoto ? 'PAN Ready' : 'Upload PAN'}</div>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setPanPhoto(e.target.files[0])} />
                    </label>
                  </div>
                </div>
              </div>

              <div style={{display:'flex', gap:14}}>
                <button className="btn-full" style={{background:'var(--paper)', border:'1.5px solid var(--border-2)', color:'var(--ink)', flex:1}} onClick={() => setStep(2)}>Back</button>
                <button className="btn-full btn-mint" style={{flex:2, marginTop:0}} onClick={handleSubmit} disabled={loading}>
                  {loading ? <Spinner color="#fff" /> : 'Submit Application'}
                </button>
              </div>
            </div>
          )}

        </div>
        <div className="register-footer">
          <div className="register-footer-text">
            Already registered? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>Sign In</a>
          </div>
        </div>
      </div>
    </div>
  );
}
