'use client';

import { useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import PlatformPulse from '@/components/dashboard/PlatformPulse';
import Heatmap from '@/components/dashboard/Heatmap';
import SearchBar from '@/components/dashboard/SearchBar';
import FilterSummary from '@/components/dashboard/FilterSummary';
import FilterModal from '@/components/dashboard/FilterModal';
import FeaturedCard from '@/components/dashboard/FeaturedCard';
import TrendRow from '@/components/dashboard/TrendRow';

export default function DashboardPage() {
  const setTab = useStore((s) => s.setTab);
  const trends = useStore((s) => s.trends);
  const setTrends = useStore((s) => s.setTrends);
  const filterPlatform = useStore((s) => s.filterPlatform);
  const filterCategory = useStore((s) => s.filterCategory);
  const searchQuery = useStore((s) => s.searchQuery);

  useEffect(() => {
    setTab('dashboard');
  }, [setTab]);

  useEffect(() => {
    fetch('/api/trends')
      .then((r) => r.json())
      .then((json) => { if (json.data?.length) setTrends(json.data); })
      .catch(() => {});
  }, [setTrends]);

  const filtered = useMemo(() => {
    let result = trends;

    if (filterPlatform !== 'all') {
      result = result.filter((t) => t.platform === filterPlatform);
    }
    if (filterCategory) {
      result = result.filter((t) => t.category === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.creator.toLowerCase().includes(q) ||
          t.hashtags.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => b.growth - a.growth);
  }, [trends, filterPlatform, filterCategory, searchQuery]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      <div className="px-6 pb-3.5 flex justify-between items-end">
        <div className="font-display text-[32px] leading-none tracking-tight">
          이번 주 <span className="text-accent-lime">트렌드</span>
          <br />
          한눈에 비교
        </div>
        <div className="font-mono text-[9px] text-text-faint tracking-widest uppercase">
          06 MAY · 7 DAYS
        </div>
      </div>

      <PlatformPulse />
      <Heatmap />
      <SearchBar />
      <FilterSummary count={filtered.length} />

      {filtered.length === 0 ? (
        <div className="text-center py-16 px-8 text-text-faint">
          <div className="text-4xl mb-4 opacity-50">🔍</div>
          <div className="font-display text-xl text-text-dim mb-2 tracking-tight">결과 없음</div>
          <div className="text-xs leading-relaxed text-text-faint">
            검색어나 필터를 조정해보세요
          </div>
        </div>
      ) : (
        <>
          {featured && <FeaturedCard trend={featured} />}
          {rest.length > 0 && (
            <>
              <div className="px-6 pt-1 pb-3 font-mono text-[10px] tracking-widest text-text-faint uppercase">
                이어지는 {rest.length}개 트렌드
              </div>
              <div className="px-6">
                {rest.map((t, i) => (
                  <TrendRow key={t.id} trend={t} rank={i + 2} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <FilterModal />
    </>
  );
}
