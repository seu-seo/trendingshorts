'use client';

import { useEffect, useState } from 'react';
import type { Trend } from '@/lib/types';
import type { KeywordInsightResponse } from '@/app/api/keyword-insight/route';

// 키워드 버블 색은 보조 액센트(--color-primary-mid). 불투명도는 color-mix 로.
const BUBBLE_COLOR = 'var(--color-primary-mid)';
const mix = (pct: number) => `color-mix(in srgb, ${BUBBLE_COLOR} ${pct}%, transparent)`;
const glow = (layers: [number, number][]) => layers.map(([px, pct]) => `0 0 ${px}px ${mix(pct)}`).join(', ');

const BUBBLE_SIZES = [
  { size: 96, glow: glow([[12, 55], [28, 28], [48, 10]]), border: mix(60), wordSize: 14, pctSize: 11, pulse: true },
  { size: 82, glow: glow([[8, 45], [18, 22]]), border: mix(50), wordSize: 13, pctSize: 10, pulse: false },
  { size: 72, glow: glow([[6, 35], [13, 16]]), border: mix(40), wordSize: 12, pctSize: 9, pulse: false },
  { size: 72, glow: glow([[6, 35], [13, 16]]), border: mix(40), wordSize: 12, pctSize: 9, pulse: false },
  { size: 62, glow: glow([[5, 22], [10, 10]]), border: mix(28), wordSize: 11, pctSize: 9, pulse: false },
  { size: 62, glow: glow([[5, 22], [10, 10]]), border: mix(28), wordSize: 11, pctSize: 9, pulse: false },
  { size: 52, glow: glow([[4, 12]]), border: mix(18), wordSize: 10, pctSize: 8, pulse: false },
  { size: 52, glow: glow([[4, 12]]), border: mix(18), wordSize: 10, pctSize: 8, pulse: false },
];

export default function KeywordInsight({ trends, category }: { trends: Trend[]; category: string | null }) {
  const [data, setData] = useState<KeywordInsightResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trends.length === 0) return;
    setData(null);
    setLoading(true);

    const top20 = trends.slice(0, 20);
    fetch('/api/keyword-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titles: top20.map(t => t.title),
        hashtags: top20.flatMap(t => t.hashtags.split(' ').filter(Boolean)),
        trends: top20.map(t => ({ title: t.title, hashtags: t.hashtags, engagementRate: t.engagementRate })),
        category,
      }),
    })
      .then(r => r.json())
      .then((d: KeywordInsightResponse) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [trends, category]);

  if (loading) {
    return (
      <div className="mx-6 mb-5">
          <div className="flex flex-wrap gap-2.5 justify-center items-center py-2">
          {BUBBLE_SIZES.map((b, i) => (
            <div key={i} className="rounded-full animate-pulse flex-shrink-0"
              style={{ width: b.size, height: b.size, background: mix(5), border: `1px solid ${mix(15)}` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.keywords.length === 0) return null;

  return (
    <div className="mx-6 mb-5">
      {/* 버블 맵 */}
      <div className="flex flex-wrap gap-2.5 justify-center items-center py-2">
        {data.keywords.map((kw, i) => {
          const b = BUBBLE_SIZES[i] ?? BUBBLE_SIZES[7];
          return (
            <div key={kw.tag}
              className="rounded-full flex flex-col items-center justify-center text-center flex-shrink-0"
              style={{
                width: b.size,
                height: b.size,
                background: mix(8),
                border: `1px solid ${b.border}`,
                boxShadow: b.glow,
                gap: 2,
                cursor: 'pointer',
                animation: b.pulse ? 'bubblePulse 2.4s ease-in-out infinite' : undefined,
              }}>
              <span className="font-bold leading-tight px-1 text-center break-keep"
                style={{ fontSize: b.wordSize, color: i < 4 ? 'var(--color-ink)' : 'var(--color-ink-2)', lineHeight: 1.2 }}>
                {kw.tag}
              </span>
              <span className="font-mono font-bold"
                style={{ fontSize: b.pctSize, color: BUBBLE_COLOR, letterSpacing: '0.02em' }}>
                {Math.round(kw.score)}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes bubblePulse {
          0%,100% { box-shadow: ${glow([[12, 55], [28, 28], [48, 10]])}; }
          50%      { box-shadow: ${glow([[18, 75], [38, 38], [64, 16]])}; }
        }
      `}</style>
    </div>
  );
}
