'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import WeeklyIssues from '@/components/dashboard/WeeklyIssues';
import KeywordInsight from '@/components/dashboard/KeywordInsight';
import TrendRow from '@/components/dashboard/TrendRow';
import TrendActionSheet from '@/components/dashboard/TrendActionSheet';
import { applyTheme, clearTheme } from '@/lib/themes/applyTheme';
import type { ThemeName } from '@/lib/themes/types';
import ThemeSwitcher from '@/components/ThemeSwitcher';

// v7 테마 토큰 (globals.css [data-theme] 공급)
const BG = 'var(--color-bg)';
const ACCENT = 'var(--color-primary)';   // 메인 액센트 (구 라임)
const ACCENT2 = 'var(--color-primary-mid)'; // 보조 액센트 (구 블루)
const INK = 'var(--color-ink)';
const DIM3 = 'var(--color-ink-3)';

const CATEGORY_LABEL: Record<string, string> = {
  food: '요리/먹방', beauty: '뷰티/패션', lifestyle: '라이프스타일',
  edu: '정보/자기계발', gaming: '게임', fitness: '운동/건강', art: '예술/음악',
};

const AGE_LABEL: Record<string, string> = {
  '10s': '10대', '20s': '20대', '30s': '30대', '40s': '40대', '50+': '50대+',
};

