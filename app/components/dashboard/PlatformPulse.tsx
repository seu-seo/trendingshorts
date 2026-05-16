'use client';

import { useStore } from '@/lib/store';
import type { Platform } from '@/lib/types';

const PLATFORMS: { key: Platform; label: string }[] = [
  { key: 'youtube', label: 'YOUTUBE' },
  { key: 'tiktok', label: 'TIKTOK' },
  { key: 'instagram', label: 'INSTAGRAM' },
];

const PLATFORM_GRADIENTS: Record<Platform, string> = {
  youtube: 'linear-gradient(to right, #FF0033, #FF4466)',
  tiktok: 'linear-gradient(to right, #69C9D0, #25F4EE)',
  instagram: 'linear-gradient(to right, #FF8657, #FF3D7F, #C857FF)',
};

const PLATFORM_TEXT_COLORS: Record<Platform, string> = {
  youtube: '#FF4466',
  tiktok: '#69C9D0',
  instagram: '#FF6699',
};

export default function PlatformPulse() {
  const trends = useStore((s) => s.trends);
  const filterCategory = useStore((s) => s.filterCategory);
  const setActionSheetTrend = useStore((s) => s.setActionSheetTrend);

  const topPerPlatform = PLATFORMS.map((p) => {
    const top = trends
      .filter((t) => t.platform === p.key && (filterCategory === null || t.category === filterCategory))
      .sort((a, b) => b.growth - a.growth)[0];
    return { ...p, top };
  });

  return (
    <div className="px-6 pb-6">
      <div className="flex justify-between items-baseline mb-3.5">
        <div className="font-mono text-[10px] tracking-widest text-accent-lime uppercase flex items-center gap-1.5">
          <span
            className="w-[5px] h-[5px] rounded-full bg-accent-lime animate-pulse-dot"
            style={{ boxShadow: '0 0 6px var(--accent-lime)' }}
          />
          플랫폼별 TOP 1
        </div>
        <div className="font-mono text-[9px] text-text-faint tracking-wider uppercase">
          이번 주 · 3개 플랫폼
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {topPerPlatform.filter(({ top }) => !!top).map(({ key, label, top }) => (
          <button
            key={key}
            onClick={() => setActionSheetTrend(top)}
            className="bg-surface-1 border border-border rounded-2xl p-3 cursor-pointer transition-all hover:border-border-bright hover:-translate-y-0.5 relative overflow-hidden flex flex-col gap-2 text-left"
          >
            <div
              className="absolute top-0 left-0 right-0 h-[3px] opacity-70"
              style={{ background: PLATFORM_GRADIENTS[key] }}
            />
            <div className="flex justify-between items-center mt-1">
              <span
                className="font-mono text-[9px] font-bold tracking-wider uppercase"
                style={{ color: PLATFORM_TEXT_COLORS[key] }}
              >
                {label}
              </span>
              <span className="font-mono text-[9px] text-text-faint tracking-wide">#1</span>
            </div>
            <div
              className="w-full grid place-items-center text-[32px] mt-0.5 relative overflow-hidden rounded-[10px] bg-surface-2"
              style={{ aspectRatio: '1.2 / 1' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, rgba(200, 255, 87, 0.12), transparent 60%)',
                }}
              />
              <span className="relative">{top.thumb}</span>
            </div>
            <div className="text-[11px] font-semibold leading-snug line-clamp-2 min-h-[28px]">
              {top.title}
            </div>
            <div className="font-mono text-[10px] font-bold mt-auto"
              style={{ color: top.lifecycle === 'rising' ? '#C8FF57' : top.lifecycle === 'peak' ? '#57C8FF' : '#666' }}>
              {top.lifecycle === 'rising' ? '▲ RISING' : top.lifecycle === 'peak' ? '◆ PEAK' : '▼ FADING'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
