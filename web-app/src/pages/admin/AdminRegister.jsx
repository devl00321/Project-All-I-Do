import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, Eye, EyeOff } from 'lucide-react';
import { B } from '../../constants';
import { Spinner } from '../../components/Common';
import api from '../../utils/api';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
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
      const res = await api.post('/dealer/register', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Registration successful! HQ will review your profile. You can now login.");
      navigate('/admin/login');
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: B.mintFog, padding: 24 }}>
      <div className="card" style={{ width: '100%', maxWidth: 500, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: B.ink }}>Dealer Partner Application</h2>
          <p style={{ color: B.muted, fontSize: 14 }}>Join ALLIDO as a city operator</p>
        </div>

        {error && <div style={{ background: B.errBg, color: B.err, padding: '12px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ flex: 1, height: 4, background: i <= step ? B.mint : B.brd, borderRadius: 2 }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Basic Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="text" className="fi" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="email" className="fi" placeholder="Business Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="fi" 
                  placeholder="Create Password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                    background: 'none', border: 'none', cursor: 'pointer', color: B.muted,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <input type="text" className="fi" placeholder="Operating City (e.g. Suri)" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              <button className="pbtn" onClick={() => setStep(2)}>Next Step</button>
              <div style={{ textAlign: 'center', fontSize: 13, marginTop: 16 }}>
                Already a dealer? <a href="#" onClick={() => navigate('/admin')} style={{ color: B.mint, fontWeight: 600, textDecoration: 'none' }}>Login</a>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>KYC Document Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="text" className="fi" placeholder="Aadhaar Number (12 digits)" value={formData.aadhaar_id} onChange={e => setFormData({...formData, aadhaar_id: e.target.value})} />
              <input type="text" className="fi" placeholder="PAN Number (10 chars)" value={formData.pan_id} onChange={e => setFormData({...formData, pan_id: e.target.value})} />
              <input type="text" className="fi" placeholder="Voter ID (optional)" value={formData.voter_id} onChange={e => setFormData({...formData, voter_id: e.target.value})} />
              
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button className="gbtn" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
                <button className="pbtn" style={{ flex: 1 }} onClick={() => setStep(3)}>Next Step</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Identity Verification</h3>
            
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: B.ink }}>1. Live Face Capture</div>
              {!facePhoto ? (
                <div style={{ border: `2px dashed ${B.brd}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  {cameraActive ? (
                    <div>
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />
                      <button className="pbtn" onClick={capturePhoto} style={{ width: '100%' }}>Capture Photo</button>
                    </div>
                  ) : (
                    <div>
                      <Camera size={32} color={B.muted} style={{ marginBottom: 8 }} />
                      <p style={{ fontSize: 13, color: B.muted, marginBottom: 12 }}>We need to verify your identity.</p>
                      <button className="gbtn" onClick={startCamera}>Start Camera</button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: B.okBg, borderRadius: 8, border: `1px solid ${B.ok}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: B.ok, fontWeight: 600, fontSize: 13 }}>
                    <span>✅ Face Verified</span>
                  </div>
                  <button onClick={() => setFacePhoto(null)} style={{ background: 'none', border: 'none', color: B.err, cursor: 'pointer' }}><X size={16} /></button>
                </div>
              )}
              {/* Hidden canvas for image capture */}
              <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: B.ink }}>2. Document Scans</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', padding: 16, textAlign: 'center', border: `2px dashed ${B.brd}`, borderRadius: 12, cursor: 'pointer', background: aadhaarPhoto ? B.mintLight : '#fff' }}>
                    <Upload size={20} color={aadhaarPhoto ? B.mint : B.muted} />
                    <div style={{ fontSize: 12, marginTop: 8, fontWeight: 600, color: aadhaarPhoto ? B.mint : B.muted }}>{aadhaarPhoto ? 'Aadhaar Uploaded' : 'Upload Aadhaar'}</div>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setAadhaarPhoto(e.target.files[0])} />
                  </label>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', padding: 16, textAlign: 'center', border: `2px dashed ${B.brd}`, borderRadius: 12, cursor: 'pointer', background: panPhoto ? B.mintLight : '#fff' }}>
                    <Upload size={20} color={panPhoto ? B.mint : B.muted} />
                    <div style={{ fontSize: 12, marginTop: 8, fontWeight: 600, color: panPhoto ? B.mint : B.muted }}>{panPhoto ? 'PAN Uploaded' : 'Upload PAN'}</div>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setPanPhoto(e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="gbtn" style={{ flex: 1 }} onClick={() => setStep(2)}>Back</button>
              <button className="pbtn" style={{ flex: 2 }} onClick={handleSubmit} disabled={loading}>
                {loading ? <Spinner color="#fff" /> : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
