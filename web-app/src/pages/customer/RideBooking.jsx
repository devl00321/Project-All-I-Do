import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Bike, Car, Compass, Phone, Shield, Star, ArrowLeft, CreditCard, DollarSign, Loader2, Search } from 'lucide-react';
import { B } from '../../constants';
import gsap from 'gsap';

export default function RideBooking({ service, onConfirm, onBack, setCatState }) {
  const [pickupText, setPickupText] = useState("Detecting GPS Location...");
  const [pickupQuery, setPickupQuery] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [showPickupSug, setShowPickupSug] = useState(false);

  const [dropText, setDropText] = useState("");
  const [dropQuery, setDropQuery] = useState("");
  const [dropCoords, setDropCoords] = useState(null);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [showDropSug, setShowDropSug] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState("bike");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [bookingState, setBookingState] = useState("request"); // request, loading, tracked
  
  const [distance, setDistance] = useState(0); // in km
  const [duration, setDuration] = useState(0); // in min
  const [routeGeometry, setRouteGeometry] = useState([]); // Array of [lat, lng] for routing
  
  const [driverEta, setDriverEta] = useState(5);
  const [markerProgress, setMarkerProgress] = useState(0);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Monitor booking steps and coords to set the cat's emotion
  useEffect(() => {
    if (!setCatState || isCanceling) return;
    if (bookingState === 'tracked') {
      setCatState('sitting_right');
    } else if (bookingState === 'loading') {
      setCatState('sitting_right');
    } else if (pickupCoords && dropCoords) {
      setCatState('smile'); // Payment step (since payment selection & vehicle cards are active)
    } else {
      setCatState('sitting_right');
    }
  }, [pickupCoords, dropCoords, bookingState, setCatState, isCanceling]);

  const panelRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const trackingMarkerRef = useRef(null);

  const VEHICLES = [
    { id: "bike", label: service.id === 'driver' ? "Personal Rider" : "ALLIDO Bike", type: "bike", icon: Bike, desc: "Fastest ride through traffic", base: 40, rate: 10, cap: 1 },
    { id: "auto", label: "ALLIDO Auto", type: "auto", icon: Compass, desc: "Comfortable local auto", base: 65, rate: 15, cap: 3 },
    { id: "mini", label: "ALLIDO Mini", type: "car", icon: Car, desc: "Affordable AC Hatchback", base: 90, rate: 19, cap: 4 },
    { id: "sedan", label: "ALLIDO Sedan", type: "car", icon: Car, desc: "Premium Sedan experience", base: 130, rate: 28, cap: 4 }
  ];

  // 1. Browser Geolocation & Reverse Geocoding on Mount
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setPickupText("Birbhum, West Bengal");
      setPickupCoords([23.9113, 87.5284]); // Default to Suri Lal Bazar
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setPickupCoords([latitude, longitude]);
        
        // Reverse Geocode coordinates to readable address via Nominatim
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`);
          const data = await res.json();
          const readableName = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setPickupText(readableName);
          setPickupQuery(readableName);
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setPickupText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setPickupQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setGpsLoading(false);
      },
      (error) => {
        console.error("GPS error:", error);
        setPickupText("Lal Bazar Chowk, Suri");
        setPickupCoords([23.9113, 87.5284]);
        setPickupQuery("Lal Bazar Chowk, Suri");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 2. Debounced Suggestions for Pickup Input
  useEffect(() => {
    if (pickupQuery.length < 3 || pickupQuery === pickupText) {
      setPickupSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickupQuery)}&limit=5&countrycodes=in`);
        const data = await res.json();
        setPickupSuggestions(data);
      } catch (err) {
        console.error("Autocomplete search error:", err);
      }
    }, 450);
    return () => clearTimeout(delay);
  }, [pickupQuery]);

  // 3. Debounced Suggestions for Dropoff Input
  useEffect(() => {
    if (dropQuery.length < 3 || dropQuery === dropText) {
      setDropSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dropQuery)}&limit=5&countrycodes=in`);
        const data = await res.json();
        setDropSuggestions(data);
      } catch (err) {
        console.error("Autocomplete search error:", err);
      }
    }, 450);
    return () => clearTimeout(delay);
  }, [dropQuery]);

  // 4. Map Instantiation
  useEffect(() => {
    if (window.L && mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([23.9113, 87.5284], 13);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    }
  }, []);

  // Update map center when pickup changes
  useEffect(() => {
    if (window.L && mapInstanceRef.current && pickupCoords && !dropCoords) {
      mapInstanceRef.current.setView(pickupCoords, 14);
    }
  }, [pickupCoords]);

  // 5. OSRM Road Routing & actual road path plotting
  useEffect(() => {
    if (window.L && mapInstanceRef.current && pickupCoords && dropCoords) {
      fetchOSRMRoute();
    }
  }, [pickupCoords, dropCoords]);

  const fetchOSRMRoute = async () => {
    // Clear previous markers & polylines
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
    if (trackingMarkerRef.current) {
      trackingMarkerRef.current.remove();
      trackingMarkerRef.current = null;
    }

    try {
      // OSRM requires coord order: lng,lat;lng,lat
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${dropCoords[1]},${dropCoords[0]}?overview=full&geometries=geojson`);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes[0]) {
        const route = data.routes[0];
        
        // OSRM returns driving distance in meters -> convert to km
        const roadDist = Math.round((route.distance / 1000) * 10) / 10;
        setDistance(roadDist);
        setDuration(Math.round(route.duration / 60));

        // Geometry contains array of [lng, lat] -> translate to Leaflet's [lat, lng]
        const rawCoords = route.geometry.coordinates;
        const mappedCoords = rawCoords.map(c => [c[1], c[0]]);
        setRouteGeometry(mappedCoords);

        // Draw Pins
        const pIcon = window.L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="background:${B.mint};width:16px;height:16px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`
        });

        const dIcon = window.L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="background:${B.err};width:16px;height:16px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`
        });

        const pMarker = window.L.marker(pickupCoords, { icon: pIcon }).addTo(mapInstanceRef.current).bindPopup("Pickup Location");
        const dMarker = window.L.marker(dropCoords, { icon: dIcon }).addTo(mapInstanceRef.current).bindPopup("Destination");
        markersRef.current = [pMarker, dMarker];

        // Draw actual road route line
        polylineRef.current = window.L.polyline(mappedCoords, {
          color: '#3B82F6',
          weight: 5,
          opacity: 0.85
        }).addTo(mapInstanceRef.current);

        // Fit map bounds
        const group = new window.L.featureGroup([pMarker, dMarker]);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.25));
      } else {
        // Fallback to straight line if OSRM fails
        drawFallbackStraightLine();
      }
    } catch (err) {
      console.error("OSRM Route API failed, using fallback:", err);
      drawFallbackStraightLine();
    }
  };

  const drawFallbackStraightLine = () => {
    const pIcon = window.L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background:${B.mint};width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`
    });
    const dIcon = window.L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background:${B.err};width:16px;height:16px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`
    });

    const pMarker = window.L.marker(pickupCoords, { icon: pIcon }).addTo(mapInstanceRef.current);
    const dMarker = window.L.marker(dropCoords, { icon: dIcon }).addTo(mapInstanceRef.current);
    markersRef.current = [pMarker, dMarker];

    polylineRef.current = window.L.polyline([pickupCoords, dropCoords], {
      color: '#3B82F6',
      weight: 4,
      dashArray: '8, 8'
    }).addTo(mapInstanceRef.current);

    // Calculate straight line distance
    const R = 6371;
    const dLat = (dropCoords[0] - pickupCoords[0]) * Math.PI / 180;
    const dLon = (dropCoords[1] - pickupCoords[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(pickupCoords[0]*Math.PI/180) * Math.cos(dropCoords[0]*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = Math.round((R * c) * 10) / 10;
    setDistance(dist);
    setDuration(Math.round(dist * 2)); // rough ETA estimation
    setRouteGeometry([pickupCoords, dropCoords]);

    const group = new window.L.featureGroup([pMarker, dMarker]);
    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2));
  };

  // 6. Handle driver tracking simulation marker animation
  useEffect(() => {
    if (bookingState === 'tracked' && window.L && mapInstanceRef.current && routeGeometry.length > 0) {
      const vIcon = window.L.divIcon({
        className: 'tracking-vehicle-pin',
        html: `<div style="background:#1E293B;color:#fff;width:32px;height:32px;border-radius:50%;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:14px">🚗</div>`
      });

      const trackingMarker = window.L.marker(routeGeometry[0], { icon: vIcon }).addTo(mapInstanceRef.current);
      trackingMarkerRef.current = trackingMarker;

      const interval = setInterval(() => {
        setMarkerProgress(prev => {
          const next = prev + 2;
          if (next >= 100) {
            clearInterval(interval);
            trackingMarker.setLatLng(routeGeometry[routeGeometry.length - 1]);
            return 100;
          }

          // Index index interpolation along the OSRM route coordinate list
          const index = Math.min(
            routeGeometry.length - 1,
            Math.floor((next / 100) * routeGeometry.length)
          );
          trackingMarker.setLatLng(routeGeometry[index]);

          return next;
        });
        setDriverEta(prev => (prev > 1 ? Math.max(1, Math.round(5 - (markerProgress / 20))) : 1));
      }, 350);

      return () => clearInterval(interval);
    }
  }, [bookingState, routeGeometry]);

  // GSAP Entrance
  useEffect(() => {
    gsap.fromTo(panelRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" });
  }, []);

  const selectPickupSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setPickupText(item.display_name);
    setPickupQuery(item.display_name);
    setPickupCoords([lat, lng]);
    setPickupSuggestions([]);
    setShowPickupSug(false);
  };

  const selectDropSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setDropText(item.display_name);
    setDropQuery(item.display_name);
    setDropCoords([lat, lng]);
    setDropSuggestions([]);
    setShowDropSug(false);
  };

  const handleBookRide = () => {
    if (!pickupCoords || !dropCoords) {
      alert("Please choose both Pickup and Destination from suggestions.");
      return;
    }
    setBookingState("loading");
    setTimeout(() => {
      setBookingState("tracked");
    }, 2000);
  };

  const handleCompleteRide = () => {
    const activeVeh = VEHICLES.find(v => v.id === selectedVehicle);
    const calculatedFare = Math.round(activeVeh.base + (distance * activeVeh.rate));
    onConfirm({
      ...service,
      calculatedFare,
      paymentMethod,
      rideDetails: {
        pickup: pickupText,
        drop: dropText,
        pickupCoords,
        dropCoords,
        distance,
        duration,
        routeGeometry,
        vehicle: activeVeh,
        fare: calculatedFare,
        driverName: "Rajesh Kumar",
        driverRating: "4.9★",
        eta: `${driverEta} min`
      }
    });
  };

  const activeVehicle = VEHICLES.find(v => v.id === selectedVehicle);
  const fareEstimate = activeVehicle ? Math.round(activeVehicle.base + (distance * activeVehicle.rate)) : 0;

  return (
    <div className="ride-booking-layout">
      
      {/* Left panel: Input panel */}
      <div ref={panelRef} className="card ride-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'visible', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: B.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '50%', transition: 'background 0.2s' }} className="hover-light">
            <ArrowLeft size={20} />
          </button>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: B.ink }}>{service.label} Booking</h3>
            <p style={{ fontSize: '12px', color: B.muted }}>Live Map Interactive Routing</p>
          </div>
        </div>

        {bookingState === 'request' && (
          <>
            {/* Input elements with autocomplete dropdown suggestion panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: B.bg, borderRadius: '16px', border: `1.5px solid ${B.brd}`, marginBottom: '20px', textAlign: 'left', position: 'relative' }}>
              
              {/* Pickup Input Group */}
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '10px', color: B.muted, textTransform: 'uppercase', fontWeight: 700 }}>Pickup Location</label>
                  <button onClick={fetchCurrentLocation} style={{ border: 'none', background: 'none', color: B.mint, fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Navigation size={10} style={{ fill: B.mint }} /> {gpsLoading ? "Locating..." : "Use GPS"}
                  </button>
                </div>
                
                <input 
                  type="text" 
                  value={pickupQuery} 
                  onChange={e => { setPickupQuery(e.target.value); setShowPickupSug(true); }}
                  onFocus={() => setShowPickupSug(true)}
                  placeholder="Enter pickup point..." 
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13.5px', width: '100%', color: B.ink, fontWeight: 700, padding: '4px 0' }}
                />

                {showPickupSug && pickupSuggestions.length > 0 && (
                  <div className="suggestion-dropdown">
                    {pickupSuggestions.map(item => (
                      <div 
                        key={item.place_id} 
                        onClick={() => selectPickupSuggestion(item)}
                        className="suggestion-item"
                      >
                        📍 {item.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr style={{ border: 'none', borderTop: `1px solid ${B.brd}`, margin: '4px 0' }} />

              {/* Destination Input Group */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '10px', color: B.muted, display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Destination</label>
                <input 
                  type="text" 
                  value={dropQuery} 
                  onChange={e => { setDropQuery(e.target.value); setShowDropSug(true); }}
                  onFocus={() => setShowDropSug(true)}
                  placeholder="Search destination (e.g. Suri Station, Kolkata)..." 
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13.5px', width: '100%', color: B.ink, fontWeight: 700, padding: '4px 0' }}
                />

                {showDropSug && dropSuggestions.length > 0 && (
                  <div className="suggestion-dropdown">
                    {dropSuggestions.map(item => (
                      <div 
                        key={item.place_id} 
                        onClick={() => selectDropSuggestion(item)}
                        className="suggestion-item"
                      >
                        🚩 {item.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fare Summary information */}
            {distance > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginBottom: '14px', fontSize: '12.5px', fontWeight: 700, color: B.inkLight }}>
                <span>Driving Distance: <span style={{ color: B.mint }}>{distance} km</span></span>
                <span>Est. Duration: <span style={{ color: B.mint }}>{duration} mins</span></span>
              </div>
            )}

            {/* Vehicle Options */}
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: B.ink, marginBottom: '12px', textAlign: 'left' }}>Choose Ride Type</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {VEHICLES.map(v => {
                const SelectedIcon = v.icon;
                const isSelected = selectedVehicle === v.id;
                const fare = Math.round(v.base + (distance * v.rate));
                return (
                  <div 
                    key={v.id} 
                    onClick={() => setSelectedVehicle(v.id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '14px', 
                      padding: '12px 16px', 
                      borderRadius: '16px', 
                      border: `1.5px solid ${isSelected ? B.mint : B.brd}`, 
                      background: isSelected ? B.mintLight : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    className="ride-vehicle-card"
                  >
                    <div style={{ 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '12px', 
                      background: isSelected ? '#fff' : `${B.mint}12`, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: B.mint 
                    }}>
                      <SelectedIcon size={24} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: B.ink }}>{v.label}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: B.muted, marginTop: '2px' }}>{v.desc}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: B.ink }}>₹{distance > 0 ? fare : v.base}</div>
                      <div style={{ fontSize: '10px', color: B.muted }}>👤 {v.cap}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Selector */}
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: B.ink, marginBottom: '12px', textAlign: 'left' }}>Payment Method</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              <button 
                onClick={() => setPaymentMethod("upi")}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  border: `1.5px solid ${paymentMethod === 'upi' ? B.mint : B.brd}`,
                  background: paymentMethod === 'upi' ? B.mintLight : '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: B.ink
                }}
              >
                <CreditCard size={16} /> UPI / Cards
              </button>
              <button 
                onClick={() => setPaymentMethod("cash")}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  border: `1.5px solid ${paymentMethod === 'cash' ? B.mint : B.brd}`,
                  background: paymentMethod === 'cash' ? B.mintLight : '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: B.ink
                }}
              >
                <DollarSign size={16} /> Pay Cash
              </button>
            </div>

            {/* Book button */}
            <button 
              onClick={handleBookRide}
              className="pbtn" 
              style={{ width: '100%', padding: '15px', borderRadius: '14px', fontSize: '15px' }}
            >
              Request {activeVehicle ? activeVehicle.label : "Ride"} · ₹{fareEstimate}
            </button>
          </>
        )}

        {/* Loading Screen */}
        {bookingState === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 0' }}>
            <Loader2 size={48} className="animate-spin" style={{ color: B.mint, marginBottom: '20px' }} />
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: B.ink, marginBottom: '8px' }}>Finding Your Ride...</h4>
            <p style={{ fontSize: '13px', color: B.muted, textAlign: 'center', maxWidth: '280px' }}>
              Connecting you with nearby drivers. This will take just a few seconds.
            </p>
          </div>
        )}

        {/* Ride Tracking Screen */}
        {bookingState === 'tracked' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Status Card */}
            <div style={{ padding: '16px', background: `${B.mint}10`, border: `1.5px solid ${B.mint}30`, borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
              <div style={{ position: 'relative', width: '12px', height: '12px', borderRadius: '50%', background: B.mint }}>
                <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', border: `2px solid ${B.mint}`, animation: 'ping 1.5s infinite' }}></div>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: B.ink }}>Driver is arriving</h4>
                <p style={{ fontSize: '11px', color: B.mintDark, fontWeight: 600 }}>ETA {driverEta} mins · {markerProgress < 100 ? `${100 - Math.round(markerProgress)}% remaining` : "Arrived!"}</p>
              </div>
            </div>

            {/* Driver Profile */}
            <div style={{ padding: '16px', border: `1.5px solid ${B.brd}`, borderRadius: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: B.bg, border: `1px solid ${B.brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  👨🏽‍✈️
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: B.ink }}>Rajesh Kumar</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', background: `${B.warn}15`, color: B.warn, padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                      <Star size={10} style={{ fill: B.warn }} /> 4.9
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: B.muted }}>Verified ALLIDO Service Partner</p>
                </div>
                <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: B.mintLight, border: 'none', color: B.mint, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} className="hover-light">
                  <Phone size={18} />
                </button>
              </div>

              <hr style={{ border: 'none', borderTop: `1px solid ${B.brd}`, margin: '14px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '10px', color: B.muted, textTransform: 'uppercase', fontWeight: 700 }}>Vehicle Details</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: B.ink, marginTop: '2px' }}>
                    {activeVehicle?.type === 'bike' ? "Royal Enfield (Black)" : "Maruti Swift Dzire"}
                  </div>
                </div>
                <div style={{ padding: '6px 12px', background: B.ink, color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                  WB-54-A-1234
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: B.bg, border: `1.5px solid ${B.brd}`, borderRadius: '16px', marginBottom: '24px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: B.muted }}>Pickup Point</span>
                <span style={{ fontWeight: 600, color: B.ink, maxWidth: '200px', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pickupText}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: B.muted }}>Drop Point</span>
                <span style={{ fontWeight: 600, color: B.ink, maxWidth: '200px', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dropText}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: B.muted }}>Fare Estimate</span>
                <span style={{ fontWeight: 700, color: B.mint }}>₹{fareEstimate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: B.muted }}>Payment Method</span>
                <span style={{ fontWeight: 600, color: B.ink }}>{paymentMethod === 'upi' ? "UPI / Card" : "Cash"}</span>
              </div>
            </div>

            {/* Simulation completion buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
              <button 
                onClick={() => {
                  setIsCanceling(true);
                  if (setCatState) {
                    setCatState('sad');
                  }
                  setTimeout(() => {
                    setBookingState("request");
                    setIsCanceling(false);
                  }, 1800);
                }}
                style={{ flex: 1, padding: '14px', border: `1.5px solid ${B.err}`, color: B.err, background: 'transparent', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
              >
                Cancel Ride
              </button>
              <button 
                onClick={handleCompleteRide}
                className="pbtn"
                style={{ flex: 2, padding: '14px', borderRadius: '12px', fontSize: '13px' }}
              >
                Simulate Ride Complete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right panel: Real-Time Leaflet Map container */}
      <div className="card" style={{ height: '100%', position: 'relative', overflow: 'hidden', border: `1.5px solid ${B.brd}`, borderRadius: '18px', zIndex: 1 }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }}></div>

        {/* Location Safety Shield Badge */}
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: '#fff', border: `1.5px solid ${B.brd}`, borderRadius: '12px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', zIndex: 10 }}>
          <Shield size={16} color={B.mint} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: B.ink }}>ALLIDO Safety Shield Active</span>
        </div>
      </div>

    </div>
  );
}
