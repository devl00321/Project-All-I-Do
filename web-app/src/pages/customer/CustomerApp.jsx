import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../../components/Sidebar';
import Home from './Home';
import Services from './Services';
import Booking from './Booking';
import Auth from './Auth';
import Profile from './Profile';
import LiveTrack from './LiveTrack';
import BookingHistory from './BookingHistory';
import gsap from 'gsap';

export default function CustomerApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [preSelectedService, setPreSelectedService] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [userPhone, setUserPhone] = useState("9876543210");
  const [activeBookingId, setActiveBookingId] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Only animate if not full screen auth
    if (contentRef.current && !(activeTab === 'profile' && !isLoggedIn)) {
      gsap.fromTo(contentRef.current, 
        { opacity: 0, y: 16 }, 
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [activeTab, isLoggedIn]);

  const handleBook = (service) => {
    setPreSelectedService(service);
    setActiveTab('book');
  };

  const handleConfirm = (data) => {
    setActiveBookingId(data.bookingId);
    setActiveTab('track');
  };

  // If user is not logged in and tries to access profile, show Auth full-screen
  if (activeTab === 'profile' && !isLoggedIn) {
    return <Auth onLogin={(name, phone) => { setUserName(name); setUserPhone(phone); setIsLoggedIn(true); }} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar tab={activeTab} onTab={setActiveTab} hasActive={activeTab === 'track'} />
      <div className="main-content" ref={contentRef}>
        {activeTab === 'home' && <Home onBook={handleBook} onTab={setActiveTab} hasActive={false} />}
        {activeTab === 'services' && <Services onBook={handleBook} />}
        {activeTab === 'book' && <Booking preService={preSelectedService} onConfirm={handleConfirm} />}
        {activeTab === 'bookings' && <BookingHistory />}
        {activeTab === 'track' && <LiveTrack bookingId={activeBookingId} />}
        {activeTab === 'profile' && isLoggedIn && <Profile name={userName} phone={userPhone} onLogout={() => { setIsLoggedIn(false); setActiveTab('home'); }} />}
      </div>
    </div>
  );
}
