'use client';

import { useState } from 'react';
import type { ScriptOutput, ScriptTone } from '@/lib/prompts';

const TONE_META: Record<
  ScriptTone,
  { label: string; toneClass: 'tone-emotional' | 'tone-info' | 'tone-trend' }
> = {
  story: { label: '스토리형 · STORY', toneClass: 'tone-emotional' },
  informative: { label: '정보형 · INFORMATIVE', toneClass: 'tone-info' },
  hooking: { label: '후킹형 · TRENDING HOOK', toneClass: 'tone-trend' },
};

const TONE_STYLES: Record<string, React.CSSProperties> = {
  'tone-emotional': { color: 'var(--accent-pink)', borderColor: 'rgba(255, 61, 127, 0.4)' },
  'tone-info': { color: 'var(--accent-blue)', borderColor: 'rgba(87, 200, 255, 0.4)' },
  'tone-trend': { color: 'var(--accent-lime)', borderColor: 'rgba(200, 255, 87, 0.4)' },
};

export default function GeneratedScriptCard({
  tone,
  script,
  index,
  total,
  recommended,
}: {
  tone: ScriptTone;
  script: ScriptOutput;
  index: number;
  total: number;
  recommended: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const meta = TONE_META[tone];

  const handleCopy = async () => {
    const fullText = `[${meta.label}]\n\n훅: ${script.hook}\n\n본문:\n${script.body}\n\nCTA: ${script.cta}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className="bg-surface-1 border border-border rounded-[18px] p-[18px] transition-all hover:border-accent-blue relative overflow-hidden"
      style={
        recommended
          ? { borderColor: 'var(--accent-lime)', boxShadow: '0 0 0 1px rgba(200, 255, 87, 0.2)' }
          : undefined
      }
    >
      <div className="absolute top-4 right-4 font-mono text-[11px] text-text-faint tracking-wider">
        {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div
          className="inline-flex items-center gap-1.5 py-1 px-2.5 border rounded-full font-mono text-[9px] tracking-widest uppercase"
          style={TONE_STYLES[meta.toneClass]}
        >
          {meta.label}
        </div>
        {recommended && (
          <div
            className="inline-flex items-center gap-1 py-1 px-2 rounded-full font-mono text-[9px] tracking-widest uppercase"
            style={{ background: 'rgba(200, 255, 87, 0.12)', color: 'var(--accent-lime)' }}
          >
            ★ RECOMMENDED
          </div>
        )}
      </div>

      <div className="font-mono text-[10px] text-text-faint tracking-widest uppercase mb-1">
        HOOK · 첫 3초
      </div>
      <div className="text-[16px] font-semibold leading-snug mb-3.5 pr-12">
        {script.hook}
      </div>

      <div className="font-mono text-[10px] text-text-faint tracking-widest uppercase mb-1">
        BODY · 본문
      </div>
      <div className="text-[13px] text-text leading-relaxed mb-3.5 whitespace-pre-line">
        {script.body}
      </div>

      <div className="font-mono text-[10px] text-text-faint tracking-widest uppercase mb-1">
        CTA · 마무리
      </div>
      <div className="text-[13px] text-text-dim leading-relaxed mb-4 italic">
        {script.cta}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-dashed border-border">
        <button
          type="button"
          onClick={handleCopy}
          className="font-mono text-[11px] text-accent-blue font-semibold tracking-wider uppercase cursor-pointer transition-colors hover:text-accent-lime"
        >
          {copied ? '✓ 복사됨' : '대본 복사'}
        </button>
        <span className="w-7 h-7 rounded-full bg-accent-blue text-bg grid place-items-center text-sm">
          ✎
        </span>
      </div>
    </div>
  );
}
