import { PredictabilityModel, PredictabilityResult } from './predictabilityModel';
import { calculateCharPool } from '../utils/analyzer';

// Common bigrams and trigrams found in password leaks (e.g. RockYou, LinkedIn leaks)
const COMMON_SEQS = new Set([
  '123', '234', '345', '456', '567', '678', '789', '890',
  'qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop',
  'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl',
  'zxc', 'xcv', 'cvb', 'vbn', 'bnm',
  'abc', 'bcd', 'cde', 'def', 'efg', 'fgh',
  'pass', 'word', 'admin', 'login', 'love', 'ilove', 'baby',
  'master', 'dragon', 'football', 'shadow', 'super', 'monkey',
  'letme', 'trust', 'secret', 'welcome', 'god', 'sun', 'star'
]);

const LEET_PATTERNS = [
  { pattern: /[@4]dmin/i, label: '@ for a in admin' },
  { pattern: /p[@4]ss/i, label: '@ or 4 for a in pass' },
  { pattern: /w[0o]rd/i, label: '0 for o in word' },
  { pattern: /s[3e]cr[3e]t/i, label: '3 for e in secret' },
  { pattern: /l[0o]v[3e]/i, label: 'leetspeak in love' },
];

/**
 * Baseline heuristic implementation of PredictabilityModel.
 * Analyzes empirical n-gram sequences, keyboard walks, repeated characters,
 * calendar dates, and leetspeak substitution patterns.
 */
export class HeuristicPredictabilityModel implements PredictabilityModel {
  public readonly name = 'baseline-heuristic';
  public readonly version = '1.0.0';

  public score(password: string): PredictabilityResult {
    if (!password || password.length === 0) {
      return { predictability: 100, patterns: [] };
    }

    const lower = password.toLowerCase();
    const detected: string[] = [];
    let penalty = 0;

    // 1. Check for common trigram / word patterns
    for (let i = 0; i <= lower.length - 3; i++) {
      const sub3 = lower.slice(i, i + 3);
      const sub4 = lower.slice(i, i + 4);

      if (COMMON_SEQS.has(sub3) && !detected.includes(sub3)) {
        detected.push(sub3);
        penalty += 15;
      }
      if (COMMON_SEQS.has(sub4) && !detected.includes(sub4)) {
        detected.push(sub4);
        penalty += 25;
      }
    }

    // 2. Check for consecutive repeated characters (e.g. 'aaa', '111')
    const repeatRegex = /(.)\1{2,}/g;
    let match;
    while ((match = repeatRegex.exec(lower)) !== null) {
      detected.push(`Repeat: "${match[0]}"`);
      penalty += 18;
    }

    // 3. Check for dates / years (e.g. 1970-2030)
    const yearRegex = /(19\d{2}|20[0-2]\d)/g;
    while ((match = yearRegex.exec(password)) !== null) {
      detected.push(`Year detected: "${match[0]}"`);
      penalty += 20;
    }

    // 4. Check for obvious Leetspeak substitutions
    for (const { pattern, label } of LEET_PATTERNS) {
      if (pattern.test(password)) {
        detected.push(label);
        penalty += 15;
      }
    }

    // Base predictability from length and diversity
    const { pool } = calculateCharPool(password);
    const rawEntropyPerChar = pool > 1 ? Math.log2(pool) : 0;
    const idealEntropy = password.length * rawEntropyPerChar;

    // Predictability normalized 0 to 100
    // Higher penalty = higher predictability
    const rawPredict = Math.min(100, Math.max(5, penalty + Math.max(0, 45 - idealEntropy * 0.7)));
    return { predictability: Math.round(rawPredict), patterns: detected };
  }
}

/** Default shared singleton instance of the baseline heuristic model */
export const defaultPredictabilityModel: PredictabilityModel = new HeuristicPredictabilityModel();
