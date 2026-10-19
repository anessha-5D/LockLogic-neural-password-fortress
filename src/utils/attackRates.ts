/**
 * Single source of truth for guessing rates across attack scenarios.
 * Rates are defined in guesses per second.
 */
export const ATTACK_RATES = {
  onlineThrottled: 10, // 10 guesses/sec (online form with rate limiting & lockouts)
  laptop: 1e7, // 10 Million guesses/sec (standard CPU)
  offlineFastHash: 1e11, // 100 Billion guesses/sec (8x NVIDIA RTX 4090 GPU cluster)
  nationState: 1e14, // 100 Trillion guesses/sec (distributed / nation-state exascale)
} as const;

export type AttackRateScenario = keyof typeof ATTACK_RATES;
