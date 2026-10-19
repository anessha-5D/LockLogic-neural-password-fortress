import React from 'react';
import { BookOpen, ShieldCheck, Binary, Cpu, KeyRound } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-xs font-mono text-[#7C5CFF]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>SPECIFICATION // ARCHITECTURAL BLUEPRINTS</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#F4F5F7]">
          The Science of Cryptographic Resilience
        </h2>
        <p className="text-sm text-[#8E92A0]">
          How LockLogic blends keyspace entropy calculations, spatial graph traversal, heuristic pattern analysis (trained ML model: planned), and k-anonymity protocols — without ever transmitting your credentials.
        </p>
      </div>

      {/* 4 Architectural Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: zxcvbn Entropy Engine */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <Binary className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#F4F5F7] font-heading">
            01. Lexical & Spatial Graph Traversal
          </h3>
          <p className="text-xs text-[#8E92A0] leading-relaxed">
            Conventional checkers count length and character classes. LockLogic employs <code>zxcvbn-ts</code> to model an attacker who has full knowledge of human psychology. It detects spatial keyboard walks (e.g. <code>qwerty</code>, <code>1qaz2wsx</code>), leetspeak substitutions (<code>@</code> for <code>a</code>, <code>3</code> for <code>e</code>), date sequences, and dictionary corpora.
          </p>
          <div className="p-3 rounded-xl bg-[#0A0B0F] border border-white/5 text-[11px] font-mono text-[#00E5FF]">
            Formula: Guess count G = Π(guesses_i) across minimal cost decomposition path.
          </div>
        </div>

        {/* Module 2: Markov Predictability */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center text-[#FFB800]">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#F4F5F7] font-heading">
            02. Character N-Gram & Pattern Estimator
          </h3>
          <p className="text-xs text-[#8E92A0] leading-relaxed">
            Even without full dictionary words, human-typed passwords exhibit predictable transition patterns (e.g. <code>th</code>, <code>ing</code>, <code>2024</code>, repeated letters). LockLogic currently runs a baseline heuristic pattern analyzer evaluating common leak n-grams and motifs (trained neural ML model: planned for a future release).
          </p>
          <div className="p-3 rounded-xl bg-[#0A0B0F] border border-white/5 text-[11px] font-mono text-[#FFB800]">
            Architecture: PredictabilityModel interface with baseline heuristic implementation.
          </div>
        </div>

        {/* Module 3: k-Anonymity */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/30 flex items-center justify-center text-[#7C5CFF]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#F4F5F7] font-heading">
            03. Privacy-First k-Anonymity Leak Audit
          </h3>
          <p className="text-xs text-[#8E92A0] leading-relaxed">
            To check whether a password has been compromised in historical data breaches, we compute its SHA-1 hash locally in the browser via Web Crypto. Only the first 5 hexadecimal characters are sent via our backend proxy to the HaveIBeenPwned Range API with response padding. Suffix matching occurs 100% in client memory.
          </p>
          <div className="p-3 rounded-xl bg-[#0A0B0F] border border-white/5 text-[11px] font-mono text-[#7C5CFF]">
            Privacy: Only 5-character hash prefix is sent to HaveIBeenPwned; full hash and password are never sent to any server.
          </div>
        </div>

        {/* Module 4: Passphrase Mathematics */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 flex items-center justify-center text-[#C6FF3D]">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#F4F5F7] font-heading">
            04. Diceware Passphrase Superiority
          </h3>
          <p className="text-xs text-[#8E92A0] leading-relaxed">
            A random passphrase composed of 4 unrelated words from the EFF large wordlist (7,776 words) plus numbers and delimiters yields substantial entropy. Even high-throughput GPU clusters testing 100 billion guesses per second would require vast search duration to exhaust the keyspace.
          </p>
          <div className="p-3 rounded-xl bg-[#0A0B0F] border border-white/5 text-[11px] font-mono text-[#C6FF3D]">
            Search Space: N = |Corpus|^words. Crack times are theoretical models based on assumed guessing rates.
          </div>
        </div>
      </div>

      {/* Privacy & Third-Party Network Disclosures */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-3">
        <h3 className="text-sm font-semibold text-[#F4F5F7] uppercase tracking-wider font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C6FF3D]" />
          Comprehensive Privacy & Data Egress Disclosures
        </h3>
        <ul className="text-xs text-[#8E92A0] space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-[#F4F5F7]">Password Processing:</strong> Password evaluation, keyspace calculations, and heuristic pattern detection run 100% client-side in your browser. Your password plaintext is never transmitted to any server.
          </li>
          <li>
            <strong className="text-[#F4F5F7]">HaveIBeenPwned Breach Check:</strong> When you manually trigger a breach check, the client computes the SHA-1 hash and sends only the first 5 characters (a 20-bit prefix) to the HaveIBeenPwned API via our proxy. The response contains a padded list of thousands of hashes matching that prefix; your browser matches the remaining suffix locally.
          </li>
          <li>
            <strong className="text-[#F4F5F7]">AI Vault Coach:</strong> If configured, the Gemini Vault Coach receives strictly sanitized numeric metadata (password length, score, entropy, crack time, character class counts). Your actual password or hash is never sent to the AI service.
          </li>
          <li>
            <strong className="text-[#F4F5F7]">Google Fonts:</strong> Web typography (Inter, JetBrains Mono, Sora, Space Grotesk) is requested directly from Google's CDN servers when the web page loads.
          </li>
        </ul>
      </div>
    </div>
  );
};
