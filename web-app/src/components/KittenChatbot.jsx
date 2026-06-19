import React, { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { B } from '../constants';

export default function KittenChatbot({ isOpen, onClose, activeServiceId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'puffy',
      text: 'Meow! I am Puffy, your Persian kitten helper! 🐾 How can I help you navigate the services today?',
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

    if (text.includes('service') || text.includes('book') || text.includes('laundry') || text.includes('plumber') || text.includes('electrician') || text.includes('fuel')) {
      baseText = 'Meow! We offer 12+ premium local services, from plumbing 🔧 and mechanics 🔧 to electricians ⚡, porter delivery 📦, and emergency fuel ⛽! You can book them step-by-step from the Services list.';
    } else if (text.includes('price') || text.includes('pricing') || text.includes('fare') || text.includes('charge') || text.includes('cost') || text.includes('money')) {
      baseText = 'Purr... Our pricing is set to competitive Indian market rates! 💰 Ride hailing and emergency fuel depend on real-time routing distance. Home services scale based on job complexity (Minor, Standard, or Installation). No hidden fees!';
    } else if (text.includes('track') || text.includes('where') || text.includes('status') || text.includes('driver') || text.includes('partner')) {
      baseText = 'Mrowr! When your booking is confirmed, go to the "Live Tracking" tab in the sidebar. You can watch your service partner move along the roads in real-time on our Leaflet OSRM map! 📍';
    } else if (text.includes('play') || text.includes('toy') || text.includes('game') || text.includes('yarn') || text.includes('wrench')) {
      baseText = 'Purrr... *swings fluffy tail* I love to play! Whenever you are on a booking page, I will grab a matching toy (like a wrench, spark wires, a toy car, or a pink yarn ball) and play with it! 🧶 Try choosing a service to see!';
    } else if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('puffy')) {
      baseText = 'Meow! Hello friend! I am Puffy. I follow you around to keep you company and help you out. Let me know if you need help with bookings or tracking! 🐾';
    } else {
      matched = false;
      baseText = "Meow! I'm still a small kitten learning human speech. 🐾 Try clicking one of the help options below, or ask about 'services', 'pricing', or 'tracking'!";
    }

    const showNumbers = !matched || isTooLong;

    const textNode = (
      <div>
        <div>{baseText}</div>
        {showNumbers && (
          <div style={{ marginTop: '10px', borderTop: `1.5px dashed ${B.brd}`, paddingTop: '8px' }}>
            <div style={{ fontSize: '11px', color: B.muted, marginBottom: '6px', fontWeight: 700 }}>📞 Customer Service Support:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <a href="tel:+919907927383" style={{ color: B.teal, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700 }}>
                <span>📞</span> +91 99079 27383
              </a>
              <a href="tel:+918116282746" style={{ color: B.teal, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700 }}>
                <span>📞</span> +91 81162 82746
              </a>
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
    { text: 'Browse Services 🔧', query: 'Tell me about available services' },
    { text: 'Pricing & Rates 💰', query: 'How does the pricing system work?' },
    { text: 'Live Tracking 📍', query: 'How can I track my partner?' },
    { text: 'Play with Puffy 🧶', query: 'What toys do you play with?' }
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
            <div style={{ fontSize: '11px', color: '#D0EAE0' }}>Companion Assistant</div>
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
          placeholder="Ask Puffy a question..."
          className="puffy-chat-input-field"
        />
        <button type="submit" className="puffy-chat-send-btn">
          <Icons.Send size={14} />
        </button>
      </form>
    </div>
  );
}
