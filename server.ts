import express, { type Express } from 'express';
import path from 'node:path';
import type { ViteDevServer } from 'vite';
import { loadConfig } from './server/config';
import { createLogger } from './server/logger';
import { createApp } from './server/app';

async function main() {
  const config = loadConfig();
  const logger = createLogger(config);
  const isProd = config.NODE_ENV === 'production';

  let vite: ViteDevServer | undefined;
  let frontend: (app: Express) => void;

  if (isProd) {
    const dist = path.resolve(process.cwd(), 'dist');
    frontend = (app) => {
      app.use(express.static(dist, { index: false, maxAge: '1h' }));
      // SPA fallback (API routes are already handled and 404'd before this point)
      app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
    };
  } else {
    // Vite in middleware mode: one process, one port, API + HMR frontend.
    // vite.config.ts still applies (incl. DISABLE_HMR handling).
    const { createServer } = await import('vite');
    vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    frontend = (app) => app.use(vite!.middlewares);
  }

  const app = createApp({ config, logger, frontend });
  const server = app.listen(config.PORT, '0.0.0.0', () => {
    logger.info({ port: config.PORT, env: config.NODE_ENV, gemini: Boolean(config.GEMINI_API_KEY) }, 'LockLogic server listening');
  });

  server.requestTimeout = 15_000;
  server.headersTimeout = 20_000;
  server.keepAliveTimeout = 65_000; // > Cloud Run / most LB idle timeouts

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'shutting down');
    server.close(async () => {
      await vite?.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error({ errName: reason instanceof Error ? reason.name : 'unknown' }, 'unhandledRejection');
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
