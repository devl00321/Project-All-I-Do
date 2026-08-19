import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import * as Icons from 'lucide-react';
import { B } from '../constants';

export default function OnboardingWalkthrough({ onComplete }) {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to ALLIDO! 🎉",
      description: "Your personal assistant for every home and emergency service. Let's get you familiar with how things work.",
      icon: <Icons.Sparkles size={48} color="var(--mint)" />
    },
    {
      title: "Book Any Service 🔧",
      description: "From plumbers and electricians to emergency mechanics. Browse our catalog and book instantly with transparent pricing.",
      icon: <Icons.Wrench size={48} color="var(--mint)" />
    },
    {
      title: "Track in Real-Time 📍",
      description: "Watch your service partner arrive on our live map. No more guessing when help will arrive!",
      icon: <Icons.MapPin size={48} color="var(--mint)" />
    },
    {
      title: "Meet Puffy 🐱",
      description: "Say hi to your personal AI assistant in the bottom right! Puffy can book services, track orders, and pull up your profile.",
      icon: <span style={{ fontSize: '48px' }}>🐾</span>
    }
  ];

  useEffect(() => {
    gsap.fromTo('.onboarding-content', 
      { opacity: 0, x: 20 }, 
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [step]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(13, 31, 24, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--surface)', width: '90%', maxWidth: '420px',
        borderRadius: '24px', padding: '32px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative background blobs */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'var(--mintPale)', borderRadius: '50%', filter: 'blur(30px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', filter: 'blur(30px)', zIndex: 0 }} />

        <div className="onboarding-content" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ 
            width: '80px', height: '80px', margin: '0 auto 24px', 
            background: 'var(--mintPale)', borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(93, 202, 165, 0.2)'
          }}>
            {steps[step].icon}
          </div>
          
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.6rem', color: 'var(--ink)', marginBottom: '12px' }}>
            {steps[step].title}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '32px', minHeight: '66px' }}>
            {steps[step].description}
          </p>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: i === step ? '24px' : '8px', height: '8px',
                borderRadius: '4px',
                background: i === step ? 'var(--mint)' : 'var(--brdMid)',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>

          <button 
            onClick={handleNext}
            style={{
              width: '100%', padding: '14px', borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--mint), var(--mintDeep))',
              color: '#fff', fontSize: '1rem', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(14, 159, 114, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {step === steps.length - 1 ? "Get Started 🚀" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
