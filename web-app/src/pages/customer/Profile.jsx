import React from 'react';
import { B } from '../../constants';

export default function Profile({ name = "John Doe", phone = "9876543210", onLogout }) {
  const profileOptions = [
    { id: 'edit', label: 'Edit Profile', icon: '👤', desc: 'Update your personal details' },
    { id: 'addresses', label: 'Saved Addresses', icon: '📍', desc: 'Manage your delivery locations' },
    { id: 'payment', label: 'Payment Methods', icon: '💳', desc: 'Manage cards and UPI' },
    { id: 'settings', label: 'Settings', icon: '⚙️', desc: 'Notifications and preferences' },
    { id: 'support', label: 'Help & Support', icon: '💬', desc: 'Get help with your bookings' }
  ];

  return (
    <div className="page" style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <div className="section-title">My Profile</div>
      <div className="section-sub" style={{ marginBottom: "32px" }}>Manage your account settings and preferences.</div>

      {/* Profile Header Card */}
      <div style={{
        display: "flex", alignItems: "center", gap: "24px", padding: "32px",
        background: `linear-gradient(135deg, ${B.mintLight} 0%, #fff 100%)`,
        borderRadius: "16px", border: `1px solid ${B.brd}`, marginBottom: "32px"
      }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%", background: B.mint,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "36px", flexShrink: 0, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
        }}>
          👨‍💼
        </div>
        <div>
          <div style={{ fontFamily: "'Lexend', sans-serif", fontSize: "24px", fontWeight: "600", color: B.ink }}>
            {name}
          </div>
          <div style={{ color: B.inkLight, fontSize: "15px", marginTop: "4px" }}>
            +91 {phone.replace(/(\d{5})(\d{5})/, "$1 $2")}
          </div>
          <div style={{ display: "inline-block", marginTop: "8px", background: `${B.teal}15`, color: B.teal, padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: "600" }}>
            Premium Member
          </div>
        </div>
      </div>

      {/* Options List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
        {profileOptions.map(opt => (
          <div key={opt.id} style={{
            display: "flex", alignItems: "center", padding: "20px",
            background: "#fff", borderRadius: "12px", border: `1px solid ${B.brd}`,
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = B.mint;
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = B.brd;
            e.currentTarget.style.boxShadow = "none";
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px", background: B.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", marginRight: "16px"
            }}>
              {opt.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "16px", fontWeight: "600", color: B.ink }}>{opt.label}</div>
              <div style={{ fontSize: "13px", color: B.inkLight, marginTop: "4px" }}>{opt.desc}</div>
            </div>
            <div style={{ color: B.muted }}>→</div>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <button 
        onClick={onLogout}
        style={{
          width: "100%", padding: "16px", borderRadius: "12px", border: `1.5px solid ${B.err}33`,
          background: "#fff", color: B.err, fontSize: "16px", fontWeight: "600",
          cursor: "pointer", transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = B.errBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#fff";
        }}
      >
        Log Out
      </button>

    </div>
  );
}
