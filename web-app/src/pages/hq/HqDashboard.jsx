import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle, XCircle } from 'lucide-react';
import { B } from '../../constants';
import api from '../../utils/api';

export default function HqDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/hq/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('hqToken');
    if (!token) {
      navigate('/hq');
      return;
    }
    fetchRequests();
    
    // Auto-refresh every 15s
    const int = setInterval(fetchRequests, 15000);
    return () => clearInterval(int);
  }, [navigate]);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/hq/requests/${id}`, { action });
      fetchRequests();
    } catch (err) {
      alert(`Failed to ${action.toLowerCase()} request`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hqToken');
    navigate('/hq');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <header style={{ background: 'var(--ink)', color: '#fff', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: 24 }}>🏢</span>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>HQ Global Portal</h1>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 24 }}>Pending Dealer Requests</h2>
        
        {loading ? (
          <div>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: B.muted }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: B.ink }}>All Clear</div>
            <div>No pending edit requests from any dealers.</div>
          </div>
        ) : (
          <div className="card" style={{ padding: 24 }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1.5px solid var(--brdMid)` }}>
                  <th style={{ padding: '16px 12px', color: 'var(--inkLight)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>City</th>
                  <th style={{ padding: '16px 12px', color: 'var(--inkLight)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dealer Name</th>
                  <th style={{ padding: '16px 12px', color: 'var(--inkLight)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ padding: '16px 12px', color: 'var(--inkLight)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Request Type</th>
                  <th style={{ padding: '16px 12px', color: 'var(--inkLight)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} style={{ borderBottom: `1px solid var(--brd)` }}>
                    <td style={{ padding: '16px 12px', fontWeight: 600, color: 'var(--ink)' }}>{req.city || 'Unknown'}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--ink)' }}>{req.name}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--inkLight)' }}>{req.email}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ background: 'var(--warnBg)', color: 'var(--warn)', padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                        Profile Edit Permission
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleAction(req.id, 'APPROVE')}
                          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 13, fontWeight: 600 }}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'REJECT')}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 13, fontWeight: 600 }}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
