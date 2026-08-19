import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { B } from '../constants';

export default function KittenChatbot({ 
  isOpen, 
  onClose, 
  activeServiceId,
  userName = "Guest",
  userPhone = "",
  userLocation = "Kolkata, West Bengal",
  isLoggedIn = false,
  bookingHistory = [],
  onNavigate
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'puffy',
      text: 'Meow! I am Puffy, your personal assistant! 🐾 I can manage your bookings, check your profile, or answer questions. Try asking me "what is my name?", "book a plumber", or "show my history"!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [userMsgCount, setUserMsgCount] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getPuffyReply = (input, currentCount) => {
    const text = input.toLowerCase();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isTooLong = currentCount >= 4;

    let matched = true;
    let baseText = "";
    let interactiveNode = null;

    // Command Intent Parser
    if (text.includes('name') || text.includes('who am i') || text.includes('profile')) {
      if (isLoggedIn) {
        baseText = `Purr! Your name is ${userName}, and your registered phone number is ${userPhone}. Is there anything else you'd like to update? 🐱`;
        interactiveNode = (
          <button onClick={() => onNavigate('profile')} className="puffy-chat-action-btn">
            Go to Profile
          </button>
        );
      } else {
        baseText = `Meow! You are not logged in yet. Please log in so I can remember your details! 🐾`;
        interactiveNode = (
          <button onClick={() => onNavigate('profile')} className="puffy-chat-action-btn">
            Log In Now
          </button>
        );
      }
    }
    else if (text.includes('location') || text.includes('address') || text.includes('where do i live') || text.includes('saved location')) {
      if (isLoggedIn) {
        baseText = `Mrowr! Your default saved location is set to ${userLocation}. 📍 Would you like to check or update your profile?`;
        interactiveNode = (
          <button onClick={() => onNavigate('profile')} className="puffy-chat-action-btn">
            Go to Profile
          </button>
        );
      } else {
        baseText = `Meow! You are not logged in yet. Please log in so I can check your saved location! 🐾`;
        interactiveNode = (
          <button onClick={() => onNavigate('profile')} className="puffy-chat-action-btn">
            Log In Now
          </button>
        );
      }
    } 
    else if (text.includes('order') || text.includes('history') || text.includes('past') || text.includes('previous')) {
      if (!isLoggedIn) {
        baseText = `Mrowr! Please log in to see your past orders.`;
      } else if (bookingHistory.length === 0) {
        baseText = `Meow! You haven't made any bookings yet. Want me to help you book a service? 🔧`;
      } else {
        baseText = `Here is a quick look at your past orders! You have ${bookingHistory.length} previous booking(s). 🐾`;
        interactiveNode = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {bookingHistory.slice(0, 2).map((booking, i) => (
              <div key={i} style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '4px' }}>
                <strong>{booking.service}</strong> - {booking.date}<br/>
                Cost: {booking.amount}
              </div>
            ))}
            <button onClick={() => onNavigate('bookings')} className="puffy-chat-action-btn">
              View All History
            </button>
          </div>
        );
      }
    }
    else if (text.includes('book') || text.includes('plumber') || text.includes('electrician') || text.includes('mechanic') || text.includes('driver')) {
      let detectedService = null;
      if (text.includes('plumber')) detectedService = { id: 'plumber', label: 'Plumber' };
      else if (text.includes('electrician')) detectedService = { id: 'electrician', label: 'Electrician' };
      else if (text.includes('mechanic')) detectedService = { id: 'mechanic', label: 'Mechanic' };
      else if (text.includes('driver')) detectedService = { id: 'driver', label: 'Driver' };

      if (detectedService) {
        baseText = `Purrrfect! Let's get a ${detectedService.label} for you. Click the button below to start booking! 🛠️`;
        interactiveNode = (
          <button onClick={() => onNavigate('book', detectedService)} className="puffy-chat-action-btn">
            Book {detectedService.label}
          </button>
        );
      } else {
        baseText = 'Meow! We offer 12+ premium local services, from plumbing 🔧 and mechanics to electricians ⚡! I can take you to the services page to browse.';
        interactiveNode = (
          <button onClick={() => onNavigate('services')} className="puffy-chat-action-btn">
            Browse Services
          </button>
        );
      }
    } 
    else if (text.includes('track') || text.includes('where') || text.includes('status')) {
      baseText = 'Mrowr! Want to check where your service partner is? I can take you to the Live Tracking map! 📍';
      interactiveNode = (
        <button onClick={() => onNavigate('track')} className="puffy-chat-action-btn">
          Go to Live Tracking
        </button>
      );
    } 
    else if (text.includes('price') || text.includes('cost') || text.includes('fare')) {
      baseText = 'Purr... Our pricing is set to competitive Indian market rates! 💰 No hidden fees. Select a service to see exact estimates.';
    } 
    else if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
      baseText = `Meow! Hello ${isLoggedIn ? userName : 'friend'}! I am Puffy. I can manage your bookings, show your profile, or answer any questions! 🐾`;
    } 
    else {
      matched = false;
      baseText = "Meow! I'm still learning human speech. 🐾 I can help you manage your bookings, check your profile, or navigate the app! What would you like to do?";
    }

    const showNumbers = (!matched && isTooLong);

    const textNode = (
      <div>
        <div>{baseText}</div>
        {interactiveNode}
        {showNumbers && (
          <div style={{ marginTop: '10px', borderTop: `1.5px dashed ${B.brd}`, paddingTop: '8px' }}>
            <div style={{ fontSize: '11px', color: B.muted, marginBottom: '6px', fontWeight: 700 }}>📞 Customer Service Support:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <a href="tel:+919547452913" style={{ color: B.teal, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700 }}>
                <span>📞</span> +91 95474 52913
              </a>
            </div>
          </div>
        )}
      </div>
    );

    return {
      id: Date.now(),
      sender: 'puffy',
      text: textNode,
      time
    };
  };

  const handleSend = (textToSend) => {
    if (!textToSend.trim()) return;
    
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextCount = userMsgCount + 1;
    setUserMsgCount(nextCount);

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulate Puffy thinking/typing
    setTimeout(() => {
      const reply = getPuffyReply(textToSend, nextCount);
      setMessages(prev => [...prev, reply]);
    }, 600);
  };

  const CHIPS = [
    { text: 'Book Plumber 🔧', query: 'Book a plumber' },
    { text: 'My Profile 👤', query: 'What is my name?' },
    { text: 'Past Orders 📦', query: 'Show my history' },
    { text: 'Track Order 📍', query: 'Track my order' }
  ];

  if (!isOpen) return null;

  return (
    <div className="puffy-chat-window animate-fade-in">
      {/* Header */}
      <div className="puffy-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="puffy-chat-avatar">🐱</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Puffy
              <span className="puffy-chat-online-dot"></span>
            </div>
            <div style={{ fontSize: '11px', color: '#D0EAE0' }}>Site Manager & Assistant</div>
          </div>
        </div>
        <button onClick={onClose} className="puffy-chat-close-btn">
          <Icons.X size={16} />
        </button>
      </div>

      {/* Message List */}
      <div className="puffy-chat-body">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            style={{ 
              display: 'flex', 
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '12px' 
            }}
          >
            <div 
              className={`puffy-msg-bubble ${msg.sender === 'user' ? 'user' : 'puffy'}`}
            >
              <div style={{ wordBreak: 'break-word' }}>{msg.text}</div>
              <div className="puffy-msg-time">{msg.time}</div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="puffy-chat-chips">
        {CHIPS.map(chip => (
          <button 
            key={chip.text} 
            onClick={() => handleSend(chip.query)}
            className="puffy-chat-chip-btn"
          >
            {chip.text}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
        className="puffy-chat-input-bar"
      >
        <input 
          type="text" 
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Ask Puffy to do something..."
          className="puffy-chat-input-field"
        />
        <button type="submit" className="puffy-chat-send-btn">
          <Icons.Send size={14} />
        </button>
      </form>
    </div>
  );
}
