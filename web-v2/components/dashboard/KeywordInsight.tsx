'use client';

import { useEffect, useState } from 'react';
import type { KeywordItem, InsightsResponse } from '@/app/api/insights/route';
import type { Trend } from '@/lib/types';
import { useStore } from '@/lib/store';

const BUBBLE: Record<string, { size: number; bg: string; border: string; color: string; glow: string; fs: number }> = {
  hot:    { size: 84, bg: 'rgba(255,61,127,0.22)',  border: 'rgba(255,61,127,0.6)',   color: '#FF3D7F', glow: '0 0 20px rgba(255,61,127,0.4)',  fs: 11 },
  rising: { size: 68, bg: 'rgba(200,255,87,0.18)',  border: 'rgba(200,255,87,0.55)',  color: '#C8FF57', glow: '0 0 16px rgba(200,255,87,0.32)', fs: 10 },
  '':     { size: 54, bg: 'rgba(255,255,255,0.09)', border: 'rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.75)', glow: 'none', fs: 9 },
};

const BULLET_COLOR = ['#FF3D7F', '#C8FF57', '#57C8FF'];

// Center-point positions for up to 6 bubbles (sorted: hot → rising → normal)
const POS = [
  { cx: '20%', cy: '36%' },
  { cx: '64%', cy: '26%' },
  { cx: '40%', cy: '74%' },
  { cx: '80%', cy: '65%' },
  { cx: '10%', cy: '76%' },
  { cx: '56%', cy: '52%' },
];

export default function KeywordInsight({ trends, category }: { trends: Trend[]; category: string | null }) {
  const insightsCache = useStore((s) => s.insightsCache);
  const setInsightsCache = useStore((s) => s.setInsightsCache);
  const cat = category ?? 'general';
  const [loading, setLoading] = useState(false);
  const data = insightsCache.get(cat) ?? null;

  useEffect(() => {
    if (trends.length === 0 || insightsCache.has(cat)) return;

    const titles = trends.slice(0, 20).map((t) => t.title);
    const hashtags = trends.flatMap((t) => t.hashtags.split(' ').filter(Boolean));

    setLoading(true);
    fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, titles, hashtags }),
    })
      .then((r) => r.json())
      .then((d: InsightsResponse) => setInsightsCache(cat, d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [trends, category]);

  if (loading) {
    return (
      <div className="mx-6 mb-5 px-4 py-3.5 rounded-2xl animate-pulse"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="h-3 w-32 rounded mb-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="relative w-full mb-4" style={{ height: 170 }}>
          {[78, 78, 62, 62, 48, 48].map((s, i) => (
            <div key={i} className="absolute rounded-full"
              style={{ width: s, height: s, left: POS[i].cx, top: POS[i].cy, transform: 'translate(-50%,-50%)', background: 'rgba(255,255,255,0.06)' }} />
          ))}
        </div>
        <div className="space-y-2">
          {[80, 65, 72].map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="h-2.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', width: `${w}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const sorted = [...data.keywords].sort((a, b) => {
    const order: Record<string, number> = { hot: 0, rising: 1, '': 2 };
    return (order[a.type] ?? 2) - (order[b.type] ?? 2);
  });

  return (
    <div className="mx-6 mb-5 px-4 py-3.5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

      {/* 헤더 */}
      <div className="font-mono text-[9px] tracking-widest text-accent-lime uppercase mb-4 flex items-center gap-1.5">
        <span className="w-[5px] h-[5px] rounded-full bg-accent-lime" style={{ boxShadow: '0 0 6px var(--accent-lime)' }} />
        AI 키워드 분석
        {data.source === 'mock' && (
          <span className="ml-auto font-mono text-[8px] text-text-faint">(샘플)</span>
        )}
      </div>

      {/* 버블 맵 */}
      <div className="relative w-full mb-5" style={{ height: 170 }}>
        {sorted.slice(0, 6).map((kw: KeywordItem, i) => {
          const b = BUBBLE[kw.type] ?? BUBBLE[''];
          const p = POS[i];
          return (
            <div key={kw.text}
              className="absolute flex flex-col items-center justify-center rounded-full text-center"
              style={{
                width: b.size, height: b.size,
                left: p.cx, top: p.cy,
                transform: 'translate(-50%, -50%)',
                background: b.bg,
                border: `1px solid ${b.border}`,
                boxShadow: b.glow,
              }}>
              {kw.type !== '' && (
                <span className="font-mono font-black leading-none mb-1"
                  style={{ fontSize: 8, color: b.color, letterSpacing: '0.1em' }}>
                  {kw.type === 'hot' ? 'HOT' : 'RISING'}
                </span>
              )}
              <span className="font-bold leading-tight px-1.5 text-center"
                style={{ fontSize: b.fs, color: b.color, wordBreak: 'keep-all' }}>
                {kw.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* 인사이트 불릿 */}
      <div className="space-y-2.5">
        {data.bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="mt-[4px] flex-shrink-0 w-[5px] h-[5px] rounded-full"
              style={{ background: BULLET_COLOR[i] ?? BULLET_COLOR[2] }} />
            <p className="text-[11px] text-text-dim leading-relaxed">{b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
