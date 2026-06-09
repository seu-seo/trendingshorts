'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

// ── 디자인 토큰 ──────────────────────────────────────────────────

const ACCENT  = '#C8FF57';
const BG      = '#0A0A0A';
const CARD    = '#1A1A1A';
const BORDER  = '#2A2A30';
const TEXT    = '#F2F0EB';
const DIM     = '#8A8A92';
const FAINT   = '#5A5A62';

const FONT_HEADING = "'Cafe24 Dangdanghae', Impact, sans-serif";
const FONT_BODY    = "'Pretendard', 'Instrument Sans', sans-serif";

const OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export default function GoalPage() {
  const router     = useRouter();
  const weeklyGoal = useStore((s) => s.weeklyGoal);
  const setWeeklyGoal = useStore((s) => s.setWeeklyGoal);

  const [selected, setSelected] = useState<number>(weeklyGoal || 0);

  function handleSave() {
    if (selected < 1) return;
    setWeeklyGoal(selected);
    router.replace('/my');
  }

  return (
    <div className="flex flex-col px-6 pt-6 pb-10" style={{ background: BG, minHeight: '100%' }}>

      {/* 헤더 */}
      <button onClick={() => router.replace('/my')}
        className="font-mono text-[10px] tracking-wider mb-8 self-start transition-opacity hover:opacity-60"
        style={{ color: FAINT }}>
        ← 마이
      </button>

      <h2 className="leading-[0.9] tracking-tight mb-3"
        style={{ fontFamily: FONT_HEADING, fontSize: '40px', color: TEXT }}>
        주간 업로드<br />
        <span style={{ color: ACCENT }}>목표는?</span>
      </h2>
      <p className="text-[13px] leading-[1.6] mb-9" style={{ fontFamily: FONT_BODY, color: DIM }}>
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
                background: sel ? `${ACCENT}12` : CARD,
                border:     `1.5px solid ${sel ? ACCENT : BORDER}`,
              }}>
              <span style={{
                fontFamily: FONT_HEADING,
                fontSize:   '22px',
                lineHeight: 1,
                color:      sel ? ACCENT : TEXT,
              }}>
                {n}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 font-mono text-[10px] tracking-wider text-center"
        style={{ color: selected > 0 ? ACCENT : FAINT }}>
        {selected > 0 ? `주 ${selected}회 업로드` : '횟수를 선택하세요'}
      </p>

      {/* 저장 */}
      <button onClick={handleSave}
        className="w-full py-[18px] rounded-2xl text-[15px] font-semibold mt-10 transition-all active:scale-[0.98]"
        style={{
          background: selected > 0 ? ACCENT : '#1A1A1A',
          color:      selected > 0 ? BG     : '#3A3A42',
          fontFamily: FONT_BODY,
          cursor:     selected > 0 ? 'pointer' : 'default',
        }}>
        저장하기
      </button>
    </div>
  );
}
