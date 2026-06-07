'use client';

import { useStore } from '@/lib/store';
import type { Trend } from '@/lib/types';

const PLATFORM_KR: Record<string, string> = {
  youtube: '유튜브', tiktok: '틱톡', instagram: '인스타그램',
};

const PLATFORM_COLOR: Record<string, string> = {
  youtube: '#FF4466', tiktok: '#69C9D0', instagram: '#C857FF',
};

const RANK_COLOR: Record<number, string> = {
  1: '#FF4274',
  2: '#6B6B72',
  3: '#C8FF57',
};

// heatLevel에 따라 sparkline 경로를 다르게
function Sparkline({ heatLevel }: { heatLevel: string }) {
  if (heatLevel === 'HOT') return (
    <svg viewBox="0 0 50 24" width="42" height="20" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sg-hot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8FF57" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#C8FF57" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,20 L8,18 L17,14 L25,10 L33,7 L42,4 L50,2 L50,24 L0,24 Z" fill="url(#sg-hot)" />
      <path d="M0,20 L8,18 L17,14 L25,10 L33,7 L42,4 L50,2" fill="none" stroke="#C8FF57" strokeWidth="1.5" />
      <circle cx="50" cy="2" r="2" fill="#C8FF57" />
    </svg>
  );
  if (heatLevel === 'WARM') return (
    <svg viewBox="0 0 50 24" width="42" height="20" style={{ overflow: 'visible' }}>
      <path d="M0,18 L8,16 L17,14 L25,13 L33,11 L42,10 L50,9" fill="none" stroke="#57C8FF" strokeWidth="1.5" />
      <circle cx="50" cy="9" r="2" fill="#57C8FF" />
    </svg>
  );
  return (
    <svg viewBox="0 0 50 24" width="42" height="20" style={{ overflow: 'visible' }}>
      <path d="M0,12 L8,13 L17,14 L25,15 L33,14 L42,15 L50,16" fill="none" stroke="#444" strokeWidth="1.5" />
      <circle cx="50" cy="16" r="2" fill="#444" />
    </svg>
  );
}

export default function TrendRow({ trend, rank }: { trend: Trend; rank: number }) {
  const setActionSheetTrend = useStore((s) => s.setActionSheetTrend);
  const savedTrendIds = useStore((s) => s.savedTrendIds);
  const toggleSaveTrend = useStore((s) => s.toggleSaveTrend);

  const isSaved = savedTrendIds.includes(trend.id);
  const rankColor = RANK_COLOR[rank] ?? 'var(--text-faint)';

  return (
    <div
      className="flex gap-3 items-center py-3.5 border-b border-border last:border-b-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* 순위 */}
      <div
        className="font-mono text-[13px] font-bold min-w-[22px] text-center flex-shrink-0 leading-none"
        style={{ color: rankColor }}
      >
        {rank}
      </div>

      {/* 본문 — 탭하면 액션시트 */}
      <button
        className="flex-1 min-w-0 text-left"
        onClick={() => setActionSheetTrend(trend)}
      >
        <div className="text-[13px] font-medium leading-snug mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {trend.title}
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span style={{ color: PLATFORM_COLOR[trend.platform] ?? 'var(--text-faint)' }}>
            {PLATFORM_KR[trend.platform] ?? trend.platform}
          </span>
          <span style={{ color: 'var(--text-faint)' }}>·</span>
          <span style={{ color: trend.engagementRate >= 5 ? '#C8FF57' : trend.engagementRate >= 2 ? '#57C8FF' : 'var(--text-faint)' }}>
            {trend.engagementRate > 0 ? `ER ${trend.engagementRate}%` : '—'}
          </span>
          <span style={{ color: 'var(--text-faint)' }}>·</span>
          <span style={{ color: 'var(--text-faint)' }}>{trend.views.toLocaleString()}</span>
        </div>
      </button>

      {/* 스파크라인 */}
      <div className="flex-shrink-0">
        <Sparkline heatLevel={trend.heatLevel} />
      </div>

      {/* 저장 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleSaveTrend(trend.id); }}
        className="flex-shrink-0 w-8 h-8 grid place-items-center rounded-full transition-all"
        style={{ background: isSaved ? 'rgba(200,255,87,0.12)' : 'transparent' }}
        aria-label={isSaved ? '저장 취소' : '저장'}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill={isSaved ? '#C8FF57' : 'none'} stroke={isSaved ? '#C8FF57' : 'rgba(255,255,255,0.3)'} strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
}
