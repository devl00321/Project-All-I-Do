import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { B } from '../../constants';
import { Spinner } from '../../components/Common';
import api from '../../utils/api';

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
      setError('Invalid HQ credentials. Use hq@allido.com / hq123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
      {/* Visual Brand Side */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', padding: '60px', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '80%', height: '80%', background: 'var(--mint)', filter: 'blur(200px)', opacity: 0.15, borderRadius: '50%' }}></div>
        <div style={{ zIndex: 1 }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 42, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16 }}>ALLIDO HQ</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, maxWidth: 400, lineHeight: 1.5 }}>
            Global operations control. Manage cities, dealers, and network health from one unified command center.
          </p>
        </div>
      </div>

      {/* Auth Form Side */}
      <div style={{ flex: '0 0 500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--inkMid)', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🏢</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>HQ Access</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Secure login for authorized personnel only.</p>
          </div>

          {error && <div style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500, marginBottom: 20, border: '1px solid rgba(220, 38, 38, 0.2)' }}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>HQ Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', outline: 'none', transition: 'border-color 0.2s', fontSize: 15 }}
                placeholder="hq@allido.com"
                onFocus={(e) => e.target.style.borderColor = 'var(--mint)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', outline: 'none', transition: 'border-color 0.2s', fontSize: 15 }}
                placeholder="••••••••"
                onFocus={(e) => e.target.style.borderColor = 'var(--mint)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <button type="submit" style={{ width: '100%', background: '#fff', color: 'var(--ink)', padding: '15px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', justifyContent: 'center' }} disabled={loading} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
              {loading ? <Spinner color="var(--ink)" /> : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
