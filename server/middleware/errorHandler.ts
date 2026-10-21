import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { Logger } from 'pino';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly extra?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'not_found', 'Route not found.'));
};

export const errorHandler =
  (logger: Logger): ErrorRequestHandler =>
  (err, req, res, next) => {
    let status = 500;
    let code = 'internal_error';
    let message = 'Internal server error.';
    let body: Record<string, unknown> = {};

    if (err instanceof AppError) {
      status = err.status;
      code = err.code;
      message = err.message;
      body = err.extra ?? {};
    } else if (err instanceof ZodError) {
      status = 400;
      code = 'invalid_request';
      message = 'Request validation failed.';
      // path + code only: never echo received values back (or into logs)
      body = { issues: err.issues.map((i) => ({ path: i.path.join('.'), code: i.code })) };
    } else if (err?.type === 'entity.too.large') {
      status = 413;
      code = 'payload_too_large';
      message = 'Request body too large.';
    } else if (err?.type === 'entity.parse.failed') {
      status = 400;
      code = 'invalid_json';
      message = 'Malformed JSON body.';
    }

    if (status >= 500) {
      logger.error({ code, path: req.path, errName: err?.name }, 'request failed');
    }
    if (res.headersSent) return next(err);

    res.status(status).json({ error: { code, message }, ...body });
  };
