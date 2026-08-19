import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, LayoutDashboard, Users, FileText, Settings, Search, Bell, Edit, Star, Activity, UserCheck, ShieldAlert, ArrowLeft, BarChart3, TrendingUp, Users as UsersIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Spinner } from '../../components/Common';
import api from '../../utils/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function HqDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [apps, setApps] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Detailed Dealer View State
  const [detailedDealer, setDetailedDealer] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Super Admin Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', city: '', status: '' });
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      const [reqsRes, appsRes, dealersRes] = await Promise.all([
        api.get('/hq/requests'),
        api.get('/hq/applications'),
        api.get('/hq/dealers')
      ]);
      setRequests(reqsRes.data);
      setApps(appsRes.data);
      setDealers(dealersRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data from the server. It might be restarting.");
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
    
    // Auto-refresh every 15s (only if not viewing detailed analytics to prevent jarring resets)
    const int = setInterval(() => {
      if (!detailedDealer && !isEditModalOpen) fetchRequests();
    }, 15000);
    return () => clearInterval(int);
  }, [navigate, detailedDealer, isEditModalOpen]);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/hq/requests/${id}`, { action });
      fetchRequests();
    } catch (err) {
      alert(`Failed to ${action.toLowerCase()} request`);
    }
  };

  const handleAppAction = async (id, action) => {
    try {
      await api.put(`/hq/applications/${id}/action`, { action });
      fetchRequests();
    } catch (err) {
      alert(`Failed to ${action.toLowerCase()} application`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hqToken');
    navigate('/hq');
  };

  const openDetailedView = async (dealer) => {
    setDetailedDealer(dealer);
    setAnalyticsLoading(true);
    try {
      const res = await api.get(`/hq/dealers/${dealer.id}/analytics`);
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const openEditModal = (dealer, e) => {
    if (e) e.stopPropagation(); // prevent row click
    setSelectedDealer(dealer);
    setEditForm({
      name: dealer.name || '',
      email: dealer.email || '',
      password: '', // blank unless changing
      city: dealer.city || '',
      status: dealer.status || 'APPROVED'
    });
    setIsEditModalOpen(true);
  };

  const handleSuperAdminSave = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const payload = { ...editForm };
      if (!payload.password) delete payload.password;
      
      const res = await api.put(`/hq/dealers/${selectedDealer.id}`, payload);
      setIsEditModalOpen(false);
      
      // Update detailed view if it's currently open
      if (detailedDealer && detailedDealer.id === selectedDealer.id) {
        setDetailedDealer(prev => ({...prev, ...res.data.user}));
      }
      fetchRequests();
    } catch (err) {
      alert('Failed to update dealer profile. Super Admin action rejected.');
    } finally {
      setEditLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Overview' },
    { id: 'dealers', icon: <UserCheck size={18} />, label: 'Dealer Approvals', badge: apps.length },
    { id: 'analytics', icon: <Activity size={18} />, label: 'Dealers & Analytics' },
    { id: 'requests', icon: <FileText size={18} />, label: 'Edit Requests', badge: requests.length },
    { id: 'settings', icon: <Settings size={18} />, label: 'Settings' }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif', color: '#334155' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid #e2e8f0' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '12px' }}>
            <path d="M4 13L12 5L20 13M7 11V19H17V11" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.02em' }}>ALLIDO HQ</span>
        </div>
        
        <div style={{ padding: '24px 16px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingLeft: '8px' }}>
            Main Menu
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sidebarItems.map(item => (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setDetailedDealer(null); }}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '6px', 
                  backgroundColor: activeTab === item.id && !detailedDealer ? '#eff6ff' : 'transparent',
                  color: activeTab === item.id && !detailedDealer ? '#2563eb' : '#64748b',
                  border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <span style={{ marginRight: '12px' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge > 0 && (
                  <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '100px' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* Top Header */}
        <header style={{ height: '64px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '400px', backgroundColor: '#f1f5f9', borderRadius: '6px', padding: '8px 12px' }}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search super-admin records..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '8px', fontSize: '14px', width: '100%' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', position: 'relative' }}>
              <Bell size={20} />
              {(apps.length > 0 || requests.length > 0) && (
                <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
              )}
            </button>
            <div style={{ height: '32px', width: '1px', backgroundColor: '#e2e8f0' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={handleLogout}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '13px' }}>
                HQ
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Supreme Admin</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Logout</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          
          {detailedDealer ? (
            // DETAILED DEALER COMMAND CENTER
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                  <button onClick={() => setDetailedDealer(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
                    <ArrowLeft size={16} /> Back to Directory
                  </button>
                  <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {detailedDealer.name}
                    {detailedDealer.status === 'APPROVED' && <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>APPROVED</span>}
                    {detailedDealer.status === 'SUSPENDED' && <span style={{ background: '#f3f4f6', color: '#374151', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>SUSPENDED</span>}
                  </h1>
                  <div style={{ fontSize: '15px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📍 {detailedDealer.city} Area</span> • <span>✉️ {detailedDealer.email}</span>
                  </div>
                </div>
                <button 
                  onClick={() => openEditModal(detailedDealer)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', color: '#2563eb', border: '1px solid #bfdbfe', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  <Edit size={16} /> Admin Override
                </button>
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={16} color="#2563eb" /> Total Revenue
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>₹{detailedDealer.totalRevenue.toLocaleString()}</div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UsersIcon size={16} color="#10b981" /> Total Customers
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{detailedDealer.totalCustomers}</div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} color="#f59e0b" /> Active Workers
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{detailedDealer.totalWorkers}</div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={16} color="#8b5cf6" /> Avg Rating
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{detailedDealer.overallRating > 0 ? detailedDealer.overallRating : 'N/A'} <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: '500' }}>/ 5.0</span></div>
                </div>
              </div>

              {/* Charts Section */}
              {analyticsLoading ? (
                <div style={{ padding: '64px', display: 'flex', justifyContent: 'center' }}><Spinner color="#2563eb" /></div>
              ) : analyticsData ? (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                  
                  {/* Revenue Chart */}
                  <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0 0 24px 0' }}>Revenue Trend (Past 6 Months)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.revenueData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(val) => `₹${val}`} />
                          <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                          <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Worker & Service Charts side by side in a column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0 0 16px 0' }}>Service Distribution</h3>
                      <div style={{ height: '180px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={analyticsData.serviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                              {analyticsData.serviceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: '0 0 16px 0' }}>Worker Status</h3>
                      <div style={{ height: '120px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.workerData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16}>
                              {analyticsData.workerData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Available' ? '#10b981' : entry.name === 'Busy' ? '#f59e0b' : '#94a3b8'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                </div>
              ) : null}

            </div>
          ) : (
            // NORMAL DASHBOARD VIEW
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  {activeTab === 'overview' && 'System Overview'}
                  {activeTab === 'dealers' && 'Pending Registrations'}
                  {activeTab === 'analytics' && 'Dealer Directory & Analytics'}
                  {activeTab === 'requests' && 'Edit Requests'}
                  {activeTab === 'settings' && 'System Settings'}
                </h1>
              </div>

              {(activeTab === 'overview' || activeTab === 'analytics') && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '32px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>Super Admin Directory</h2>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{dealers.length} total dealers</span>
                  </div>
                  
                  {loading ? (
                    <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}><Spinner color="#2563eb" /></div>
                  ) : error ? (
                    <div style={{ padding: '48px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444', marginBottom: '8px' }}>Connection Error</div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>{error}</div>
                    </div>
                  ) : dealers.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center' }}>
                      <Users size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>No Dealers Found</div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>There are no dealers currently registered in the system.</div>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dealer & City</th>
                          <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operations</th>
                          <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</th>
                          <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                          <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Manage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dealers.map(dealer => (
                          <tr 
                            key={dealer.id} 
                            onClick={() => openDetailedView(dealer)}
                            style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.15s ease', cursor: 'pointer' }} 
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} 
                            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{dealer.name}</div>
                              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{dealer.city} • {dealer.email}</div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div><span style={{ fontWeight: '600' }}>Customers:</span> {dealer.totalCustomers}</div>
                                <div><span style={{ fontWeight: '600' }}>Workers:</span> {dealer.totalWorkers}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontWeight: '600' }}>Rating:</span> {dealer.overallRating > 0 ? dealer.overallRating : 'N/A'}
                                  {dealer.overallRating > 0 && <Star size={12} fill="#eab308" color="#eab308" />}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                                ₹{dealer.totalRevenue.toLocaleString()}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{dealer.totalBookings} total bookings</div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              {dealer.status === 'APPROVED' && <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>APPROVED</span>}
                              {dealer.status === 'PENDING' && <span style={{ background: '#fef9c3', color: '#854d0e', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>PENDING</span>}
                              {dealer.status === 'REJECTED' && <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>REJECTED</span>}
                              {dealer.status === 'SUSPENDED' && <span style={{ background: '#f3f4f6', color: '#374151', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>SUSPENDED</span>}
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <button 
                                onClick={(e) => openEditModal(dealer, e)}
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease' }}
                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = '#ffffff'; }}
                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                              >
                                <Edit size={14} /> Modify
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {(activeTab === 'dealers') && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '32px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>Pending Dealer Registrations</h2>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{apps.length} pending</span>
                  </div>
                  
                  {loading ? (
                    <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}><Spinner color="#2563eb" /></div>
                  ) : apps.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center' }}>
                      <Users size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>No Applications</div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>All dealer registrations have been processed.</div>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>City & Dealer</th>
                          <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                          <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documents</th>
                          <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apps.map(app => (
                          <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.15s ease' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{app.city || 'N/A'}</div>
                              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{app.name}</div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ fontSize: '13px', color: '#334155' }}>{app.email}</div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div><span style={{ fontWeight: '600', color: '#334155' }}>AADHAAR:</span> {app.aadhaar_id} {app.aadhaar_photo_url && <a href={`http://localhost:5000${app.aadhaar_photo_url}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', marginLeft: '4px' }}>View</a>}</div>
                                <div><span style={{ fontWeight: '600', color: '#334155' }}>PAN:</span> {app.pan_id} {app.pan_photo_url && <a href={`http://localhost:5000${app.pan_photo_url}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', marginLeft: '4px' }}>View</a>}</div>
                                {app.face_photo_url && <div><span style={{ fontWeight: '600', color: '#334155' }}>FACE:</span> <a href={`http://localhost:5000${app.face_photo_url}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>View Match</a></div>}
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => handleAppAction(app.id, 'APPROVE')}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--surface)', color: '#10b981', border: '1px solid #10b981', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease' }}
                                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#10b981'; e.currentTarget.style.color = '#ffffff'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#10b981'; }}
                                >
                                  <Check size={14} /> Approve
                                </button>
                                <button 
                                  onClick={() => handleAppAction(app.id, 'REJECT')}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--surface)', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease' }}
                                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#ef4444'; }}
                                >
                                  <X size={14} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {(activeTab === 'requests') && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>Profile Edit Requests</h2>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{requests.length} pending</span>
                  </div>
                  
                  {loading ? (
                    <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}><Spinner color="#2563eb" /></div>
                  ) : requests.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center' }}>
                      <FileText size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>No Edit Requests</div>
                      <div style={{ fontSize: '14px', color: '#64748b' }}>No dealers are currently requesting profile modifications.</div>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dealer</th>
                          <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Request Type</th>
                          <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(req => (
                          <tr key={req.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.15s ease' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{req.name}</div>
                              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{req.city} • {req.email}</div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500', border: '1px solid #e2e8f0' }}>
                                Profile Modification
                              </span>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => handleAction(req.id, 'APPROVE')}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--surface)', color: '#10b981', border: '1px solid #10b981', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease' }}
                                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#10b981'; e.currentTarget.style.color = '#ffffff'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#10b981'; }}
                                >
                                  <Check size={14} /> Approve
                                </button>
                                <button 
                                  onClick={() => handleAction(req.id, 'REJECT')}
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--surface)', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease' }}
                                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#ef4444'; }}
                                >
                                  <X size={14} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '48px', textAlign: 'center' }}>
                   <Settings size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                   <div style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>System Settings</div>
                   <div style={{ fontSize: '14px', color: '#64748b' }}>Global configuration options will be available here.</div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Super Admin Edit Modal */}
        {isEditModalOpen && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(2px)' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldAlert size={20} color="#2563eb" />
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Super Admin: Dealer Override</h3>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSuperAdminSave} style={{ padding: '24px' }}>
                
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#1e3a8a', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ marginTop: '2px' }}>⚠️</span>
                  <span><strong>Warning:</strong> You are using supreme admin privileges. Changes here bypass normal dealer approval flows and immediately alter their account. You can hand over this account to a completely different person by changing the Name, Email, and Password.</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>Owner Name</label>
                    <input required type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>City Jurisdiction</label>
                    <input required type="text" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>Login Email</label>
                  <input required type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>Override Password (leave blank to keep current)</label>
                  <input type="text" placeholder="Enter new password..." value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>Account Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
                    <option value="APPROVED">Active (Approved)</option>
                    <option value="PENDING">Pending Review</option>
                    <option value="SUSPENDED">Suspended (Blocked)</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #e2e8f0', background: 'var(--surface)', borderRadius: '6px', fontSize: '14px', fontWeight: '500', color: '#475569', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={editLoading} style={{ padding: '8px 16px', border: 'none', background: '#2563eb', color: '#ffffff', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    {editLoading ? <Spinner color="#fff" /> : 'Execute Override'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
