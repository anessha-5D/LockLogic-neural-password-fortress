import React, { useEffect, useMemo, useState } from 'react';
import { Shield, Sparkles } from 'lucide-react';
import type { AnalysisResult } from '../utils/analyzer';
import type { BreachResult } from '../utils/breachCheck';
import { buildCoachPayload, requestCoachAdvice, type CoachAdvice } from '../utils/coachClient';

interface CoachCardProps {
  analysis: AnalysisResult;
  breach: BreachResult | null;
  isCheckingBreach: boolean;
}

export const CoachCard: React.FC<CoachCardProps> = ({ analysis, breach, isCheckingBreach }) => {
  const [advice, setAdvice] = useState<CoachAdvice | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  // Only the anonymous feature payload decides when to re-fetch (not every keystroke).
  const payload = useMemo(() => buildCoachPayload(analysis, breach), [analysis, breach]);
  const payloadKey = JSON.stringify(payload);

  useEffect(() => {
    if (analysis.length === 0) {
      setAdvice(null);
      setStatus('idle');
      return;
    }
    if (isCheckingBreach) return; // wait so the breach bucket is included in a single request

    const ctrl = new AbortController();
    setStatus('loading');
    const timer = setTimeout(async () => {
      try {
        const result = await requestCoachAdvice(JSON.parse(payloadKey), ctrl.signal);
        setAdvice(result);
        setStatus('ready');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setStatus('error');
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [payloadKey, isCheckingBreach, analysis.length]);

  return (
    <div className="p-6 md:p-8 rounded-3xl glass-panel space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C6FF3D]" />
          <h3 className="text-lg md:text-xl font-bold font-heading text-[#F4F5F7]">AI Security Coach</h3>
          {advice && status === 'ready' && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#7C5CFF]">
              {advice.source === 'gemini' ? 'GEMINI' : 'RULE-BASED'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8E92A0]">
          <Shield className="w-3.5 h-3.5 text-[#C6FF3D]" />
          Sent: score &amp; categories only. Never your password.
        </div>
      </div>

      {status === 'idle' && <p className="text-sm text-[#8E92A0]">Type a password to get personalised coaching.</p>}

      {status === 'loading' && (
        <div className="space-y-2 animate-pulse" aria-busy="true">
          <div className="h-4 w-2/3 rounded bg-white/10" />
          <div className="h-3 w-full rounded bg-white/5" />
          <div className="h-3 w-5/6 rounded bg-white/5" />
        </div>
      )}

      {status === 'error' && (
        <p className="text-sm text-[#FFB800]">Coach is unavailable right now. The analysis above still works fully offline.</p>
      )}

      {status === 'ready' && advice && (
        <div className="space-y-3">
          <p className="text-base font-semibold text-[#F4F5F7]">{advice.headline}</p>
          <p className="text-sm text-[#8E92A0]">{advice.summary}</p>
          <ul className="space-y-1.5">
            {advice.actions.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#F4F5F7]">
                <span className="text-[#C6FF3D] font-mono">&gt;</span>
                {a}
              </li>
            ))}
          </ul>
          <p className="text-xs font-mono text-[#00E5FF]">NEXT LEVEL // {advice.nextLevelTip}</p>
        </div>
      )}
    </div>
  );
};
