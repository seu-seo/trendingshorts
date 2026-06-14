'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import type { Trend } from '@/lib/types';
import type { SavedScript } from '@/lib/store';
import { applyTheme, clearTheme } from '@/lib/themes/applyTheme';
import type { ThemeName } from '@/lib/themes/types';
import ThemeSwitcher from '@/components/ThemeSwitcher';

// ── 상수 ─────────────────────────────────────────────────────────

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
  HOT: 'var(--color-primary)', WARM: 'var(--color-primary-mid)', COLD: 'var(--color-ink-3)',
};


// ── 서브 컴포넌트 ─────────────────────────────────────────────────

function CollectionRow({ trend, onClick }: { trend: Trend; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:bg-white/[0.03]"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <span className="text-xl w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--color-soft)' }}>
        {trend.thumb}
      </span>
      <span className="flex-1 min-w-0 text-[13px] font-medium truncate"
        style={{ color: 'var(--color-ink)' }}>
        {trend.title}
      </span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="font-mono text-[9px] font-bold"
          style={{ color: HEAT_COLOR[trend.heatLevel] ?? 'var(--color-ink-3)' }}>
          {trend.heatLevel === 'HOT' ? '▲' : trend.heatLevel === 'WARM' ? '◆' : '▼'}
        </span>
        <span className="font-mono text-[9px]" style={{ color: 'var(--color-ink-3)' }}>
          {PLATFORM_LABEL[trend.platform] ?? trend.platform}
        </span>
      </div>
      <span className="font-mono text-[11px] flex-shrink-0" style={{ color: 'var(--color-ink-3)' }}>›</span>
    </button>
  );
}

function ScriptRow({ script, onRemove }: { script: SavedScript; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium truncate" style={{ color: 'var(--color-ink)' }}>{script.title}</span>
            {script.hasConti && (
              <span className="font-mono text-[8px] px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}>
                콘티
              </span>
            )}
          </div>
          <span className="font-mono text-[9px]" style={{ color: 'var(--color-ink-3)' }}>{script.date}</span>
        </div>
        <span className="font-mono text-[11px] transition-transform flex-shrink-0"
          style={{ color: 'var(--color-ink-3)', transform: expanded ? 'rotate(90deg)' : 'none' }}>
          ›
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          {script.hook && (
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--color-ink-3)' }}>HOOK · 첫 3초</div>
              <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--color-ink)' }}>{script.hook}</p>
            </div>
          )}
          {script.body && (
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--color-ink-3)' }}>BODY · 본문</div>
              <p className="text-[12px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-ink-2)' }}>{script.body}</p>
            </div>
          )}
          {script.cta && (
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--color-ink-3)' }}>CTA · 마무리</div>
              <p className="text-[12px] leading-relaxed italic" style={{ color: 'var(--color-ink-2)' }}>{script.cta}</p>
            </div>
          )}
          {!script.body && !script.cta && !script.hook && (
            <p className="text-[12px] italic" style={{ color: 'var(--color-ink-3)' }}>저장된 내용이 없어요.</p>
          )}
          <div className="flex justify-end pt-1">
            <button
              onClick={onRemove}
              className="font-mono text-[10px] hover:text-red-400 transition-colors"
              style={{ color: 'var(--color-ink-3)' }}
            >
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
        {title}
      </span>
      {count !== undefined && (
        <span className="font-mono text-[9px]" style={{ color: 'var(--color-ink-3)' }}>{count}개</span>
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  const isEmpty = value === '--';
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <span className="font-mono text-[9px] tracking-widest uppercase leading-none" style={{ color: 'var(--color-ink-3)' }}>
        {label}
      </span>
      <span className="font-display text-[30px] leading-none tracking-tight"
        style={{ color: isEmpty ? 'var(--color-ink-3)' : 'var(--color-ink)' }}>
        {value}
      </span>
    </div>
  );
}

