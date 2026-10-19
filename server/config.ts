import 'dotenv/config';
import { z } from 'zod';

// Treat empty strings and the "MY_..." placeholders from .env.example as "not set".
const unsetIfPlaceholder = (v: unknown) =>
  typeof v === 'string' && (v.trim() === '' || /^MY_/.test(v.trim())) ? undefined : v;

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  APP_URL: z.preprocess(unsetIfPlaceholder, z.string().url().optional()),
  GEMINI_API_KEY: z.preprocess(unsetIfPlaceholder, z.string().min(10).optional()),
  GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
  HIBP_CACHE_TTL_SECONDS: z.coerce.number().int().min(1).default(3600),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(120),
  COACH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(10),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return parsed.data;
}
