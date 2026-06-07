'use client';

import { useEffect, useState } from 'react';
import type { WeeklyIssue, WeeklyIssuesResponse } from '@/app/api/weekly-issues/route';

const ISSUE_COLORS = ['#FF3D7F', '#C8FF57', '#57C8FF'];

const CATEGORY_KR: Record<string, string> = {
  food: '요리/먹방', beauty: '뷰티/패션', lifestyle: '라이프스타일',
  edu: '정보/자기계발', gaming: '게임/엔터', fitness: '운동/건강', art: '예술/음악',
};

export default function WeeklyIssues({ category, trendTitles }: { category: string | null; trendTitles?: string[] }) {
  const [data, setData] = useState<WeeklyIssuesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const cat = category ?? 'lifestyle';

  useEffect(() => {
    setData(null);
    setLoading(true);
    fetch('/api/weekly-issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, trendTitles }),
    })
      .then((r) => r.json())
      .then((d: WeeklyIssuesResponse) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cat]);

  const catLabel = CATEGORY_KR[cat] ?? cat;

  if (loading) {
    return (
      <div className="mx-6 mb-5 px-4 py-3.5 rounded-2xl animate-pulse"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="h-3 w-40 rounded mb-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-3 last:mb-0">
            <div className="h-3 w-28 rounded mb-1.5" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="h-2.5 w-full rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.issues.length === 0) return null;

  return (
    <div className="mx-6 mb-5 px-4 py-3.5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

      <div className="font-mono text-[9px] tracking-widest uppercase mb-3.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5" style={{ color: 'var(--accent-lime)' }}>
          <span className="w-[5px] h-[5px] rounded-full bg-accent-lime"
            style={{ boxShadow: '0 0 6px var(--accent-lime)' }} />
          이번 주 {catLabel} 주요 이슈
        </span>
        {data.source === 'mock' && (
          <span className="text-text-faint">(샘플)</span>
        )}
      </div>

      <div className="space-y-4">
        {data.issues.map((issue: WeeklyIssue, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="mt-[4px] font-mono text-[12px] font-black flex-shrink-0 w-5 text-center"
              style={{ color: ISSUE_COLORS[i] ?? ISSUE_COLORS[2] }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-bold leading-snug mb-1"
                style={{ color: ISSUE_COLORS[i] ?? 'var(--text)', letterSpacing: '-0.01em' }}>
                {issue.title}
              </div>
              <div className="text-[13px] text-text-dim leading-relaxed mb-1.5">
                {issue.summary}
              </div>
              <div className="font-mono text-[11px] px-2 py-1 rounded inline-block"
                style={{ background: `${ISSUE_COLORS[i] ?? '#57C8FF'}18`, color: ISSUE_COLORS[i] ?? '#57C8FF' }}>
                → {issue.angle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
