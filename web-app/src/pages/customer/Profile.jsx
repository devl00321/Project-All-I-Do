import React, { useState } from 'react';
import { B } from '../../constants';
import { ArrowLeft, User, MapPin, CreditCard, Settings, MessageSquare, Plus, Trash2 } from 'lucide-react';
import AddAddressMap from '../../components/AddAddressMap';

export default function Profile({ name = "User", phone = "9876543210", onLogout }) {
  const [activeView, setActiveView] = useState('main');

  // Mock Data States
  const [profileData, setProfileData] = useState({ name, phone, email: '' });
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    smsAlerts: true
  });

  const profileOptions = [
    { id: 'edit', label: 'Edit Profile', icon: <User size={20} />, desc: 'Update your personal details' },
    { id: 'addresses', label: 'Saved Addresses', icon: <MapPin size={20} />, desc: 'Manage your delivery locations' },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard size={20} />, desc: 'Manage cards and UPI' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, desc: 'Notifications and preferences' },
    { id: 'support', label: 'Help & Support', icon: <MessageSquare size={20} />, desc: 'Get help with your bookings' }
  ];

  // Top header for sub-views
  const SubHeader = ({ title }) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "32px", gap: "16px" }}>
      <button
        onClick={() => setActiveView('main')}
        style={{
          background: 'var(--surface)', border: `1px solid ${B.brd}`, borderRadius: "50%", width: "40px", height: "40px",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: B.ink
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = B.mint; e.currentTarget.style.color = B.mint; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = B.brd; e.currentTarget.style.color = B.ink; }}
      >
        <ArrowLeft size={20} />
      </button>
      <div className="section-title" style={{ margin: 0, fontSize: "24px" }}>{title}</div>
    </div>
  );

  const renderMain = () => (
    <>
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
            {profileData.name}
          </div>
          <div style={{ color: B.inkLight, fontSize: "15px", marginTop: "4px" }}>
            +91 {profileData.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}
          </div>
          <div style={{ display: "inline-block", marginTop: "8px", background: `${B.teal}15`, color: B.teal, padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: "600" }}>
            Premium Member
          </div>
        </div>
      </div>

      {/* Options List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
        {profileOptions.map(opt => (
          <div key={opt.id} onClick={() => setActiveView(opt.id)} style={{
            display: "flex", alignItems: "center", padding: "20px",
            background: 'var(--surface)', borderRadius: "12px", border: `1px solid ${B.brd}`,
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
              color: B.ink, marginRight: "16px"
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
          background: 'var(--surface)', color: B.err, fontSize: "16px", fontWeight: "600",
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
    </>
  );

  const renderEditProfile = () => (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <SubHeader title="Edit Profile" />
      <div style={{ background: 'var(--surface)', padding: "24px", borderRadius: "16px", border: `1px solid ${B.brd}` }}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", color: B.inkLight, marginBottom: "8px" }}>Full Name</label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: `1px solid ${B.brd}`, fontSize: "16px", outline: "none" }}
            onFocus={(e) => e.target.style.borderColor = B.mint}
            onBlur={(e) => e.target.style.borderColor = B.brd}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", color: B.inkLight, marginBottom: "8px" }}>Phone Number</label>
          <input
            type="text"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: `1px solid ${B.brd}`, fontSize: "16px", outline: "none" }}
            onFocus={(e) => e.target.style.borderColor = B.mint}
            onBlur={(e) => e.target.style.borderColor = B.brd}
          />
        </div>
        <div style={{ marginBottom: "32px" }}>
          <label style={{ display: "block", fontSize: "14px", color: B.inkLight, marginBottom: "8px" }}>Email Address</label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: `1px solid ${B.brd}`, fontSize: "16px", outline: "none" }}
            onFocus={(e) => e.target.style.borderColor = B.mint}
            onBlur={(e) => e.target.style.borderColor = B.brd}
          />
        </div>
        <button
          onClick={() => setActiveView('main')}
          style={{ width: "100%", padding: "16px", borderRadius: "12px", background: B.mint, color: "#fff", fontSize: "16px", fontWeight: "600", cursor: "pointer", border: "none", transition: "all 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.background = B.mintDark}
          onMouseLeave={(e) => e.currentTarget.style.background = B.mint}
        >
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <SubHeader title="Saved Addresses" />
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {addresses.map(addr => (
          <div key={addr.id} style={{ padding: "20px", background: 'var(--surface)', borderRadius: "12px", border: `1px solid ${B.brd}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ background: B.bg, padding: "12px", borderRadius: "8px", color: B.ink }}>
                <MapPin size={20} />
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: B.ink, marginBottom: "4px" }}>{addr.type}</div>
                <div style={{ fontSize: "14px", color: B.inkLight }}>{addr.address}</div>
              </div>
            </div>
            <button
              onClick={() => setAddresses(addresses.filter(a => a.id !== addr.id))}
              style={{ background: "transparent", border: "none", color: B.err, cursor: "pointer", padding: "8px" }}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setActiveView('add_address')}
          style={{ padding: "20px", background: B.mintLight, borderRadius: "12px", border: `2px dashed ${B.mint}`, color: B.mintDeep, fontSize: "16px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.background = B.mintFog}
          onMouseLeave={(e) => e.currentTarget.style.background = B.mintLight}
        >
          <Plus size={20} /> Add New Address
        </button>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <SubHeader title="Payment Methods" />
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {paymentMethods.map(pm => (
          <div key={pm.id} style={{ padding: "20px", background: 'var(--surface)', borderRadius: "12px", border: `1px solid ${B.brd}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ background: B.bg, padding: "12px", borderRadius: "8px", color: B.ink }}>
                <CreditCard size={20} />
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: B.ink, marginBottom: "4px" }}>{pm.type}</div>
                <div style={{ fontSize: "14px", color: B.inkLight }}>{pm.detail}</div>
              </div>
            </div>
            <button
              onClick={() => setPaymentMethods(paymentMethods.filter(p => p.id !== pm.id))}
              style={{ background: "transparent", border: "none", color: B.err, cursor: "pointer", padding: "8px" }}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const newType = prompt("Method Type (UPI / Card):", "UPI");
            if (newType) {
              const newDetail = prompt("Enter UPI ID or Card Number:");
              if (newDetail) setPaymentMethods([...paymentMethods, { id: Date.now(), type: newType, detail: newDetail }]);
            }
          }}
          style={{ padding: "20px", background: B.mintLight, borderRadius: "12px", border: `2px dashed ${B.mint}`, color: B.mintDeep, fontSize: "16px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.background = B.mintFog}
          onMouseLeave={(e) => e.currentTarget.style.background = B.mintLight}
        >
          <Plus size={20} /> Add Payment Method
        </button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <SubHeader title="Settings" />
      <div style={{ background: 'var(--surface)', padding: "8px 24px", borderRadius: "16px", border: `1px solid ${B.brd}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: `1px solid ${B.brd}` }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: B.ink }}>Push Notifications</div>
            <div style={{ fontSize: "14px", color: B.inkLight, marginTop: "4px" }}>Receive updates on bookings and ETAs</div>
          </div>
          <input
            type="checkbox"
            checked={settings.pushNotifications}
            onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
            style={{ width: "24px", height: "24px", accentColor: B.mint, cursor: "pointer" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: B.ink }}>SMS Alerts</div>
            <div style={{ fontSize: "14px", color: B.inkLight, marginTop: "4px" }}>Get OTPs and important alerts via SMS</div>
          </div>
          <input
            type="checkbox"
            checked={settings.smsAlerts}
            onChange={(e) => setSettings({ ...settings, smsAlerts: e.target.checked })}
            style={{ width: "24px", height: "24px", accentColor: B.mint, cursor: "pointer" }}
          />
        </div>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <SubHeader title="Help & Support" />
      <div style={{ background: 'var(--surface)', padding: "24px", borderRadius: "16px", border: `1px solid ${B.brd}` }}>
        <div style={{ fontSize: "18px", fontWeight: "600", color: B.ink, marginBottom: "16px" }}>How can we help you?</div>
        <div style={{ fontSize: "15px", color: B.inkLight, lineHeight: "1.6", marginBottom: "24px" }}>
          If you have any issues with your bookings, payments, or just want to give feedback, please reach out to our local dealer network.
        </div>

        <div style={{ background: B.bg, padding: "16px", borderRadius: "12px", marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", color: B.muted, marginBottom: "4px" }}>Call us at</div>
          <div style={{ fontSize: "18px", fontWeight: "600", color: B.teal }}>+91 9547452913</div>
        </div>

        <div style={{ background: B.bg, padding: "16px", borderRadius: "12px" }}>
          <div style={{ fontSize: "14px", color: B.muted, marginBottom: "4px" }}>Email support</div>
          <div style={{ fontSize: "18px", fontWeight: "600", color: B.teal }}>allidosupport@gmail.com</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page" style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", position: "relative" }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      {activeView === 'main' && renderMain()}
      {activeView === 'edit' && renderEditProfile()}
      {activeView === 'addresses' && renderAddresses()}
      {activeView === 'payment' && renderPayment()}
      {activeView === 'settings' && renderSettings()}
      {activeView === 'support' && renderSupport()}
      {activeView === 'add_address' && (
        <AddAddressMap 
          onSave={(newAddress) => {
            setAddresses([...addresses, newAddress]);
            setActiveView('addresses');
          }}
          onCancel={() => setActiveView('addresses')}
        />
      )}
    </div>
  );
}
