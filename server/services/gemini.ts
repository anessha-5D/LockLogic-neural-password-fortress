import { GoogleGenAI, Type } from '@google/genai';
import { coachAdviceSchema, type CoachAdvice, type CoachInput } from '../schemas/coach';

export type CoachGenerator = (input: CoachInput) => Promise<CoachAdvice>;

const SYSTEM_INSTRUCTION = `You are the LockLogic Security Coach.
You NEVER see the user's password, only anonymous strength metrics (numbers, flags, pattern categories).
Rules:
- Never ask the user to reveal, type or paste their password.
- Never propose a specific password or passphrase example.
- Give advice about habits only: length, random passphrases, avoiding the listed pattern categories, uniqueness per account, password managers, multi-factor authentication, and replacing breached passwords.
- Be concise, concrete and encouraging. No fear-mongering. Plain text only, no markdown.
- Respond ONLY with JSON matching the provided schema.`;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('gemini timeout')), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

const clip = (s: unknown, max: number) =>
  typeof s === 'string' ? (s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s) : s;

/** Models occasionally overshoot length limits; clip first, then validate strictly. */
function clipAdvice(raw: any) {
  return {
    headline: clip(raw?.headline, 80),
    summary: clip(raw?.summary, 300),
    actions: Array.isArray(raw?.actions) ? raw.actions.slice(0, 5).map((x: unknown) => clip(x, 140)) : raw?.actions,
    nextLevelTip: clip(raw?.nextLevelTip, 140),
  };
}

export function createGeminiCoach(opts: { apiKey: string; model: string; timeoutMs?: number }): CoachGenerator {
  const { apiKey, model, timeoutMs = 10_000 } = opts;
  const ai = new GoogleGenAI({ apiKey });

  return async (input) => {
    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents: `Anonymous strength report (no password available to you):\n${JSON.stringify(input)}\n\nWrite personalised coaching for this report.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.3,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
          // Flash models can skip "thinking" so the token budget isn't eaten before the JSON is written.
          ...(model.includes('flash') ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              actions: { type: Type.ARRAY, items: { type: Type.STRING } },
              nextLevelTip: { type: Type.STRING },
            },
            required: ['headline', 'summary', 'actions', 'nextLevelTip'],
          },
        },
      }),
      timeoutMs,
    );

    const text = response.text;
    if (!text) throw new Error('empty gemini response');
    return coachAdviceSchema.parse(clipAdvice(JSON.parse(text)));
  };
}
