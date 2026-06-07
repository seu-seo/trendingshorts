'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import CategoryTabs from '@/components/dashboard/CategoryTabs';
import PlatformTabs from '@/components/dashboard/PlatformTabs';
import PlatformPulse from '@/components/dashboard/PlatformPulse';
import KeywordInsight from '@/components/dashboard/KeywordInsight';
import TrendRow from '@/components/dashboard/TrendRow';
import TrendActionSheet from '@/components/dashboard/TrendActionSheet';
import WeeklyIssues from '@/components/dashboard/WeeklyIssues';

export default function DashboardPage() {
  const setTab = useStore((s) => s.setTab);
  const trends = useStore((s) => s.trends);
  const setTrends = useStore((s) => s.setTrends);
  const filterPlatform = useStore((s) => s.filterPlatform);
  const filterCategory = useStore((s) => s.filterCategory);
  const persona = useStore((s) => s.persona);
  const hasPersona = !!persona;
  const personaResult = useStore((s) => s.personaResult);
  const personaInput = useStore((s) => s.personaInput);

  const CATEGORY_LABEL: Record<string, string> = {
    food: '요리/먹방', beauty: '뷰티/패션', lifestyle: '라이프스타일',
    edu: '정보/자기계발', gaming: '게임', fitness: '운동/건강', art: '예술/음악',
  };

  useEffect(() => {
    setTab('dashboard');
  }, [setTab]);

  useEffect(() => {
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

  // 카테고리 필터만 적용 — PlatformPulse·KeywordInsight에 사용 (3개 플랫폼 전체)
  const categoryFiltered = useMemo(() => {
    let result = trends;
    if (filterCategory) {
      result = result.filter((t) => t.category === filterCategory);
    }
    return [...result].sort((a, b) => b.engagementRate - a.engagementRate);
  }, [trends, filterCategory]);

  // 카테고리 + 플랫폼 필터 — 트렌드 목록에 사용
  const platformFiltered = useMemo(() => {
    return categoryFiltered.filter((t) => t.platform === filterPlatform);
  }, [categoryFiltered, filterPlatform]);

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

      {/* ── 1. 카테고리 탭 ─────────────────────────────── */}
      <CategoryTabs />

      {/* ── 2. 이번 주 주요 이슈 (Gemini + Google Search) ── */}
      <WeeklyIssues category={filterCategory} />

      {/* ── 3. 플랫폼별 TOP 1 (카테고리 기준, 3개 플랫폼 항상 표시) ── */}
      <PlatformPulse />

      {/* ── 4. 키워드 트렌드 (카테고리 기준, 전체 플랫폼) ─── */}
      <KeywordInsight trends={categoryFiltered} category={filterCategory} />

      {/* ── 5. 트렌드 목록 (카테고리 + 플랫폼 선택) ──────── */}
      <div className="px-6 pt-2 pb-2 flex items-baseline justify-between">
        <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase">
          트렌드 목록
        </div>
        <div className="font-mono text-[9px] text-text-faint">
          {platformFiltered.length}개
        </div>
      </div>
      <PlatformTabs />

      {platformFiltered.length === 0 ? (
        <div className="text-center py-14 px-8 text-text-faint">
          <div className="text-4xl mb-4 opacity-40">📭</div>
          <div className="font-display text-lg text-text-dim mb-1 tracking-tight">데이터 없음</div>
          <div className="text-xs leading-relaxed text-text-faint">
            다른 플랫폼을 선택해보세요
          </div>
        </div>
      ) : (
        <div className="px-6 pb-6">
          {platformFiltered.map((t, i) => (
            <TrendRow key={t.id} trend={t} rank={i + 1} />
          ))}
        </div>
      )}

      <TrendActionSheet />
    </>
  );
}
