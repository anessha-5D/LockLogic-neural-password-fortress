# LockLogic backend (Express + TypeScript)

Drop-in backend for the existing LockLogic frontend. File paths mirror the repo root.

## Install
1. Copy everything in this folder into the project root, overwriting `package.json`, `tsconfig.json`, `.env.example`, `src/utils/breachCheck.ts`.
2. `npm install`
3. `cp .env.example .env` and set `GEMINI_API_KEY` (optional: without it the coach uses the rule-based fallback).
4. Add the coach card to `src/components/PasswordAnalyzer.tsx`:
   ```tsx
   import { CoachCard } from './CoachCard';
   // ...inside the returned JSX, e.g. right after the breach-status section:
   <CoachCard analysis={analysis} breach={breachData} isCheckingBreach={isCheckingBreach} />
   ```
5. `npm run dev` (frontend + API on :3000), `npm test`, `npm run build && npm start`.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | liveness + whether Gemini is configured |
| GET | `/api/breach/range/:prefix` | HIBP k-anonymity proxy (5 hex chars only), padded, cached |
| POST | `/api/coach` | AI coaching from anonymous metrics (Gemini, with rule-based fallback) |

```bash
curl localhost:3000/api/health
curl -i localhost:3000/api/breach/range/21BD1
curl -X POST localhost:3000/api/coach -H 'Content-Type: application/json' -d '{
  "score":62,"scoreLevel":"Strong","entropyBits":58,"predictabilityScore":30,"zxcvbnScore":3,
  "length":14,"hasLower":true,"hasUpper":true,"hasNumber":true,"hasSymbol":false,
  "patternCategories":["year_or_date"],"breached":false,"breachBucket":"none"}'
```

## Privacy model (what the server can and cannot see)
- Can see: the 5-char SHA-1 prefix; score, entropy, flags and generic pattern categories.
- Cannot see: the password, the full hash, any substring or per-character data. `/api/coach` uses a strict zod schema (numbers, booleans, fixed enums only) and rejects unknown keys.
- Logs: method, route, status and latency only. No bodies, queries, headers, IPs or AI text. The breach path is logged as `/api/breach/range/[redacted]`.
- Stateless: no database, sessions or cookies. Only in-memory caches.
- `tests/privacy.test.ts` enforces all of this.

## Notes
- Production CSP is enabled only when `NODE_ENV=production` (Vite dev needs inline scripts/HMR).
- Docker/Cloud Run: `docker build -t locklogic .`; the container listens on `$PORT` (8080 by default).
- The optional anonymous-stats module from the brief was intentionally not built (extra surface area, no clear need).
