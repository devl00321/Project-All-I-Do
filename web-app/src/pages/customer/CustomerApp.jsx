import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../../components/Sidebar';
import Home from './Home';
import Booking from './Booking';
import LiveTracking from './LiveTracking';
import Auth from './Auth';
import CatCompanion from '../../components/CatCompanion';
import KittenChatbot from '../../components/KittenChatbot';
import Profile from './Profile';
import LiveTrack from './LiveTrack';
import BookingHistory from './BookingHistory';
import OnboardingWalkthrough from '../../components/OnboardingWalkthrough';
import gsap from 'gsap';

export default function CustomerApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [preSelectedService, setPreSelectedService] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userPhone, setUserPhone] = useState("9876543210");
  const [userLocation, setUserLocation] = useState("Kolkata, West Bengal");
  const [requireAuth, setRequireAuth] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Toggle toys on navigation/tabs transition (Cat always stays right now)
  useEffect(() => {
    if (showSplash || showNotice) return;
    
    // The cat is now always sitting on the right to act as a fixed assistant
    setCatState('sitting_right');
    
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
    setIsMobileMenuOpen(false);
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

  return (
    <div className="app-container flex h-screen w-full overflow-hidden bg-[var(--bg)]">
      {/* Auth overlay */}
      {((activeTab === 'profile' || requireAuth) && !isLoggedIn) && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'var(--bg)' }}>
          <Auth onLogin={(name, phone, isNewUser) => { 
            setUserName(name || "User"); 
            setUserPhone(phone); 
            setIsLoggedIn(true); 
            setRequireAuth(false);
            if (isNewUser) {
              setShowOnboarding(true);
            }
          }} />
          {requireAuth && activeTab !== 'profile' && (
            <button 
              onClick={() => setRequireAuth(false)}
              style={{ position: 'absolute', top: 20, left: 20, zIndex: 101, background: 'var(--surface)', border: '1px solid #ddd', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: 'var(--ink)' }}
            >
              ← Back to Booking
            </button>
          )}
        </div>
      )}

      {/* Onboarding overlay */}
      {showOnboarding && <OnboardingWalkthrough onComplete={() => setShowOnboarding(false)} />}

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

      <Sidebar 
        tab={activeTab} 
        onTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} 
        hasActive={activeBookingId !== null} 
        userName={userName} 
        onLogout={isLoggedIn ? () => { setIsLoggedIn(false); setActiveTab('home'); setIsMobileMenuOpen(false); } : null}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <div className="main-content" ref={contentRef}>
        {/* Mobile Topbar */}
        <div className="mobile-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--mint), var(--mintDeep))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>A</div>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: '1.1rem', fontWeight: '700', color: 'var(--ink)' }}>ALLIDO</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            style={{ background: 'transparent', border: 'none', fontSize: '24px', color: 'var(--ink)' }}
          >
            ☰
          </button>
        </div>
        {activeTab === 'home' && <Home onBook={handleBook} onTab={setActiveTab} hasActive={activeBookingId !== null} bookingHistory={bookingHistory} />}
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
            isLoggedIn={isLoggedIn}
            onRequireAuth={() => setRequireAuth(true)}
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
          {/* Kitten Chatbot Window */}
          <KittenChatbot 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
            activeServiceId={catServiceId}
            userName={userName}
            userPhone={userPhone}
            userLocation={userLocation}
            isLoggedIn={isLoggedIn}
            bookingHistory={bookingHistory}
            onNavigate={(tab, service) => {
              if (service) {
                setPreSelectedService(service);
              }
              setActiveTab(tab);
            }}
          />

          {/* Floating hint tooltip (only when closed) */}
          {!isChatOpen && (
            <div 
              className="puffy-chat-bubble-hint"
              onClick={() => setIsChatOpen(true)}
            >
              Chat with Puffy! 💬
            </div>
          )}

          <div 
            className="cat-companion-container"
            onClick={() => setIsChatOpen(prev => !prev)}
            style={{
              /* FIXED: Enforcing translate(0,0) permanently so the cat never runs left */
              transform: 'translate(0, 0) scaleX(1)'
            }}
          >
            <CatCompanion state={catState} serviceId={catServiceId} />
          </div>
        </>
      )}
    </div>
  );
}
