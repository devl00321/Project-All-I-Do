import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../../components/Common';
import api from '../../utils/api';
import { ShieldCheck } from 'lucide-react';

export default function HqAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/hq/login', { email, password });
      localStorage.setItem('hqToken', res.data.token);
      navigate('/hq/dashboard');
    } catch (err) {
      setError('Invalid HQ credentials. Please verify your access.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f5f7', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: 40, backgroundColor: '#ffffff', borderRadius: 8, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ background: '#eff6ff', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M4 13L12 5L20 13M7 11V19H17V11" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>HQ Administration</h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 8 }}>Secure access to global operations</p>
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: 6, fontSize: 13, marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Corporate Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', transition: 'border-color 0.15s ease-in-out', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', transition: 'border-color 0.15s ease-in-out', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'background-color 0.15s ease-in-out', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            {loading ? <Spinner color="#ffffff" /> : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
}
