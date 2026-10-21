import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import { dictionary, translations } from '@zxcvbn-ts/language-en';
import { ATTACK_RATES } from './attackRates';
import { defaultPredictabilityModel } from '../ml/heuristicModel';
import { loadMarkovModel, type MarkovModel } from '../ml/markovModel';

// Initialize ZxcvbnFactory with English language dictionaries
let zxcvbnEngine: ZxcvbnFactory;
try {
  zxcvbnEngine = new ZxcvbnFactory({
    translations,
    dictionary: {
      ...dictionary,
    },
  });
} catch (e) {
  console.warn('ZxcvbnFactory initialization fallback', e);
  zxcvbnEngine = new ZxcvbnFactory();
}

// ---- Trained predictability model (loaded lazily in the browser) ----
export type ModelSource = 'trained' | 'heuristic';

let trainedModel: MarkovModel | null = null;
let modelSource: ModelSource = 'heuristic';
const modelListeners = new Set<() => void>();

export function getModelSource(): ModelSource {
  return modelSource;
}

export function subscribeModel(cb: () => void): () => void {
  modelListeners.add(cb);
  return () => {
    modelListeners.delete(cb);
  };
}

if (typeof window !== 'undefined' && typeof fetch === 'function') {
  loadMarkovModel().then((m) => {
    if (m) {
      trainedModel = m;
      modelSource = 'trained';
      modelListeners.forEach((cb) => cb());
    }
  });
}

export interface CharacterRisk {
  char: string;
  index: number;
  risk: 'critical' | 'warning' | 'safe';
  reason?: string;
}

export interface AnalysisResult {
  score: number; // 0 - 100
  scoreLevel: 'Critical' | 'Vulnerable' | 'Moderate' | 'Strong' | 'Fortress';
  levelColor: string;
  entropyBits: number; // Max keyspace entropy (if fully random): L * log2(pool)
  theoreticalEntropy?: number;
  keyspaceEntropy?: number;
  effectiveEntropy?: number;
  predictabilityScore: number; // 0 - 100 (lower means less predictable / better)
  zxcvbnScore: number; // 0 - 4
  crackTimes: {
    onlineThrottled: string;
    offlineFastHash: string;
    nationState: string;
  };
  patterns: string[];
  feedback: {
    warning?: string;
    suggestions: string[];
  };
  characterRisks: CharacterRisk[];
  charPoolSize: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  length: number;
}

// Empirical N-gram and Markov frequency model for password predictability
// Common bigrams and trigrams found in leaks (e.g. RockYou, LinkedIn leaks)
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

/**
 * Calculates character pool size based on character classes present.
 * - Lowercase: 26
 * - Uppercase: 26
 * - Digits: 10
 * - Printable ASCII symbols & space: 33
 * - Unicode / non-ASCII characters: expanded dynamically based on distinct code points
 */
export function calculateCharPool(str: string): { pool: number; hasL: boolean; hasU: boolean; hasN: boolean; hasS: boolean } {
  if (!str || str.length === 0) {
    return { pool: 0, hasL: false, hasU: false, hasN: false, hasS: false };
  }

  let pool = 0;
  const hasL = /[a-z]/.test(str);
  const hasU = /[A-Z]/.test(str);
  const hasN = /[0-9]/.test(str);
  const hasS = /[^a-zA-Z0-9]/.test(str);

  if (hasL) pool += 26;
  if (hasU) pool += 26;
  if (hasN) pool += 10;
  if (hasS) {
    // 32 standard printable ASCII punctuation marks + 1 for space
    const hasSpace = /\s/.test(str);
    const hasAsciiSymbol = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(str);
    if (hasAsciiSymbol) pool += 32;
    if (hasSpace) pool += 1;
    // Account for non-ASCII Unicode characters
    const nonAsciiChars = str.match(/[^\x00-\x7F]/g);
    if (nonAsciiChars && nonAsciiChars.length > 0) {
      pool += Math.max(64, new Set(nonAsciiChars).size * 8);
    }
    // Fallback if symbol was matched by [^a-zA-Z0-9] but not caught above
    if (!hasAsciiSymbol && !hasSpace && (!nonAsciiChars || nonAsciiChars.length === 0)) {
      pool += 33;
    }
  }

  return { pool: Math.max(pool, 1), hasL, hasU, hasN, hasS };
}

