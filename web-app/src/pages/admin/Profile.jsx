import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Lock, Unlock, Image as ImageIcon, Save, CheckCircle } from 'lucide-react';
import { B } from '../../constants';
import { Spinner } from '../../components/Common';
import api from '../../utils/api';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Editable fields
  const [formData, setFormData] = useState({
    name: '', email: '', city: '', password: ''
  });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminAuth');
      if (!token || token === 'true') {
        // If they are on old hardcoded token, warn them
        if (token === 'true') {
          alert('You are using the legacy test account. Please logout and login with the real Dealer account.');
        }
        return;
      }
      
      const res = await api.get('/dealer/profile', {
        headers: { Authorization: token }
      });
      setProfile(res.data);
      setFormData({
        name: res.data.name,
        email: res.data.email,
        city: res.data.city || '',
        password: res.data.password || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRequestEdit = async () => {
    try {
      const token = localStorage.getItem('adminAuth');
      await api.post('/dealer/profile/request-edit', {}, {
        headers: { Authorization: token }
      });
      fetchProfile();
      setMessage('Edit request sent to HQ.');
    } catch (err) {
      alert("Failed to request edit.");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminAuth');
      await api.put('/dealer/profile', formData, {
        headers: { Authorization: token }
      });
      setMessage('Profile updated successfully! Edit access is now locked again.');
      fetchProfile();
    } catch (err) {
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!profile) return <div style={{ padding: 40, textAlign: 'center' }}>Error loading profile.</div>;

  const canEdit = profile.edit_permission_status === 'GRANTED';
  const isRequested = profile.edit_permission_status === 'REQUESTED';

  const DocumentPreview = ({ label, url }) => (
    <div style={{ flex: 1, border: `1px solid ${B.brd}`, borderRadius: 12, padding: 12, background: '#f9fafb', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 12, right: 12 }}><Lock size={16} color={B.muted} /></div>
      <div style={{ fontSize: 12, fontWeight: 700, color: B.muted, marginBottom: 8, textTransform: 'uppercase' }}>{label}</div>
      {url ? (
        <a href={`http://localhost:5000${url}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
          <ImageIcon size={18} /> View Document
        </a>
      ) : (
        <div style={{ color: B.muted, fontSize: 13 }}>Not uploaded</div>
      )}
    </div>
  );

  return (
    <div className="container animate-fade-in" style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
      <header style={{ marginBottom: 32, display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: B.brd, overflow: 'hidden', border: `3px solid ${B.mint}` }}>
          {profile.face_photo_url ? (
            <img src={`http://localhost:5000${profile.face_photo_url}`} alt="Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: B.mintLight }}><Camera color={B.mint} size={32} /></div>
          )}
        </div>
        <div>
          <h1 className="heading-2" style={{ fontSize: 28, fontWeight: 700, color: B.ink }}>{profile.name}</h1>
          <p className="text-secondary" style={{ color: B.muted }}>City Dealer: {profile.city || 'Unassigned'}</p>
        </div>
      </header>

      {message && (
        <div style={{ background: B.okBg, color: B.ok, padding: '16px', borderRadius: 8, marginBottom: 24, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={18} /> {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        
        {/* Left Column: Editable Data */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Personal Details</h3>
            
            {!canEdit && !isRequested && (
              <button onClick={handleRequestEdit} style={{ background: 'transparent', color: B.mint, border: `1px solid ${B.mint}`, padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Unlock size={14} /> Request Edit Access
              </button>
            )}
            
            {isRequested && (
              <span style={{ background: '#fef3c7', color: '#b45309', padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                ⏳ Pending HQ Approval
              </span>
            )}
            
            {canEdit && (
              <span style={{ background: B.okBg, color: B.ok, padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Unlock size={14} /> Edit Mode Unlocked
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: B.muted, marginBottom: 6 }}>Full Name</label>
              <input type="text" className="fi" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={!canEdit} style={{ width: '100%', opacity: canEdit ? 1 : 0.6 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: B.muted, marginBottom: 6 }}>Email Address</label>
              <input type="email" className="fi" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={!canEdit} style={{ width: '100%', opacity: canEdit ? 1 : 0.6 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: B.muted, marginBottom: 6 }}>Operating City</label>
              <input type="text" className="fi" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} disabled={!canEdit} style={{ width: '100%', opacity: canEdit ? 1 : 0.6 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: B.muted, marginBottom: 6 }}>Password</label>
              <input type="text" className="fi" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} disabled={!canEdit} style={{ width: '100%', opacity: canEdit ? 1 : 0.6 }} />
            </div>
            
            {canEdit && (
              <button className="pbtn" onClick={handleSave} disabled={saving} style={{ marginTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                {saving ? <Spinner color="#fff" /> : <><Save size={18} /> Save Changes & Relock</>}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Locked KYC */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={16} color={B.muted} /> Verified KYC Data
            </h3>
            <p style={{ fontSize: 13, color: B.muted, marginBottom: 24 }}>These details were verified by Headquarters during onboarding and cannot be changed.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: B.muted }}>Aadhaar Number</div>
                <div style={{ fontWeight: 600, color: B.ink }}>{profile.aadhaar_id || 'Not Provided'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: B.muted }}>PAN Number</div>
                <div style={{ fontWeight: 600, color: B.ink }}>{profile.pan_id || 'Not Provided'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: B.muted }}>Voter ID</div>
                <div style={{ fontWeight: 600, color: B.ink }}>{profile.voter_id || 'Not Provided'}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={16} color={B.muted} /> KYC Documents
            </h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <DocumentPreview label="Aadhaar" url={profile.aadhaar_photo_url} />
              <DocumentPreview label="PAN" url={profile.pan_photo_url} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
