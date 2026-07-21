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
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🏢</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: B.ink }}>HQ Portal</h2>
          <p style={{ color: B.muted, fontSize: 14 }}>Global operations control</p>
        </div>

        {error && <div style={{ background: B.errBg, color: B.err, padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: B.ink, marginBottom: 8 }}>HQ Email</label>
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
          <button className="pbtn" type="submit" style={{ width: '100%', background: '#0f172a' }}>
            {loading ? <Spinner color="#fff" /> : 'Access HQ System'}
          </button>
        </form>
      </div>
    </div>
  );
}
