import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ className = "w-9 h-9", size = 36 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Shield Gradient: Royal Blue (#2563EB) to Emerald Green (#10B981) */}
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* AI Circuit Glow */}
        <filter id="aiGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. SHIELD OUTER (Protection) */}
      <path 
        d="M24 4L8 10V22C8 31.8 14.8 40.7 24 44C33.2 40.7 40 31.8 40 22V10L24 4Z" 
        fill="url(#shieldGrad)"
        stroke="#FFFFFF" 
        strokeWidth="1.5" 
        strokeLinejoin="round"
      />

      {/* 2. INNER HEART (Healthcare) */}
      <path 
        d="M24 34L22.2 32.4C15.6 26.4 11.2 22.4 11.2 17.5C11.2 13.5 14.3 10.4 18.3 10.4C20.6 10.4 22.8 11.5 24 13.2C25.2 11.5 27.4 10.4 29.7 10.4C33.7 10.4 36.8 13.5 36.8 17.5C36.8 22.4 32.4 26.4 25.8 32.4L24 34Z" 
        fill="#FFFFFF"
      />

      {/* 3. AI CIRCUIT LINES & NODES (AI Protection) */}
      {/* Center Circuit Cross Traces */}
      <path 
        d="M24 16.5V26.5M19 21.5H29" 
        stroke="#2563EB" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />

      {/* Circuit Nodes (Dots) */}
      <circle cx="24" cy="16.5" r="2.2" fill="#10B981" filter="url(#aiGlow)" />
      <circle cx="24" cy="26.5" r="2.2" fill="#10B981" filter="url(#aiGlow)" />
      <circle cx="19" cy="21.5" r="2.2" fill="#2563EB" filter="url(#aiGlow)" />
      <circle cx="29" cy="21.5" r="2.2" fill="#2563EB" filter="url(#aiGlow)" />

      {/* Corner AI Circuit Traces */}
      <path 
        d="M17 14.5L14 11.5M31 14.5L34 11.5M17 28.5L14 31.5M31 28.5L34 31.5" 
        stroke="#FFFFFF" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
      <circle cx="14" cy="11.5" r="1.5" fill="#FFFFFF" />
      <circle cx="34" cy="11.5" r="1.5" fill="#FFFFFF" />
      <circle cx="14" cy="31.5" r="1.5" fill="#FFFFFF" />
      <circle cx="34" cy="31.5" r="1.5" fill="#FFFFFF" />
    </svg>
  );
};
