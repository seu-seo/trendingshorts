'use client';

import { useStore } from '@/lib/store';
import type { Trend } from '@/lib/types';

const PLATFORM_KR: Record<string, string> = {
  youtube: '유튜브', tiktok: '틱톡', instagram: '인스타그램',
};

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// Left border opacity and bg tint per rank (matching demo v6)
const LEFT_BAR_OPACITY = [0.90, 0.70, 0.50, 0.30, 0.15];
const LEFT_BG_OPACITY  = [0.06, 0.03, 0,    0,    0   ];

// Rank text color per rank (demo v6)
function rankColor(rank: number): string {
  if (rank === 1) return 'var(--accent-lime)';
  if (rank === 2) return 'rgba(236,237,238,0.7)';
  return 'rgba(236,237,238,0.4)';
}

export default function TrendRow({ trend, rank }: { trend: Trend; rank: number }) {
  const setActionSheetTrend = useStore((s) => s.setActionSheetTrend);
  const savedTrendIds = useStore((s) => s.savedTrendIds);
  const toggleSaveTrend = useStore((s) => s.toggleSaveTrend);

  const isSaved = savedTrendIds.includes(trend.id);
  const idx = Math.min(rank - 1, LEFT_BAR_OPACITY.length - 1);
  const barOpacity = LEFT_BAR_OPACITY[idx] ?? 0.10;
  const bgOpacity  = LEFT_BG_OPACITY[idx]  ?? 0;

  const erPct = trend.engagementRate > 0 ? `${trend.engagementRate.toFixed(1)}%` : '—';
  const HEAT_COLOR: Record<string, string> = {
    HOT: 'var(--accent-lime)',
    WARM: '#57C8FF',
    COLD: 'rgba(255,255,255,0.3)',
  };

  return (
    <div
      className="flex gap-3 items-center py-3.5 transition-all"
      style={{
        borderLeft: `3px solid rgba(200,255,87,${barOpacity})`,
        background: bgOpacity > 0 ? `rgba(200,255,87,${bgOpacity})` : 'transparent',
        paddingLeft: 12,
      }}
    >
      {/* 순위 */}
      <div
        className="font-display text-[22px] font-bold w-8 text-center flex-shrink-0 leading-none"
        style={{ color: rankColor(rank) }}
      >
        {rank}
      </div>

      {/* 본문 */}
      <button className="flex-1 min-w-0 text-left" onClick={() => setActionSheetTrend(trend)}>
        <div className="text-[15px] font-medium leading-snug mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-text"
          style={{ letterSpacing: '-0.01em' }}>
          {trend.title}
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="font-semibold uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, letterSpacing: '0.06em' }}>
            {PLATFORM_KR[trend.platform] ?? trend.platform}
          </span>
          <span className="w-[2px] h-[2px] rounded-full flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ color: 'var(--text-faint)' }}>{formatViews(trend.views)}</span>
        </div>
      </button>

      {/* ER + 열기 + 저장 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-[14px] font-bold leading-none"
            style={{ color: HEAT_COLOR[trend.heatLevel] ?? HEAT_COLOR.COLD, letterSpacing: '-0.02em' }}>
            {erPct}
          </span>
          <span className="font-mono text-[8px] font-bold tracking-wider leading-none"
            style={{ color: HEAT_COLOR[trend.heatLevel] ?? HEAT_COLOR.COLD }}>
            {trend.heatLevel}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleSaveTrend(trend.id); }}
          className="w-8 h-8 grid place-items-center rounded-full transition-all"
          style={{ background: isSaved ? 'rgba(200,255,87,0.12)' : 'transparent' }}
          aria-label={isSaved ? '저장 취소' : '저장'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={isSaved ? '#C8FF57' : 'none'}
            stroke={isSaved ? '#C8FF57' : 'rgba(255,255,255,0.35)'}
            strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
