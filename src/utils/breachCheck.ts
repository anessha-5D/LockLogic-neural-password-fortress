// k-Anonymity breach check, now routed through the LockLogic backend proxy.
// The password and the full SHA-1 hash NEVER leave the browser: only the 5-char prefix is sent
// (to OUR server, which forwards it to HaveIBeenPwned without any client IP/headers).
// Suffix matching still happens locally in browser memory.

export interface BreachResult {
  checked: boolean;
  breached: boolean;
  count: number;
  hashPrefix: string;
  error?: string;
  offlineFallback?: boolean;
}

export async function checkBreachStatus(password: string): Promise<BreachResult> {
  if (!password || password.trim().length === 0) {
    return { checked: false, breached: false, count: 0, hashPrefix: '' };
  }

  try {
    // 1. SHA-1 locally via Web Crypto
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const fullHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    // 2. Split into 5-char prefix (sent) and 35-char suffix (kept local)
    const prefix = fullHash.slice(0, 5);
    const suffix = fullHash.slice(5);

    // 3. Ask our backend proxy (it adds Add-Padding and caches)
    const response = await fetch(`/api/breach/range/${prefix}`, { method: 'GET' });
    if (!response.ok) throw new Error(`API responded with status: ${response.status}`);

    const text = await response.text();
    let count = 0;
    let breached = false;
    for (const line of text.split('\n')) {
      const [hashSuffix, breachCount] = line.trim().split(':');
      if (hashSuffix && hashSuffix.toUpperCase() === suffix) {
        count = parseInt(breachCount, 10);
        breached = count > 0;
        break;
      }
    }

    return { checked: true, breached, count, hashPrefix: prefix };
  } catch (error) {
    console.warn('Breach check error (offline fallback)', error);
    return {
      checked: false,
      breached: false,
      count: 0,
      hashPrefix: '',
      error: 'Network offline or breach service unreachable. Offline heuristics applied.',
      offlineFallback: true,
    };
  }
}
