import React, { useEffect, useState } from 'react';
import { LockLogicLogo } from './LockLogicLogo';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(55), 250);
    const timer2 = setTimeout(() => setProgress(88), 650);
    const timer3 = setTimeout(() => setProgress(100), 950);
    const timer4 = setTimeout(() => setFading(true), 1150);
    const timer5 = setTimeout(() => onComplete(), 1450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0B0F] transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center space-y-6">
        {/* Animated Rings & Circuit Logo */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#7C5CFF]/30 animate-ping opacity-30" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[#C6FF3D] border-r-[#7C5CFF] border-b-transparent border-l-transparent animate-spin duration-1000" />
          <div className="w-16 h-16 rounded-2xl bg-[#12141B] border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(198,255,61,0.25)]">
            <LockLogicLogo size={36} glow />
          </div>
        </div>

        {/* Wordmark */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold font-heading tracking-tight text-[#F4F5F7]">
            Lock<span className="text-[#C6FF3D]">Logic</span>
          </h1>
          <p className="text-xs font-mono text-[#8E92A0] tracking-wider uppercase">
            VAULT CRYPTOGRAPHIC INTELLIGENCE
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-52 h-1 rounded-full bg-[#12141B] overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#7C5CFF] via-[#00E5FF] to-[#C6FF3D] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] font-mono text-[#8E92A0] uppercase tracking-widest">
          SYS.LOAD // CALIBRATING KINEMATICS... {progress}%
        </span>
      </div>
    </div>
  );
};
