'use client';

import React from 'react';

interface ImmigrantCentralLogoProps {
  className?: string;
  size?: number;
  /** Play the draw-in animation once on mount (default true). */
  animate?: boolean;
}

export const ImmigrantCentralLogo: React.FC<ImmigrantCentralLogoProps> = ({
  className = 'w-8 h-8',
  size = 32,
  animate = true,
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
      {animate && (
        <style>{`
          @keyframes ic-logo-trace {
            from { stroke-dashoffset: 30; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes ic-logo-dot {
            from { opacity: 0; transform: scale(0.4); }
            to { opacity: 1; transform: scale(1); }
          }
          .ic-logo-arch { stroke-dasharray: 30; animation: ic-logo-trace 0.9s ease-in-out 0.15s both; }
          .ic-logo-dot { transform-box: fill-box; transform-origin: center; animation: ic-logo-dot 0.4s ease-out 0.95s both; }
          @media (prefers-reduced-motion: reduce) {
            .ic-logo-arch, .ic-logo-dot { animation: none; }
          }
        `}</style>
      )}

      {/* Background squircle */}
      <rect width="32" height="32" rx="7.2" fill="#1545a2" />

      {/* Gateway arch */}
      <path
        className={animate ? 'ic-logo-arch' : undefined}
        d="M11 21.75 L11 15.25 A5 5 0 0 1 21 15.25 L21 21.75"
        stroke="white"
        strokeWidth="2.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Point of light arriving through the gate */}
      <circle
        className={animate ? 'ic-logo-dot' : undefined}
        cx="16"
        cy="19.75"
        r="1.8"
        fill="white"
      />
    </svg>
  );
};
