import React from 'react';
import { B } from '../constants';

export default function CatCompanion({ state, serviceId }) {
  // Determine facial features based on emotion state
  const isSmile = state === 'smile' || state === 'happy' || state === 'payment';
  const isSad = state === 'sad' || state === 'cancel';
  const isHappy = state === 'happy';

  // Determine current active toy based on serviceId
  const getServiceToy = () => {
    if (!serviceId) return null;
    switch (serviceId) {
      case 'plumber':
      case 'mechanic':
        // Return SVG for a plumbing wrench
        return (
          <g className="cat-toy-wrench" transform="translate(100, 115)">
            <path d="M -12,-4 L -4,-12 C -6,-14 -6,-17 -4,-19 C -2,-21 1,-21 3,-19 L 5,-17 L 1,-13 L 3,-11 L 7,-15 L 9,-13 C 11,-11 11,-8 9,-6 C 7,-4 4,-4 2,-6 L -4,0 Z" fill="#64748B" stroke="#475569" strokeWidth="1.5" />
            <circle cx="8" cy="-8" r="1.5" fill="#FDA4AF" />
          </g>
        );
      case 'electrician':
        // Coil of wire with spark details
        return (
          <g className="cat-toy-wire" transform="translate(100, 115)">
            <path d="M -12,-6 Q -6,-15 0,-6 Q 6,-15 12,-6 Q 6,3 0,-6 Q -6,3 -12,-6" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M -3,-18 L -1,-14 L 2,-14 M 3,-2 L 1,2 L -2,2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 'car_rental':
        // Toy car
        return (
          <g className="cat-toy-car" transform="translate(100, 125)">
            <path d="M -16,4 L -16,0 Q -16,-6 -10,-6 L 10,-6 Q 16,-6 16,0 L 16,4 Z" fill="#EF4444" />
            <rect x="-12" y="-12" width="24" height="7" rx="2" fill="#93C5FD" />
            <circle cx="-9" cy="5" r="4.5" fill="#1E293B" stroke="#fff" strokeWidth="1" />
            <circle cx="9" cy="5" r="4.5" fill="#1E293B" stroke="#fff" strokeWidth="1" />
          </g>
        );
      case 'driver':
      case 'emergency_fuel':
        // Fuel Canister
        return (
          <g className="cat-toy-generic" transform="translate(100, 122)">
            <rect x="-8" y="-12" width="16" height="20" rx="3" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
            <rect x="-4" y="-16" width="8" height="4" fill="#1E293B" />
            <path d="M 4,-4 L 10,-8" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      case 'porter':
        // Package box
        return (
          <g className="cat-toy-generic" transform="translate(100, 122)">
            <rect x="-10" y="-10" width="20" height="18" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
            <line x1="0" y1="-10" x2="0" y2="8" stroke="#92400E" strokeWidth="1.5" strokeDasharray="3,3" />
          </g>
        );
      default:
        // Default play accessory: a cute pink ball of yarn
        return (
          <g className="cat-toy-generic" transform="translate(100, 122)">
            <circle cx="0" cy="0" r="11" fill="#EC4899" />
            <path d="M -8,-5 Q 0,-11 8,-5 M -10,0 Q 0,-6 10,0 M -8,5 Q 0,11 8,5 M -5,-8 Q 5,0 -5,8" fill="none" stroke="#F472B6" strokeWidth="1.5" />
          </g>
        );
    }
  };

  return (
    <svg 
      viewBox="0 0 200 200" 
      width="100%" 
      height="100%" 
      className={isHappy ? 'cat-happy' : (isSad ? 'cat-sad-breath' : '')}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Shading gradients for 3D premium feel */}
        <linearGradient id="catBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        
        <linearGradient id="innerEarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE4E6" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>

        <linearGradient id="collarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>

        <radialGradient id="bellGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="70%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#854D0E" />
        </radialGradient>

        {/* Foliage/Bush gradients */}
        <linearGradient id="bushGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id="bushGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#065F46" />
        </linearGradient>
      </defs>

      {/* Floor Shadow */}
      <ellipse cx="100" cy="154" rx="42" ry="7" fill="#CBD5E1" opacity="0.5" />

      {/* Fluffy tail */}
      <g className="cat-tail">
        <path 
          d="M 125 130 C 148 123, 158 102, 148 85 C 139 74, 127 80, 131 92 C 137 104, 129 118, 120 125" 
          fill="url(#catBodyGrad)" 
          stroke="#94A3B8" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
      </g>

      {/* Cat Body */}
      <path 
        d="M 62 125 C 42 155, 158 155, 138 125 C 145 110, 55 110, 62 125" 
        fill="url(#catBodyGrad)" 
        stroke="#94A3B8" 
        strokeWidth="2" 
      />

      {/* Collar Ribbon */}
      <path 
        d="M 74 113 Q 100 122 126 113" 
        fill="none" 
        stroke="url(#collarGrad)" 
        strokeWidth="4.5" 
        strokeLinecap="round" 
      />

      {/* Collar Bell */}
      <g className="cat-collar-bell">
        <circle cx="100" cy="120" r="6" fill="url(#bellGrad)" stroke="#78350F" strokeWidth="0.8" />
        <circle cx="100" cy="118" r="1.5" fill="#FFF" opacity="0.9" />
        {/* Tiny slit for bell details */}
        <line x1="97.5" y1="122" x2="102.5" y2="122" stroke="#451A03" strokeWidth="0.8" />
      </g>

      {/* Left Ear */}
      <g className="cat-ear-left">
        <path d="M 64 68 L 50 38 L 80 56 Z" fill="url(#catBodyGrad)" stroke="#94A3B8" strokeWidth="2" />
        <path d="M 65 63 L 55 44 L 76 54 Z" fill="url(#innerEarGrad)" />
      </g>

      {/* Right Ear */}
      <g className="cat-ear-right">
        <path d="M 136 68 L 150 38 L 120 56 Z" fill="url(#catBodyGrad)" stroke="#94A3B8" strokeWidth="2" />
        <path d="M 135 63 L 145 44 L 124 54 Z" fill="url(#innerEarGrad)" />
      </g>

      {/* Fluffy Head */}
      <ellipse cx="100" cy="84" rx="46" ry="38" fill="url(#catBodyGrad)" stroke="#94A3B8" strokeWidth="2" />

      {/* Cheeks blush */}
      <circle cx="68" cy="94" r="7.5" fill="#FDA4AF" opacity="0.6" />
      <circle cx="132" cy="94" r="7.5" fill="#FDA4AF" opacity="0.6" />

      {/* Whiskers */}
      <g stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round">
        <line x1="52" y1="90" x2="34" y2="86" />
        <line x1="50" y1="95" x2="32" y2="95" />
        <line x1="52" y1="100" x2="36" y2="104" />
        
        <line x1="148" y1="90" x2="166" y2="86" />
        <line x1="150" y1="95" x2="168" y2="95" />
        <line x1="148" y1="100" x2="164" y2="104" />
      </g>

      {/* Eyes */}
      {isSad ? (
        // Sad crying/drooping eyes
        <g stroke="#475569" strokeWidth="3.2" fill="none" strokeLinecap="round">
          <path d="M 72 88 Q 78 82 84 88" />
          <path d="M 116 88 Q 122 82 128 88" />
          {/* Sparkly tears */}
          <ellipse cx="81.5" cy="95" rx="2" ry="3" fill="#3B82F6" stroke="none" />
          <ellipse cx="118.5" cy="95" rx="2" ry="3" fill="#3B82F6" stroke="none" />
        </g>
      ) : isSmile ? (
        // Upward smiling curved arcs
        <g stroke="#0F2E25" strokeWidth="3.5" fill="none" strokeLinecap="round">
          <path d="M 70 85 Q 78 93 86 85" />
          <path d="M 114 85 Q 122 93 130 85" />
        </g>
      ) : (
        // Round cute sparkles eyes
        <g fill="#0F2E25">
          <circle cx="78" cy="85" r="7" />
          <circle cx="122" cy="85" r="7" />
          {/* Sparkles */}
          <circle cx="75.5" cy="82.5" r="2.8" fill="#FFFFFF" />
          <circle cx="119.5" cy="82.5" r="2.8" fill="#FFFFFF" />
          <circle cx="80.5" cy="87" r="1.2" fill="#FFFFFF" opacity="0.8" />
          <circle cx="124.5" cy="87" r="1.2" fill="#FFFFFF" opacity="0.8" />
        </g>
      )}

      {/* Nose */}
      <polygon points="97.5,93 102.5,93 100,95.5" fill="#F43F5E" />

      {/* Mouth */}
      {isSad ? (
        // Sad downward arc mouth
        <path d="M 94 103 Q 100 98 106 103" fill="none" stroke="#0F2E25" strokeWidth="2" strokeLinecap="round" />
      ) : isSmile ? (
        // Smiling open mouth
        <path d="M 94 97 Q 100 107 106 97 Z" fill="#FDA4AF" stroke="#0F2E25" strokeWidth="2" strokeLinecap="round" />
      ) : (
        // Cute cat w-smile
        <path d="M 94 98 Q 97 101 100 98 Q 103 101 106 98" fill="none" stroke="#0F2E25" strokeWidth="2" strokeLinecap="round" />
      )}

      {/* Paws */}
      {state === 'splash' ? (
        // Splash waving paw
        <g>
          {/* Left paw sitting */}
          <ellipse cx="74" cy="138" rx="8" ry="6" fill="url(#catBodyGrad)" stroke="#94A3B8" strokeWidth="1.8" />
          {/* Waving Right paw */}
          <g className="cat-paw-right-wave">
            <path d="M 125 125 Q 138 103 143 108 Q 148 113 130 132" fill="url(#catBodyGrad)" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="139" cy="109" r="2.2" fill="#FDA4AF" />
          </g>
        </g>
      ) : serviceId ? (
        // Playing with active service toy paw animation
        <g>
          <g className="cat-paw-left-play">
            <ellipse cx="75" cy="128" rx="8" ry="6" fill="url(#catBodyGrad)" stroke="#94A3B8" strokeWidth="1.8" />
          </g>
          <g className="cat-paw-right-play">
            <ellipse cx="125" cy="128" rx="8" ry="6" fill="url(#catBodyGrad)" stroke="#94A3B8" strokeWidth="1.8" />
          </g>
        </g>
      ) : (
        // Normal sitting paws
        <g>
          <ellipse cx="78" cy="140" rx="8" ry="6" fill="url(#catBodyGrad)" stroke="#94A3B8" strokeWidth="1.8" />
          <ellipse cx="122" cy="140" rx="8" ry="6" fill="url(#catBodyGrad)" stroke="#94A3B8" strokeWidth="1.8" />
        </g>
      )}

      {/* Render Service Toy overlay */}
      {serviceId && getServiceToy()}

      {/* Garden foliage/bushes overlay masking the cat's bottom boundary */}
      {state !== 'splash' && state !== 'home_peek' && state !== 'normal' && (
        <g className="cat-bushes">
          {/* Left leaf cluster */}
          <path d="M 25 160 C 20 135, 45 128, 55 132 C 65 118, 85 122, 90 136 C 98 128, 115 135, 110 160 Z" fill="url(#bushGrad1)" />
          {/* Right leaf cluster */}
          <path d="M 175 160 C 180 135, 155 128, 145 132 C 135 118, 115 122, 110 136 C 102 128, 85 135, 90 160 Z" fill="url(#bushGrad1)" />
          {/* Center foreground bush overlay */}
          <path d="M 50 160 C 60 140, 80 135, 95 140 C 105 130, 125 135, 130 142 C 140 138, 155 145, 150 160 Z" fill="url(#bushGrad2)" />
          
          {/* Cute single detail leaf accents */}
          <path d="M 68 138 Q 72 130 82 135 Q 78 143 68 138 Z" fill="#34D399" />
          <path d="M 132 138 Q 128 130 118 135 Q 122 143 132 138 Z" fill="#34D399" />
        </g>
      )}
    </svg>
  );
}
