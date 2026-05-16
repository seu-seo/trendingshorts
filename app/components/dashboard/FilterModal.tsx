'use client';

import { useStore } from '@/lib/store';
import { CATEGORIES } from '@/lib/data/categories';
import type { PlatformFilter, Category } from '@/lib/types';

const PLATFORMS: { value: PlatformFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Reels' },
];

export default function FilterModal() {
  const open = useStore((s) => s.filterModalOpen);
  const close = () => useStore.getState().setFilterModalOpen(false);
  const filterPlatform = useStore((s) => s.filterPlatform);
  const filterCategory = useStore((s) => s.filterCategory);
  const setFilterPlatform = useStore((s) => s.setFilterPlatform);
  const setFilterCategory = useStore((s) => s.setFilterCategory);
  const clearAllFilters = useStore((s) => s.clearAllFilters);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-end animate-fade-in"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={close}
    >
      <div
        className="bg-bg w-full max-h-[88%] overflow-y-auto rounded-t-3xl border-t border-border-bright p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-surface-3 rounded-sm mx-auto mb-5" />

        <div className="font-mono text-[10px] tracking-widest text-accent-lime uppercase mb-2">
          FILTER
        </div>
        <div className="font-display text-2xl leading-tight mb-2">트렌드 필터</div>
        <div className="text-sm text-text-dim mb-6 leading-relaxed">
          원하는 조건으로 트렌드를 좁혀보세요.
        </div>

        <div className="mb-5">
          <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase mb-2.5">
            플랫폼
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setFilterPlatform(p.value)}
                className={`px-3.5 py-2 border rounded-full text-sm transition-all font-body ${
                  filterPlatform === p.value
                    ? 'border-accent-lime text-accent-lime'
                    : 'border-border bg-surface-1 text-text-dim'
                }`}
                style={
                  filterPlatform === p.value
                    ? { background: 'rgba(200, 255, 87, 0.1)' }
                    : {}
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase mb-2.5">
            카테고리
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterCategory(null)}
              className={`px-3.5 py-2 border rounded-full text-sm transition-all font-body ${
                filterCategory === null
                  ? 'border-accent-lime text-accent-lime'
                  : 'border-border bg-surface-1 text-text-dim'
              }`}
              style={
                filterCategory === null ? { background: 'rgba(200, 255, 87, 0.1)' } : {}
              }
            >
              전체
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setFilterCategory(c.value as Category)}
                className={`px-3.5 py-2 border rounded-full text-sm transition-all font-body ${
                  filterCategory === c.value
                    ? 'border-accent-lime text-accent-lime'
                    : 'border-border bg-surface-1 text-text-dim'
                }`}
                style={
                  filterCategory === c.value ? { background: 'rgba(200, 255, 87, 0.1)' } : {}
                }
              >
                {c.emoji} {c.label.split(' / ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5 mt-2">
          <button
            onClick={clearAllFilters}
            className="flex-1 py-3.5 rounded-xl border border-border bg-surface-1 text-text-dim font-mono text-xs font-semibold tracking-wider uppercase transition-all hover:bg-surface-2 hover:text-text"
          >
            초기화
          </button>
          <button
            onClick={close}
            className="flex-1 py-3.5 rounded-xl bg-accent-lime text-bg font-mono text-xs font-semibold tracking-wider uppercase transition-all"
            style={{ boxShadow: '0 0 0 transparent' }}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
