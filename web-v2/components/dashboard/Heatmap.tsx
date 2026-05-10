'use client';

import { CATEGORY_LABELS } from '@/lib/data/categories';
import { useStore } from '@/lib/store';
import type { Category, Platform, Trend } from '@/lib/types';

const CATS: Category[] = ['food', 'beauty', 'dance', 'lifestyle', 'gaming', 'pets'];
const PLATFORMS: Platform[] = ['youtube', 'tiktok', 'instagram'];
const PLATFORM_SHORT: Record<Platform, string> = { youtube: 'YT', tiktok: 'TT', instagram: 'IG' };
const CAT_EMOJIS: Record<Category, string> = {
  food: '🍔', beauty: '💄', dance: '💃', lifestyle: '📹', gaming: '🎮', pets: '🐶',
};

function getIntensity(trends: Trend[], cat: Category, platform: Platform): number {
  const matching = trends.filter((t) => t.category === cat && t.platform === platform);
  if (matching.length === 0) return 0;
  return matching.reduce((sum, t) => sum + Math.max(0, t.growth), 0) / matching.length;
}

export default function Heatmap() {
  const trends = useStore((s) => s.trends);
  const setFilterCategory = useStore((s) => s.setFilterCategory);
  const setFilterPlatform = useStore((s) => s.setFilterPlatform);

  const allIntensities: number[] = [];
  CATS.forEach((c) => PLATFORMS.forEach((p) => allIntensities.push(getIntensity(trends, c, p))));
  const maxIntensity = Math.max(...allIntensities);

  const intensityClass = (value: number) => {
    if (value === 0) return 'l1';
    const ratio = value / maxIntensity;
    if (ratio > 0.85) return 'l5';
    if (ratio > 0.6) return 'l4';
    if (ratio > 0.4) return 'l3';
    if (ratio > 0.2) return 'l2';
    return 'l1';
  };

  const intensityStyle = (lvl: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      l1: { background: 'rgba(200, 255, 87, 0.06)', color: 'var(--text-faint)' },
      l2: { background: 'rgba(200, 255, 87, 0.16)', color: 'var(--text-dim)' },
      l3: { background: 'rgba(200, 255, 87, 0.32)', color: 'var(--text)' },
      l4: { background: 'rgba(200, 255, 87, 0.55)', color: 'var(--bg)' },
      l5: { background: 'var(--accent-lime)', color: 'var(--bg)', boxShadow: '0 0 12px rgba(200, 255, 87, 0.3)' },
    };
    return map[lvl] || map.l1;
  };

  const cellLabel = (value: number) => (value === 0 ? '—' : `${Math.round(value)}%`);

  const onCellClick = (cat: Category, p: Platform) => {
    setFilterCategory(cat);
    setFilterPlatform(p);
    setTimeout(() => {
      document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="px-6 pb-6">
      <div className="flex justify-between items-baseline mb-3.5">
        <div className="font-mono text-[10px] tracking-widest text-accent-pink uppercase flex items-center gap-1.5">
          <span
            className="w-[5px] h-[5px] rounded-full bg-accent-pink"
            style={{ boxShadow: '0 0 6px var(--accent-pink)' }}
          />
          카테고리 적합도
        </div>
        <div className="font-mono text-[9px] text-text-faint tracking-wider uppercase">
          이번 주 평균 성장률
        </div>
      </div>

      <div className="bg-surface-1 border border-border rounded-2xl p-4 overflow-hidden">
        <div className="grid font-mono" style={{ gridTemplateColumns: '70px 1fr 1fr 1fr', gap: 0 }}>
          {/* Header row */}
          <div className="py-2 px-1 text-left font-mono text-[9px] text-text-faint tracking-wider uppercase border-b border-border">
            CATEGORY
          </div>
          {PLATFORMS.map((p) => (
            <div
              key={p}
              className="py-2 px-1 text-center font-mono text-[9px] text-text-faint tracking-wider uppercase border-b border-border"
            >
              {PLATFORM_SHORT[p]}
            </div>
          ))}

          {/* Data rows */}
          {CATS.map((cat) => (
            <div key={cat} className="contents">
              <div className="py-3 pr-1 text-[11px] font-semibold text-text flex items-center gap-1.5 font-body">
                <span className="text-sm">{CAT_EMOJIS[cat]}</span>
                <span>{CATEGORY_LABELS[cat]}</span>
              </div>
              {PLATFORMS.map((p) => {
                const intensity = getIntensity(trends, cat, p);
                const lvl = intensityClass(intensity);
                return (
                  <div key={p} className="py-1.5 px-1 flex items-center justify-center">
                    <button
                      onClick={() => onCellClick(cat, p)}
                      className="w-full rounded-md flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all hover:scale-105 hover:z-10 hover:outline-1 hover:outline hover:outline-text"
                      style={{ aspectRatio: '2.4 / 1', ...intensityStyle(lvl) }}
                    >
                      {cellLabel(intensity)}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-dashed border-border font-mono text-[9px] text-text-faint tracking-wide uppercase">
          <span>LOW</span>
          <span className="flex items-center gap-1">
            {['l1', 'l2', 'l3', 'l4', 'l5'].map((lvl) => (
              <span
                key={lvl}
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: intensityStyle(lvl).background }}
              />
            ))}
          </span>
          <span>HIGH</span>
        </div>
      </div>
    </div>
  );
}
