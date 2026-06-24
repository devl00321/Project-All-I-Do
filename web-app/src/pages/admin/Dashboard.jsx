import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, Activity, LogOut, Settings, LayoutDashboard, Search, Map, CheckCircle2, AlertCircle, Clock, Truck } from 'lucide-react';
import api from '../../utils/api';
import AssignWorkerModal from './components/AssignWorkerModal';
import DealerLiveMap from './components/DealerLiveMap';
import { B } from '../../constants';
import useSocket from '../../hooks/useSocket';

export default function Dashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [usersCount, setUsersCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, workersRes, usersRes] = await Promise.all([
        api.get('/dealer/bookings'),
        api.get('/workers'),
        api.get('/users')
      ]);
      setBookings(bookingsRes.data);
      setWorkers(workersRes.data);
      setUsersCount(usersRes.data.length);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  useSocket('admin_room', 
    (data) => {
      if (data.workerId && data.lat && data.lng) {
        setWorkers(prevWorkers => prevWorkers.map(w => 
          w.id === data.workerId ? { ...w, current_lat: data.lat, current_lng: data.lng } : w
        ));
      }
    },
    () => {
      fetchDashboardData();
    }
  );

  const handleAssignClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setAssignModalOpen(true);
  };

  const handleAssignWorker = async (workerId) => {
    try {
      await api.put(`/dealer/bookings/${selectedBookingId}/assign`, { workerId });
      setAssignModalOpen(false);
      setSelectedBookingId(null);
      fetchDashboardData();
    } catch (error) {
      console.error("Assignment failed", error);
      alert("Failed to assign worker");
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await api.put(`/dealer/bookings/${bookingId}/complete`);
      fetchDashboardData();
    } catch (error) {
      console.error("Completion failed", error);
      alert("Failed to complete booking");
    }
  };

  // Stats
  const activeJobs = bookings.filter(b => b.status === 'IN_PROGRESS' || b.status === 'EN_ROUTE').length;
  const pendingJobs = bookings.filter(b => b.status === 'PENDING').length;
  const availableWorkers = workers.filter(w => w.status === 'AVAILABLE').length;
  const todayRevenue = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sb-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M4 13L12 5L20 13M7 11V19H17V11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="sb-brand-name">ALLIDO</span>
        </div>

        <div className="sidebar-section-label">Main Menu</div>
        <nav className="sidebar-nav">
          <div className="sidebar-link active"><LayoutDashboard /> Overview</div>
          <div className="sidebar-link"><Map /> Live Fleet</div>
          <div className="sidebar-link"><Calendar /> Schedule</div>
          <div className="sidebar-link"><Users /> Drivers</div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout}>
            <div className="sidebar-user-av">A</div>
            <div>
              <div className="sidebar-user-name">Admin User</div>
              <div className="sidebar-user-role">Sign Out</div>
            </div>
            <div className="sidebar-status-dot"></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">Dashboard Overview</div>
            <div className="topbar-sub">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div className="topbar-right">
            <div className="topbar-badge">
              <div className="topbar-badge-dot"></div>
              System Operational
            </div>
            <button className="topbar-icon-btn"><Search /></button>
            <button className="topbar-icon-btn"><Settings /></button>
          </div>
        </header>

        <div className="dash-content">
          <div className="stat-pills">
            <div className="stat-pill"><div className="stat-pill-dot" style={{background: 'var(--violet)'}}>{usersCount}</div> Total Users</div>
            <div className="stat-pill"><div className="stat-pill-dot" style={{background: 'var(--amber)'}}>{workers.length}</div> Fleet Size</div>
            <div className="stat-pill"><div className="stat-pill-dot" style={{background: 'var(--sky)'}}>{workers.filter(w => ['AVAILABLE', 'BUSY'].includes(w.status)).length}</div> Active Now</div>
          </div>

          <div className="metric-grid">
            <div className="metric-card" style={{'--mc-color':'var(--sky)', '--mc-bg':'rgba(56,189,248,.15)'}}>
              <div className="metric-icon-wrap"><Truck style={{color:'var(--sky)'}}/></div>
              <div className="metric-label">Active Jobs</div>
              <div className="metric-value">{activeJobs}</div>
              <div className="metric-sub">Currently en route or in progress</div>
            </div>
            <div className="metric-card" style={{'--mc-color':'var(--mint)', '--mc-bg':'rgba(93,202,165,.15)'}}>
              <div className="metric-icon-wrap"><CheckCircle2 style={{color:'var(--mint)'}}/></div>
              <div className="metric-label">Available Workers</div>
              <div className="metric-value">{availableWorkers}</div>
              <div className="metric-sub">Ready for assignment</div>
            </div>
            <div className="metric-card" style={{'--mc-color':'var(--amber)', '--mc-bg':'rgba(245,158,11,.15)'}}>
              <div className="metric-icon-wrap"><AlertCircle style={{color:'var(--amber)'}}/></div>
              <div className="metric-label">Pending Requests</div>
              <div className="metric-value">{pendingJobs}</div>
              <div className="metric-sub">Needs attention</div>
            </div>
            <div className="metric-card" style={{'--mc-color':'var(--coral)', '--mc-bg':'rgba(226,114,91,.15)'}}>
              <div className="metric-icon-wrap"><DollarSign style={{color:'var(--coral)'}}/></div>
              <div className="metric-label">Today's Revenue</div>
              <div className="metric-value">₹{todayRevenue}</div>
              <div className="metric-sub">Completed jobs only</div>
            </div>
          </div>

          <div className="dash-two-col">
            {/* Bookings Table */}
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>Recent Bookings</h3>
                <div className="dash-card-head-right">
                  <button className="topbar-icon-btn" onClick={fetchDashboardData} style={{width: 32, height: 32}}><Activity size={14}/></button>
                </div>
              </div>
              <div style={{overflowX: 'auto'}}>
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Worker</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" className="text-center py-6 text-muted">Loading bookings...</td></tr>
                    ) : bookings.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-6 text-muted">No recent bookings.</td></tr>
                    ) : (
                      bookings.map(b => (
                        <BookingRow 
                          key={b.id} 
                          booking={b} 
                          onAssign={() => handleAssignClick(b.id)} 
                          onComplete={() => handleCompleteBooking(b.id)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Map */}
            <div className="dash-card" style={{display: 'flex', flexDirection: 'column'}}>
              <div className="dash-card-head">
                <h3>Live Fleet Tracking</h3>
              </div>
              <div style={{flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div className="map-wrap" style={{flex: 1, minHeight: '300px', borderRadius: 'var(--r-md)', overflow: 'hidden'}}>
                  <DealerLiveMap workers={workers.filter(w => ['AVAILABLE', 'BUSY'].includes(w.status))} />
                </div>
                
                {/* Live Activity Feed */}
                <div style={{border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden'}}>
                  <div style={{padding: '10px 16px', background: 'var(--paper)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                    Activity Feed
                  </div>
                  <div className="activity-feed">
                    {bookings.slice(0, 3).map((b, idx) => (
                      <div className="activity-item" key={b.id || idx}>
                        <div className="activity-dot-wrap">
                          <div className={`activity-dot ${b.status === 'IN_PROGRESS' ? 'live' : ''}`} style={{background: b.status === 'IN_PROGRESS' ? 'var(--mint)' : (b.status === 'PENDING' ? 'var(--amber)' : 'var(--border-2)')}}></div>
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">{b.service} - {b.User?.name || 'Unknown'}</div>
                          <div className="activity-sub">Status: {b.status}</div>
                        </div>
                        <div className="activity-time">Just now</div>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <div className="empty-state" style={{padding: '24px 16px'}}>
                        <p>No activity yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AssignWorkerModal 
        isOpen={assignModalOpen} 
        onClose={() => setAssignModalOpen(false)} 
        workers={workers.filter(w => w.status === 'AVAILABLE')} 
        onAssign={handleAssignWorker} 
      />
    </div>
  );
}

function BookingRow({ booking, onAssign, onComplete }) {
  const getBadgeClass = (status) => {
    switch(status) {
      case 'COMPLETED': return 'badge-completed';
      case 'PENDING': return 'badge-pending';
      case 'IN_PROGRESS':
      case 'EN_ROUTE':
      case 'ASSIGNED': return 'badge-active';
      case 'CANCELLED': return 'badge-cancelled';
      default: return '';
    }
  };
  const isActive = ['ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS'].includes(booking.status);

  return (
    <tr>
      <td><div style={{fontWeight: 600, color: 'var(--ink)'}}>{booking.User?.name || 'Unknown'}</div></td>
      <td>{booking.service}</td>
      <td>
        <span className={`badge ${getBadgeClass(booking.status)}`}>
          <span className="badge-dot"></span>
          {booking.status.replace('_', ' ')}
        </span>
      </td>
      <td style={{color: 'var(--muted)'}}>{booking.Worker?.name || '-'}</td>
      <td>
        {booking.status === 'PENDING' ? (
          <button className="assign-btn" onClick={onAssign}>Assign Worker</button>
        ) : isActive ? (
          <button className="assign-btn" style={{background: 'rgba(56,189,248,.1)', color: '#0771A0', borderColor: 'rgba(56,189,248,.25)'}} onClick={onComplete}>Complete</button>
        ) : (
          <span style={{color: 'var(--muted-2)', fontWeight: 600, fontSize: '0.8rem'}}>-</span>
        )}
      </td>
    </tr>
  );
}
