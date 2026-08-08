import React from 'react';

export const Loader966Icon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id="iconBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Gold Accent Gradient */}
        <linearGradient id="iconGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Metallic Blade Gradient */}
        <linearGradient id="iconMetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* Tire Rubber Gradient */}
        <linearGradient id="iconTireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      {/* Cabin Glass Body */}
      <path d="M 205 155 Q 240 145 275 155 L 310 220 L 205 220 Z" fill="#38BDF8" opacity="0.85"/>
      <path d="M 220 162 L 265 162 L 295 212 L 220 212 Z" fill="#E0F2FE" opacity="0.4"/>

      {/* Cab Pillars & Roof */}
      <path d="M 195 150 L 285 150 L 320 225 L 195 225 Z" fill="none" stroke="url(#iconGoldGrad)" strokeWidth="12" strokeLinejoin="round"/>
      <line x1="185" y1="145" x2="290" y2="145" stroke="url(#iconGoldGrad)" strokeWidth="14" strokeLinecap="round"/>

      {/* Rear Engine Frame Body */}
      <path d="M 100 225 L 200 225 L 200 295 L 110 295 C 100 280 95 250 100 225 Z" fill="url(#iconGoldGrad)"/>
      {/* Grill Vents */}
      <line x1="115" y1="240" x2="155" y2="240" stroke="#78350F" strokeWidth="4" strokeLinecap="round"/>
      <line x1="115" y1="255" x2="155" y2="255" stroke="#78350F" strokeWidth="4" strokeLinecap="round"/>
      <line x1="115" y1="270" x2="155" y2="270" stroke="#78350F" strokeWidth="4" strokeLinecap="round"/>

      {/* Exhaust Stack */}
      <rect x="175" y="105" width="14" height="45" rx="4" fill="#64748B"/>
      <path d="M 172 105 L 192 105 L 182 92 Z" fill="#94A3B8"/>

      {/* Front Chassis */}
      <path d="M 200 235 L 340 235 L 360 295 L 200 295 Z" fill="#D97706"/>

      {/* Heavy Boom Arm */}
      <path d="M 265 245 L 395 210 L 420 315 L 390 320 L 365 255 L 270 275 Z" fill="url(#iconGoldGrad)"/>
      <circle cx="270" cy="270" r="8" fill="#78350F"/>
      <circle cx="390" cy="220" r="8" fill="#78350F"/>

      {/* Hydraulic Piston */}
      <line x1="285" y1="210" x2="365" y2="230" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round"/>
      <line x1="285" y1="210" x2="325" y2="220" stroke="#475569" strokeWidth="16" strokeLinecap="round"/>

      {/* Large Loader Bucket */}
      <path d="M 390 285 Q 460 250 475 295 L 460 375 Q 390 395 375 345 Z" fill="url(#iconMetalGrad)" stroke="url(#iconGoldGrad)" strokeWidth="8"/>
      {/* Teeth */}
      <polygon points="465,275 488,270 480,290" fill="#F59E0B"/>
      <polygon points="473,305 498,305 487,322" fill="#F59E0B"/>
      <polygon points="475,335 498,340 484,355" fill="#F59E0B"/>
      <polygon points="468,365 488,375 474,385" fill="#F59E0B"/>

      {/* Rear Wheel */}
      <circle cx="155" cy="345" r="54" fill="url(#iconTireGrad)" stroke="#1E293B" strokeWidth="12"/>
      <circle cx="155" cy="345" r="32" fill="url(#iconGoldGrad)"/>
      <circle cx="155" cy="345" r="14" fill="#0F172A"/>
      <line x1="155" y1="282" x2="155" y2="292" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
      <line x1="155" y1="398" x2="155" y2="408" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
      <line x1="92" y1="345" x2="102" y2="345" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
      <line x1="208" y1="345" x2="218" y2="345" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>

      {/* Front Wheel */}
      <circle cx="330" cy="345" r="54" fill="url(#iconTireGrad)" stroke="#1E293B" strokeWidth="12"/>
      <circle cx="330" cy="345" r="32" fill="url(#iconGoldGrad)"/>
      <circle cx="330" cy="345" r="14" fill="#0F172A"/>
      <line x1="330" y1="282" x2="330" y2="292" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
      <line x1="330" y1="398" x2="330" y2="408" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
      <line x1="267" y1="345" x2="277" y2="345" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
      <line x1="383" y1="345" x2="393" y2="345" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>

      {/* 966 Emblem */}
      <rect x="220" y="248" width="55" height="22" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="2.5"/>
      <text x="247.5" y="264" fontFamily="'Cairo', 'Segoe UI', Arial, sans-serif" fontWeight="900" fontSize="13" fill="#FBBF24" textAnchor="middle" letterSpacing="1">966</text>
    </svg>
  );
};
