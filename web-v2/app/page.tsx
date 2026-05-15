'use client';

import Link from 'next/link';
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
  const persona = useStore((s) => s.persona);
  const hasPersona = !!persona;
  const personaResult = useStore((s) => s.personaResult);
  const personaInput = useStore((s) => s.personaInput);

  const CATEGORY_LABEL: Record<string, string> = {
    food: '요리/먹방', beauty: '뷰티/패션', lifestyle: '라이프스타일',
    edu: '정보/자기계발', gaming: '게임', fitness: '운동/건강', art: '예술',
    dance: '댄스', pets: '반려동물',
  };

  useEffect(() => {
    setTab('dashboard');
  }, [setTab]);

  useEffect(() => {
    // YouTube 먼저 빠르게 로드, TikTok·Instagram 이후 순차 추가
    const platforms = ['youtube', 'tiktok', 'instagram'] as const;
    let accumulated: typeof trends = [];

    (async () => {
      for (const platform of platforms) {
        try {
          const res = await fetch(`/api/trends?platform=${platform}`);
          const json = await res.json();
          if (json.data?.length) {
            accumulated = [...accumulated, ...json.data];
            setTrends([...accumulated]);
          }
        } catch {}
      }
    })();
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

      {/* 온보딩 기반 카테고리 뱃지 */}
      {personaResult && personaInput && (
        <div className="mx-6 mb-4 px-3.5 py-2.5 rounded-xl flex items-center justify-between"
          style={{ background: 'rgba(200,255,87,0.06)', border: '1px solid rgba(200,255,87,0.2)' }}>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[8px] tracking-widest uppercase" style={{ color: 'rgba(200,255,87,0.6)' }}>
              내 카테고리
            </span>
            <span className="font-semibold text-[12px] text-text">
              {CATEGORY_LABEL[personaInput.category] ?? personaInput.category}
            </span>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(200,255,87,0.12)', color: 'var(--accent-lime)' }}>
              {personaResult.personaType}
            </span>
          </div>
          <Link href="/onboarding"
            className="font-mono text-[9px] text-text-faint hover:text-text transition-colors no-underline">
            변경
          </Link>
        </div>
      )}

      {!hasPersona && !personaResult && (
        <Link
          href="/recommend"
          className="mx-6 mb-4 mt-1 px-3.5 py-3 rounded-xl border border-dashed flex items-center justify-between gap-3 no-underline transition-all hover:translate-y-[-1px]"
          style={{
            background: 'linear-gradient(135deg, rgba(200,255,87,0.06), rgba(255,61,127,0.06))',
            borderColor: 'rgba(200, 255, 87, 0.4)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="text-base">✨</div>
            <div className="min-w-0">
              <div className="font-mono text-[9px] tracking-widest text-accent-lime uppercase mb-0.5">
                소재 추천
              </div>
              <div className="text-[12px] text-text leading-tight">
                영상 방향 설문 → 맞춤 소재 + 대본 자동 생성
              </div>
            </div>
          </div>
          <div className="font-mono text-[10px] text-accent-lime tracking-wider uppercase whitespace-nowrap flex-shrink-0">
            시작 →
          </div>
        </Link>
      )}

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
