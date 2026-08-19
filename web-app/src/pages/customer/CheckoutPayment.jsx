import React from 'react';
import * as Icons from 'lucide-react';

const BRAND = {
  navy: '#242e47',
  mint: '#51d09f',
  mintDark: '#3ebd8b',
  grayBg: '#f8fafc',
  border: '#e2e8f0',
  textMuted: '#64748b'
};

const PAYMENTS = [
  { id: "upi", label: "UPI", icon: "Smartphone", sub: "Google Pay · PhonePe · Paytm" },
  { id: "card", label: "Card", icon: "CreditCard", sub: "Debit / Credit via Razorpay" },
  { id: "wallet", label: "ALLIDO Wallet", icon: "Wallet", sub: "Balance: ₹1,250" },
  { id: "cash", label: "Cash on Service", icon: "Banknote", sub: "Pay after work is done" },
];

export default function CheckoutPayment({ pay, setPay }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: "18px", color: BRAND.navy, marginBottom: "20px" }}>Payment Method</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {PAYMENTS.map((m) => {
          const isSel = pay === m.id;
          const IconComponent = Icons[m.icon];
          return (
            <button
              key={m.id}
              onClick={() => setPay(m.id)}
              style={{
                padding: "16px 20px", borderRadius: "16px",
                background: isSel ? `${BRAND.mint}15` : "#fff",
                border: `1.5px solid ${isSel ? BRAND.mint : BRAND.border}`,
                display: "flex", alignItems: "center", gap: "16px",
                cursor: "pointer", transition: "all .2s ease",
                boxShadow: isSel ? '0 4px 12px rgba(81, 208, 159, 0.1)' : 'none'
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: isSel ? BRAND.mint : BRAND.grayBg,
                color: isSel ? '#fff' : BRAND.textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <IconComponent size={20} />
              </div>
              
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "15px", color: BRAND.navy }}>
                  {m.label}
                </div>
                <div style={{ color: BRAND.textMuted, fontSize: "12px", marginTop: "2px" }}>{m.sub}</div>
              </div>
              
              <div style={{ 
                width: 24, height: 24, borderRadius: '50%', 
                border: `2px solid ${isSel ? BRAND.mint : BRAND.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isSel && <div style={{ width: 12, height: 12, borderRadius: '50%', background: BRAND.mint }} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