export default function DashboardPage() {
  const setTab = useStore((s) => s.setTab);
  const trends = useStore((s) => s.trends);
  const setTrends = useStore((s) => s.setTrends);
  const filterCategory = useStore((s) => s.filterCategory);
  const ageGroup = useStore((s) => s.ageGroup);
  const personaResult = useStore((s) => s.personaResult);
  const category = useStore((s) => s.category);

  useEffect(() => { setTab('dashboard'); }, [setTab]);

  // v7 PoC: A(인디고)/C(퍼플) 테마 전환. 이탈 시 해제.
  const [theme, setTheme] = useState<ThemeName>('indigo');
  useEffect(() => {
    applyTheme(theme);
    return () => clearTheme();
  }, [theme]);

  useEffect(() => {
    const platforms = ['youtube', 'tiktok', 'instagram'] as const;
    const OFFSET: Record<string, number> = { youtube: 0, tiktok: 10000, instagram: 20000 };
    (async () => {
      const results = await Promise.all(
        platforms.map(async (platform) => {
          try {
            const res = await fetch(`/api/trends?platform=${platform}`);
            const json = await res.json();
            const offset = OFFSET[platform] ?? 0;
            return (json.data ?? []).map((t: typeof trends[number]) => ({
              ...t,
              id: t.id + offset,
            }));
          } catch {
            return [] as typeof trends;
          }
        })
      );
      setTrends(results.flat());
    })();
  }, [setTrends]);

  // ER 내림차순 정렬 (카테고리 필터 적용)
  const sorted = useMemo(() => {
    let result = trends;
    if (filterCategory) result = result.filter((t) => t.category === filterCategory);
    return [...result].sort((a, b) => b.engagementRate - a.engagementRate);
  }, [trends, filterCategory]);

  const top10 = sorted.slice(0, 10);

  // 개인화 헤더 ("30대 유튜브 트렌드" 등)
  const personaName = personaResult?.personaType
    ? personaResult.personaType.replace(/^THE\s+/i, '')
    : null;
  const ageLabelStr = ageGroup ? AGE_LABEL[ageGroup] : null;
  const catLabelStr = filterCategory ? CATEGORY_LABEL[filterCategory] : (category ? category : null);

  return (
    <div style={{ background: BG, minHeight: '100%' }}>
      <ThemeSwitcher value={theme} onChange={setTheme} options={['indigo', 'purple']} />

      {/* ── 헤더 ──────────────────────────────────────────── */}
      <div className="px-6 pt-1 pb-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: ACCENT }}>
            SHORTFORM PULSE
          </div>
          <div className="font-display text-[26px] leading-tight tracking-tight" style={{ color: INK }}>
            {personaName
              ? <><span style={{ color: ACCENT }}>{personaName}</span>님을 위한<br />오늘의 트렌드</>
              : ageLabelStr
              ? <>{ageLabelStr} {catLabelStr ?? ''}<br /><span style={{ color: ACCENT }}>트렌드</span></>
              : <>이번 주<br /><span style={{ color: ACCENT }}>인기 트렌드</span></>
            }
          </div>
        </div>
        <Link href="/my" onClick={() => useStore.getState().setTab('my')}
          className="w-9 h-9 rounded-full grid place-items-center font-display text-[15px] no-underline flex-shrink-0"
          style={{ background: 'var(--color-primary-soft)', color: ACCENT, border: '1px solid var(--color-primary-mid)' }}>
          {personaName?.[0] ?? (category?.[0]?.toUpperCase() ?? 'M')}
        </Link>
      </div>

      {/* 온보딩 미완료 시 CTA */}
      {!personaResult && (
        <Link
          href="/recommend"
          className="mx-6 mb-4 px-3.5 py-3 rounded-xl border border-dashed flex items-center justify-between gap-3 no-underline transition-all hover:translate-y-[-1px]"
          style={{
            background: 'var(--color-primary-soft)',
            borderColor: 'var(--color-primary-mid)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="text-base">✨</div>
            <div className="min-w-0">
              <div className="font-mono text-[9px] tracking-widest uppercase mb-0.5" style={{ color: ACCENT }}>소재 추천</div>
              <div className="text-[12px] leading-tight" style={{ color: INK }}>영상 방향 설문 → 맞춤 소재 + 대본 자동 생성</div>
            </div>
          </div>
          <div className="font-mono text-[10px] tracking-wider uppercase whitespace-nowrap flex-shrink-0" style={{ color: ACCENT }}>시작 →</div>
        </Link>
      )}

      {/* ── 1. 트렌드 분석 ──────────────────────────────────── */}
      <div className="px-6 mb-1 flex items-center gap-2">
        <span className="w-[5px] h-[5px] rounded-full flex-shrink-0 animate-pulse-dot"
          style={{ background: ACCENT, boxShadow: '0 0 6px var(--color-primary)' }} />
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: ACCENT }}>트렌드 분석</span>
      </div>
      <WeeklyIssues category={filterCategory} trendTitles={top10.map(t => t.title)} />

      {/* ── 2. 키워드 분석 ──────────────────────────────────── */}
      <div className="px-6 mb-1 flex items-center gap-2">
        <span className="w-[5px] h-[5px] rounded-full flex-shrink-0"
          style={{ background: ACCENT2, boxShadow: '0 0 6px var(--color-primary-mid)' }} />
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: ACCENT2 }}>키워드 분석</span>
      </div>
      <KeywordInsight trends={sorted} category={filterCategory} />

      {/* ── 3. 지금 뜨고 있어요 ──────────────────────────────── */}
      <div className="px-6 mb-3 flex items-baseline justify-between">
        <div className="font-display text-[18px] leading-none tracking-tight"
          style={{ letterSpacing: '-0.02em', color: INK }}>
          지금 뜨고 있어요
        </div>
        <span className="font-mono text-[9px] tracking-wider" style={{ color: DIM3 }}>더보기 →</span>
      </div>

      {top10.length === 0 ? (
        <div className="text-center py-14 px-8">
          <div className="text-4xl mb-4 opacity-30">📭</div>
          <div className="font-mono text-[11px] tracking-wider" style={{ color: DIM3 }}>트렌드 데이터를 불러오는 중이에요</div>
        </div>
      ) : (
        <div className="pb-6">
          {top10.map((t, i) => (
            <TrendRow key={t.id} trend={t} rank={i + 1} />
          ))}
        </div>
      )}

      <TrendActionSheet />
    </div>
  );
}
