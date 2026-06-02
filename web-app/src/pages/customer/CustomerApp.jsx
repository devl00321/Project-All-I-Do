import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import Home from './Home';
import Services from './Services';
import Booking from './Booking';
import Auth from './Auth';

export default function CustomerApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [preSelectedService, setPreSelectedService] = useState(null);

  const handleBook = (service) => {
    setPreSelectedService(service);
    setActiveTab('book');
  };

  const handleConfirm = (service) => {
    setActiveTab('track');
  };

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar tab={activeTab} onTab={setActiveTab} hasActive={activeTab === 'track'} />
      <div className="main-content">
        {activeTab === 'home' && <Home onBook={handleBook} onTab={setActiveTab} hasActive={false} />}
        {activeTab === 'services' && <Services onBook={handleBook} />}
        {activeTab === 'book' && <Booking preService={preSelectedService} onConfirm={handleConfirm} />}
        {activeTab === 'bookings' && <div className="page"><div className="section-title">My Bookings</div><div className="section-sub">Your booking history will appear here.</div></div>}
        {activeTab === 'track' && <div className="page"><div className="section-title">Live Track</div><div className="section-sub">Tracking active service...</div></div>}
        {activeTab === 'profile' && <div className="page"><div className="section-title">Profile</div><div className="section-sub">Your profile information.</div></div>}
      </div>
    </div>
  );
}
