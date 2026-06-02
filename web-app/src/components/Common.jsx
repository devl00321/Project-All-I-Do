import React, { useState, useEffect } from 'react';
import { B } from '../constants';
import logoImg from '../assets/logo.jpg';

export const Spinner = ({ color = B.mint }) => (
  <span style={{ display:"inline-flex", gap:4, alignItems:"center" }}>
    {[0,1,2].map(i => (
      <span key={i} style={{
        width:6, height:6, borderRadius:"50%", background:color,
        display:"inline-block",
        animation:`bounce3 1.2s infinite ease-in-out`,
        animationDelay:`${i*.15}s`,
      }}/>
    ))}
  </span>
);

export const Badge = ({ children, color=B.mint }) => (
  <span className="chip" style={{ background:`${color}18`, color, border:`1.5px solid ${color}44` }}>
    {children}
  </span>
);

export const AllidoLogo = ({ size=40 }) => (
  <img src={logoImg} alt="Allido Logo" width={size} height={size} style={{ flexShrink:0, borderRadius: '22%', objectFit: 'cover' }} />
);

export function MockMap({ height=280, workerActive=true }) {
  const [pos, setPos] = useState({ x:38, y:55 });
  useEffect(() => {
    if (!workerActive) return;
    const t = setInterval(() => setPos(p => ({
      x: Math.max(12, Math.min(80, p.x + (Math.random()-.5)*5)),
      y: Math.max(15, Math.min(72, p.y + (Math.random()-.5)*4)),
    })), 1900);
    return () => clearInterval(t);
  }, [workerActive]);

  return (
    <div className="map-wrap" style={{ height }}>
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
        {[["5%","5%","18%","20%"],["34%","4%","24%","17%"],["70%","6%","22%","18%"],
          ["5%","45%","20%","26%"],["34%","43%","22%","17%"],["70%","44%","22%","28%"],
          ["12%","78%","14%","14%"],["48%","75%","18%","16%"]
        ].map(([x,y,w,h],i)=>(
          <rect key={i} x={x} y={y} width={w} height={h} fill="rgba(29,158,117,.12)" rx="4"/>
        ))}
        {[["0%","32%","100%","35%"],["0%","60%","100%","58%"],
          ["26%","0%","28%","100%"],["62%","0%","64%","100%"],
          ["0%","16%","60%","40%"],["40%","58%","100%","78%"]
        ].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="white" strokeWidth="5" strokeOpacity=".6"/>
        ))}
        {workerActive && (
          <path d={`M ${pos.x}% ${pos.y}% L 78% 82%`}
            stroke={B.mint} strokeWidth="2.5" strokeDasharray="7 5" fill="none" opacity=".8"
            style={{ animation:"dashMove 1.2s linear infinite" }}/>
        )}
        {workerActive && <>
          <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r="14" fill={B.mint} opacity=".15">
            <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".2;0;.2" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx={`${pos.x}%`} cy={`${pos.y}%`} r="9" fill={B.mint}/>
          <text x={`${pos.x}%`} y={`${pos.y}%`} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="white">👷</text>
        </>}
        <circle cx="78%" cy="82%" r="11" fill={B.teal}/>
        <text x="78%" y="82%" textAnchor="middle" dominantBaseline="central" fontSize="10">🏠</text>
      </svg>
      <div style={{ position:"absolute", inset:0,
        background:"linear-gradient(to bottom, transparent 50%, rgba(244,251,248,.8) 100%)",
        pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:12, left:12,
        background:"rgba(255,255,255,.9)", borderRadius:8, padding:"4px 11px",
        fontSize:12, color:B.inkLight, border:`1px solid ${B.brd}`, fontWeight:500 }}>
        📍 Suri, Birbhum
      </div>
    </div>
  );
}
