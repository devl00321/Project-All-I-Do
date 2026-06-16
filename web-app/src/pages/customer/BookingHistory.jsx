// STATUS: READY FOR DEPLOY
import React, { useState } from 'react';
import { B, PAST_BOOKINGS } from '../../constants';

const extendedBookings = PAST_BOOKINGS.map((b, i) => ({
  ...b,
  status: i === 0 ? 'needs_review' : 'completed',
}));

export default function BookingHistory() {
  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmitReview = () => {
    console.log("Review submitted:", { rating, reviewText, bookingId: reviewModal.id });
    setReviewModal(null);
    setRating(0);
    setReviewText("");
  };

  return (
    <div className="page" style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
      <div className="section-title">My Bookings</div>
      <div className="section-sub" style={{ marginBottom: "32px" }}>View your past service history</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {extendedBookings.map((b) => (
          <div key={b.id} className="booking-row">
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: B.mintFog, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "24px", flexShrink: 0
            }}>
              {b.service === "Plumber" ? "🔧" : b.service === "Electrician" ? "⚡" : "🧹"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                <div style={{ fontWeight: 700, fontSize: "16px", color: B.ink }}>{b.service}</div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: B.mint }}>{b.amount}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                <div style={{ color: B.muted }}>{b.date} • {b.id}</div>
                {b.status === 'needs_review' ? (
                  <button 
                    onClick={() => setReviewModal(b)}
                    style={{
                      background: B.warnBg, color: B.warn, border: "none",
                      padding: "6px 14px", borderRadius: "100px", fontWeight: 700,
                      fontSize: "12px", cursor: "pointer", transition: "opacity .2s"
                    }}
                  >
                    Leave Review
                  </button>
                ) : (
                  <div style={{ color: B.inkLight, display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                    <span style={{ fontSize: "12px" }}>⭐</span> {b.rating}/5
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Rating Modal Overlay */}
      {reviewModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", padding: "20px"
        }}>
          <div className="card" style={{
            padding: "36px", maxWidth: "420px", width: "100%", position: "relative",
            animation: "bounce3 0.4s ease-out forwards", boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
          }}>
            <button 
              onClick={() => setReviewModal(null)}
              style={{
                position: "absolute", top: "20px", right: "20px", width: "32px", height: "32px",
                borderRadius: "50%", background: B.surface, border: "none", color: B.ink,
                fontWeight: 700, fontSize: "14px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "44px", marginBottom: "8px" }}>⭐</div>
              <div style={{ fontFamily: "'Lexend', sans-serif", fontWeight: 700, fontSize: "22px", color: B.ink }}>
                Rate your service
              </div>
              <div style={{ fontSize: "14px", color: B.muted, marginTop: "6px" }}>
                How was your {reviewModal.service} service with {reviewModal.worker}?
              </div>
            </div>

            {/* Star Rating Selector */}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "28px", cursor: "pointer" }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverRating || rating) >= star;
                return (
                  <div 
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      fontSize: "36px", transition: "transform 0.2s",
                      color: isActive ? B.warn : B.brd,
                      filter: isActive ? "none" : "grayscale(100%) opacity(50%)",
                      transform: isActive ? "scale(1.15)" : "scale(1)"
                    }}
                  >
                    ★
                  </div>
                );
              })}
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: B.inkLight, marginBottom: "8px" }}>
                Leave a comment (optional)
              </label>
              <textarea className="fi"
                style={{ minHeight: "100px", resize: "none" }}
                placeholder="What did you like or dislike?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>

            <button 
              disabled={rating === 0}
              onClick={handleSubmitReview}
              className="pbtn lg"
              style={{ width: "100%", background: rating > 0 ? B.mint : B.brd, color: rating > 0 ? "#fff" : B.muted }}
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
