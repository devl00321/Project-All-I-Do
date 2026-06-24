import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, Activity, LogOut, Settings } from 'lucide-react';
import api from '../../utils/api';
import AssignWorkerModal from './components/AssignWorkerModal';
import DealerLiveMap from './components/DealerLiveMap';
import { B } from '../../constants';
// Re-using the socket hook to listen for general updates
import useSocket from '../../hooks/useSocket';

export default function Dashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [usersCount, setUsersCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handleProfile = () => {
    alert("Profile setup feature coming soon!");
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

  // Re-fetch data every 10 seconds as a fallback, but also listen for socket events
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Listen for admin refresh events and live worker movement
  useSocket('admin_room', 
    (data) => {
      if (data.workerId && data.lat && data.lng) {
        // Update the specific worker's location in state instantly
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
      fetchDashboardData(); // Refresh the list
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

  // Calculate Stats
  const activeJobs = bookings.filter(b => b.status === 'IN_PROGRESS' || b.status === 'EN_ROUTE').length;
  const pendingJobs = bookings.filter(b => b.status === 'PENDING').length;
  const availableWorkers = workers.filter(w => w.status === 'AVAILABLE').length;
  const todayRevenue = bookings
    .filter(b => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  return (
    <div className="dealer-dashboard container animate-fade-in" style={{ padding: '32px' }}>
      <header className="dashboard-header flex-between mb-lg" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <div>
            <h1 className="heading-2" style={{ fontSize: 28, fontWeight: 700, color: B.ink }}>Dealer Portal</h1>
            <p className="text-secondary" style={{ color: B.muted }}>Manage your bookings and workforce.</p>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: B.muted, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Users</div>
              <div style={{ background: B.mintLight, color: B.mint, padding: '4px 18px', borderRadius: '100px', fontWeight: 700, fontSize: '18px' }}>{usersCount}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: B.muted, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Total Workers</div>
              <div style={{ background: '#fef3c7', color: '#d97706', padding: '4px 18px', borderRadius: '100px', fontWeight: 700, fontSize: '18px' }}>{workers.length}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: B.muted, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Active Workers</div>
              <div style={{ background: '#dbeafe', color: '#2563eb', padding: '4px 18px', borderRadius: '100px', fontWeight: 700, fontSize: '18px' }}>{workers.filter(w => ['AVAILABLE', 'BUSY'].includes(w.status)).length}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="pbtn" onClick={fetchDashboardData}>Refresh Data</button>
          
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ 
                width: 44, height: 44, borderRadius: '50%', background: B.mint, color: '#fff', 
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(93, 202, 165, 0.3)'
              }}
            >
              <Users size={20} />
            </button>
            
            {dropdownOpen && (
              <div style={{ 
                position: 'absolute', top: '56px', right: 0, width: '220px', background: '#fff', 
                borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: `1px solid ${B.brd}`,
                overflow: 'hidden', zIndex: 50
              }}>
                <div style={{ padding: '16px', borderBottom: `1px solid ${B.brd}`, background: '#f9fafb' }}>
                  <div style={{ fontWeight: 700, color: B.ink }}>Admin User</div>
                  <div style={{ fontSize: '12px', color: B.muted }}>admin@allido.com</div>
                </div>
                <div style={{ padding: '8px' }}>
                  <button onClick={() => { handleProfile(); setDropdownOpen(false); }} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, color: B.ink, borderRadius: '8px' }}>
                    <Settings size={16} /> My Profile
                  </button>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, color: '#ef4444', borderRadius: '8px' }}>
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
        <StatCard title="Active Jobs" value={activeJobs} icon={<Activity />} color="#3b82f6" />
        <StatCard title="Available Workers" value={availableWorkers} icon={<Users />} color="#10b981" />
        <StatCard title="Total Revenue" value={`₹${todayRevenue}`} icon={<DollarSign />} color="#eab308" />
        <StatCard title="Pending" value={pendingJobs} icon={<Calendar />} color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Bookings Table */}
        <div className="recent-bookings card p-lg" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Bookings</h3>
          {loading ? (
            <p>Loading...</p>
          ) : bookings.length === 0 ? (
            <p style={{ color: B.muted }}>No bookings found.</p>
          ) : (
            <div className="table-responsive">
              <table className="bookings-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${B.brd}` }}>
                    <th style={{ padding: '12px 8px', color: B.muted, fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '12px 8px', color: B.muted, fontWeight: 600 }}>Service</th>
                    <th style={{ padding: '12px 8px', color: B.muted, fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px 8px', color: B.muted, fontWeight: 600 }}>Worker</th>
                    <th style={{ padding: '12px 8px', color: B.muted, fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <BookingRow 
                      key={b.id} 
                      booking={b} 
                      onAssign={() => handleAssignClick(b.id)} 
                      onComplete={() => handleCompleteBooking(b.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Map */}
        <div>
          <DealerLiveMap workers={workers.filter(w => ['AVAILABLE', 'BUSY'].includes(w.status))} />
        </div>
      </div>

      <AssignWorkerModal 
        isOpen={assignModalOpen} 
        onClose={() => setAssignModalOpen(false)} 
        workers={workers.filter(w => w.status === 'AVAILABLE')} 
        onAssign={handleAssignWorker} 
      />
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="stat-card card p-md"
      style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}
    >
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color, width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <p className="text-secondary text-sm" style={{ color: '#6b7280', fontSize: 13, marginBottom: 4 }}>{title}</p>
        <h3 className="stat-value" style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{value}</h3>
      </div>
    </motion.div>
  );
}

function BookingRow({ booking, onAssign, onComplete }) {
  const statusColors = {
    'PENDING': '#f59e0b',
    'ASSIGNED': '#3b82f6',
    'EN_ROUTE': '#8b5cf6',
    'IN_PROGRESS': '#ec4899',
    'COMPLETED': '#10b981',
    'CANCELLED': '#ef4444'
  };
  const color = statusColors[booking.status] || '#6b7280';
  
  const isActive = ['ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS'].includes(booking.status);

  return (
    <tr style={{ borderBottom: `1px solid #e5e7eb` }}>
      <td style={{ padding: '16px 8px', fontWeight: 500 }}>{booking.User?.name || 'Unknown'}</td>
      <td style={{ padding: '16px 8px', color: '#4b5563' }}>{booking.service}</td>
      <td style={{ padding: '16px 8px' }}>
        <span style={{ 
          color, backgroundColor: `${color}15`, 
          padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 
        }}>
          {booking.status}
        </span>
      </td>
      <td style={{ padding: '16px 8px', color: '#4b5563' }}>{booking.Worker?.name || '-'}</td>
      <td style={{ padding: '16px 8px' }}>
        {booking.status === 'PENDING' ? (
          <button 
            style={{ background: 'transparent', color: '#3b82f6', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            onClick={onAssign}
          >
            Assign
          </button>
        ) : isActive ? (
          <button 
            style={{ background: 'transparent', color: '#10b981', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            onClick={onComplete}
          >
            Complete
          </button>
        ) : (
          <button style={{ background: 'transparent', color: '#6b7280', border: 'none', fontWeight: 600, cursor: 'pointer', cursor: 'default' }}>
            -
          </button>
        )}
      </td>
    </tr>
  );
}
