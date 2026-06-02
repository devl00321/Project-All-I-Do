import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, Activity } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="dealer-dashboard container animate-fade-in">
      <header className="dashboard-header flex-between mb-lg">
        <div>
          <h1 className="heading-2">Dealer Portal</h1>
          <p className="text-secondary">Manage your bookings and workforce.</p>
        </div>
        <button className="btn-primary">Assign Worker</button>
      </header>

      <div className="stats-grid">
        <StatCard title="Active Jobs" value="12" icon={<Activity />} color="#3b82f6" />
        <StatCard title="Available Workers" value="8" icon={<Users />} color="#10b981" />
        <StatCard title="Today's Revenue" value="₹4,250" icon={<DollarSign />} color="#eab308" />
        <StatCard title="Pending" value="3" icon={<Calendar />} color="#ef4444" />
      </div>

      <div className="recent-bookings glass-card mt-lg p-lg">
        <h3 className="mb-md">Recent Bookings</h3>
        <div className="table-responsive">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <BookingRow customer="Rahul Das" service="Plumber" time="Today, 2:00 PM" status="Pending" />
              <BookingRow customer="Anjali Sen" service="Electrician" time="Today, 4:30 PM" status="Assigned" />
              <BookingRow customer="Amit Roy" service="Cleaning" time="Tomorrow, 10:00 AM" status="Pending" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="stat-card glass-card p-md"
    >
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-secondary text-sm">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </motion.div>
  );
}

function BookingRow({ customer, service, time, status }) {
  const statusColors = {
    'Pending': 'var(--warning)',
    'Assigned': 'var(--success)'
  };
  
  return (
    <tr>
      <td>{customer}</td>
      <td>{service}</td>
      <td>{time}</td>
      <td>
        <span className="status-badge" style={{ color: statusColors[status], backgroundColor: `${statusColors[status]}20` }}>
          {status}
        </span>
      </td>
      <td>
        <button className="btn-text">View</button>
      </td>
    </tr>
  );
}
