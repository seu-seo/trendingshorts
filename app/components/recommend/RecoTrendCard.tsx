'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { Trend } from '@/lib/types';

const PLATFORM_BADGE_STYLES: Record<string, React.CSSProperties> = {
  youtube: { background: '#FF0033', color: 'white' },
  tiktok: { background: '#69C9D0', color: 'var(--bg)' },
  instagram: {
    background: 'linear-gradient(135deg, #FF8657, #FF3D7F, #C857FF)',
    color: 'white',
  },
};

export default function RecoTrendCard({ trend, rank }: { trend: Trend; rank: number }) {
  const router = useRouter();
  const setSelectedTrendId = useStore((s) => s.setSelectedTrendId);
  const setTab = useStore((s) => s.setTab);

  const rankClass =
    trend.heatLevel === 'WARM'
      ? 'bg-peak text-bg'
      : trend.heatLevel === 'COLD'
      ? 'bg-fading text-text'
      : 'bg-accent-lime text-bg';


  const handleClick = () => {
    setSelectedTrendId(trend.id);
    setTab('recommend');
    router.push('/recommend');
  };

  return (
    <button
      onClick={handleClick}
      className="bg-surface-1 border border-border rounded-2xl p-3.5 cursor-pointer transition-all hover:border-border-bright hover:-translate-y-px relative overflow-hidden text-left w-full"
    >
      <div
        className={`absolute top-3 right-3 font-mono text-[10px] font-bold py-0.5 px-2 rounded tracking-wide ${rankClass}`}
      >
        #{rank}
      </div>
      <div className="flex gap-2 items-center mb-2.5">
        <span
          className="font-mono text-[9px] font-bold py-0.5 px-1.5 rounded tracking-wider uppercase"
          style={PLATFORM_BADGE_STYLES[trend.platform]}
        >
          {trend.platformLabel}
        </span>
        <span className="font-mono text-[10px] text-text-faint tracking-tight">{trend.time}</span>
      </div>
      <div className="flex gap-3 items-start">
        <div className="w-14 h-14 rounded-xl bg-surface-2 grid place-items-center text-3xl flex-shrink-0">
          {trend.thumb}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-snug mb-1 line-clamp-2 pr-7">
            {trend.title}
          </div>
          <div className="font-mono text-[11px] text-text-dim mb-2.5">{trend.creator}</div>
          <div className="flex gap-3.5 text-[11px] text-text-dim">
            <div className="flex items-center gap-1">👁 {trend.views}</div>
            <div className="flex items-center gap-1">♥ {trend.likes}</div>
            <div className="flex items-center gap-1">↗ {trend.shares}</div>
          </div>
        </div>
      </div>
      <div className="mt-2.5 pt-2.5 border-t border-dashed border-border flex justify-between items-center">
        <span className="font-mono text-[10px] text-text-faint">{trend.hashtags}</span>
        <span className="font-mono text-[10px] font-bold"
          style={{ color: trend.heatLevel === 'HOT' ? '#C8FF57' : trend.heatLevel === 'WARM' ? '#57C8FF' : '#666' }}>
          {trend.engagementRate > 0 ? `${trend.engagementRate}%` : '—'} {trend.heatLevel}
        </span>
      </div>
    </button>
  );
}
