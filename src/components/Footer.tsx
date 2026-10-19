import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { LockLogicLogo } from './LockLogicLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#07080C] py-12 px-4 sm:px-8 text-xs text-[#8E92A0]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <LockLogicLogo size={28} />
          <div>
            <span className="font-heading font-bold text-[#F4F5F7] tracking-tight">Lock<span className="text-[#C6FF3D]">Logic</span></span>
            <span className="text-white/20 mx-2">·</span>
            <span className="text-[#8E92A0]">Think like the attacker. Build like the vault.</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-[#8E92A0]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#C6FF3D]" />
            Privacy-First Web Crypto
          </span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7C5CFF]" />
            NIST SP 800-63B Standards
          </span>
          <span className="text-white/20">·</span>
          <span>HaveIBeenPwned k-Anonymity API</span>
        </div>

        <div className="text-[#8E92A0]/80 text-center md:text-right font-mono text-[11px]">
          SYS.ARCH // PRIVACY-FIRST PROTOCOL © {new Date().getFullYear()}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-white/5 text-[10px] text-[#8E92A0]/60 leading-relaxed text-center md:text-left">
        Privacy & Compliance Disclosure: Google Fonts are loaded from Google servers. When checking breach status, a truncated 5-character SHA-1 prefix is sent to haveibeenpwned.com via k-anonymity (your full password or full hash never leaves your device). The AI Vault Coach receives only sanitized numeric metadata (length, score, entropy, crack times, character counts), never the password plaintext.
      </div>
    </footer>
  );
};
