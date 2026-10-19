import { Router } from 'express';
import type { Config } from '../config';

export function healthRouter(config: Config) {
  const router = Router();
  router.get('/', (_req, res) => {
    res.json({ status: 'ok', uptime: Math.round(process.uptime()), gemini: Boolean(config.GEMINI_API_KEY) });
  });
  return router;
}
