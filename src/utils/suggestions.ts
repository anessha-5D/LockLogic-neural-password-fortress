// Client-side Diceware & Cryptographic Password / Passphrase Suggester
import { EFF_WORDLIST } from '../data/effWordlist';

export const CONNECTORS = ['-', '#', '_', '.', '+', '!'];
export const HYBRID_SYMBOLS = ['$', '#', '&', '%', '!'];
export const CRYPTO_CHAR_POOL = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*?+-=';

export interface PasswordSuggestion {
  id: string;
  type: 'passphrase' | 'alphanumeric' | 'hybrid';
  title: string;
  password: string;
  entropy: number;
  description: string;
}

/**
 * Generates an unbiased cryptographically secure random integer in [0, max - 1].
 * Uses rejection sampling on Web Crypto getRandomValues to eliminate modulo bias.
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 1) return 0;
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
    throw new Error('Cryptographically secure random number generator is unavailable.');
  }

  // To eliminate modulo bias:
  // Find the largest multiple of max that fits into 32 bits (0x100000000 = 2^32)
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);

  while (true) {
    cryptoObj.getRandomValues(buffer);
    if (buffer[0] < limit) {
      return buffer[0] % max;
    }
  }
}

/**
 * Unbiased Fisher-Yates shuffle using cryptographically secure random integers.
 */
export function secureShuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

export function generateAlternativeSuggestions(): PasswordSuggestion[] {
  const formatWord = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

  // 1. High-Entropy Diceware Passphrase (4 words from EFF large wordlist + 3-digit number + delimiter)
  const w1 = formatWord(EFF_WORDLIST[getSecureRandomInt(EFF_WORDLIST.length)]);
  const w2 = formatWord(EFF_WORDLIST[getSecureRandomInt(EFF_WORDLIST.length)]);
  const w3 = formatWord(EFF_WORDLIST[getSecureRandomInt(EFF_WORDLIST.length)]);
  const w4 = formatWord(EFF_WORDLIST[getSecureRandomInt(EFF_WORDLIST.length)]);
  const num1 = getSecureRandomInt(900) + 100; // 3 digits (100 to 999: 900 possibilities)
  const conn = CONNECTORS[getSecureRandomInt(CONNECTORS.length)];
  const passphrase = `${w1}${conn}${w2}${conn}${w3}${conn}${w4}${conn}${num1}`;

  // Entropy: 4 words * log2(7776) + log2(connectors) + log2(900)
  const dicewareEntropy = Math.round(
    4 * Math.log2(EFF_WORDLIST.length) + Math.log2(CONNECTORS.length) + Math.log2(900)
  );

  // 2. Cryptographic Alphanumeric Fortress (18 chars, mixed cases, symbols, numbers)
  const alphaChars: string[] = [];
  for (let i = 0; i < 18; i++) {
    alphaChars.push(CRYPTO_CHAR_POOL[getSecureRandomInt(CRYPTO_CHAR_POOL.length)]);
  }
  const alphaFortress = alphaChars.join('');

  // Entropy: 18 chars * log2(poolSize)
  const cryptoEntropy = Math.round(18 * Math.log2(CRYPTO_CHAR_POOL.length));

  // 3. Memorable Hybrid Acrostic Passphrase
  const wA = formatWord(EFF_WORDLIST[getSecureRandomInt(EFF_WORDLIST.length)]);
  const wB = formatWord(EFF_WORDLIST[getSecureRandomInt(EFF_WORDLIST.length)]);
  const sym = HYBRID_SYMBOLS[getSecureRandomInt(HYBRID_SYMBOLS.length)];
  const hybrid = `${wA}${sym}${wB}${getSecureRandomInt(90) + 10}!`;

  // Entropy: 2 words * log2(7776) + log2(symbols) + log2(90)
  const hybridEntropy = Math.round(
    2 * Math.log2(EFF_WORDLIST.length) + Math.log2(HYBRID_SYMBOLS.length) + Math.log2(90)
  );

  return [
    {
      id: 'diceware',
      type: 'passphrase',
      title: 'Diceware Passphrase',
      password: passphrase,
      entropy: dicewareEntropy,
      description: 'Human-memorable, immune to standard GPU dictionary attacks with 4 semantic anchors from EFF wordlist.',
    },
    {
      id: 'crypto',
      type: 'alphanumeric',
      title: 'Cryptographic Fortress',
      password: alphaFortress,
      entropy: cryptoEntropy,
      description: 'Maximum entropy pseudo-random 18-character cipher string. Ideal for master keys & password managers.',
    },
    {
      id: 'hybrid',
      type: 'hybrid',
      title: 'Structured Hybrid Shield',
      password: hybrid,
      entropy: hybridEntropy,
      description: 'Balanced elegance: easy to type on mobile keyboards with high entropy transitions.',
    },
  ];
}

export function generateCustomPassword(options: {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  excludeAmbiguous: boolean;
}): string {
  const targetLength = Math.max(1, Math.round(options.length || 16));

  const upperSet = options.excludeAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerSet = options.excludeAmbiguous ? 'abcdefghijkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  const numberSet = options.excludeAmbiguous ? '23456789' : '0123456789';
  const symbolSet = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const requiredSets: string[] = [];
  if (options.useUpper) requiredSets.push(upperSet);
  if (options.useLower) requiredSets.push(lowerSet);
  if (options.useNumbers) requiredSets.push(numberSet);
  if (options.useSymbols) requiredSets.push(symbolSet);

  // If no categories selected, default to lowercase + uppercase + numbers
  if (requiredSets.length === 0) {
    requiredSets.push(lowerSet, upperSet, numberSet);
  }

  const combinedPool = requiredSets.join('');
  const chars: string[] = [];

  // Guarantee at least one character from each selected requirement
  // (as long as length permits)
  const guaranteedCount = Math.min(targetLength, requiredSets.length);
  for (let i = 0; i < guaranteedCount; i++) {
    const set = requiredSets[i];
    chars.push(set[getSecureRandomInt(set.length)]);
  }

  // Fill remaining length from combined pool
  for (let i = chars.length; i < targetLength; i++) {
    chars.push(combinedPool[getSecureRandomInt(combinedPool.length)]);
  }

  // Unbiased shuffle so guaranteed characters are uniformly distributed
  secureShuffle(chars);

  return chars.join('');
}
