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
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <header style={{ background: '#0f172a', color: '#fff', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: 24 }}>🏢</span>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>HQ Global Portal</h1>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 24 }}>Pending Dealer Requests</h2>
        
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
                <tr style={{ borderBottom: `2px solid ${B.brd}` }}>
                  <th style={{ padding: '12px', color: B.muted }}>City</th>
                  <th style={{ padding: '12px', color: B.muted }}>Dealer Name</th>
                  <th style={{ padding: '12px', color: B.muted }}>Email</th>
                  <th style={{ padding: '12px', color: B.muted }}>Request Type</th>
                  <th style={{ padding: '12px', color: B.muted }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} style={{ borderBottom: `1px solid #e2e8f0` }}>
                    <td style={{ padding: '16px 12px', fontWeight: 600 }}>{req.city || 'Unknown'}</td>
                    <td style={{ padding: '16px 12px' }}>{req.name}</td>
                    <td style={{ padding: '16px 12px', color: B.muted }}>{req.email}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
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
