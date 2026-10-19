import express, { Router, type Express } from 'express';
import type { Logger } from 'pino';
import { loadConfig, type Config } from './config';
import { createLogger, requestLogger } from './logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { coachLimiter, globalLimiter } from './middleware/rateLimit';
import { securityMiddleware } from './middleware/security';
import { breachRouter } from './routes/breach';
import { coachRouter } from './routes/coach';
import { healthRouter } from './routes/health';
import { createGeminiCoach, type CoachGenerator } from './services/gemini';
import { createHibpService, type HibpService } from './services/hibp';

export interface AppDeps {
  config?: Config;
  logger?: Logger;
  hibp?: HibpService;
  /** undefined = build from config; null = force "no AI" (fallback only) */
  coachGenerator?: CoachGenerator | null;
  /** mounts the frontend (Vite middleware or static files) BEFORE the error handler */
  frontend?: (app: Express) => void;
}

export function createApp(deps: AppDeps = {}): Express {
  const config = deps.config ?? loadConfig();
  const logger = deps.logger ?? createLogger(config);
  const hibp = deps.hibp ?? createHibpService({ ttlSeconds: config.HIBP_CACHE_TTL_SECONDS });

  const generator: CoachGenerator | undefined =
    deps.coachGenerator !== undefined
      ? deps.coachGenerator ?? undefined
      : config.GEMINI_API_KEY
        ? createGeminiCoach({ apiKey: config.GEMINI_API_KEY, model: config.GEMINI_MODEL })
        : undefined;

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // Cloud Run sits behind one proxy hop

  app.use(requestLogger(logger));
  app.use(...securityMiddleware(config));

  const api = Router();
  api.use(globalLimiter(config));
  api.use(express.json({ limit: '4kb' }));
  api.use('/health', healthRouter(config));
  api.use('/breach', breachRouter(hibp, config.HIBP_CACHE_TTL_SECONDS));
  api.use('/coach', coachLimiter(config), coachRouter({ generator, logger }));
  api.use(notFound);
  app.use('/api', api);

  deps.frontend?.(app);
  app.use(errorHandler(logger));
  return app;
}
