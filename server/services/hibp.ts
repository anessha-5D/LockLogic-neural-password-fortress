import { LRUCache } from 'lru-cache';

export class UpstreamError extends Error {
  constructor(message = 'HIBP upstream unavailable', public readonly retryable = false) {
    super(message);
    this.name = 'UpstreamError';
  }
}

export interface HibpService {
  getRange(prefix: string): Promise<{ body: string; cacheHit: boolean }>;
}

export interface HibpOptions {
  ttlSeconds: number;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  baseUrl?: string;
}

const LINE = /^[0-9A-F]{35}:\d+$/i;
const looksLikeRange = (body: string) =>
  body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .every((l) => LINE.test(l));

export function createHibpService(opts: HibpOptions): HibpService {
  const { ttlSeconds, fetchImpl = fetch, timeoutMs = 5000, baseUrl = 'https://api.pwnedpasswords.com/range/' } = opts;
  const cache = new LRUCache<string, string>({ max: 5000, ttl: ttlSeconds * 1000 });

  async function fetchOnce(prefix: string): Promise<string> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      // Deliberately forwards NOTHING from the client request (no IP, no headers).
      const res = await fetchImpl(baseUrl + prefix, {
        method: 'GET',
        headers: { 'Add-Padding': 'true', 'User-Agent': 'LockLogic-kanon-proxy/1.0' },
        signal: ctrl.signal,
      });
      if (res.status >= 500) throw new UpstreamError(`upstream ${res.status}`, true);
      if (!res.ok) throw new UpstreamError(`upstream ${res.status}`, false);
      const body = await res.text();
      if (!looksLikeRange(body)) throw new UpstreamError('malformed upstream body', false);
      return body;
    } catch (err) {
      if (err instanceof UpstreamError) throw err;
      throw new UpstreamError('network error or timeout', true);
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    async getRange(prefix) {
      const cached = cache.get(prefix);
      if (cached !== undefined) return { body: cached, cacheHit: true };

      let lastErr: unknown;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const body = await fetchOnce(prefix);
          cache.set(prefix, body);
          return { body, cacheHit: false };
        } catch (err) {
          lastErr = err;
          if (!(err instanceof UpstreamError && err.retryable)) break;
        }
      }
      throw lastErr instanceof UpstreamError ? lastErr : new UpstreamError();
    },
  };
}
