import { Router } from 'express';
import { AppError } from '../middleware/errorHandler';
import { UpstreamError, type HibpService } from '../services/hibp';

const PREFIX_RE = /^[0-9A-Fa-f]{5}$/;

export function breachRouter(hibp: HibpService, ttlSeconds: number) {
  const router = Router();

  // GET /api/breach/range/:prefix  ->  HIBP k-anonymity range (5 hex chars of SHA-1 ONLY)
  router.get('/range/:prefix', async (req, res, next) => {
    try {
      const { prefix } = req.params;
      if (!PREFIX_RE.test(prefix)) {
        throw new AppError(400, 'invalid_prefix', 'Prefix must be exactly 5 hexadecimal characters.');
      }
      const { body, cacheHit } = await hibp.getRange(prefix.toUpperCase());
      res.set({
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': `public, max-age=${Math.min(ttlSeconds, 3600)}`,
        'X-Cache': cacheHit ? 'HIT' : 'MISS',
      });
      res.send(body);
    } catch (err) {
      if (err instanceof UpstreamError) {
        return next(new AppError(502, 'upstream_unavailable', 'Breach database unreachable.', { offlineFallback: true }));
      }
      next(err);
    }
  });

  return router;
}
