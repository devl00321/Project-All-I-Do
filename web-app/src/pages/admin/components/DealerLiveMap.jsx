import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { B } from '../../../constants';

const workerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204071.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if(center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function DealerLiveMap({ workers = [] }) {
  // Default to Suri coords
  const defaultCenter = [23.9054, 87.5276];

  return (
    <div className="card" style={{ height: 400, padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: B.ink }}>Live Fleet Map</h3>
        <span style={{ fontSize: 12, color: B.mint, fontWeight: 600, background: B.mintLight, padding: '4px 10px', borderRadius: 12 }}>
          {workers.length} Active
        </span>
      </div>
      <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${B.brd}` }}>
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {workers.map(w => (
            w.current_lat && w.current_lng && (
              <Marker key={w.id} position={[w.current_lat, w.current_lng]} icon={workerIcon}>
                <Popup>
                  <strong>{w.name}</strong><br />
                  {w.service_type}<br />
                  Status: {w.status}
                </Popup>
              </Marker>
            )
          ))}
          <ChangeView center={workers.length > 0 && workers[0].current_lat ? [workers[0].current_lat, workers[0].current_lng] : null} />
        </MapContainer>
      </div>
    </div>
  );
}
