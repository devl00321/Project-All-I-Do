import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../../components/Sidebar';
import Home from './Home';
import Services from './Services';
import Booking from './Booking';
import Auth from './Auth';
import gsap from 'gsap';

export default function CustomerApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [preSelectedService, setPreSelectedService] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current && activeTab !== 'profile') {
      gsap.fromTo(contentRef.current, 
        { opacity: 0, y: 16 }, 
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [activeTab]);

  const handleBook = (service) => {
    setPreSelectedService(service);
    setActiveTab('book');
  };

  const handleConfirm = (service) => {
    setActiveTab('track');
  };

  if (activeTab === 'profile') {
    return <Auth onLogin={() => setActiveTab('home')} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar tab={activeTab} onTab={setActiveTab} hasActive={activeTab === 'track'} />
      <div className="main-content" ref={contentRef}>
        {activeTab === 'home' && <Home onBook={handleBook} onTab={setActiveTab} hasActive={false} />}
        {activeTab === 'services' && <Services onBook={handleBook} />}
        {activeTab === 'book' && <Booking preService={preSelectedService} onConfirm={handleConfirm} />}
        {activeTab === 'bookings' && <div className="page"><div className="section-title">My Bookings</div><div className="section-sub">Your booking history will appear here.</div></div>}
        {activeTab === 'track' && <div className="page"><div className="section-title">Live Track</div><div className="section-sub">Tracking active service...</div></div>}
      </div>
    </div>
  );
}
