import type { CoachAdvice, CoachInput } from '../schemas/coach';

const HEADLINES: Record<CoachInput['scoreLevel'], string> = {
  Critical: 'Critical: this would fall almost instantly',
  Vulnerable: 'Vulnerable to common cracking tools',
  Moderate: 'A decent start, but not yet resilient',
  Strong: 'Strong, and a few tweaks from fortress',
  Fortress: 'Fortress-grade password',
};

const NEXT_TIP: Record<CoachInput['scoreLevel'], string> = {
  Critical: 'Switch to a random 4-word passphrase of 16+ characters.',
  Vulnerable: 'Double the length and drop predictable words or patterns.',
  Moderate: 'Add 4+ random characters or one more unrelated word.',
  Strong: 'Remove any predictable pattern and push past 16 characters.',
  Fortress: 'Keep it unique per account and store it in a password manager.',
};

/** Deterministic, rule-based advice. Used when Gemini is unavailable or returns junk. */
export function fallbackAdvice(i: CoachInput): CoachAdvice {
  const a: string[] = [];
  const has = (c: CoachInput['patternCategories'][number]) => i.patternCategories.includes(c);

  if (i.breached) a.push('This password appears in known breaches. Retire it everywhere today.');
  if (i.length < 14) a.push('Aim for 14+ characters. Length beats complexity.');
  if (has('keyboard_walk') || has('sequence')) a.push('Avoid keyboard runs and sequences like qwe or 123.');
  if (has('year_or_date')) a.push('Drop years and dates. They are the first thing attackers try.');
  if (has('dictionary_word') || has('common_phrase')) a.push('Replace familiar words with random, unrelated ones.');
  if (has('leetspeak')) a.push('Swapping letters for symbols (a to @) no longer fools crackers.');
  if (has('repeated_chars')) a.push('Remove repeated characters like aaa or 111.');
  if (!i.hasSymbol && !i.hasNumber) a.push('Mix in digits or symbols, or use a longer passphrase.');

  a.push('Use a password manager so every account gets a unique password.');
  a.push('Turn on multi-factor authentication wherever it is offered.');
  // The response schema requires 3-5 actions; guarantee the floor for already-healthy passwords.
  if (a.length < 3) a.push('Prefer a random passphrase of 4+ unrelated words: long and memorable.');

  const breachNote =
    i.breached === true ? ' It also shows up in known breach data.' : i.breached === false ? ' No breach exposure was found.' : '';

  return {
    headline: HEADLINES[i.scoreLevel],
    summary: `Score ${i.score}/100 with roughly ${i.entropyBits} bits of estimated entropy.${breachNote}`,
    actions: a.slice(0, 5),
    nextLevelTip: NEXT_TIP[i.scoreLevel],
  };
}