function EmptySlate({ label }: { label: string }) {
  return (
    <div className="rounded-xl py-10 flex items-center justify-center"
      style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border)' }}>
      <span className="font-mono text-[10px] tracking-widest" style={{ color: 'var(--color-ink-3)' }}>{label}</span>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────

export default function MyPage() {
  const [theme, setTheme] = useState<ThemeName>('indigo');
  useEffect(() => { applyTheme(theme); return () => clearTheme(); }, [theme]);

  const setTab        = useStore((s) => s.setTab);
  const platform      = useStore((s) => s.platform);
  const category      = useStore((s) => s.category);
  const ageGroup      = useStore((s) => s.ageGroup);
  const personaResult = useStore((s) => s.personaResult);
  const trends        = useStore((s) => s.trends);
  const weeklyGoal    = useStore((s) => s.weeklyGoal);
  const handles       = useStore((s) => s.handles);

  const savedTrendIds = useStore((s) => s.savedTrendIds);
  const savedScripts = useStore((s) => s.savedScripts);
  const removeSavedScript = useStore((s) => s.removeSavedScript);
  const setActionSheetTrend = useStore((s) => s.setActionSheetTrend);

  useEffect(() => {
    setTab('my');
  }, [setTab]);

  const savedTrends: Trend[] = trends.filter(t => savedTrendIds.includes(t.id));

  const connectedHandles = (['youtube', 'tiktok', 'instagram'] as const)
    .map(key => ({ key, value: handles[key] }))
    .filter(h => h.value);

  const avatarLetter = personaResult?.personaType
    ? personaResult.personaType.replace(/^THE\s+/i, '')[0] ?? 'M'
    : (category?.[0]?.toUpperCase() ?? 'M');

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100%' }} className="pb-10">
      <ThemeSwitcher value={theme} onChange={setTheme} options={['indigo', 'purple']} />

      {/* ── 1. 프로필 카드 ───────────────────────────────────── */}
      <div className="mx-6 mt-4 rounded-2xl p-5"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>

        <div className="flex items-start gap-4">
          {/* 아바타 */}
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1.5px solid color-mix(in srgb, var(--color-primary) 21%, transparent)' }}>
            <span className="font-display text-[28px] leading-none tracking-tight"
              style={{ color: 'var(--color-primary)' }}>
              {avatarLetter}
            </span>
          </div>

          {/* 텍스트 */}
          <div className="flex-1 min-w-0 pt-0.5">
            {personaResult?.personaType && (
              <div className="font-mono text-[8px] tracking-[0.2em] mb-0.5" style={{ color: 'var(--color-ink-3)' }}>
                PERSONA
              </div>
            )}
            <div className="font-display text-[20px] leading-tight tracking-tight mb-1" style={{ color: 'var(--color-ink)' }}>
              {personaResult?.personaType ?? 'MY CHANNEL'}
            </div>
            <div className="font-mono text-[11px]" style={{ color: 'var(--color-ink-2)' }}>
              {category || '--'}
              {AGE_LABEL[ageGroup] && (
                <span style={{ color: 'var(--color-ink-3)' }}> · {AGE_LABEL[ageGroup]}</span>
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
                      color:       PLATFORM_COLOR[p] ?? 'var(--color-ink-3)',
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
          <div className="mt-4 pt-4 flex flex-col gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
            {connectedHandles.map(h => (
              <div key={h.key} className="flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
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
        <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border)' }}>
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'var(--color-ink-3)' }}>
            팔로워
          </span>
          <span className="font-mono text-[12px]" style={{ color: 'var(--color-ink-3)' }}>--</span>
        </div>
      </div>

      {/* ── 이번 주 목표 (프로필 아래) ───────────────────────── */}
      {weeklyGoal > 0 && (
        <div className="mx-6 mt-2.5 rounded-xl px-5 py-3.5 flex items-center justify-between"
          style={{ background: 'var(--color-surface)', border: '1px solid color-mix(in srgb, var(--color-primary) 19%, transparent)' }}>
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-primary)' }}>
            이번 주 목표
          </span>
          <span className="text-[13px] font-medium" style={{ color: 'var(--color-ink)' }}>주 {weeklyGoal}회</span>
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
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>

          {/* 01 */}
          <Link href="/recommend"
            className="flex items-center gap-3 px-4 py-4 no-underline transition-colors hover:bg-white/[0.025]"
            style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="font-mono text-[10px] font-bold w-5" style={{ color: 'var(--color-primary)' }}>01</span>
            <span className="flex-1 text-[14px]" style={{ color: 'var(--color-ink)' }}>콘텐츠 만들기</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--color-primary)' }}>→</span>
          </Link>

          {/* 02 */}
          <Link href="/my/goal"
            className="flex items-center gap-3 px-4 py-4 no-underline transition-colors hover:bg-white/[0.025]"
            style={{ borderBottom: '1px solid var(--color-border)' }}>
            <span className="font-mono text-[10px] font-bold w-5" style={{ color: 'var(--color-primary)' }}>02</span>
            <span className="flex-1 text-[14px]" style={{ color: 'var(--color-ink)' }}>목표 설정하기</span>
            {weeklyGoal > 0 && (
              <span className="font-mono text-[10px]" style={{ color: 'var(--color-ink-3)' }}>주 {weeklyGoal}회</span>
            )}
            <span className="font-mono text-[11px]" style={{ color: 'var(--color-primary)' }}>→</span>
          </Link>

          {/* 03 */}
          <Link href="/my/connect"
            className="flex items-center gap-3 px-4 py-4 no-underline transition-colors hover:bg-white/[0.025]">
            <span className="font-mono text-[10px] font-bold w-5" style={{ color: 'var(--color-primary)' }}>03</span>
            <span className="flex-1 text-[14px]" style={{ color: 'var(--color-ink)' }}>계정 연결하기</span>
            {connectedHandles.length > 0 && (
              <span className="font-mono text-[10px]" style={{ color: 'var(--color-ink-3)' }}>{connectedHandles.length}개 연결됨</span>
            )}
            <span className="font-mono text-[11px]" style={{ color: 'var(--color-primary)' }}>→</span>
          </Link>
        </div>
      </div>

      {/* ── 4. 내 컬렉션 ─────────────────────────────────────── */}
      <div className="mx-6 mt-6">
        <SectionLabel title="내 컬렉션" count={savedTrends.length} />
        {savedTrends.length === 0 ? (
          <EmptySlate label="저장한 트렌드가 없어요" />
        ) : (
          <div className="flex flex-col gap-2">
            {savedTrends.map(t => (
              <CollectionRow
                key={t.id}
                trend={t}
                onClick={() => setActionSheetTrend(t)}
              />
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
              <ScriptRow
                key={s.id}
                script={s}
                onRemove={() => removeSavedScript(s.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 온보딩 재설정 ────────────────────────────────────── */}
      <div className="mx-6 mt-8">
        <button
          onClick={() => { useStore.getState().resetOnboarding(); window.location.replace('/onboarding'); }}
          className="w-full py-3 rounded-xl font-mono text-[10px] tracking-widest transition-opacity hover:opacity-60"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-ink-3)' }}>
          온보딩 다시하기
        </button>
      </div>

    </div>
  );
}
