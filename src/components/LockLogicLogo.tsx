import React from 'react';

interface LockLogicLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const LockLogicLogo: React.FC<LockLogicLogoProps> = ({
  className = '',
  size = 32,
  glow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${glow ? 'drop-shadow-[0_0_12px_rgba(198,255,61,0.5)]' : ''} ${className}`}
    >
      {/* Circuit Shackle - Formed from logic gate and circuit trace pathways */}
      {/* Left trace leg */}
      <path
        d="M15 22V15C15 10.0294 19.0294 6 24 6C28.9706 6 33 10.0294 33 15V22"
        stroke="#7C5CFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Circuit Trace Shackle Accent with Logic Gates */}
      <path
        d="M19 22V16C19 13.2386 21.2386 11 24 11C26.7614 11 29 13.2386 29 16V18L26 21V22"
        stroke="#C6FF3D"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Circuit junction nodes on shackle */}
      <circle cx="24" cy="6" r="2" fill="#00E5FF" />
      <circle cx="15" cy="14" r="1.5" fill="#7C5CFF" />
      <circle cx="33" cy="14" r="1.5" fill="#7C5CFF" />
      <circle cx="29" cy="16" r="1.5" fill="#C6FF3D" />

      {/* Padlock Vault Body */}
      <rect
        x="9"
        y="21"
        width="30"
        height="22"
        rx="5"
        fill="#12141B"
        stroke="#C6FF3D"
        strokeWidth="1.8"
      />

      {/* Logic Gate / Circuit Inlay on Padlock Body */}
      {/* Horizontal bus line */}
      <path
        d="M13 32H18L21 29H27L30 32H35"
        stroke="#7C5CFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />

      {/* Center Keyhole with Logic Inverter Node */}
      <circle cx="24" cy="29" r="2.8" fill="#C6FF3D" />
      <path
        d="M22.8 30.5L21.5 36.5H26.5L25.2 30.5"
        fill="#C6FF3D"
      />

      {/* Corner telemetry dots */}
      <circle cx="13" cy="25" r="1" fill="#00E5FF" opacity="0.9" />
      <circle cx="35" cy="25" r="1" fill="#00E5FF" opacity="0.9" />
      <circle cx="13" cy="39" r="1" fill="#7C5CFF" opacity="0.7" />
      <circle cx="35" cy="39" r="1" fill="#C6FF3D" opacity="0.7" />
    </svg>
  );
};
