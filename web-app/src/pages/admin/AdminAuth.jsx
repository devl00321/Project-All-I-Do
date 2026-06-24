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
    <div className="login-screen">
      <div className="login-dots"></div>
      <div className="login-orb login-orb-1"></div>
      <div className="login-orb login-orb-2"></div>

      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M4 13L12 5L20 13M7 11V19H17V11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="login-brand-name">ALLIDO</span>
        </div>

        <div className="login-head">
          <h1>Dealer Portal</h1>
          <p>Sign in to manage ALLIDO operations</p>
        </div>

        {error && <div style={{ background: 'var(--errBg)', color: 'var(--err)', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500, marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="field-group">
            <label className="field-label">Email address</label>
            <input 
              className="field-input" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@allido.com" 
              required 
            />
          </div>
          <div className="field-group">
            <label className="field-label">Password</label>
            <input 
              className="field-input" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password" 
              required 
            />
          </div>
          <button type="submit" className="btn-full btn-mint" disabled={loading}>
            {loading ? <Spinner color="#fff" /> : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Sign in
              </>
            )}
          </button>
        </form>

        <p className="login-footer-text">Want to become a city operator? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/register'); }}>Apply Here</a></p>
      </div>
    </div>
  );
}
