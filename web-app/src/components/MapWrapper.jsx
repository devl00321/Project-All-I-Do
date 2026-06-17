// STATUS: READY FOR DEPLOY
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create a custom icon for the worker
const workerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204071.png', // Delivery/Worker icon placeholder
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Create a custom icon for the user/home
const homeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Dummy coordinates for Suri, Birbhum
const homePos = [23.9100, 87.5200];

// Component to adjust bounds to fit markers
function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [map, bounds]);
  return null;
}

export default function MapWrapper({ height = 320, workerPos = [23.9054, 87.5276], showWorker = true }) {
  // If worker is not shown, center map on home. Otherwise, bound both.
  const bounds = showWorker ? L.latLngBounds(workerPos, homePos) : L.latLngBounds(homePos, homePos);

  return (
    <div style={{ height, width: "100%", borderRadius: "12px", overflow: "hidden", zIndex: 0, position: "relative" }}>
      <MapContainer 
        bounds={bounds} 
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {showWorker && (
          <Marker position={workerPos} icon={workerIcon}>
            <Popup>Assigned Worker</Popup>
          </Marker>
        )}
        
        <Marker position={homePos} icon={homeIcon}>
          <Popup>Your Location</Popup>
        </Marker>

        <ChangeView bounds={bounds} />
      </MapContainer>
    </div>
  );
}
