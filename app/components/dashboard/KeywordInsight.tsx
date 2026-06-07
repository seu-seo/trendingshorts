'use client';

import { useEffect, useState } from 'react';
import type { Trend } from '@/lib/types';
import type { KeywordInsightResponse } from '@/app/api/keyword-insight/route';

const BUBBLE_SIZES = [
  { size: 96, glow: '0 0 12px rgba(56,182,255,0.55), 0 0 28px rgba(56,182,255,0.28), 0 0 48px rgba(56,182,255,0.10)', border: 'rgba(56,182,255,0.60)', wordSize: 14, pctSize: 11, pulse: true },
  { size: 82, glow: '0 0 8px rgba(56,182,255,0.45), 0 0 18px rgba(56,182,255,0.22)', border: 'rgba(56,182,255,0.50)', wordSize: 13, pctSize: 10, pulse: false },
  { size: 72, glow: '0 0 6px rgba(56,182,255,0.35), 0 0 13px rgba(56,182,255,0.16)', border: 'rgba(56,182,255,0.40)', wordSize: 12, pctSize: 9, pulse: false },
  { size: 72, glow: '0 0 6px rgba(56,182,255,0.35), 0 0 13px rgba(56,182,255,0.16)', border: 'rgba(56,182,255,0.40)', wordSize: 12, pctSize: 9, pulse: false },
  { size: 62, glow: '0 0 5px rgba(56,182,255,0.22), 0 0 10px rgba(56,182,255,0.10)', border: 'rgba(56,182,255,0.28)', wordSize: 11, pctSize: 9, pulse: false },
  { size: 62, glow: '0 0 5px rgba(56,182,255,0.22), 0 0 10px rgba(56,182,255,0.10)', border: 'rgba(56,182,255,0.28)', wordSize: 11, pctSize: 9, pulse: false },
  { size: 52, glow: '0 0 4px rgba(56,182,255,0.12)', border: 'rgba(56,182,255,0.18)', wordSize: 10, pctSize: 8, pulse: false },
  { size: 52, glow: '0 0 4px rgba(56,182,255,0.12)', border: 'rgba(56,182,255,0.18)', wordSize: 10, pctSize: 8, pulse: false },
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
              style={{ width: b.size, height: b.size, background: 'rgba(56,182,255,0.05)', border: '1px solid rgba(56,182,255,0.15)' }} />
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
                background: 'rgba(56,182,255,0.08)',
                border: `1px solid ${b.border}`,
                boxShadow: b.glow,
                gap: 2,
                cursor: 'pointer',
                animation: b.pulse ? 'bubblePulse 2.4s ease-in-out infinite' : undefined,
              }}>
              <span className="font-bold leading-tight px-1 text-center break-keep"
                style={{ fontSize: b.wordSize, color: i < 4 ? 'var(--text)' : 'var(--text-dim)', lineHeight: 1.2 }}>
                {kw.tag}
              </span>
              <span className="font-mono font-bold"
                style={{ fontSize: b.pctSize, color: '#38B6FF', letterSpacing: '0.02em' }}>
                {Math.round(kw.score)}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes bubblePulse {
          0%,100% { box-shadow: 0 0 12px rgba(56,182,255,0.55), 0 0 28px rgba(56,182,255,0.28), 0 0 48px rgba(56,182,255,0.10); }
          50%      { box-shadow: 0 0 18px rgba(56,182,255,0.75), 0 0 38px rgba(56,182,255,0.38), 0 0 64px rgba(56,182,255,0.16); }
        }
      `}</style>
    </div>
  );
}
