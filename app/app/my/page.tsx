'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import type { Trend } from '@/lib/types';

// ── 상수 ─────────────────────────────────────────────────────────
// BG: 기존 앱과 동일 (#0A0A0B ≈ #0A0A0A). 카드: #1A1A1A (spec)

const CARD    = '#1A1A1A';
const ACCENT  = '#C8FF57';

const PLATFORM_LABEL: Record<string, string> = {
  youtube: 'YT Shorts', tiktok: 'TikTok', instagram: 'IG Reels',
};
const PLATFORM_COLOR: Record<string, string> = {
  youtube: '#FF4466', tiktok: '#69C9D0', instagram: '#FF6699',
};
const AGE_LABEL: Record<string, string> = {
  '10s': '10대', '20s': '20대', '30s': '30대', '40s': '40대', '50+': '50대+',
};
const HEAT_COLOR: Record<string, string> = {
  HOT: '#C8FF57', WARM: '#57C8FF', COLD: '#555',
};

interface SavedScript {
  id: string;
  title: string;
  hook?: string;
  date: string;
}

// ── 서브 컴포넌트 ─────────────────────────────────────────────────

function SectionLabel({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="font-mono text-[10px] tracking-widest text-text-faint uppercase">
        {title}
      </span>
      {count !== undefined && (
        <span className="font-mono text-[9px] text-text-faint">{count}개</span>
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  const isEmpty = value === '--';
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)' }}>
      <span className="font-mono text-[9px] tracking-widest text-text-faint uppercase leading-none">
        {label}
      </span>
      <span className={`font-display text-[30px] leading-none tracking-tight ${
        isEmpty ? 'text-text-faint' : 'text-text'
      }`}>
        {value}
      </span>
    </div>
  );
}

function EmptySlate({ label }: { label: string }) {
  return (
    <div className="rounded-xl py-10 flex items-center justify-center"
      style={{ background: CARD, border: '1px dashed rgba(255,255,255,0.08)' }}>
      <span className="font-mono text-[10px] tracking-widest text-text-faint">{label}</span>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────

export default function MyPage() {
  const setTab        = useStore((s) => s.setTab);
  const platform      = useStore((s) => s.platform);
  const category      = useStore((s) => s.category);
  const ageGroup      = useStore((s) => s.ageGroup);
  const personaResult = useStore((s) => s.personaResult);
  const trends        = useStore((s) => s.trends);
  const weeklyGoal    = useStore((s) => s.weeklyGoal);
  const handles       = useStore((s) => s.handles);

  const savedTrendIds = useStore((s) => s.savedTrendIds);
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);

  useEffect(() => {
    setTab('my');
    try {
      const s = localStorage.getItem('sfp_saved_scripts');
      if (s) setSavedScripts(JSON.parse(s));
    } catch {}
  }, [setTab]);

  const savedTrends: Trend[] = trends.filter(t => savedTrendIds.includes(t.id));

  const connectedHandles = (['youtube', 'tiktok', 'instagram'] as const)
    .map(key => ({ key, value: handles[key] }))
    .filter(h => h.value);

  const avatarLetter = personaResult?.personaType
    ? personaResult.personaType.replace(/^THE\s+/i, '')[0] ?? 'M'
    : (category?.[0]?.toUpperCase() ?? 'M');

  return (
    <div className="bg-bg pb-10">

      {/* ── 1. 프로필 카드 ───────────────────────────────────── */}
      <div className="mx-6 mt-4 rounded-2xl p-5"
        style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)' }}>

        <div className="flex items-start gap-4">
          {/* 아바타 */}
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${ACCENT}14`, border: `1.5px solid ${ACCENT}35` }}>
            <span className="font-display text-[28px] leading-none tracking-tight"
              style={{ color: ACCENT }}>
              {avatarLetter}
            </span>
          </div>

          {/* 텍스트 */}
          <div className="flex-1 min-w-0 pt-0.5">
            {personaResult?.personaType && (
              <div className="font-mono text-[8px] tracking-[0.2em] text-text-faint mb-0.5">
                PERSONA
              </div>
            )}
            <div className="font-display text-[20px] leading-tight tracking-tight text-text mb-1">
              {personaResult?.personaType ?? 'MY CHANNEL'}
            </div>
            <div className="font-mono text-[11px] text-text-dim">
              {category || '--'}
              {AGE_LABEL[ageGroup] && (
                <span className="text-text-faint"> · {AGE_LABEL[ageGroup]}</span>
              )}
            </div>

            {/* 플랫폼 태그 */}
            {platform.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {platform.map(p => (
                  <span key={p}
                    className="font-mono text-[9px] tracking-wider px-2 py-0.5 rounded"
                    style={{
                      background: `${PLATFORM_COLOR[p] ?? '#888'}16`,
                      border:     `1px solid ${PLATFORM_COLOR[p] ?? '#888'}35`,
                      color:       PLATFORM_COLOR[p] ?? 'var(--text-faint)',
                    }}>
                    {PLATFORM_LABEL[p] ?? p}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 연결된 핸들 */}
        {connectedHandles.length > 0 && (
          <div className="mt-4 pt-4 flex flex-col gap-2 border-t border-border">
            {connectedHandles.map(h => (
              <div key={h.key} className="flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-widest text-text-faint uppercase">
                  {PLATFORM_LABEL[h.key] ?? h.key}
                </span>
                <span className="font-mono text-[11px]" style={{ color: PLATFORM_COLOR[h.key] }}>
                  {h.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 팔로워 */}
        <div className="mt-4 pt-4 flex items-center justify-between border-t border-border">
          <span className="font-mono text-[9px] tracking-widest text-text-faint uppercase">
            팔로워
          </span>
          <span className="font-mono text-[12px] text-text-faint">--</span>
        </div>
      </div>

      {/* ── 이번 주 목표 (프로필 아래) ───────────────────────── */}
      {weeklyGoal > 0 && (
        <div className="mx-6 mt-2.5 rounded-xl px-5 py-3.5 flex items-center justify-between"
          style={{ background: CARD, border: `1px solid ${ACCENT}30` }}>
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: ACCENT }}>
            이번 주 목표
          </span>
          <span className="text-[13px] font-medium text-text">주 {weeklyGoal}회</span>
        </div>
      )}

      {/* ── 2. This Week's Insights ──────────────────────────── */}
      <div className="mx-6 mt-6">
        <SectionLabel title="This Week's Insights" />
        <div className="grid grid-cols-2 gap-2.5">
          <KpiCard label="저장 트렌드"   value={savedTrendIds.length > 0 ? savedTrendIds.length : '--'} />
          <KpiCard label="생성 대본"     value={savedScripts.length  > 0 ? savedScripts.length  : '--'} />
          <KpiCard label="팔로워"        value="--" />
          <KpiCard label="이번 주 업로드" value="--" />
        </div>
      </div>

      {/* ── 3. 액션 메뉴 ─────────────────────────────────────── */}
      <div className="mx-6 mt-6">
        <SectionLabel title="Quick Actions" />
        <div className="rounded-xl overflow-hidden"
          style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* 01 */}
          <Link href="/recommend"
            className="flex items-center gap-3 px-4 py-4 border-b border-border no-underline transition-colors hover:bg-white/[0.025]">
            <span className="font-mono text-[10px] font-bold w-5" style={{ color: ACCENT }}>01</span>
            <span className="flex-1 text-[14px] text-text">콘텐츠 만들기</span>
            <span className="font-mono text-[11px]" style={{ color: ACCENT }}>→</span>
          </Link>

          {/* 02 */}
          <Link href="/my/goal"
            className="flex items-center gap-3 px-4 py-4 border-b border-border no-underline transition-colors hover:bg-white/[0.025]">
            <span className="font-mono text-[10px] font-bold w-5" style={{ color: ACCENT }}>02</span>
            <span className="flex-1 text-[14px] text-text">목표 설정하기</span>
            {weeklyGoal > 0 && (
              <span className="font-mono text-[10px] text-text-faint">주 {weeklyGoal}회</span>
            )}
            <span className="font-mono text-[11px]" style={{ color: ACCENT }}>→</span>
          </Link>

          {/* 03 */}
          <Link href="/my/connect"
            className="flex items-center gap-3 px-4 py-4 no-underline transition-colors hover:bg-white/[0.025]">
            <span className="font-mono text-[10px] font-bold w-5" style={{ color: ACCENT }}>03</span>
            <span className="flex-1 text-[14px] text-text">계정 연결하기</span>
            {connectedHandles.length > 0 && (
              <span className="font-mono text-[10px] text-text-faint">{connectedHandles.length}개 연결됨</span>
            )}
            <span className="font-mono text-[11px]" style={{ color: ACCENT }}>→</span>
          </Link>
        </div>
      </div>

      {/* ── 4. 내 컬렉션 ─────────────────────────────────────── */}
      <div className="mx-6 mt-6">
        <SectionLabel title="내 컬렉션" count={savedTrends.length} />

        {savedTrends.length === 0 ? (
          <EmptySlate label="저장한 트렌드가 없어요" />
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {savedTrends.map(t => (
              <div key={t.id} className="rounded-xl p-3.5 flex flex-col gap-2"
                style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-9 h-9 rounded-lg bg-surface-2 text-xl grid place-items-center">
                  {t.thumb}
                </div>
                <p className="text-[12px] font-medium leading-snug line-clamp-2 text-text">
                  {t.title}
                </p>
                <div className="flex items-center gap-1.5 mt-auto pt-1">
                  <span className="font-mono text-[9px] font-bold"
                    style={{ color: HEAT_COLOR[t.heatLevel] ?? 'var(--text-faint)' }}>
                    {t.heatLevel === 'HOT' ? '▲' : t.heatLevel === 'WARM' ? '◆' : '▼'}
                  </span>
                  <span className="font-mono text-[9px] text-text-faint">
                    {PLATFORM_LABEL[t.platform] ?? t.platform}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 5. 저장한 대본·콘티 ──────────────────────────────── */}
      <div className="mx-6 mt-6">
        <SectionLabel title="저장한 대본·콘티" count={savedScripts.length} />

        {savedScripts.length === 0 ? (
          <EmptySlate label="생성한 대본이 없어요" />
        ) : (
          <div className="flex flex-col gap-2">
            {savedScripts.map(s => (
              <div key={s.id}
                className="rounded-xl px-4 py-3.5 flex items-start justify-between gap-3"
                style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate text-text mb-0.5">{s.title}</p>
                  {s.hook && (
                    <p className="text-[11px] text-text-dim line-clamp-1">&ldquo;{s.hook}&rdquo;</p>
                  )}
                  <span className="font-mono text-[9px] text-text-faint mt-1.5 block">{s.date}</span>
                </div>
                <span className="font-mono text-[10px] text-text-faint flex-shrink-0 pt-0.5">→</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 온보딩 재설정 ────────────────────────────────────── */}
      <div className="mx-6 mt-8">
        <button
          onClick={() => { useStore.getState().resetOnboarding(); window.location.replace('/onboarding'); }}
          className="w-full py-3 rounded-xl font-mono text-[10px] tracking-widest text-text-faint transition-opacity hover:opacity-60"
          style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)' }}>
          온보딩 다시하기
        </button>
      </div>

    </div>
  );
}
