import pino, { type DestinationStream, type Logger } from 'pino';
import pinoHttp from 'pino-http';
import type { Config } from './config';

/**
 * PRIVACY: logs contain method, route, status and latency only.
 * Request bodies, query strings, headers, IPs and AI prompts/responses are never logged.
 */
export function createLogger(config: Config, stream?: DestinationStream): Logger {
  return pino(
    {
      level: config.NODE_ENV === 'test' && !stream ? 'silent' : 'info',
      redact: { paths: ['req.headers', 'res.headers', '*.password', '*.body'], remove: true },
    },
    stream,
  );
}

export function requestLogger(logger: Logger) {
  return pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === '/api/health' },
    serializers: {
      req: (req: { method?: string; url?: string; originalUrl?: string }) => ({
        method: req.method,
        // drop the query string and never log whatever follows /range/
        path: (req.originalUrl ?? req.url ?? '').split('?')[0].replace(/^(\/api\/breach\/range\/).*/, '$1[redacted]'),
      }),
      res: (res: { statusCode?: number }) => ({ status: res.statusCode }),
    },
    customLogLevel: (_req, res, err) =>
      err || (res.statusCode ?? 0) >= 500 ? 'error' : (res.statusCode ?? 0) >= 400 ? 'warn' : 'info',
  });
}
