import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, Database, BrainCircuit, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';
import { AnalysisResult } from '../utils/analyzer';
import { getSecureRandomInt } from '../utils/suggestions';
import { ATTACK_RATES } from '../utils/attackRates';

interface AttackLabProps {
  currentPassword: string;
  analysis: AnalysisResult;
  onSelectPassword: (pwd: string) => void;
}

type HardwareSpeed = 'laptop' | 'gpuCluster' | 'supercomputer';

export const AttackLab: React.FC<AttackLabProps> = ({
  currentPassword,
  analysis,
  onSelectPassword,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [hardware, setHardware] = useState<HardwareSpeed>('gpuCluster');
  const [elapsedMs, setElapsedMs] = useState(0);

  // Vectors state
  const [bruteGuesses, setBruteGuesses] = useState(0);
  const [bruteStatus, setBruteStatus] = useState<'running' | 'cracked' | 'exhausted'>('running');
  const [bruteSample, setBruteSample] = useState('...');

  const [dictGuesses, setDictGuesses] = useState(0);
  const [dictStatus, setDictStatus] = useState<'running' | 'cracked' | 'exhausted'>('running');
  const [dictSample, setDictSample] = useState('...');

  const [mlGuesses, setMlGuesses] = useState(0);
  const [mlStatus, setMlStatus] = useState<'running' | 'cracked' | 'exhausted'>('running');
  const [mlSample, setMlSample] = useState('...');

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Hardware attack rates (guesses per millisecond derived from ATTACK_RATES)
  const rates = {
    laptop: {
      brute: ATTACK_RATES.laptop / 1000,
      dict: (ATTACK_RATES.laptop * 1.5) / 1000,
      ml: ATTACK_RATES.laptop / 1000,
      label: 'Standard CPU (10M/sec)',
    },
    gpuCluster: {
      brute: ATTACK_RATES.offlineFastHash / 1000,
      dict: (ATTACK_RATES.offlineFastHash * 1.4) / 1000,
      ml: (ATTACK_RATES.offlineFastHash * 0.7) / 1000,
      label: '8x RTX 4090 Hashcat (100B/sec)',
    },
    supercomputer: {
      brute: ATTACK_RATES.nationState / 1000,
      dict: (ATTACK_RATES.nationState * 0.8) / 1000,
      ml: (ATTACK_RATES.nationState * 0.5) / 1000,
      label: 'State Supercomputer (100T/sec)',
    },
  };

  const pwdLength = currentPassword.length;
  const isTooEmpty = !currentPassword || pwdLength === 0;

  // Determine attack vulnerabilities
  const isDictVulnerable =
    analysis.predictabilityScore > 40 ||
    /^(?=.*[a-z])([a-z0-9!@#]{1,10})$/i.test(currentPassword) ||
    analysis.patterns.length > 0;

  // Total permutations needed for brute force (log-space calculation, no arbitrary length cap)
  const charPool = analysis.charPoolSize || 26;
  const log10SearchSpace = pwdLength * Math.log10(charPool);
  // Attacker traverses on average 0.5 * keyspace
  const estimatedBruteNeeded = 0.5 * Math.pow(10, Math.min(300, log10SearchSpace));

  // Dictionary search space: ~20M common dictionary mutations
  const estimatedDictNeeded = isDictVulnerable
    ? Math.max(100, Math.floor(Math.pow(10, Math.min(pwdLength * 0.7, 7))))
    : 80_000_000;

  // ML / Markov predictor guesses
  const estimatedMlNeeded = Math.max(
    50,
    Math.floor((analysis.predictabilityScore / 100) * 500_000 + Math.pow(2, Math.min(analysis.entropyBits, 40)))
  );

  const resetSimulation = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsRunning(false);
    setElapsedMs(0);
    setBruteGuesses(0);
    setBruteStatus('running');
    setBruteSample('---');
    setDictGuesses(0);
    setDictStatus('running');
    setDictSample('---');
    setMlGuesses(0);
    setMlStatus('running');
    setMlSample('---');
  };

  const toggleSimulation = () => {
    if (isRunning) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      startTimeRef.current = performance.now() - elapsedMs;
    }
  };

  useEffect(() => {
    resetSimulation();
  }, [currentPassword, hardware]);

  useEffect(() => {
    if (!isRunning) return;

    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const randomAttempt = (len: number) => {
      let res = '';
      for (let i = 0; i < len; i++) res += chars[getSecureRandomInt(chars.length)];
      return res;
    };

    const dictMutations = ['pass123', 'admin2024', 'hunter2', 'shadow!', 'dragon99', 'letmein', 'master@1', 'qwerty9'];

    const step = () => {
      const now = performance.now();
      const delta = now - startTimeRef.current;
      setElapsedMs(delta);

      const currentRate = rates[hardware];

      // Update Brute Force Simulation
      const newBrute = Math.floor(delta * currentRate.brute);
      setBruteGuesses(newBrute);
      if (newBrute >= estimatedBruteNeeded) {
        setBruteStatus('cracked');
        setBruteSample(currentPassword);
      } else if (newBrute >= 1e12 || (delta >= 10000 && estimatedBruteNeeded > 1e12)) {
        setBruteStatus('exhausted');
        setBruteSample('Keyspace resilient: Infeasible for simulated hardware');
      } else {
        setBruteSample(randomAttempt(Math.min(pwdLength, 12)));
      }

      // Update Dictionary Simulation
      const newDict = Math.floor(delta * currentRate.dict);
      setDictGuesses(newDict);
      if (newDict >= estimatedDictNeeded && isDictVulnerable) {
        setDictStatus('cracked');
        setDictSample(currentPassword);
      } else if (newDict >= 50_000_000 && !isDictVulnerable) {
        setDictStatus('exhausted');
        setDictSample('Dictionary exhausted (0 matches)');
      } else {
        setDictSample(dictMutations[getSecureRandomInt(dictMutations.length)] + getSecureRandomInt(100));
      }

      // Update Pattern-Heuristic Simulation
      const newMl = Math.floor(delta * currentRate.ml);
      setMlGuesses(newMl);
      if (newMl >= estimatedMlNeeded && analysis.score < 70) {
        setMlStatus('cracked');
        setMlSample(currentPassword);
      } else if (newMl >= 100_000_000 && analysis.score >= 70) {
        setMlStatus('exhausted');
        setMlSample('Pattern resilient (Heuristic threshold exceeded)');
      } else {
        setMlSample(`PatternCandidate(${chars[getSecureRandomInt(chars.length)]}${chars[getSecureRandomInt(chars.length)]}${chars[getSecureRandomInt(chars.length)]})`);
      }

      // Stop if all finished
      const allDone =
        (newBrute >= estimatedBruteNeeded || newBrute > 1e12) &&
        (newDict >= estimatedDictNeeded || newDict >= 50_000_000) &&
        (newMl >= estimatedMlNeeded || newMl >= 100_000_000);

      if (!allDone && isRunning) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setIsRunning(false);
      }
    };

    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, hardware, currentPassword, analysis]);

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Hardware Configuration */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141B] border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-[#C6FF3D]" />
            <h3 className="text-lg font-semibold text-[#F4F5F7] font-heading">
              Educational Attack Simulation Lab
            </h3>
          </div>
          <p className="text-xs text-[#8E92A0]">
            Mathematical attack modeling simulating adversary guessing rates against estimated search spaces. No actual brute-force cracking or password hashing is performed on your device.
          </p>
        </div>

        {/* Speed presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8E92A0] whitespace-nowrap font-mono">SIMULATED.RIG:</span>
          <div className="flex items-center p-1 rounded-xl bg-[#0A0B0F] border border-white/10">
            {(['laptop', 'gpuCluster', 'supercomputer'] as HardwareSpeed[]).map((hw) => (
              <button
                key={hw}
                onClick={() => setHardware(hw)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  hardware === hw
                    ? 'bg-[#C6FF3D] text-[#0A0B0F] font-semibold shadow-sm'
                    : 'text-[#8E92A0] hover:text-[#F4F5F7]'
                }`}
              >
                {hw === 'laptop' ? 'PC' : hw === 'gpuCluster' ? '8x GPU' : 'Exascale'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Bar & Target Specimen */}
      <div className="p-4 rounded-xl bg-[#12141B]/70 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSimulation}
            disabled={isTooEmpty}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs font-mono transition-all cursor-pointer ${
              isTooEmpty
                ? 'opacity-40 cursor-not-allowed bg-white/5 text-[#8E92A0]'
                : isRunning
                ? 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40'
                : 'bg-[#C6FF3D] text-[#0A0B0F] hover:bg-[#b5f524] shadow-[0_0_15px_rgba(198,255,61,0.25)] font-semibold'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> PAUSE SIMULATION
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> START SIMULATION
              </>
            )}
          </button>

          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-[#8E92A0] hover:text-[#F4F5F7] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> RESET
          </button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          <div className="text-xs text-[#8E92A0] hidden sm:flex items-center gap-2 font-mono">
            <span>SIMULATED ELAPSED:</span>
            <span className="text-[#F4F5F7] font-semibold tabular-nums">{(elapsedMs / 1000).toFixed(2)}s</span>
          </div>
        </div>

        {/* Quick Test Presets */}
        <div className="flex items-center gap-2 text-xs overflow-x-auto py-1">
          <span className="text-[11px] font-mono text-[#8E92A0] shrink-0">TEST.PRESET:</span>
          <button
            onClick={() => onSelectPassword('password123')}
            className="px-2 py-1 rounded bg-[#FF3B5C]/10 hover:bg-[#FF3B5C]/20 text-[#FF3B5C] border border-[#FF3B5C]/30 text-[11px] font-mono whitespace-nowrap"
          >
            Critical (password123)
          </button>
          <button
            onClick={() => onSelectPassword('Tr0ub4dor&3')}
            className="px-2 py-1 rounded bg-[#FFB800]/10 hover:bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30 text-[11px] font-mono whitespace-nowrap"
          >
            Moderate (Tr0ub4dor&3)
          </button>
          <button
            onClick={() => onSelectPassword('LockLogic-Obsidian-942!')}
            className="px-2 py-1 rounded bg-[#C6FF3D]/10 hover:bg-[#C6FF3D]/20 text-[#C6FF3D] border border-[#C6FF3D]/30 text-[11px] font-mono whitespace-nowrap"
          >
            Fortress (Diceware)
          </button>
        </div>
      </div>

      {/* 3 Concurrent Cracking Vectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Vector 1: Permutation Brute Force */}
        <div className="p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#00E5FF]" />
                <h4 className="text-sm font-semibold text-[#F4F5F7]">Brute Force Simulation</h4>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  bruteStatus === 'cracked'
                    ? 'bg-[#FF3B5C]/20 text-[#FF3B5C] border border-[#FF3B5C]/30'
                    : 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30'
                }`}
              >
                {bruteStatus === 'cracked' ? 'KEYSPACE EXHAUSTED (SIMULATED)' : isRunning ? 'SIMULATING...' : 'IDLE'}
              </span>
            </div>

            <p className="text-xs text-[#8E92A0]">
              Simulating sequential permutation traversal across keyspace (R^L = {analysis.charPoolSize}^{pwdLength} symbols).
            </p>

            <div className="p-3 rounded-xl bg-[#0A0B0F] border border-white/5 font-mono text-xs">
              <div className="text-[10px] text-[#8E92A0] uppercase tracking-wider mb-1">Simulated Candidate Trial:</div>
              <div className="text-[#00E5FF] truncate tracking-wider font-semibold">{bruteSample}</div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-[#8E92A0]">
                <span>Calculated Guesses:</span>
                <span className="text-[#F4F5F7] font-semibold tabular-nums">{bruteGuesses.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0A0B0F] overflow-hidden">
                <div
                  className="h-full bg-[#00E5FF] transition-all duration-150"
                  style={{
                    width: `${Math.min(100, (bruteGuesses / Math.max(1, estimatedBruteNeeded)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#8E92A0]">
            <span>Simulation State:</span>
            <span className={bruteStatus === 'cracked' ? 'text-[#FF3B5C] font-mono font-medium' : 'text-[#C6FF3D] font-mono font-medium'}>
              {bruteStatus === 'cracked' ? 'Theoretical Keyspace Exhausted' : 'Defending (Simulated)'}
            </span>
          </div>
        </div>

        {/* Vector 2: Dictionary & Leetspeak Mutation */}
        <div className="p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#FFB800]" />
                <h4 className="text-sm font-semibold text-[#F4F5F7]">Dictionary & Rule Mutation</h4>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  dictStatus === 'cracked'
                    ? 'bg-[#FF3B5C]/20 text-[#FF3B5C] border border-[#FF3B5C]/30'
                    : dictStatus === 'exhausted'
                    ? 'bg-[#C6FF3D]/20 text-[#C6FF3D] border border-[#C6FF3D]/30'
                    : 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30'
                }`}
              >
                {dictStatus === 'cracked' ? 'RULE MATCHED (SIMULATED)' : dictStatus === 'exhausted' ? 'CORPUS EXHAUSTED (SIMULATED)' : isRunning ? 'MUTATING RULES...' : 'IDLE'}
              </span>
            </div>

            <p className="text-xs text-[#8E92A0]">
              Simulating matching across 20M breach corpus with 1,400+ mutation rules (l33tspeak, dates, capitalization).
            </p>

            <div className="p-3 rounded-xl bg-[#0A0B0F] border border-white/5 font-mono text-xs">
              <div className="text-[10px] text-[#8E92A0] uppercase tracking-wider mb-1">Simulated Rule Trial:</div>
              <div className="text-[#FFB800] truncate tracking-wider font-semibold">{dictSample}</div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-[#8E92A0]">
                <span>Simulated Tests:</span>
                <span className="text-[#F4F5F7] font-semibold tabular-nums">{dictGuesses.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0A0B0F] overflow-hidden">
                <div
                  className="h-full bg-[#FFB800] transition-all duration-150"
                  style={{
                    width: `${Math.min(100, (dictGuesses / Math.max(1, estimatedDictNeeded)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#8E92A0]">
            <span>Simulation State:</span>
            <span
              className={
                dictStatus === 'cracked'
                  ? 'text-[#FF3B5C] font-mono font-medium'
                  : dictStatus === 'exhausted'
                  ? 'text-[#C6FF3D] font-mono font-medium'
                  : 'text-[#FFB800] font-mono'
              }
            >
              {dictStatus === 'cracked' ? 'Dictionary Rule Vulnerable' : dictStatus === 'exhausted' ? 'Corpus Resilient (Simulated)' : 'Testing Rules'}
            </span>
          </div>
        </div>

        {/* Vector 3: Pattern-Heuristic Search */}
        <div className="p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#C6FF3D]" />
                <h4 className="text-sm font-semibold text-[#F4F5F7]">Pattern-Heuristic Search</h4>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  mlStatus === 'cracked'
                    ? 'bg-[#FF3B5C]/20 text-[#FF3B5C] border border-[#FF3B5C]/30'
                    : mlStatus === 'exhausted'
                    ? 'bg-[#C6FF3D]/20 text-[#C6FF3D] border border-[#C6FF3D]/30'
                    : 'bg-[#C6FF3D]/20 text-[#C6FF3D] border border-[#C6FF3D]/30'
                }`}
              >
                {mlStatus === 'cracked' ? 'PATTERN IDENTIFIED (SIMULATED)' : mlStatus === 'exhausted' ? 'PATTERN RESILIENT (SIMULATED)' : isRunning ? 'SEARCHING PATTERNS...' : 'IDLE'}
              </span>
            </div>

            <p className="text-xs text-[#8E92A0]">
              Simulating heuristic pattern traversal prioritizing high-frequency leak n-grams, repeats, and keyboard walks (trained ML model: planned).
            </p>

            <div className="p-3 rounded-xl bg-[#0A0B0F] border border-white/5 font-mono text-xs">
              <div className="text-[10px] text-[#8E92A0] uppercase tracking-wider mb-1">Simulated Candidate Pattern:</div>
              <div className="text-[#C6FF3D] truncate tracking-wider font-semibold">{mlSample}</div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-[#8E92A0]">
                <span>Evaluated Patterns:</span>
                <span className="text-[#F4F5F7] font-semibold tabular-nums">{mlGuesses.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0A0B0F] overflow-hidden">
                <div
                  className="h-full bg-[#C6FF3D] transition-all duration-150"
                  style={{
                    width: `${Math.min(100, (mlGuesses / Math.max(1, estimatedMlNeeded)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#8E92A0]">
            <span>Simulation State:</span>
            <span
              className={
                mlStatus === 'cracked'
                  ? 'text-[#FF3B5C] font-mono font-medium'
                  : mlStatus === 'exhausted'
                  ? 'text-[#C6FF3D] font-mono font-medium'
                  : 'text-[#C6FF3D] font-mono'
              }
            >
              {mlStatus === 'cracked' ? 'High Predictability' : mlStatus === 'exhausted' ? 'Pattern Resilient' : 'Searching Patterns'}
            </span>
          </div>
        </div>
      </div>

      {/* Global Defense Assessment Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
          analysis.score >= 80
            ? 'bg-[#C6FF3D]/10 border-[#C6FF3D]/30 text-[#F4F5F7]'
            : analysis.score >= 60
            ? 'bg-[#7C5CFF]/10 border-[#7C5CFF]/30 text-[#F4F5F7]'
            : analysis.score >= 40
            ? 'bg-[#FFB800]/10 border-[#FFB800]/30 text-[#F4F5F7]'
            : 'bg-[#FF3B5C]/15 border-[#FF3B5C]/40 text-[#F4F5F7]'
        }`}
      >
        <div className="flex items-center gap-3">
          {analysis.score >= 60 ? (
            <ShieldCheck className="w-5 h-5 shrink-0 text-[#C6FF3D]" />
          ) : (
            <ShieldAlert className="w-5 h-5 shrink-0 text-[#FF3B5C]" />
          )}
          <div className="text-xs">
            <span className="font-semibold block sm:inline mr-2 font-mono">
              {analysis.score >= 80
                ? 'FORTRESS STATUS // SIMULATED ADVERSARY COMPUTE EXHAUSTED.'
                : analysis.score >= 60
                ? 'STRONG DEFENSE // RESISTANT TO CONSUMER & GPU RIG SIMULATIONS.'
                : analysis.score >= 40
                ? 'MODERATE RESISTANCE // SUSCEPTIBLE TO DICTIONARY RULE CLUSTERS.'
                : 'CRITICAL VULNERABILITY // INSTANT COMPROMISE ACROSS SIMULATED VECTORS.'}
            </span>
            <span className="text-[#8E92A0]">
              Offline crack estimate on 8x RTX 4090: <span className="font-mono text-[#F4F5F7] font-bold">{analysis.crackTimes.offlineFastHash}</span> (Theoretical model estimate based on assumed 100B hashes/sec, not a guarantee).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
