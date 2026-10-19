import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Shield,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  Lock,
  Globe,
  Sliders,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnalysisResult } from '../utils/analyzer';
import { BreachResult, checkBreachStatus } from '../utils/breachCheck';
import { generateAlternativeSuggestions, generateCustomPassword, PasswordSuggestion } from '../utils/suggestions';

interface PasswordAnalyzerProps {
  password: string;
  setPassword: (val: string) => void;
  analysis: AnalysisResult;
}

export const PasswordAnalyzer: React.FC<PasswordAnalyzerProps> = ({
  password,
  setPassword,
  analysis,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [breachData, setBreachData] = useState<BreachResult | null>(null);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [suggestions, setSuggestions] = useState<PasswordSuggestion[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);

  // Generator settings
  const [genLength, setGenLength] = useState(16);
  const [genUpper, setGenUpper] = useState(true);
  const [genLower, setGenLower] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);

  // Load initial suggestions
  useEffect(() => {
    setSuggestions(generateAlternativeSuggestions());
  }, []);

  // Reset breach status when password changes (manual trigger required)
  useEffect(() => {
    setBreachData(null);
    setIsCheckingBreach(false);
  }, [password]);

  const handleCheckBreach = async () => {
    if (!password || password.length === 0 || isCheckingBreach) return;
    setIsCheckingBreach(true);
    try {
      const res = await checkBreachStatus(password);
      setBreachData(res);
    } finally {
      setIsCheckingBreach(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (id === 'crypto' || id === 'diceware') {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#C6FF3D', '#7C5CFF', '#00E5FF', '#FFFFFF'],
      });
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerateSuggestions = () => {
    setSuggestions(generateAlternativeSuggestions());
  };

  const handleApplyGenerated = () => {
    const newPwd = generateCustomPassword({
      length: genLength,
      useUpper: genUpper,
      useLower: genLower,
      useNumbers: genNumbers,
      useSymbols: genSymbols,
      excludeAmbiguous: false,
    });
    setPassword(newPwd);
    setShowGenerator(false);
  };

  // Radial progress calculations
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (analysis.score / 100) * circumference;

  return (
    <div className="w-full space-y-8">
      {/* 1. Primary Input Card with Privacy Shield */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold font-heading text-[#F4F5F7] tracking-tight">
              Cryptographic Dissection
            </h2>
            <span className="text-xs text-[#C6FF3D] font-mono px-2 py-0.5 rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/25">
              CIPHER.V2
            </span>
          </div>

          {/* Privacy Guarantee Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12141B] border border-white/10 text-xs font-mono">
            <Shield className="w-3.5 h-3.5 text-[#C6FF3D]" />
            <span className="text-[#F4F5F7]">PRIVACY // IN-BROWSER</span>
            <span className="text-white/20">·</span>
            <span className="text-[#8E92A0]">Prefix-Only Egress</span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative mt-2">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to dissect cryptographic entropy..."
            aria-label="Password to analyze"
            className="w-full px-5 py-4 pr-32 text-base md:text-lg font-mono-code bg-[#0A0B0F]/90 border border-white/10 focus:border-[#C6FF3D] rounded-2xl text-[#F4F5F7] placeholder:text-[#8E92A0]/50 focus:outline-none focus:ring-2 focus:ring-[#C6FF3D]/20 transition-all shadow-inner"
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {password && (
              <button
                onClick={() => setPassword('')}
                className="px-2 py-1 text-xs text-[#8E92A0] hover:text-[#F4F5F7] font-mono transition-colors cursor-pointer"
                title="Clear input"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-[#8E92A0] hover:text-[#C6FF3D] transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowGenerator(!showGenerator)}
              className="p-2 text-[#8E92A0] hover:text-[#7C5CFF] transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
              title="Configure Generator"
              aria-label="Configure Generator"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Custom Generator Drawer (Expandable) */}
        {showGenerator && (
          <div className="mt-5 p-5 rounded-2xl bg-[#0A0B0F] border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#C6FF3D] tracking-wider uppercase font-mono">
                VAULT.KEY_SYNTHESIZER()
              </span>
              <span className="text-xs font-mono text-[#8E92A0]">Length: {genLength}</span>
            </div>

            <input
              type="range"
              min={8}
              max={40}
              value={genLength}
              onChange={(e) => setGenLength(parseInt(e.target.value, 10))}
              className="w-full accent-[#C6FF3D] cursor-pointer mb-4"
            />

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#8E92A0] mb-4">
              <label className="flex items-center gap-2 cursor-pointer text-[#F4F5F7]">
                <input
                  type="checkbox"
                  checked={genUpper}
                  onChange={(e) => setGenUpper(e.target.checked)}
                  className="accent-[#C6FF3D]"
                />
                Uppercase (A-Z)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#F4F5F7]">
                <input
                  type="checkbox"
                  checked={genLower}
                  onChange={(e) => setGenLower(e.target.checked)}
                  className="accent-[#C6FF3D]"
                />
                Lowercase (a-z)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#F4F5F7]">
                <input
                  type="checkbox"
                  checked={genNumbers}
                  onChange={(e) => setGenNumbers(e.target.checked)}
                  className="accent-[#C6FF3D]"
                />
                Digits (0-9)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[#F4F5F7]">
                <input
                  type="checkbox"
                  checked={genSymbols}
                  onChange={(e) => setGenSymbols(e.target.checked)}
                  className="accent-[#C6FF3D]"
                />
                Symbols (!@#$)
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowGenerator(false)}
                className="px-3 py-1.5 text-xs text-[#8E92A0] hover:text-[#F4F5F7] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleApplyGenerated}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#C6FF3D] text-[#0A0B0F] hover:bg-[#b5f524] transition-all cursor-pointer shadow-md"
              >
                Generate & Apply
              </button>
            </div>
          </div>
        )}

        {/* Character Count & Composition Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-xs font-mono text-[#8E92A0]">
          <div className="flex items-center gap-3">
            <span>Length: <strong className="text-[#F4F5F7]">{analysis.length}</strong></span>
            <span>·</span>
            <span>Pool: <strong className="text-[#F4F5F7]">{analysis.charPoolSize} symbols</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] ${analysis.hasLower ? 'bg-white/10 text-[#F4F5F7]' : 'bg-white/5 text-[#8E92A0]/40'}`}>
              abc
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] ${analysis.hasUpper ? 'bg-white/10 text-[#F4F5F7]' : 'bg-white/5 text-[#8E92A0]/40'}`}>
              ABC
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] ${analysis.hasNumber ? 'bg-white/10 text-[#F4F5F7]' : 'bg-white/5 text-[#8E92A0]/40'}`}>
              123
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] ${analysis.hasSymbol ? 'bg-white/10 text-[#F4F5F7]' : 'bg-white/5 text-[#8E92A0]/40'}`}>
              #$&
            </span>
          </div>
        </div>
      </div>

      {/* 2. Primary Metrics: Radial Score Gauge + 3-Tier Crack Time Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radial Gauge Card (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-panel flex flex-col items-center justify-center text-center relative">
          <span className="text-[11px] font-mono tracking-widest text-[#C6FF3D] uppercase mb-3">
            RESILIENCE.METRIC
          </span>

          {/* SVG Radial Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
              {/* Background track */}
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="var(--gauge-track)"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Value track */}
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke={analysis.levelColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Score Center Label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold font-mono tracking-tight text-[#F4F5F7]">
                {analysis.score}
              </span>
              <span className="text-[10px] font-mono text-[#8E92A0]">/ 100</span>
            </div>
          </div>

          {/* Score Level Badge */}
          <div
            className="mt-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase font-mono"
            style={{
              backgroundColor: `${analysis.levelColor}20`,
              color: analysis.levelColor,
              border: `1px solid ${analysis.levelColor}50`,
            }}
          >
            {analysis.scoreLevel}
          </div>

          <p className="text-xs text-[#8E92A0] mt-3 max-w-[220px]">
            {analysis.score >= 80
              ? 'Quantum-hardened. Exceeds global supercomputer exhaustion threshold.'
              : analysis.score >= 60
              ? 'Strong fortress. Robust against consumer & distributed GPU clusters.'
              : analysis.score >= 40
              ? 'Moderate defense. At risk from targeted dictionary & rule mutations.'
              : 'Critical weakness. Subject to instantaneous heuristic compromise.'}
          </p>
        </div>

        {/* 3-Tier Crack Time Estimates (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tier 1: Online Throttled */}
          <div className="p-5 rounded-2xl glass-panel flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-[#00E5FF]">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-wider">Online Throttled</span>
              </div>
              <p className="text-[11px] text-[#8E92A0] mb-3">
                Web login forms with rate limits & CAPTCHA (10 guesses/sec).
              </p>
            </div>
            <div>
              <div className="text-xs text-[#8E92A0] font-mono mb-0.5">Estimated Duration</div>
              <div className="text-lg font-bold font-mono text-[#00E5FF] truncate">
                {analysis.crackTimes.onlineThrottled}
              </div>
            </div>
          </div>

          {/* Tier 2: Offline Fast Hash */}
          <div className="p-5 rounded-2xl glass-panel flex flex-col justify-between border-[#C6FF3D]/25">
            <div>
              <div className="flex items-center gap-2 mb-2 text-[#C6FF3D]">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-wider">Offline GPU Fast</span>
              </div>
              <p className="text-[11px] text-[#8E92A0] mb-3">
                8x RTX 4090 Hashcat cluster (100 Billion hashes/sec).
              </p>
            </div>
            <div>
              <div className="text-xs text-[#8E92A0] font-mono mb-0.5">Estimated Duration</div>
              <div className="text-lg font-bold font-mono text-[#C6FF3D] truncate">
                {analysis.crackTimes.offlineFastHash}
              </div>
            </div>
          </div>

          {/* Tier 3: Nation-State Exascale */}
          <div className="p-5 rounded-2xl glass-panel flex flex-col justify-between border-[#7C5CFF]/25">
            <div>
              <div className="flex items-center gap-2 mb-2 text-[#7C5CFF]">
                <Layers className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-wider">Nation-State Grid</span>
              </div>
              <p className="text-[11px] text-[#8E92A0] mb-3">
                Dedicated exascale cluster (100 Trillion hashes/sec).
              </p>
            </div>
            <div>
              <div className="text-xs text-[#8E92A0] font-mono mb-0.5">Estimated Duration</div>
              <div className="text-lg font-bold font-mono text-[#7C5CFF] truncate">
                {analysis.crackTimes.nationState}
              </div>
            </div>
          </div>

          {/* Secondary Entropy & Predictability Banner */}
          <div className="sm:col-span-3 p-4 rounded-2xl bg-[#0A0B0F]/90 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[#8E92A0] mr-2">Max keyspace entropy (if fully random):</span>
                <span className="text-[#F4F5F7] font-bold">{analysis.entropyBits} bits</span>
              </div>
              <span className="text-white/20">|</span>
              <div>
                <span className="text-[#8E92A0] mr-2">Effective Entropy:</span>
                <span className="text-[#F4F5F7] font-bold">{analysis.effectiveEntropy} bits</span>
              </div>
              <span className="text-white/20">|</span>
              <div>
                <span className="text-[#8E92A0] mr-2">Actual Predictability:</span>
                <span className={`font-bold ${analysis.predictabilityScore > 50 ? 'text-[#FF3B5C]' : 'text-[#C6FF3D]'}`}>
                  {analysis.predictabilityScore}%
                </span>
              </div>
            </div>

            <div className="text-[#8E92A0] text-[11px]">
              Pool: {analysis.charPoolSize} symbols · Estimates are theoretical models based on assumed attack rates, not guarantees
            </div>
          </div>
        </div>
      </div>

      {/* 3. Weakness Heatmap & Pattern Annotations */}
      {password.length > 0 && (
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F4F5F7] uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C6FF3D]" />
              Weakness Heatmap & Lexical Risk
            </h3>
            <span className="text-xs text-[#8E92A0]">Hover characters for risk classification</span>
          </div>

          {/* Character badges */}
          <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-[#0A0B0F] border border-white/10">
            {analysis.characterRisks.map((cr, idx) => (
              <span
                key={idx}
                title={cr.reason || 'Sufficient entropy contribution'}
                className={`inline-flex items-center justify-center min-w-[28px] h-9 px-2 rounded-lg font-mono text-sm font-bold border transition-all ${
                  cr.risk === 'critical'
                    ? 'bg-[#FF3B5C]/15 text-[#FF3B5C] border-[#FF3B5C]/40'
                    : cr.risk === 'warning'
                    ? 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40'
                    : 'bg-[#C6FF3D]/15 text-[#C6FF3D] border-[#C6FF3D]/30'
                }`}
              >
                {cr.char}
              </span>
            ))}
          </div>

          {/* Detected Patterns list */}
          {analysis.patterns.length > 0 ? (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono text-[#FFB800] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Detected Vulnerability Patterns:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.patterns.map((pat, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] text-xs font-mono"
                  >
                    {pat}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#C6FF3D] font-mono flex items-center gap-2 pt-1">
              <Check className="w-4 h-4" />
              <span>Zero dictionary runs or spatial keyboard walks observed.</span>
            </div>
          )}

          {/* Suggestions checklist */}
          {analysis.feedback.suggestions.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <span className="text-xs font-mono text-[#8E92A0] block mb-2">Hardening Directives:</span>
              <ul className="space-y-1.5">
                {analysis.feedback.suggestions.map((sug, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#F4F5F7]/90">
                    <ChevronRight className="w-3.5 h-3.5 text-[#C6FF3D] shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 4. HaveIBeenPwned k-Anonymity Breach Check Card (Manual Trigger) */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#7C5CFF]" />
            <h3 className="text-sm font-semibold text-[#F4F5F7] uppercase tracking-wider font-mono">
              HaveIBeenPwned k-Anonymity Leak Audit
            </h3>
          </div>

          <div className="text-xs font-mono text-[#8E92A0]">
            {breachData?.hashPrefix ? (
              <span>Prefix: <code className="text-[#C6FF3D]">{breachData.hashPrefix}*****</code> (SHA-1)</span>
            ) : (
              <span>k-Anonymity Hash Range Verification</span>
            )}
          </div>
        </div>

        <p className="text-xs text-[#8E92A0]">
          Check whether this password has appeared in historical public data breaches. When you click below, only the first 5 characters of your password's SHA-1 hash are sent to HaveIBeenPwned (k-anonymity). Your plaintext password is never sent.
        </p>

        {isCheckingBreach ? (
          <div className="p-4 rounded-2xl bg-[#0A0B0F] border border-white/10 flex items-center gap-3 text-xs text-[#8E92A0] font-mono">
            <RefreshCw className="w-4 h-4 animate-spin text-[#C6FF3D]" />
            <span>Querying 5-character SHA-1 range against HaveIBeenPwned API...</span>
          </div>
        ) : breachData ? (
          <div className="space-y-3">
            {breachData.breached ? (
              <div className="p-4 rounded-2xl bg-[#FF3B5C]/15 border border-[#FF3B5C]/40 text-[#F4F5F7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#FF3B5C] shrink-0" />
                  <div className="text-xs">
                    <strong className="text-[#FF3B5C] block sm:inline mr-2">Compromised in Known Leaks!</strong>
                    <span>
                      This exact password appears in <strong className="font-mono text-[#F4F5F7]">{breachData.count.toLocaleString()}</strong> public data breaches.
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#FF3B5C]/20 border border-[#FF3B5C]/50 text-[#FF3B5C] whitespace-nowrap">
                  HAZARD DETECTED
                </span>
              </div>
            ) : breachData.offlineFallback ? (
              <div className="p-4 rounded-2xl bg-[#0A0B0F] border border-white/10 text-[#8E92A0] text-xs font-mono flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FFB800]" />
                <span>Offline mode: Network query bypassed. Local entropy models operational.</span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-[#F4F5F7] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <Check className="w-4 h-4 text-[#C6FF3D] shrink-0" />
                  <span>Zero instances found across billions of verified leak dumps.</span>
                </div>
                <span className="text-[11px] font-mono text-[#C6FF3D]">Clean Status</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleCheckBreach}
                disabled={!password || password.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-[#12141B] hover:bg-white/5 text-xs font-mono text-[#8E92A0] hover:text-[#F4F5F7] transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-check breach status</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#0A0B0F] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#8E92A0] font-mono">
              {!password || password.length === 0
                ? 'Enter a password above to enable breach status check.'
                : 'Ready to query breach database using 5-char SHA-1 prefix.'}
            </div>

            <button
              onClick={handleCheckBreach}
              disabled={!password || password.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                !password || password.length === 0
                  ? 'opacity-40 cursor-not-allowed bg-white/5 text-[#8E92A0]'
                  : 'bg-[#7C5CFF] hover:bg-[#6846f7] text-white shadow-[0_0_15px_rgba(124,92,255,0.3)]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Check breach status</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. AI Suggestions: 3 Stronger Memorable Alternatives */}
      <div className="p-6 md:p-8 rounded-3xl glass-panel space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C6FF3D]" />
              <h3 className="text-base font-semibold text-[#F4F5F7] font-heading">
                LockLogic Vault Alternatives
              </h3>
            </div>
            <p className="text-xs text-[#8E92A0] mt-1">
              High-entropy memorable passphrases generated in browser memory via cryptographic Diceware algorithms.
            </p>
          </div>

          <button
            onClick={handleRegenerateSuggestions}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#8E92A0] hover:text-[#C6FF3D] rounded-xl hover:bg-white/5 transition-colors border border-white/10 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((sug) => (
            <div
              key={sug.id}
              className="p-5 rounded-2xl bg-[#0A0B0F] border border-white/10 hover:border-[#C6FF3D]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#F4F5F7]">{sug.title}</span>
                  <span className="text-[10px] font-mono text-[#C6FF3D] px-1.5 py-0.5 rounded bg-[#C6FF3D]/10 border border-[#C6FF3D]/25">
                    {sug.entropy} bits
                  </span>
                </div>

                <div className="p-3 my-2 rounded-xl bg-[#12141B] border border-white/5 font-mono text-xs text-[#F4F5F7] break-all select-all font-semibold tracking-wide">
                  {sug.password}
                </div>

                <p className="text-[11px] text-[#8E92A0] mb-3">{sug.description}</p>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => handleCopy(sug.password, sug.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-[#C6FF3D] hover:text-[#0A0B0F] text-[#F4F5F7] text-xs font-medium transition-all cursor-pointer"
                >
                  {copiedId === sug.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => setPassword(sug.password)}
                  className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-[#8E92A0] hover:text-[#F4F5F7] text-xs transition-colors cursor-pointer"
                  title="Inspect in Analyzer"
                >
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
