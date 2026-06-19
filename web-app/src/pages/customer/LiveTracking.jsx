import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Bike, Car, Compass, Phone, Shield, Star, CheckCircle2, User, Loader2 } from 'lucide-react';
import { B } from '../../constants';
import gsap from 'gsap';

export default function LiveTracking({ activeBooking, onCancel, onComplete }) {
  const [status, setStatus] = useState("confirmed"); // confirmed, assigned, en_route, arrived, in_progress, completed
  const [progress, setProgress] = useState(0); // 0 to 100 for marker position
  const [eta, setEta] = useState(8);
  const [distanceLeft, setDistanceLeft] = useState(2.8);
  const [showRating, setShowRating] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  const panelRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const partnerMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  const userCoords = activeBooking?.details?.rideDetails?.pickupCoords || activeBooking?.details?.coords || [23.9113, 87.5284];
  const destCoords = activeBooking?.details?.rideDetails?.dropCoords || null;
  const isRide = activeBooking?.serviceId === 'car_rental' || activeBooking?.serviceId === 'driver';

  const [partnerStartCoords] = useState(() => {
    const userLat = userCoords[0];
    const userLng = userCoords[1];
    const offsetLat = (Math.random() > 0.5 ? 0.008 : -0.008) + (Math.random() - 0.5) * 0.004;
    const offsetLng = (Math.random() > 0.5 ? 0.008 : -0.008) + (Math.random() - 0.5) * 0.004;
    return [userLat + offsetLat, userLng + offsetLng];
  });

  const [enRouteGeometry, setEnRouteGeometry] = useState([]);
  const [enRouteDist, setEnRouteDist] = useState(2.8);
  const [enRouteDur, setEnRouteDur] = useState(7);

  const enRouteGeometryRef = useRef([]);
  const enRouteDistRef = useRef(2.8);
  const enRouteDurRef = useRef(7);

  useEffect(() => {
    enRouteGeometryRef.current = enRouteGeometry;
  }, [enRouteGeometry]);

  useEffect(() => {
    enRouteDistRef.current = enRouteDist;
  }, [enRouteDist]);

  useEffect(() => {
    enRouteDurRef.current = enRouteDur;
  }, [enRouteDur]);

  // Helper to calculate total distance of coordinates path
  const getRemainingDistance = (coordsList, startIndex) => {
    let dist = 0;
    for (let idx = startIndex; idx < coordsList.length - 1; idx++) {
      const p1 = coordsList[idx];
      const p2 = coordsList[idx + 1];
      
      const R = 6371; // km
      const dLat = (p2[0] - p1[0]) * Math.PI / 180;
      const dLon = (p2[1] - p1[1]) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(p1[0]*Math.PI/180) * Math.cos(p2[0]*Math.PI/180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      dist += R * c;
    }
    return dist;
  };

  // Fetch OSRM path from partner start to user pickup coordinates
  useEffect(() => {
    const fetchEnRoute = async () => {
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${partnerStartCoords[1]},${partnerStartCoords[0]};${userCoords[1]},${userCoords[0]}?overview=full&geometries=geojson`);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes[0]) {
          const route = data.routes[0];
          const dist = Math.round((route.distance / 1000) * 10) / 10;
          const dur = Math.round(route.duration / 60);
          setEnRouteDist(dist);
          setEnRouteDur(dur);
          
          const rawCoords = route.geometry.coordinates;
          const mapped = rawCoords.map(c => [c[1], c[0]]);
          setEnRouteGeometry(mapped);
          
          setDistanceLeft(dist);
          setEta(dur);
        } else {
          setEnRouteGeometry([partnerStartCoords, userCoords]);
        }
      } catch (err) {
        console.error("Error fetching partner to user path:", err);
        setEnRouteGeometry([partnerStartCoords, userCoords]);
      }
    };
    fetchEnRoute();
  }, [partnerStartCoords, userCoords]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (window.L && mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(userCoords, 14);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      // Add User/Pickup Marker
      const userIcon = window.L.divIcon({
        className: 'custom-map-pin-user',
        html: `<div style="background:#3B82F6;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`
      });
      userMarkerRef.current = window.L.marker(userCoords, { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(isRide ? "Pickup Point" : "Your Service Location")
        .openPopup();

      // For Ride bookings, add dropoff marker
      if (isRide && destCoords) {
        const dropIcon = window.L.divIcon({
          className: 'custom-map-pin-drop',
          html: `<div style="background:${B.err};width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`
        });
        window.L.marker(destCoords, { icon: dropIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`Destination: ${activeBooking?.details?.rideDetails?.drop}`);
      }
    }
  }, []);

  // Dispatch & Ride Simulator Timeline
  useEffect(() => {
    // 0s-3s: Confirmed
    // 3s: Assigned
    const tAssigned = setTimeout(() => {
      setStatus("assigned");
      setEta(enRouteDurRef.current);
      setDistanceLeft(enRouteDistRef.current);
      
      // Add partner marker at starting position
      if (window.L && mapInstanceRef.current) {
        const pIcon = window.L.divIcon({
          className: 'custom-map-pin-partner',
          html: `<div style="background:#1E293B;color:#fff;width:32px;height:32px;border-radius:50%;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:14px">${isRide ? '🚗' : '🚴'}</div>`
        });
        const startLoc = enRouteGeometryRef.current.length > 0 ? enRouteGeometryRef.current[0] : partnerStartCoords;
        partnerMarkerRef.current = window.L.marker(startLoc, { icon: pIcon }).addTo(mapInstanceRef.current);
        
        // Draw route line from starting point to user
        const pathCoords = enRouteGeometryRef.current.length > 0 ? enRouteGeometryRef.current : [partnerStartCoords, userCoords];
        polylineRef.current = window.L.polyline(pathCoords, {
          color: '#10B981',
          weight: 4,
          dashArray: '6, 6'
        }).addTo(mapInstanceRef.current);

        const group = new window.L.featureGroup([partnerMarkerRef.current, userMarkerRef.current]);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2));
      }
    }, 3000);

    // 5s: En Route
    const tEnRoute = setTimeout(() => {
      setStatus("en_route");
    }, 5500);

    // 14s: Arrived
    const tArrived = setTimeout(() => {
      setStatus("arrived");
      setEta(0);
      setDistanceLeft(0);
      if (partnerMarkerRef.current) {
        partnerMarkerRef.current.setLatLng(userCoords);
      }
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
    }, 14500);

    // 17s: In Progress
    const tInProgress = setTimeout(() => {
      setStatus("in_progress");
      // For rides, once arrived at pickup, we transition to moving towards destination
      if (isRide && window.L && mapInstanceRef.current && partnerMarkerRef.current && destCoords) {
        // Draw route line to destination
        const rideGeometry = activeBooking?.details?.rideDetails?.routeGeometry || [userCoords, destCoords];
        polylineRef.current = window.L.polyline(rideGeometry, {
          color: '#3B82F6',
          weight: 4,
          dashArray: '6, 6'
        }).addTo(mapInstanceRef.current);

        const group = new window.L.featureGroup([partnerMarkerRef.current, userMarkerRef.current]);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2));
      }
    }, 17500);

    // 25s: Completed (Open Rating Modal)
    const tCompleted = setTimeout(() => {
      setStatus("completed");
      setShowRating(true);
    }, 25000);

    return () => {
      clearTimeout(tAssigned);
      clearTimeout(tEnRoute);
      clearTimeout(tArrived);
      clearTimeout(tInProgress);
      clearTimeout(tCompleted);
    };
  }, []);

  // En Route Marker Movement Animation
  useEffect(() => {
    if (status === 'en_route' && partnerMarkerRef.current && window.L) {
      let currentProg = 0;
      const interval = setInterval(() => {
        currentProg += 2.5; // fits inside 9s timeline (45 steps at 200ms)
        if (currentProg >= 100) {
          clearInterval(interval);
          partnerMarkerRef.current.setLatLng(userCoords);
          setProgress(100);
          return;
        }

        setProgress(currentProg);

        const ratio = currentProg / 100;
        const path = enRouteGeometry.length > 0 ? enRouteGeometry : [partnerStartCoords, userCoords];
        const index = Math.min(path.length - 1, Math.floor(ratio * path.length));
        const currentPos = path[index];
        partnerMarkerRef.current.setLatLng(currentPos);

        const remainingDist = getRemainingDistance(path, index);
        setDistanceLeft(Math.round(remainingDist * 10) / 10);
        setEta(Math.max(1, Math.ceil(remainingDist * 2.5)));
      }, 200);

      return () => clearInterval(interval);
    }
  }, [status, enRouteGeometry]);

  // Ride In-Progress Marker Movement Animation towards drop coords
  useEffect(() => {
    if (status === 'in_progress' && isRide && partnerMarkerRef.current && window.L && destCoords) {
      const rideGeometry = activeBooking?.details?.rideDetails?.routeGeometry || [userCoords, destCoords];
      let currentProg = 0;
      const interval = setInterval(() => {
        currentProg += 2.5; // fits inside 7.5s timeline (37 steps at 200ms)
        if (currentProg >= 100) {
          clearInterval(interval);
          partnerMarkerRef.current.setLatLng(destCoords);
          setProgress(100);
          return;
        }

        setProgress(currentProg);

        const ratio = currentProg / 100;
        const index = Math.min(rideGeometry.length - 1, Math.floor(ratio * rideGeometry.length));
        const currentPos = rideGeometry[index];
        partnerMarkerRef.current.setLatLng(currentPos);

        const remainingDist = getRemainingDistance(rideGeometry, index);
        setDistanceLeft(Math.round(remainingDist * 10) / 10);
        setEta(Math.max(1, Math.ceil(remainingDist * 2.5)));
      }, 200);

      return () => clearInterval(interval);
    }
  }, [status]);

  // GSAP animations on status change
  useEffect(() => {
    gsap.fromTo(panelRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3 });
  }, [status]);

  const handleSubmitFeedback = () => {
    onComplete({
      id: activeBooking.id,
      service: activeBooking.service,
      serviceId: activeBooking.serviceId,
      date: "Today",
      amount: activeBooking.amount,
      paymentMethod: activeBooking.paymentMethod,
      worker: activeBooking.worker,
      workerRating: `${userRating}.0★`,
      feedback: feedback
    });
  };

  const steps = [
    { key: "confirmed", label: "Booking Confirmed" },
    { key: "assigned", label: "Partner Assigned" },
    { key: "en_route", label: isRide ? "Driver En Route" : "Partner En Route" },
    { key: "arrived", label: isRide ? "Driver Arrived at Pickup" : "Partner Arrived at Home" },
    { key: "in_progress", label: isRide ? "Ride in Progress" : "Service in Progress" },
    { key: "completed", label: "Service Completed" }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="live-tracking-layout">
      
      {/* Left panel: Timeline and Driver details */}
      <div ref={panelRef} className="card tracking-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: B.ink }}>Live Tracking</h3>
            <span style={{ fontSize: '12px', background: B.mintLight, color: B.mintDark, padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
              {activeBooking?.id}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: B.muted, marginTop: '2px' }}>{activeBooking?.service} Dispatch Status</p>
        </div>

        {/* Live Status Summary Card */}
        <div style={{ padding: '16px', background: `${B.mint}10`, border: `1.5px solid ${B.mint}30`, borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
          <div style={{ position: 'relative', width: '12px', height: '12px', borderRadius: '50%', background: B.mint }}>
            <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', border: `2px solid ${B.mint}`, animation: 'ping 1.5s infinite' }}></div>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: B.ink }}>
              {status === 'confirmed' && "Confirming booking details..."}
              {status === 'assigned' && "Partner assigned, preparing dispatch..."}
              {status === 'en_route' && (isRide ? "Driver is on the way to pickup" : "Partner is on the way")}
              {status === 'arrived' && (isRide ? "Driver has arrived at pickup!" : "Partner has arrived at your address!")}
              {status === 'in_progress' && (isRide ? "Heading to destination..." : "Service work in progress...")}
              {status === 'completed' && "Service completed! Thank you."}
            </h4>
            <p style={{ fontSize: '11px', color: B.mintDark, fontWeight: 600, marginTop: '2px' }}>
              {status === 'en_route' && `ETA ${eta} min (${distanceLeft} km away)`}
              {status === 'in_progress' && isRide && `ETA to drop ${eta} min (${distanceLeft} km remaining)`}
              {status === 'in_progress' && !isRide && "Est. duration: 30 - 45 mins"}
              {status === 'arrived' && "Please verify OTP with your partner."}
              {status === 'completed' && "Transaction settled."}
              {status === 'confirmed' || status === 'assigned' && "Estimated dispatch: < 2 mins"}
            </p>
          </div>
        </div>

        {/* Assigned Worker / Driver Profile */}
        {(status !== 'confirmed') && (
          <div style={{ padding: '16px', border: `1.5px solid ${B.brd}`, borderRadius: '16px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: B.bg, border: `1px solid ${B.brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                👨🏽‍🔧
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: B.ink }}>{activeBooking?.worker}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', background: `${B.warn}15`, color: B.warn, padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                    <Star size={10} style={{ fill: B.warn }} /> 4.9
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: B.muted, marginTop: '2px' }}>Verified Partner · 850+ completed jobs</p>
              </div>
              <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: B.mintLight, border: 'none', color: B.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} className="hover-light">
                <Phone size={18} />
              </button>
            </div>

            {isRide && (
              <>
                <hr style={{ border: 'none', borderTop: `1px solid ${B.brd}`, margin: '14px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: B.muted, textTransform: 'uppercase', fontWeight: 700 }}>Vehicle Details</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: B.ink, marginTop: '2px' }}>
                      {activeBooking?.details?.details?.rideDetails?.vehicle?.type === 'bike' ? "Royal Enfield (Black)" : "Maruti Swift Dzire"}
                    </div>
                  </div>
                  <div style={{ padding: '6px 12px', background: B.ink, color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                    WB-54-A-1234
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Timeline Tracking Checkpoints */}
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: B.ink, marginBottom: '14px', textAlign: 'left' }}>Status Timeline</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px', textAlign: 'left' }}>
          {steps.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            return (
              <div key={step.key} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative' }}>
                {/* vertical line segment */}
                {idx < steps.length - 1 && (
                  <div style={{ 
                    position: 'absolute', 
                    left: '11px', 
                    top: '22px', 
                    bottom: '-12px', 
                    width: '2px', 
                    background: isDone ? B.mint : B.brd,
                    zIndex: 1 
                  }}></div>
                )}
                
                {/* timeline node dot */}
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  background: isDone ? B.mint : isActive ? '#fff' : '#fff',
                  border: `2.5px solid ${isDone ? B.mint : isActive ? B.mint : B.brd}`,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  zIndex: 2,
                  boxShadow: isActive ? `0 0 10px rgba(93, 202, 165, 0.4)` : 'none'
                }}>
                  {isDone && <span style={{ fontSize: '10px', color: '#fff', fontWeight: 700 }}>✓</span>}
                  {isActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: B.mint }}></div>}
                </div>

                <div style={{ paddingTop: '2px', paddingBottom: '16px' }}>
                  <span style={{ 
                    fontWeight: isActive ? 700 : 600, 
                    fontSize: '13.5px', 
                    color: isActive ? B.mint : isDone ? B.ink : B.muted 
                  }}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cancel Button */}
        {status !== 'completed' && (
          <button 
            onClick={onCancel}
            style={{ 
              width: '100%', 
              padding: '14px', 
              border: `1.5px solid ${B.err}`, 
              color: B.err, 
              background: 'transparent', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              fontWeight: 700, 
              fontSize: '13.5px', 
              marginTop: 'auto' 
            }}
          >
            Cancel Service
          </button>
        )}

      </div>

      {/* Right panel: Real interactive Leaflet map */}
      <div className="card" style={{ height: '100%', position: 'relative', overflow: 'hidden', border: `1.5px solid ${B.brd}`, borderRadius: '18px' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }}></div>

        {/* Map Safety badge */}
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: '#fff', border: `1.5px solid ${B.brd}`, borderRadius: '12px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', zIndex: 10 }}>
          <Shield size={16} color={B.mint} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: B.ink }}>Live Route Encryption</span>
        </div>
      </div>

      {/* RATING & COMPLETION OVERLAY */}
      {showRating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 46, 37, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card animate-fade-in" style={{ padding: '36px', width: '450px', background: '#fff', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `${B.mint}15`, color: B.mint, display: 'flex', alignItems: 'center', justifyCentert: 'center', margin: '0 auto 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CheckCircle2 size={32} />
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: B.ink, marginBottom: '6px' }}>Service Completed!</h3>
            <p style={{ fontSize: '13px', color: B.muted, marginBottom: '24px' }}>
              Your booking with **{activeBooking?.worker}** is complete. Please rate your experience.
            </p>

            {/* Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button 
                  key={val} 
                  onClick={() => setUserRating(val)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Star 
                    size={36} 
                    style={{ 
                      fill: val <= userRating ? B.warn : 'none', 
                      color: val <= userRating ? B.warn : B.brdMid 
                    }} 
                  />
                </button>
              ))}
            </div>

            {/* Textarea feedback */}
            <textarea 
              className="fi" 
              value={feedback} 
              onChange={e => setFeedback(e.target.value)} 
              placeholder="Write a review... (e.g. Prompt arrival, excellent quality of work!)" 
              style={{ minHeight: '80px', resize: 'none', fontSize: '13.5px', marginBottom: '24px' }}
            />

            {/* Action Submit */}
            <button 
              onClick={handleSubmitFeedback}
              className="pbtn" 
              style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
            >
              Submit Feedback & Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
