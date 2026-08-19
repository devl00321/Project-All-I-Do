import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { B } from '../constants';
import { Navigation, MapPin } from 'lucide-react';

// Create a custom icon for the marker
const customIcon = new L.DivIcon({
  className: 'custom-map-pin',
  html: `<div style="
    background-color: ${B.mint};
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid white;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  ">
    <div style="transform: rotate(45deg); color: white;">
      📍
    </div>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Component to handle map clicks for positioning the marker
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

export default function AddAddressMap({ onSave, onCancel }) {
  // Default to Suri coordinates
  const defaultPosition = { lat: 23.9102, lng: 87.5276 };
  const [position, setPosition] = useState(defaultPosition);
  const [addressType, setAddressType] = useState('Home');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        (err) => {
          console.error(err);
          alert("Unable to retrieve your location. Please check browser permissions.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleSave = () => {
    if (!detailedAddress.trim()) {
      alert("Please enter the detailed address.");
      return;
    }
    onSave({
      id: Date.now(),
      type: addressType,
      address: detailedAddress,
      lat: position.lat,
      lng: position.lng
    });
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", gap: "16px" }}>
        <button
          onClick={onCancel}
          style={{ background: 'var(--surface)', border: `1px solid ${B.brd}`, borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer" }}
        >
          ←
        </button>
        <div className="section-title" style={{ margin: 0, fontSize: "20px" }}>Add New Address</div>
      </div>

      <div style={{ background: 'var(--surface)', padding: "20px", borderRadius: "16px", border: `1px solid ${B.brd}` }}>
        {/* Map Container */}
        <div style={{ height: "300px", borderRadius: "12px", overflow: "hidden", marginBottom: "20px", position: "relative", zIndex: 1 }}>
          <MapContainer center={defaultPosition} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
          
          <button 
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            style={{
              position: "absolute", bottom: "20px", right: "20px", zIndex: 1000,
              background: 'var(--surface)', padding: "10px 16px", borderRadius: "100px",
              display: "flex", alignItems: "center", gap: "8px", border: `1px solid ${B.brd}`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", cursor: "pointer",
              fontWeight: "600", fontSize: "14px", color: isLocating ? B.muted : B.mintDeep
            }}
          >
            <Navigation size={16} />
            {isLocating ? "Locating..." : "Use Current Location"}
          </button>
        </div>

        {/* Input Fields */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          {['Home', 'Work', 'Other'].map(type => (
            <button
              key={type}
              onClick={() => setAddressType(type)}
              style={{
                flex: 1, padding: "12px", borderRadius: "8px", fontWeight: "600",
                background: addressType === type ? B.mintLight : "#fff",
                color: addressType === type ? B.mintDark : B.inkLight,
                border: `1.5px solid ${addressType === type ? B.mint : B.brd}`,
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              {type}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", color: B.inkLight, marginBottom: "8px" }}>Detailed Address (House No, Flat, Street)</label>
          <input
            type="text"
            value={detailedAddress}
            onChange={(e) => setDetailedAddress(e.target.value)}
            placeholder="E.g. Flat 4B, Green View Apartments..."
            style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: `1px solid ${B.brd}`, fontSize: "15px", outline: "none" }}
            onFocus={(e) => e.target.style.borderColor = B.mint}
            onBlur={(e) => e.target.style.borderColor = B.brd}
          />
        </div>

        <button
          onClick={handleSave}
          className="pbtn lg w-full"
          style={{ width: "100%" }}
        >
          Save Address
        </button>
      </div>
    </div>
  );
}
