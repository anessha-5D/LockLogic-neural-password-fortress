import { createHash } from 'node:crypto';
import { Router } from 'express';
import { LRUCache } from 'lru-cache';
import type { Logger } from 'pino';
import { coachRequestSchema, type CoachAdvice } from '../schemas/coach';
import { fallbackAdvice } from '../services/fallbackCoach';
import type { CoachGenerator } from '../services/gemini';

export function coachRouter(opts: { generator?: CoachGenerator; logger: Logger }) {
  const { generator, logger } = opts;
  const router = Router();
  // Keys are hashes of an already non-sensitive payload; only successful Gemini answers are cached.
  const cache = new LRUCache<string, CoachAdvice>({ max: 500, ttl: 10 * 60 * 1000 });

  // POST /api/coach
  router.post('/', async (req, res, next) => {
    try {
      const input = coachRequestSchema.parse(req.body); // throws -> 400 (unknown keys rejected)
      res.set('Cache-Control', 'no-store');

      const key = createHash('sha256')
        .update(JSON.stringify({ ...input, patternCategories: [...input.patternCategories].sort() }))
        .digest('hex');

      const cached = cache.get(key);
      if (cached) return res.json({ ...cached, source: 'gemini' });

      if (generator) {
        try {
          const advice = await generator(input);
          cache.set(key, advice);
          return res.json({ ...advice, source: 'gemini' });
        } catch (err) {
          // Never 500 because of the AI provider. Log the error TYPE only, never prompt/response text.
          logger.warn({ errName: err instanceof Error ? err.name : 'unknown' }, 'coach generator failed; using fallback');
        }
      }
      res.json({ ...fallbackAdvice(input), source: 'fallback' });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