// Heuristic predictability evaluation via defaultPredictabilityModel
export function evaluatePredictability(pwd: string): { predictability: number; detectedSequences: string[] } {
  const result = defaultPredictabilityModel.score(pwd);
  return { predictability: result.predictability, detectedSequences: result.patterns };
}

/**
 * Converts duration in seconds into human-readable time with accurate unit conversions,
 * singular/plural agreement, and safe handling of non-finite or edge-case values.
 */
export function formatCrackDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return 'Instant (< 1ms)';
  if (seconds === Infinity || seconds >= 31536000 * 1e12) return 'Centuries (Universe lifetime+)';
  if (seconds < 0.001) return 'Instant (< 1ms)';
  if (seconds < 1) return '< 1 second';

  if (seconds < 60) {
    const s = Math.round(seconds);
    return s === 1 ? '1 second' : `${s} seconds`;
  }
  if (seconds < 3600) {
    const m = Math.round(seconds / 60);
    return m === 1 ? '1 minute' : `${m} minutes`;
  }
  if (seconds < 86400) {
    const h = Math.round(seconds / 3600);
    return h === 1 ? '1 hour' : `${h} hours`;
  }
  if (seconds < 2592000) {
    const d = Math.round(seconds / 86400);
    return d === 1 ? '1 day' : `${d} days`;
  }
  if (seconds < 31536000) {
    const mo = Math.round(seconds / 2592000);
    if (mo >= 12) return '1 year';
    return mo === 1 ? '1 month' : `${mo} months`;
  }

  const years = seconds / 31536000;
  if (years < 1000) {
    const y = Math.round(years);
    return y === 1 ? '1 year' : `${y} years`;
  }
  if (years < 1_000_000) {
    return `${Math.round(years / 1000)}k years`;
  }
  if (years < 1_000_000_000) {
    return `${Math.round(years / 1_000_000)}M years`;
  }
  if (years < 1e12) {
    return `${(years / 1e9).toFixed(1)}B years`;
  }
  return 'Centuries (Universe lifetime+)';
}

