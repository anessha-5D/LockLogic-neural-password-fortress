import { z } from 'zod';

export const SCORE_LEVELS = ['Critical', 'Vulnerable', 'Moderate', 'Strong', 'Fortress'] as const;
export const PATTERN_CATEGORIES = [
  'dictionary_word',
  'keyboard_walk',
  'repeated_chars',
  'sequence',
  'year_or_date',
  'leetspeak',
  'common_phrase',
] as const;
export const BREACH_BUCKETS = ['none', 'low', 'medium', 'high', 'massive'] as const;

/**
 * PRIVACY: this schema is the contract that keeps the password off the server.
 * Only numbers, booleans and fixed enums. NO free-text strings. .strict() rejects unknown keys.
 */
export const coachRequestSchema = z
  .object({
    score: z.number().int().min(0).max(100),
    scoreLevel: z.enum(SCORE_LEVELS),
    entropyBits: z.number().int().min(0).max(400),
    predictabilityScore: z.number().int().min(0).max(100),
    zxcvbnScore: z.number().int().min(0).max(4),
    length: z.number().int().min(0).max(256),
    hasLower: z.boolean(),
    hasUpper: z.boolean(),
    hasNumber: z.boolean(),
    hasSymbol: z.boolean(),
    patternCategories: z.array(z.enum(PATTERN_CATEGORIES)).max(7),
    breached: z.boolean().nullable(),
    breachBucket: z.enum(BREACH_BUCKETS).nullable(),
  })
  .strict();

export type CoachInput = z.infer<typeof coachRequestSchema>;

export const coachAdviceSchema = z.object({
  headline: z.string().min(1).max(80),
  summary: z.string().min(1).max(300),
  actions: z.array(z.string().min(1).max(140)).min(3).max(5),
  nextLevelTip: z.string().min(1).max(140),
});

export type CoachAdvice = z.infer<typeof coachAdviceSchema>;

/** Used by the privacy regression test. */
export const FORBIDDEN_FIELD_PATTERN = /pass(word|phrase|code)?|pwd|secret/i;
