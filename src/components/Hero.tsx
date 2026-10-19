import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Lock, Cpu, Terminal } from 'lucide-react';
import { LockLogicLogo } from './LockLogicLogo';

const ShardScene = React.lazy(() =>
  import('./ShardScene').then((m) => ({ default: m.ShardScene }))
);

interface HeroProps {
  score: number;
  scoreLevel: string;
  isReducedMotion: boolean;
  isLightMode?: boolean;
  onStartAnalyzing: () => void;
  onOpenAttackLab: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  score,
  scoreLevel,
  isReducedMotion,
  isLightMode,
  onStartAnalyzing,
  onOpenAttackLab,
}) => {
  return (
    <div className="relative w-full overflow-hidden pt-6 pb-12 circuit-grid">
      {/* 3D Shard Canvas Background Container */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <React.Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-[#0A0B0F]/50">
              <div className="w-8 h-8 rounded-full border-2 border-[#C6FF3D]/20 border-t-[#C6FF3D] animate-spin" />
            </div>
          }
        >
          <ShardScene
            score={score}
            scoreLevel={scoreLevel}
            isReducedMotion={isReducedMotion}
            isLightMode={isLightMode}
            className="w-full h-full"
          />
        </React.Suspense>
      </div>

      {/* Atmospheric radial glow backing */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C6FF3D]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#7C5CFF]/12 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Foreground Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 text-center flex flex-col items-center pointer-events-none pt-10 md:pt-14 pb-20">
        {/* HUD Pill Kicker */}
        <div className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12141B]/90 border border-white/10 text-xs font-mono text-[#C6FF3D] mb-6 backdrop-blur-md shadow-lg">
          <Terminal className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>SYS.SPEC // CRYPTOGRAPHIC VAULT INTELLIGENCE</span>
          <span className="text-white/20">·</span>
          <span className="text-[#8E92A0]">v2.4</span>
        </div>

        {/* Giant Futuristic Wordmark */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-2">
          <div className="pointer-events-auto hidden sm:block">
            <LockLogicLogo size={56} glow />
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold font-heading tracking-tight text-[#F4F5F7] select-none drop-shadow-2xl">
            Lock<span className="text-[#C6FF3D]">Logic</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="mt-4 text-xl sm:text-2xl md:text-3xl font-light text-[#F4F5F7] tracking-wide font-sora max-w-2xl text-balance">
          Think like the attacker. <span className="text-[#C6FF3D] font-medium">Build like the vault.</span>
        </p>

        <p className="mt-4 text-xs sm:text-sm text-[#8E92A0] max-w-xl leading-relaxed text-balance">
          A client-side cryptographic intelligence suite combining <span className="text-[#F4F5F7] font-medium">zxcvbn lexical graphs</span>, <span className="text-[#F4F5F7] font-medium">heuristic pattern analysis models (trained ML model: planned)</span>, and <span className="text-[#F4F5F7] font-medium">k-anonymity breach audits</span>.
        </p>

        {/* Action CTAs */}
        <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStartAnalyzing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C6FF3D] hover:bg-[#b5f524] text-[#0A0B0F] font-bold text-sm shadow-[0_0_24px_rgba(198,255,61,0.3)] transition-all cursor-pointer"
          >
            <span>Analyze Your Key</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAttackLab}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#12141B] hover:bg-[#1A1D27] border border-[#7C5CFF]/40 text-[#F4F5F7] hover:text-[#C6FF3D] font-semibold text-sm transition-all backdrop-blur-md cursor-pointer shadow-lg"
          >
            <Zap className="w-4 h-4 text-[#7C5CFF]" />
            <span>Launch Attack Lab</span>
          </button>
        </div>

        {/* 4 Quantitative Rigor Markers Strip */}
        <div className="pointer-events-auto mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl text-left">
          <div className="p-3.5 rounded-2xl bg-[#12141B]/85 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-[#C6FF3D] mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Credential Privacy</span>
            </div>
            <div className="text-sm font-bold text-[#F4F5F7] font-mono">In-Browser Key</div>
            <p className="text-[11px] text-[#8E92A0]">Your password is never sent to any server</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#12141B]/85 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-[#00E5FF] mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider">k-Anonymity</span>
            </div>
            <div className="text-sm font-bold text-[#F4F5F7] font-mono">5-Char SHA-1</div>
            <p className="text-[11px] text-[#8E92A0]">k-anonymity breach check</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#12141B]/85 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-[#7C5CFF] mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Kinetic Shards</span>
            </div>
            <div className="text-sm font-bold text-[#F4F5F7] font-mono">240 Shards</div>
            <p className="text-[11px] text-[#8E92A0]">Vault padlock assembly</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#12141B]/85 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-[#C6FF3D] mb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Pattern Analysis</span>
            </div>
            <div className="text-sm font-bold text-[#F4F5F7] font-mono">Heuristic Model</div>
            <p className="text-[11px] text-[#8E92A0]">Leak corpus & walk detection</p>
          </div>
        </div>
      </div>
    </div>
  );
};
