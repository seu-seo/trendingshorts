'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { applyTheme, clearTheme } from '@/lib/themes/applyTheme';
import type { ThemeName } from '@/lib/themes/types';
import ThemeSwitcher from '@/components/ThemeSwitcher';

// ── 디자인 토큰 ──────────────────────────────────────────────────

const FONT_HEADING = "'Cafe24 Dangdanghae', Impact, sans-serif";
const FONT_BODY    = "'Pretendard', 'Instrument Sans', sans-serif";

const OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export default function GoalPage() {
  const router     = useRouter();
  const weeklyGoal = useStore((s) => s.weeklyGoal);
  const setWeeklyGoal = useStore((s) => s.setWeeklyGoal);

  const [selected, setSelected] = useState<number>(weeklyGoal || 0);
  const [theme, setTheme] = useState<ThemeName>('indigo');
  useEffect(() => { applyTheme(theme); return () => clearTheme(); }, [theme]);

  function handleSave() {
    if (selected < 1) return;
    setWeeklyGoal(selected);
    router.replace('/my');
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100%' }}>
      <ThemeSwitcher value={theme} onChange={setTheme} options={['indigo', 'purple']} />
      <div className="flex flex-col px-6 pt-6 pb-10">

        {/* 헤더 */}
        <button onClick={() => router.replace('/my')}
          className="font-mono text-[10px] tracking-wider mb-8 self-start transition-opacity hover:opacity-60"
          style={{ color: 'var(--color-ink-3)' }}>
          ← 마이
        </button>

        <h2 className="leading-[0.9] tracking-tight mb-3"
          style={{ fontFamily: FONT_HEADING, fontSize: '40px', color: 'var(--color-ink)' }}>
          주간 업로드<br />
          <span style={{ color: 'var(--color-primary)' }}>목표는?</span>
        </h2>
        <p className="text-[13px] leading-[1.6] mb-9" style={{ fontFamily: FONT_BODY, color: 'var(--color-ink-2)' }}>
          일주일에 몇 개의 숏폼을<br />올릴 계획인가요?
        </p>

        {/* 선택지 1~7 */}
        <div className="grid grid-cols-7 gap-2">
          {OPTIONS.map(n => {
            const sel = selected === n;
            return (
              <button key={n} onClick={() => setSelected(n)}
                className="aspect-square rounded-xl flex items-center justify-center transition-all active:scale-[0.96]"
                style={{
                  background: sel ? 'color-mix(in srgb, var(--color-primary) 7%, transparent)' : 'var(--color-surface)',
                  border:     `1.5px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}>
                <span style={{
                  fontFamily: FONT_HEADING,
                  fontSize:   '22px',
                  lineHeight: 1,
                  color:      sel ? 'var(--color-primary)' : 'var(--color-ink)',
                }}>
                  {n}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 font-mono text-[10px] tracking-wider text-center"
          style={{ color: selected > 0 ? 'var(--color-primary)' : 'var(--color-ink-3)' }}>
          {selected > 0 ? `주 ${selected}회 업로드` : '횟수를 선택하세요'}
        </p>

        {/* 저장 */}
        <button onClick={handleSave}
          className="w-full py-[18px] rounded-2xl text-[15px] font-semibold mt-10 transition-all active:scale-[0.98]"
          style={{
            background: selected > 0 ? 'var(--color-primary)' : 'var(--color-surface)',
            color:      selected > 0 ? 'var(--color-bg)'      : 'var(--color-ink-3)',
            fontFamily: FONT_BODY,
            cursor:     selected > 0 ? 'pointer' : 'default',
          }}>
          저장하기
        </button>
      </div>
    </div>
  );
}
