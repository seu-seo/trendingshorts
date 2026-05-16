'use client';

import { useStore } from '@/lib/store';
import { CATEGORY_LABELS } from '@/lib/data/categories';

export default function FilterSummary({ count }: { count: number }) {
  const filterPlatform = useStore((s) => s.filterPlatform);
  const filterCategory = useStore((s) => s.filterCategory);
  const setFilterPlatform = useStore((s) => s.setFilterPlatform);
  const setFilterCategory = useStore((s) => s.setFilterCategory);
  const clearAllFilters = useStore((s) => s.clearAllFilters);

  const platformLabel =
    filterPlatform === 'all'
      ? null
      : filterPlatform === 'youtube'
      ? 'YouTube'
      : filterPlatform === 'tiktok'
      ? 'TikTok'
      : 'Reels';
  const categoryLabel = filterCategory ? CATEGORY_LABELS[filterCategory] : null;

  if (!platformLabel && !categoryLabel) {
    return (
      <div className="px-6 pb-3.5 min-h-7 flex items-center">
        <div className="font-mono text-[10px] text-text-faint tracking-wider uppercase">
          이번 주 <span className="text-accent-lime">{count}</span>건 트렌딩
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-3.5 flex gap-1.5 flex-wrap items-center min-h-7">
      {platformLabel && (
        <span
          className="inline-flex items-center gap-1 pl-2.5 pr-2 py-1 border rounded-full text-[11px] font-medium"
          style={{
            background: 'rgba(200, 255, 87, 0.08)',
            borderColor: 'rgba(200, 255, 87, 0.3)',
            color: 'var(--accent-lime)',
          }}
        >
          {platformLabel}
          <button
            onClick={() => setFilterPlatform('all')}
            className="bg-transparent border-none text-accent-lime cursor-pointer w-3.5 h-3.5 grid place-items-center text-[13px] leading-none opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </span>
      )}
      {categoryLabel && (
        <span
          className="inline-flex items-center gap-1 pl-2.5 pr-2 py-1 border rounded-full text-[11px] font-medium"
          style={{
            background: 'rgba(200, 255, 87, 0.08)',
            borderColor: 'rgba(200, 255, 87, 0.3)',
            color: 'var(--accent-lime)',
          }}
        >
          {categoryLabel}
          <button
            onClick={() => setFilterCategory(null)}
            className="bg-transparent border-none text-accent-lime cursor-pointer w-3.5 h-3.5 grid place-items-center text-[13px] leading-none opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </span>
      )}
      <button
        onClick={clearAllFilters}
        className="bg-transparent border-none text-text-faint font-mono text-[10px] tracking-wider uppercase cursor-pointer py-1 ml-1 hover:text-text-dim"
      >
        CLEAR ALL
      </button>
    </div>
  );
}
