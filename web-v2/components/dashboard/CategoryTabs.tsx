'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import type { Category, Trend } from '@/lib/types';

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  food:      { emoji: '🍔', label: '먹방' },
  beauty:    { emoji: '💄', label: '뷰티' },
  dance:     { emoji: '💃', label: '댄스' },
  lifestyle: { emoji: '📹', label: '일상' },
  gaming:    { emoji: '🎮', label: '게임' },
  pets:      { emoji: '🐶', label: '펫' },
  edu:       { emoji: '💡', label: '자기계발' },
  fitness:   { emoji: '💪', label: '운동' },
  art:       { emoji: '🎨', label: '예술' },
};

function getActiveCats(trends: Trend[]): Category[] {
  const seen = new Set<Category>();
  trends.forEach(t => seen.add(t.category as Category));
  return Array.from(seen).sort((a, b) => {
    const order = ['lifestyle', 'dance', 'beauty', 'food', 'gaming', 'pets', 'edu', 'fitness', 'art'];
    return order.indexOf(a) - order.indexOf(b);
  });
}

export default function CategoryTabs() {
  const trends = useStore((s) => s.trends);
  const filterCategory = useStore((s) => s.filterCategory);
  const setFilterCategory = useStore((s) => s.setFilterCategory);

  const activeCats = useMemo(() => getActiveCats(trends), [trends]);

  return (
    <div className="px-6 pb-4">
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* 전체 탭 */}
        <Tab
          emoji="📊"
          label="전체"
          active={filterCategory === null}
          onClick={() => setFilterCategory(null)}
        />
        {activeCats.map(cat => {
          const meta = CATEGORY_META[cat] ?? { emoji: '📌', label: cat };
          return (
            <Tab
              key={cat}
              emoji={meta.emoji}
              label={meta.label}
              active={filterCategory === cat}
              onClick={() => setFilterCategory(cat)}
            />
          );
        })}
      </div>
    </div>
  );
}

function Tab({ emoji, label, active, onClick }: {
  emoji: string; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] tracking-wide transition-all"
      style={active ? {
        background: 'rgba(200,255,87,0.15)',
        border: '1px solid rgba(200,255,87,0.5)',
        color: 'var(--accent-lime)',
      } : {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'var(--text-faint)',
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
