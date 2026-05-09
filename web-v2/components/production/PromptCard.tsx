'use client';

import type { ProductionPrompt } from '@/lib/types';

const TONE_STYLES: Record<string, React.CSSProperties> = {
  'tone-emotional': { color: 'var(--accent-pink)', borderColor: 'rgba(255, 61, 127, 0.4)' },
  'tone-info': { color: 'var(--accent-blue)', borderColor: 'rgba(87, 200, 255, 0.4)' },
  'tone-trend': { color: 'var(--accent-lime)', borderColor: 'rgba(200, 255, 87, 0.4)' },
};

export default function PromptCard({
  prompt,
  index,
  total,
}: {
  prompt: ProductionPrompt;
  index: number;
  total: number;
}) {
  return (
    <div className="bg-surface-1 border border-border rounded-[18px] p-[18px] cursor-pointer transition-all hover:border-accent-blue hover:-translate-y-0.5 relative overflow-hidden group">
      <div className="absolute top-4 right-4 font-mono text-[11px] text-text-faint tracking-wider">
        {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      <div
        className="inline-flex items-center gap-1.5 py-1 px-2.5 border rounded-full font-mono text-[9px] tracking-widest uppercase mb-3"
        style={TONE_STYLES[prompt.toneClass]}
      >
        {prompt.toneLabel}
      </div>

      <div className="text-[17px] font-semibold leading-snug mb-2.5 pr-12">
        {prompt.headline}
      </div>

      <div className="flex gap-1.5 mb-3.5 flex-wrap">
        {prompt.meta.map((m, i) => (
          <span
            key={i}
            className="font-mono text-[10px] text-text-dim py-0.5 px-2 border border-border rounded tracking-tight"
          >
            {m}
          </span>
        ))}
      </div>

      <div className="text-[13px] text-text-dim leading-relaxed mb-3.5">{prompt.reason}</div>

      <div className="flex justify-between items-center pt-3 border-t border-dashed border-border">
        <span className="font-mono text-[11px] text-accent-blue font-semibold tracking-wider uppercase">
          대본 만들기
        </span>
        <span className="w-7 h-7 rounded-full bg-accent-blue text-bg grid place-items-center text-sm transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </div>
  );
}
