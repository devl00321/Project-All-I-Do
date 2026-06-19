// STATUS: READY FOR DEPLOY
import React from 'react';
import { B } from '../../constants';

const PAYMENTS = [
  { id: "upi", label: "UPI", icon: "📱", sub: "Google Pay · PhonePe · Paytm" },
  { id: "card", label: "Card", icon: "💳", sub: "Debit / Credit via Razorpay" },
  { id: "wallet", label: "ALLIDO Wallet", icon: "👛", sub: "Balance: ₹1,250" },
  { id: "cash", label: "Cash on Service", icon: "💵", sub: "Pay after work is done" },
];

export default function CheckoutPayment({ pay, setPay }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: "17px", color: B.ink, marginBottom: "20px" }}>Payment Method</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {PAYMENTS.map((m) => {
          const isSel = pay === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setPay(m.id)}
              style={{
                padding: "16px 18px", borderRadius: "16px",
                background: isSel ? B.mintLight : "#fff",
                border: `1.5px solid ${isSel ? B.mint : B.brd}`,
                display: "flex", alignItems: "center", gap: "16px",
                cursor: "pointer", transition: "all .18s"
              }}
            >
              <span style={{ fontSize: "26px" }}>{m.icon}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", color: isSel ? B.mint : B.ink }}>
                  {m.label}
                </div>
                <div style={{ color: B.muted, fontSize: "12px" }}>{m.sub}</div>
              </div>
              {isSel && <span style={{ marginLeft: "auto", color: B.mint, fontSize: "18px" }}>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
