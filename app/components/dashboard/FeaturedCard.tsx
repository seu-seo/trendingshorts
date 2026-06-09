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

export default function FeaturedCard({ trend }: { trend: Trend }) {
  const router = useRouter();
  const setSelectedTrendId = useStore((s) => s.setSelectedTrendId);
  const setTab = useStore((s) => s.setTab);

  const handleClick = () => {
    setSelectedTrendId(trend.id);
    setTab('recommend');
    router.push('/recommend');
  };

  return (
    <div className="px-6 pb-5" id="featured-section">
      <div className="font-mono text-[9px] tracking-widest text-accent-lime uppercase mb-2 flex items-center gap-1.5">
        <span
          className="w-[5px] h-[5px] rounded-full bg-accent-lime"
          style={{ boxShadow: '0 0 6px var(--accent-lime)' }}
        />
        이번 주 1위
      </div>

      <button
        onClick={handleClick}
        className="bg-surface-1 border border-border-bright rounded-[18px] overflow-hidden cursor-pointer transition-all hover:border-accent-lime hover:-translate-y-0.5 relative w-full text-left"
      >
        <div
          className="h-[140px] grid place-items-center text-[64px] relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--surface-2), var(--surface-3))',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, rgba(200, 255, 87, 0.15), transparent 60%)',
            }}
          />
          <span
            className="absolute top-3 left-3 font-mono text-[9px] font-bold py-0.5 px-2 rounded tracking-wider uppercase"
            style={PLATFORM_BADGE_STYLES[trend.platform]}
          >
            {trend.platformLabel}
          </span>
          <span
            className="absolute top-3 right-3 font-mono text-[9px] font-bold px-2 py-0.5 rounded tracking-wider"
            style={{ background: 'rgba(0,0,0,0.6)', color: trend.heatLevel === 'HOT' ? '#C8FF57' : trend.heatLevel === 'WARM' ? '#57C8FF' : '#666' }}
          >
            {trend.engagementRate > 0 ? `${trend.engagementRate}%` : '—'} {trend.heatLevel}
          </span>
          <span
            className="relative"
            style={{ filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.4))' }}
          >
            {trend.thumb}
          </span>
        </div>
        <div className="p-4 pt-4">
          <div className="text-[17px] font-semibold leading-tight mb-1.5">{trend.title}</div>
          <div className="font-mono text-[11px] text-text-dim mb-3">
            {trend.creator} · {trend.time}
          </div>
          <div className="flex gap-4 pt-3 border-t border-border text-xs text-text-dim">
            <div className="flex items-center gap-1">👁 {trend.views.toLocaleString()}</div>
            <div className="flex items-center gap-1">♥ {trend.likes.toLocaleString()}</div>
            <div className="flex items-center gap-1">↗ {trend.shares.toLocaleString()}</div>
          </div>
        </div>
      </button>
    </div>
  );
}
