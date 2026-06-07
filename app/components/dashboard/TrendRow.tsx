'use client';

import { useStore } from '@/lib/store';
import type { Trend } from '@/lib/types';

const PLATFORM_SHORT: Record<string, string> = {
  youtube: 'YT',
  tiktok: 'TT',
  instagram: 'IG',
};

const PLATFORM_TEXT_COLORS: Record<string, string> = {
  youtube: '#FF4466',
  tiktok: '#69C9D0',
  instagram: '#FF6699',
};

const HEAT_COLOR: Record<string, string> = {
  HOT: '#C8FF57',
  WARM: '#57C8FF',
  COLD: '#555',
};

export default function TrendRow({ trend, rank }: { trend: Trend; rank: number }) {
  const setActionSheetTrend = useStore((s) => s.setActionSheetTrend);
  const isHot = trend.heatLevel === 'HOT';
  const handleClick = () => setActionSheetTrend(trend);

  return (
    <button
      onClick={handleClick}
      className="w-full flex gap-3 items-center py-3 border-b border-border last:border-b-0 cursor-pointer transition-all hover:pl-1 text-left"
    >
      <div
        className={`font-display text-[22px] min-w-8 text-center leading-none ${
          isHot ? 'text-accent-lime' : 'text-text-faint'
        }`}
      >
        {String(rank).padStart(2, '0')}
      </div>
      <div className="w-11 h-11 rounded-[10px] bg-surface-2 grid place-items-center text-[22px] flex-shrink-0">
        {trend.thumb}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium leading-snug mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {trend.title}
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-text-faint">
          <span
            className="font-semibold"
            style={{ color: PLATFORM_TEXT_COLORS[trend.platform] || 'var(--text-dim)' }}
          >
            {PLATFORM_SHORT[trend.platform]}
          </span>
          <span>·</span>
          <span>{trend.views.toLocaleString()}</span>
          <span>·</span>
          <span>{trend.time}</span>
        </div>
      </div>
      <div className="font-mono text-[10px] font-bold flex-shrink-0 text-right leading-tight"
        style={{ color: HEAT_COLOR[trend.heatLevel] }}>
        <div>{trend.engagementRate > 0 ? `${trend.engagementRate}%` : '—'}</div>
        <div className="text-[8px] tracking-wider">{trend.heatLevel}</div>
      </div>
    </button>
  );
}
