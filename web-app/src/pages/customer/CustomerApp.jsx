import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../../components/Sidebar';
import Home from './Home';
import Services from './Services';
import Booking from './Booking';
import LiveTracking from './LiveTracking';
import Auth from './Auth';
import CatCompanion from '../../components/CatCompanion';
import KittenChatbot from '../../components/KittenChatbot';
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
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([
    { id: "BK-2847", service: "Plumber", serviceId: "plumber", date: "May 24, 2026", amount: "₹350", rating: 5, worker: "Rajesh Kumar", paymentMethod: "UPI" },
    { id: "BK-2631", service: "Electrician", serviceId: "electrician", date: "May 18, 2026", amount: "₹480", rating: 4, worker: "Sunil Prasad", paymentMethod: "UPI" },
    { id: "BK-2290", service: "Cleaning", serviceId: "cleaning", date: "May 10, 2026", amount: "₹600", rating: 5, worker: "Meena Singh", paymentMethod: "Cash" },
  ]);
  const contentRef = useRef(null);

  // Persian Cat companion state triggers
  const [showSplash, setShowSplash] = useState(true);
  const [catState, setCatState] = useState('splash');
  const [catServiceId, setCatServiceId] = useState(null);
  const [showNotice, setShowNotice] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Splash and peeking notice timeline
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      setCatState('home_peek');
      setShowNotice(true);
      
      const noticeTimer = setTimeout(() => {
        setShowNotice(false);
        setCatState('sitting_right');
      }, 3800);
      
      return () => clearTimeout(noticeTimer);
    }, 2500);
    return () => clearTimeout(splashTimer);
  }, []);

  // Jump left or right and toggle toys on navigation/tabs transition
  useEffect(() => {
    if (showSplash || showNotice) return;
    
    if (activeTab === 'book' || activeTab === 'track') {
      setCatState('sitting_right');
    } else {
      setCatState('sitting_left');
      setIsChatOpen(false); // Close chat when Puffy sits on the left side to avoid mirror scale distortion
    }
    
    // Set active service toy playing
    if (activeTab === 'book' && preSelectedService) {
      setCatServiceId(preSelectedService.id);
    } else if (activeTab !== 'book' && activeTab !== 'track') {
      setCatServiceId(null);
    }
  }, [activeTab, preSelectedService, showSplash, showNotice]);

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

  const handleConfirm = (bookingData) => {
    const randomId = bookingData.bookingId || `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: randomId,
      date: "Today",
      service: bookingData.label || bookingData.service?.label || "Service",
      serviceId: bookingData.id || bookingData.service?.id || "plumber",
      amount: bookingData.rideDetails ? `₹${bookingData.rideDetails.fare}` : (bookingData.calculatedFare ? `₹${bookingData.calculatedFare}` : "₹350"),
      paymentMethod: bookingData.paymentMethod || "UPI",
      worker: bookingData.rideDetails?.driverName || "Amit Roy (Partner)",
      workerRating: bookingData.rideDetails?.driverRating || "4.8★",
      details: bookingData,
    };
    setActiveBooking(newBooking);
    setActiveBookingId(randomId);
    
    // Trigger happy jumping state on booking confirmation
    setCatState('happy');
    setTimeout(() => {
      setActiveTab('track');
    }, 1500);
  };

  const handleCancelBooking = () => {
    setActiveBooking(null);
    setActiveBookingId(null);
    
    // Trigger sad sigh on canceling service from tracking
    setCatState('sad');
    setTimeout(() => {
      setActiveTab('home');
    }, 1800);
  };

  const handleCompleteBooking = (completedBooking) => {
    setBookingHistory(prev => [completedBooking, ...prev]);
    setActiveBooking(null);
    setActiveBookingId(null);
    
    // Trigger happy moment on service completion
    setCatState('happy');
    setTimeout(() => {
      setActiveTab('bookings');
    }, 2000);
  };

  // If user is not logged in and tries to access profile, show Auth full-screen
  if (activeTab === 'profile' && !isLoggedIn) {
    return <Auth onLogin={(name, phone) => { setUserName(name); setUserPhone(phone); setIsLoggedIn(true); }} />;
  }

  return (
    <div className="app-container">
      {/* Splash overlay */}
      {showSplash && (
        <div className="cat-splash-overlay">
          <div className="cat-splash-cat-box">
            <CatCompanion state="splash" />
          </div>
        </div>
      )}

      {/* Top peeking head notice */}
      {showNotice && (
        <div className="cat-peeking-top">
          <CatCompanion state="normal" />
        </div>
      )}

      <Sidebar tab={activeTab} onTab={setActiveTab} hasActive={activeBookingId !== null} />
      <div className="main-content" ref={contentRef}>
        {activeTab === 'home' && <Home onBook={handleBook} onTab={setActiveTab} hasActive={activeBookingId !== null} bookingHistory={bookingHistory} />}
        {activeTab === 'services' && <Services onBook={handleBook} />}
        {activeTab === 'book' && (
          <Booking 
            preService={preSelectedService} 
            onConfirm={handleConfirm} 
            onCancel={() => {
              // Trigger sad state on cancellation
              setCatState('sad');
              setTimeout(() => {
                setActiveTab('home');
              }, 1800);
            }} 
            setCatState={setCatState}
          />
        )}
        {activeTab === 'bookings' && <BookingHistory />}
        {activeTab === 'track' && (
          activeBooking ? (
            <LiveTracking activeBooking={activeBooking} onCancel={handleCancelBooking} onComplete={handleCompleteBooking} />
          ) : (
            <LiveTrack bookingId={activeBookingId} />
          )
        )}
        {activeTab === 'profile' && isLoggedIn && <Profile name={userName} phone={userPhone} onLogout={() => { setIsLoggedIn(false); setActiveTab('home'); }} />}
      </div>

      {/* Floating Cat Companion and Chatbot Assistant */}
      {!showSplash && !showNotice && (
        <>
          {/* Kitten Chatbot Window (only when on right side of screen) */}
          {catState !== 'sitting_left' && (
            <KittenChatbot 
              isOpen={isChatOpen} 
              onClose={() => setIsChatOpen(false)} 
              activeServiceId={catServiceId}
            />
          )}

          {/* Floating hint tooltip (only when on right side of screen and closed) */}
          {catState !== 'sitting_left' && !isChatOpen && (
            <div 
              className="puffy-chat-bubble-hint"
              onClick={() => setIsChatOpen(true)}
            >
              Chat with Puffy! 💬
            </div>
          )}

          <div 
            className="cat-companion-container"
            onClick={() => {
              if (catState !== 'sitting_left') {
                setIsChatOpen(prev => !prev);
              }
            }}
            style={{
              transform: catState === 'sitting_left' 
                ? 'translate(var(--cat-left-translate), 0) scaleX(-1)' 
                : 'translate(0, 0) scaleX(1)'
            }}
          >
            <CatCompanion state={catState} serviceId={catServiceId} />
          </div>
        </>
      )}
    </div>
  );
}