export function analyzePassword(password: string): AnalysisResult {
  if (!password || password.length === 0) {
    return {
      score: 0,
      scoreLevel: 'Critical',
      levelColor: '#FF3B5C',
      entropyBits: 0,
      theoreticalEntropy: 0,
      keyspaceEntropy: 0,
      effectiveEntropy: 0,
      predictabilityScore: 100,
      zxcvbnScore: 0,
      crackTimes: {
        onlineThrottled: 'Instant (< 1ms)',
        offlineFastHash: 'Instant (< 1ms)',
        nationState: 'Instant (< 1ms)',
      },
      patterns: [],
      feedback: {
        warning: 'Enter a password to evaluate its cryptographic resilience.',
        suggestions: ['Use at least 12 characters', 'Combine uppercase, lowercase, numbers, and special symbols'],
      },
      characterRisks: [],
      charPoolSize: 0,
      hasLower: false,
      hasUpper: false,
      hasNumber: false,
      hasSymbol: false,
      length: 0,
    };
  }

  // Run zxcvbn evaluation
  let zxResult;
  try {
    zxResult = zxcvbnEngine.check(password);
  } catch (err) {
    console.error('zxcvbn error', err);
    zxResult = {
      score: 1,
      guesses: Math.pow(10, Math.min(password.length * 1.5, 12)),
      feedback: { warning: '', suggestions: [] },
      sequence: [],
    };
  }

  const { pool, hasL, hasU, hasN, hasS } = calculateCharPool(password);

  // Predictability: trained model when loaded, otherwise the heuristic.
  // The heuristic still supplies the readable list of detected patterns.
  const heuristic = defaultPredictabilityModel.score(password);
  const predictability = trainedModel ? trainedModel.predictability(password) : heuristic.predictability;
  const detectedSequences = heuristic.patterns;

  // Max keyspace entropy (if fully random): H = L * log2(pool)
  const keyspaceEntropy = pool > 1 ? password.length * Math.log2(pool) : 0;

  // Derive effective entropy and ALL crack times from the same source: zxcvbn guesses (effective bits = log2(guesses)).
  // For strong random passwords, zxcvbn-ts caps bruteforce tokens at BRUTEFORCE_CARDINALITY = 10 (10^L),
  // which produces unrealistically low crack times (e.g. 16 years for 20 chars instead of universe lifetime).
  // When a password is a strong pseudo-random string with diverse character classes and no dictionary tokens,
  // we use the full keyspace search space. Otherwise, we use the lower of keyspace bits and zxcvbn bits.
  const zxGuesses = typeof zxResult.guesses === 'number' && zxResult.guesses > 0 ? zxResult.guesses : 1;
  const zxBits = Math.log2(zxGuesses);

  const isPureBruteforce = zxResult.sequence.length > 0 && zxResult.sequence.every((s: { pattern: string }) => s.pattern === 'bruteforce');
  const classCount = (hasL ? 1 : 0) + (hasU ? 1 : 0) + (hasN ? 1 : 0) + (hasS ? 1 : 0);
  const isStrongRandomPassword = zxResult.score === 4 && password.length >= 14 && classCount >= 3 && isPureBruteforce;

  const effectiveEntropy = isStrongRandomPassword
    ? keyspaceEntropy
    : Math.min(keyspaceEntropy, zxBits);

  // Derive effective guesses for crack times (0.5 * guesses for average search space traversal)
  const effectiveGuesses = isStrongRandomPassword
    ? Math.pow(2, Math.min(1020, keyspaceEntropy))
    : Math.min(Math.pow(2, Math.min(1020, keyspaceEntropy)), zxGuesses);

  const averageGuesses = Math.max(1, 0.5 * effectiveGuesses);

  // Multi-tier crack time calculation based on single source of truth (ATTACK_RATES)
  const secondsOnline = averageGuesses / ATTACK_RATES.onlineThrottled;
  const secondsOffline = averageGuesses / ATTACK_RATES.offlineFastHash;
  const secondsNationState = averageGuesses / ATTACK_RATES.nationState;

  // 0-100 composite score formula
  // Blends effective entropy, zxcvbn score, and predictability
  const entropyPoints = Math.min(50, (effectiveEntropy / 90) * 50);
  const zxPoints = (zxResult.score / 4) * 40;
  const unpredictabilityPoints = Math.max(0, ((100 - predictability) / 100) * 10);

  let compositeScore = Math.round(entropyPoints + zxPoints + unpredictabilityPoints);

  // Hard caps for critical weaknesses
  if (password.length < 6) compositeScore = Math.min(compositeScore, 15);
  else if (password.length < 8) compositeScore = Math.min(compositeScore, 25);
  else if (password.length < 10 && (hasL && !hasU && !hasN && !hasS)) compositeScore = Math.min(compositeScore, 35);

  // Rule: A password that cracks in under 1 second offline must NEVER be Strong or Fortress (max 35 => Vulnerable / Critical)
  if (secondsOffline < 1) {
    compositeScore = Math.min(compositeScore, 35);
  }
  if (secondsOffline < 0.001) {
    compositeScore = Math.min(compositeScore, 19);
  }

  // Rule: Score must never increase when appending a repeated character to a weak password
  if (
    password.length > 1 &&
    password[password.length - 1] === password[password.length - 2] &&
    (zxResult.score <= 1 || secondsOffline < 1)
  ) {
    const prevScore = analyzePassword(password.slice(0, -1)).score;
    compositeScore = Math.min(compositeScore, prevScore);
  }

  if (compositeScore > 100) compositeScore = 100;
  if (compositeScore < 0) compositeScore = 0;

  // Determine Level
  let scoreLevel: AnalysisResult['scoreLevel'] = 'Critical';
  let levelColor = '#FF3B5C'; // Danger Red

  if (compositeScore >= 80) {
    scoreLevel = 'Fortress';
    levelColor = '#C6FF3D'; // Electric Lime Vault
  } else if (compositeScore >= 60) {
    scoreLevel = 'Strong';
    levelColor = '#7C5CFF'; // Neural Violet
  } else if (compositeScore >= 40) {
    scoreLevel = 'Moderate';
    levelColor = '#FFB800'; // Amber Warning
  } else if (compositeScore >= 20) {
    scoreLevel = 'Vulnerable';
    levelColor = '#FF6B4A'; // High-risk Orange
  } else {
    scoreLevel = 'Critical';
    levelColor = '#FF3B5C'; // Danger Red
  }

  // Build character risk heatmap
  const characterRisks: CharacterRisk[] = [];
  const lowerPwd = password.toLowerCase();

  for (let i = 0; i < password.length; i++) {
    const ch = password[i];
    let risk: CharacterRisk['risk'] = 'safe';
    let reason: string | undefined;

    // Check repeat
    if (i > 0 && ch === password[i - 1]) {
      risk = 'critical';
      reason = 'Immediate repetition';
    } else if (/[0-9]/.test(ch) && (i > 0 && Math.abs(ch.charCodeAt(0) - password[i - 1].charCodeAt(0)) === 1)) {
      risk = 'warning';
      reason = 'Sequential digit progression';
    } else if (i <= password.length - 3 && COMMON_SEQS.has(lowerPwd.slice(i, i + 3))) {
      risk = 'critical';
      reason = 'Keyboard walk / common trigram';
    } else if (/[a-z]/.test(ch) && password.length < 8) {
      risk = 'warning';
      reason = 'Short length decreases entropy';
    }

    characterRisks.push({ char: ch, index: i, risk, reason });
  }

  // Feedback compilation
  const feedbackList: string[] = [];
  if (zxResult.feedback?.suggestions && zxResult.feedback.suggestions.length > 0) {
    feedbackList.push(...zxResult.feedback.suggestions);
  }
  if (password.length < 12) {
    feedbackList.push('Increase length to 14+ characters for quantum resistance.');
  }
  if (!hasS) {
    feedbackList.push('Add non-alphanumeric symbols (e.g. #, $, %, @, !) to expand search space.');
  }
  if (!hasN) {
    feedbackList.push('Incorporate scattered numerals to prevent simple dictionary word matching.');
  }
  if (predictability > 50) {
    feedbackList.push('Avoid obvious phonetic syllables or familiar dictionary fragments.');
  }

  return {
    score: compositeScore,
    scoreLevel,
    levelColor,
    entropyBits: Math.min(400, Math.round(keyspaceEntropy)),
    theoreticalEntropy: Math.round(keyspaceEntropy * 10) / 10,
    keyspaceEntropy: Math.round(keyspaceEntropy * 10) / 10,
    effectiveEntropy: Math.round(effectiveEntropy * 10) / 10,
    predictabilityScore: predictability,
    zxcvbnScore: zxResult.score,
    crackTimes: {
      onlineThrottled: formatCrackDuration(secondsOnline),
      offlineFastHash: formatCrackDuration(secondsOffline),
      nationState: formatCrackDuration(secondsNationState),
    },
    patterns: detectedSequences,
    feedback: {
      warning: zxResult.feedback?.warning || (predictability > 60 ? 'Predictable character sequence detected' : undefined),
      suggestions: Array.from(new Set(feedbackList)).slice(0, 4),
    },
    characterRisks,
    charPoolSize: pool,
    hasLower: hasL,
    hasUpper: hasU,
    hasNumber: hasN,
    hasSymbol: hasS,
    length: password.length,
  };
}