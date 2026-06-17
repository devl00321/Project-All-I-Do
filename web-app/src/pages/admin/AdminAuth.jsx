import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { B } from '../../constants';
import { Spinner } from '../../components/Common';
import api from '../../utils/api';

export default function AdminAuth() {
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
      const res = await api.post('/dealer/login', { email, password });
      // We store the 'token' (user ID) instead of 'true'
      localStorage.setItem('adminAuth', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid credentials. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: B.mintFog }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: B.ink }}>Dealer Portal</h2>
          <p style={{ color: B.muted, fontSize: 14 }}>Sign in to manage ALLIDO</p>
        </div>

        {error && <div style={{ background: B.errBg, color: B.err, padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: B.ink, marginBottom: 8 }}>Email Address</label>
            <input 
              type="email" 
              className="fi" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: B.ink, marginBottom: 8 }}>Password</label>
            <input 
              type="password" 
              className="fi" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={{ width: '100%' }}
            />
          </div>
          <button className="pbtn" type="submit" style={{ width: '100%' }} disabled={loading}>
            {loading ? <Spinner color="#fff" /> : 'Sign In'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: 13, color: B.muted }}>
            Want to become a city operator? <a href="#" onClick={() => navigate('/admin/register')} style={{ color: B.mint, fontWeight: 600, textDecoration: 'none' }}>Apply Here</a>
          </div>
        </form>
      </div>
    </div>
  );
}
