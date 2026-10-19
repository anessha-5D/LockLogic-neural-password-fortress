// Builds the privacy-safe payload for POST /api/coach.
// PRIVACY: only numbers, booleans and fixed enums are sent. Raw analyzer `patterns` strings
// (which contain password fragments such as 'Year detected: "1990"') are mapped to generic
// categories and then discarded. characterRisks / per-character data is never sent.

import type { AnalysisResult } from './analyzer';
import type { BreachResult } from './breachCheck';

export type PatternCategory =
  | 'dictionary_word'
  | 'keyboard_walk'
  | 'repeated_chars'
  | 'sequence'
  | 'year_or_date'
  | 'leetspeak'
  | 'common_phrase';

export type BreachBucket = 'none' | 'low' | 'medium' | 'high' | 'massive';

export interface CoachPayload {
  score: number;
  scoreLevel: AnalysisResult['scoreLevel'];
  entropyBits: number;
  predictabilityScore: number;
  zxcvbnScore: number;
  length: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  patternCategories: PatternCategory[];
  breached: boolean | null;
  breachBucket: BreachBucket | null;
}

export interface CoachAdvice {
  headline: string;
  summary: string;
  actions: string[];
  nextLevelTip: string;
  source: 'gemini' | 'fallback';
}

const KEYBOARD = new Set(['qwe', 'wer', 'ert', 'rty', 'tyu', 'yui', 'uio', 'iop', 'asd', 'sdf', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl', 'zxc', 'xcv', 'cvb', 'vbn', 'bnm']);
const SEQUENCE = new Set(['123', '234', '345', '456', '567', '678', '789', '890', 'abc', 'bcd', 'cde', 'def', 'efg']);

export function categorizePatterns(patterns: string[], zxWarning?: string): PatternCategory[] {
  const out = new Set<PatternCategory>();
  for (const raw of patterns) {
    const p = raw.toLowerCase().trim();
    if (p.startsWith('year detected')) out.add('year_or_date');
    else if (p.startsWith('repeat')) out.add('repeated_chars');
    else if (p.includes(' for ') || p.includes('leetspeak')) out.add('leetspeak');
    else if (KEYBOARD.has(p)) out.add('keyboard_walk');
    else if (SEQUENCE.has(p)) out.add('sequence');
    else if (/^[a-z]{4,}$/.test(p)) out.add('common_phrase');
    else out.add('dictionary_word');
  }
  if (zxWarning && /dictionary|common|name|word/i.test(zxWarning)) out.add('dictionary_word');
  return [...out].slice(0, 7);
}

export function breachBucketFor(count: number): BreachBucket {
  if (count <= 0) return 'none';
  if (count < 100) return 'low';
  if (count < 10_000) return 'medium';
  if (count < 1_000_000) return 'high';
  return 'massive';
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)));

export function buildCoachPayload(a: AnalysisResult, breach: BreachResult | null): CoachPayload {
  const known = Boolean(breach?.checked);
  return {
    score: clamp(a.score, 0, 100),
    scoreLevel: a.scoreLevel,
    entropyBits: clamp(a.entropyBits, 0, 400),
    predictabilityScore: clamp(a.predictabilityScore, 0, 100),
    zxcvbnScore: clamp(a.zxcvbnScore, 0, 4),
    length: clamp(a.length, 0, 256),
    hasLower: a.hasLower,
    hasUpper: a.hasUpper,
    hasNumber: a.hasNumber,
    hasSymbol: a.hasSymbol,
    patternCategories: categorizePatterns(a.patterns, a.feedback.warning),
    breached: known ? breach!.breached : null,
    breachBucket: known ? breachBucketFor(breach!.count) : null,
  };
}

export async function requestCoachAdvice(payload: CoachPayload, signal?: AbortSignal): Promise<CoachAdvice> {
  const res = await fetch('/api/coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw new Error(`Coach request failed (${res.status})`);
  return res.json();
}
