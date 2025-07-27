'use client';

import React from 'react';

interface ImmigrantCentralLogoProps {
  className?: string;
  size?: number;
}

export const ImmigrantCentralLogo: React.FC<ImmigrantCentralLogoProps> = ({ 
  className = 'w-8 h-8',
  size = 32, 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="16" cy="16" r="16" fill="url(#gradient)" />
      
      {/* Globe/Earth representation */}
      <circle cx="16" cy="16" r="10" fill="none" stroke="white" strokeWidth="1.5" opacity="0.9" />
      
      {/* Meridian lines */}
      <path 
        d="M16 6 C16 6, 20 10, 20 16 C20 22, 16 26, 16 26" 
        fill="none" 
        stroke="white" 
        strokeWidth="1" 
        opacity="0.7"
      />
      <path 
        d="M16 6 C16 6, 12 10, 12 16 C12 22, 16 26, 16 26" 
        fill="none" 
        stroke="white" 
        strokeWidth="1" 
        opacity="0.7"
      />
      
      {/* Equator line */}
      <path 
        d="M6 16 Q16 14, 26 16" 
        fill="none" 
        stroke="white" 
        strokeWidth="1" 
        opacity="0.7"
      />
      
      {/* Migration arrow - representing movement/journey */}
      <path 
        d="M10 12 L18 12 M15 9 L18 12 L15 15" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Data points - small dots representing analytics */}
      <circle cx="13" cy="20" r="1" fill="white" opacity="0.8" />
      <circle cx="19" cy="20" r="1" fill="white" opacity="0.8" />
      <circle cx="16" cy="22" r="1" fill="white" opacity="0.8" />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
    </svg>
  );
};