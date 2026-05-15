'use client';

import { useEffect, useState } from 'react';
import type { KeywordItem, InsightsResponse } from '@/app/api/insights/route';
import type { Trend } from '@/lib/types';

const TYPE_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  hot:     { label: 'HOT',     bg: 'rgba(255,61,127,0.15)', color: '#FF3D7F' },
  rising:  { label: 'RISING',  bg: 'rgba(200,255,87,0.12)', color: 'var(--accent-lime)' },
  '':      { label: '',        bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' },
};

export default function KeywordInsight({ trends, category }: { trends: Trend[]; category: string | null }) {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trends.length === 0) return;

    const cat = category ?? 'general';
    const titles = trends.slice(0, 20).map((t) => t.title);
    const hashtags = trends.flatMap((t) => t.hashtags.split(' ').filter(Boolean));

    setLoading(true);
    fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, titles, hashtags }),
    })
      .then((r) => r.json())
      .then((d: InsightsResponse) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [trends, category]);

  if (loading) {
    return (
      <div className="mx-6 mb-5 px-4 py-3.5 rounded-2xl animate-pulse"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="h-3 w-32 rounded mb-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="flex gap-2 mb-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-6 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          ))}
        </div>
        <div className="h-3 w-full rounded mb-1.5" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-3 w-2/3 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-6 mb-5 px-4 py-3.5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* 헤더 */}
      <div className="font-mono text-[9px] tracking-widest text-accent-lime uppercase mb-3 flex items-center gap-1.5">
        <span className="w-[5px] h-[5px] rounded-full bg-accent-lime"
          style={{ boxShadow: '0 0 6px var(--accent-lime)' }} />
        AI 키워드 분석
        {data.source === 'mock' && (
          <span className="ml-auto font-mono text-[8px] text-text-faint">(샘플)</span>
        )}
      </div>

      {/* 키워드 칩 */}
      <div className="flex flex-wrap gap-1.5 mb-3.5">
        {data.keywords.map((kw: KeywordItem) => {
          const s = TYPE_STYLE[kw.type] ?? TYPE_STYLE[''];
          return (
            <span key={kw.text}
              className="flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-full"
              style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}22` }}>
              {s.label && (
                <span className="text-[8px] font-bold tracking-wider opacity-80">{s.label}</span>
              )}
              {kw.text}
            </span>
          );
        })}
      </div>

      {/* 인사이트 */}
      <p className="text-[11px] text-text-dim leading-relaxed">
        {data.insight}
      </p>
    </div>
  );
}
