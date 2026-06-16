// STATUS: READY FOR DEPLOY
import React from 'react';
import { B } from '../../constants';
import MapWrapper from '../../components/MapWrapper';

export default function LiveTrack() {
  const steps = [
    { id: 'confirmed', label: 'Confirmed', done: true },
    { id: 'assigned', label: 'Assigned', done: true },
    { id: 'en_route', label: 'Worker En Route', done: true, active: true },
    { id: 'in_progress', label: 'In Progress', done: false },
    { id: 'completed', label: 'Completed', done: false },
  ];

  return (
    <div className="page" style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
      <div className="section-title">Live Track</div>
      <div className="section-sub" style={{ marginBottom: "32px" }}>Tracking your active service booking</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>
        
        {/* Left Column: Map and Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Map Interface */}
          <div className="card" style={{ padding: "16px" }}>
            <MapWrapper height={320} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 8px 0" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: B.ink }}>
                Worker is arriving in <span style={{ color: B.mint }}>12 mins</span>
              </div>
              <div style={{ fontSize: "12px", color: B.muted }}>Auto-updating via GPS</div>
            </div>
          </div>

          {/* Status Timeline Node */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ fontWeight: 700, fontSize: "16px", color: B.ink, marginBottom: "24px" }}>Booking Status</div>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              <div style={{ position: "absolute", top: "14px", left: 0, right: 0, height: "4px", background: B.brd, borderRadius: "2px", zIndex: 0 }} />
              <div style={{ position: "absolute", top: "14px", left: 0, width: "50%", height: "4px", background: B.mint, borderRadius: "2px", zIndex: 0 }} />
              
              {steps.map((step, idx) => (
                <div key={step.id} style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "80px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    border: `2.5px solid ${step.done ? B.mint : B.brd}`,
                    background: step.done ? B.mint : "#fff", color: step.done ? "#fff" : B.muted,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .3s"
                  }}>
                    {step.done ? <span style={{ fontSize: "14px" }}>✓</span> : <span style={{ fontSize: "12px", fontWeight: 700 }}>{idx + 1}</span>}
                  </div>
                  <div style={{
                    fontSize: "11px", fontWeight: 700, textAlign: "center", lineHeight: 1.2,
                    color: step.active ? B.mint : (step.done ? B.ink : B.muted)
                  }}>
                    {step.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Worker Profile and Dealer Support */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Worker Profile Card */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%", background: B.mintLight,
                border: `2px solid ${B.mint}`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "28px", flexShrink: 0
              }}>
                👨‍🔧
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "18px", color: B.ink }}>Rajesh Kumar</div>
                <div style={{ fontSize: "13px", color: B.inkLight, fontWeight: 500 }}>Expert Plumber</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px", background: "#FEF3C7", color: "#B45309", padding: "2px 8px", borderRadius: "100px", fontSize: "11px", fontWeight: 700 }}>
                  <span>⭐ 4.9</span>
                  <span style={{ opacity: 0.6, fontWeight: 400 }}>(124 jobs)</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="pbtn" style={{ flex: 1 }}>Call</button>
              <button className="gbtn" style={{ flex: 1 }}>Message</button>
            </div>
            
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${B.brd}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: B.muted, fontSize: "13px" }}>OTP for service:</span>
              <span style={{ fontWeight: 700, color: B.ink, letterSpacing: "2px", fontSize: "16px" }}>5482</span>
            </div>
          </div>

          {/* Dealer Escalation Trigger */}
          <div style={{ background: B.errBg, border: `1.5px solid #FCA5A5`, borderRadius: "20px", padding: "20px" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: B.err, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>⚠️</span> Need Help?
            </div>
            <div style={{ fontSize: "12px", color: B.err, opacity: 0.9, marginBottom: "16px", lineHeight: 1.5 }}>
              If the worker is delayed or you have issues, contact the area dealer directly.
            </div>
            <button style={{
              width: "100%", background: "#fff", color: B.err, border: `1.5px solid ${B.err}`,
              fontWeight: 700, fontSize: "13px", padding: "10px 0", borderRadius: "12px",
              cursor: "pointer", transition: "all .2s"
            }}>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
