import rateLimit from 'express-rate-limit';
import type { Config } from '../config';
import { AppError } from './errorHandler';

const make = (windowMs: number, limit: number) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new AppError(429, 'rate_limited', 'Too many requests. Please slow down.')),
  });

export const globalLimiter = (c: Config) => make(c.RATE_LIMIT_WINDOW_MS, c.RATE_LIMIT_MAX);
export const coachLimiter = (c: Config) => make(c.RATE_LIMIT_WINDOW_MS, c.COACH_RATE_LIMIT_MAX);
