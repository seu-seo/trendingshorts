'use client';

import { useEffect, useState } from 'react';
import type { WeeklyIssue, WeeklyIssuesResponse } from '@/app/api/weekly-issues/route';

const ISSUE_COLORS = ['var(--color-hot)', 'var(--color-primary)', 'var(--color-primary-mid)'];

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
        style={{ background: 'var(--color-soft)', border: '1px solid var(--color-border)' }}>
        <div className="h-3 w-40 rounded mb-4" style={{ background: 'var(--color-border)' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-3 last:mb-0">
            <div className="h-3 w-28 rounded mb-1.5" style={{ background: 'var(--color-border)' }} />
            <div className="h-2.5 w-full rounded" style={{ background: 'var(--color-tint)' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.issues.length === 0) return null;

  return (
    <div className="mx-6 mb-5 px-4 py-3.5 rounded-2xl"
      style={{ background: 'var(--color-soft)', border: '1px solid var(--color-border)' }}>

      <div className="font-mono text-[9px] tracking-widest uppercase mb-3.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <span className="w-[5px] h-[5px] rounded-full"
            style={{ background: 'var(--color-primary)', boxShadow: '0 0 6px var(--color-primary)' }} />
          이번 주 {catLabel} 주요 이슈
        </span>
        {data.source === 'mock' && (
          <span style={{ color: 'var(--color-ink-3)' }}>(샘플)</span>
        )}
      </div>

      <div className="space-y-4">
        {data.issues.map((issue: WeeklyIssue, i) => {
          const issueColor = ISSUE_COLORS[i] ?? 'var(--color-primary-mid)';
          return (
          <div key={i} className="flex gap-3 items-start">
            <span className="mt-[4px] font-mono text-[12px] font-black flex-shrink-0 w-5 text-center"
              style={{ color: issueColor }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-bold leading-snug mb-1"
                style={{ color: issueColor, letterSpacing: '-0.01em' }}>
                {issue.title}
              </div>
              <div className="text-[13px] leading-relaxed mb-1.5" style={{ color: 'var(--color-ink-2)' }}>
                {issue.summary}
              </div>
              <div className="font-mono text-[11px] px-2 py-1 rounded inline-block"
                style={{ background: `color-mix(in srgb, ${issueColor} 12%, transparent)`, color: issueColor }}>
                → {issue.angle}
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
