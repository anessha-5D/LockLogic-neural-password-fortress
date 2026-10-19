import cors from 'cors';
import helmet from 'helmet';
import type { RequestHandler } from 'express';
import type { Config } from '../config';

export function securityMiddleware(config: Config): RequestHandler[] {
  const isProd = config.NODE_ENV === 'production';

  const allowedOrigins = new Set<string>();
  if (config.APP_URL) allowedOrigins.add(new URL(config.APP_URL).origin);
  if (!isProd) {
    ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'].forEach((o) => allowedOrigins.add(o));
  }

  return [
    helmet({
      // Vite dev injects inline scripts + HMR websockets, so CSP is production-only.
      contentSecurityPolicy: isProd
        ? {
            useDefaults: false,
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
              imgSrc: ["'self'", 'data:', 'blob:'],
              connectSrc: ["'self'"],
              workerSrc: ["'self'", 'blob:'], // canvas-confetti uses a blob worker
              objectSrc: ["'none'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
              frameAncestors: ["'none'"],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false, // Google Fonts are cross-origin
    }),
    cors({
      origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin)),
      methods: ['GET', 'POST'],
      maxAge: 600,
    }),
  ];
}
