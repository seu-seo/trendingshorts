'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { AgeGroup } from '@/lib/types';

const ACCENT = '#C8FF57';
const BG = '#0A0A0A';
const SURFACE = '#111114';
const BORDER = '#2A2A30';
const TEXT = '#F2F0EB';
const DIM = '#8A8A92';

const PLATFORMS = [
  { value: 'tiktok',    label: '틱톡' },
  { value: 'instagram', label: '인스타그램' },
  { value: 'youtube',   label: '유튜브' },
];

const CAT_CHIPS = [
  { value: 'food',      label: '먹방' },
  { value: 'beauty',    label: '뷰티' },
  { value: 'fitness',   label: '운동' },
  { value: 'lifestyle', label: '여행/일상' },
  { value: 'gaming',    label: '게임' },
  { value: 'art',       label: '음악/예술' },
  { value: 'edu',       label: '정보/꿀팁' },
];

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: '10s', label: '10대' },
  { value: '20s', label: '20대' },
  { value: '30s', label: '30대' },
  { value: '40s', label: '40대' },
  { value: '50+', label: '50+' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const [screen, setScreen] = useState<'welcome' | 'setup'>('welcome');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [catChip, setCatChip] = useState('');
  const [catText, setCatText] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('');

  const category = catText.trim() || catChip;
  const canSubmit = !!category;

  function togglePlatform(v: string) {
    setPlatforms(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  }

  function selectCatChip(v: string) {
    setCatChip(prev => prev === v ? '' : v);
    setCatText('');
  }

  function handleTextInput(v: string) {
    setCatText(v);
    if (v.trim()) setCatChip('');
  }

  function finish(skip = false) {
    const finalCat = skip ? 'lifestyle' : category;
    const finalAge = (skip ? '20s' : ageGroup || '20s') as AgeGroup;
    const finalPlatforms = platforms.length > 0 ? platforms : ['youtube', 'tiktok', 'instagram'];
    completeOnboarding(finalPlatforms, finalCat, finalAge, null);
    router.replace('/');
  }

  // ── Welcome ──────────────────────────────────────────────────
  if (screen === 'welcome') return (
    <div className="flex flex-col justify-between px-6 pt-14 pb-10" style={{ background: BG, minHeight: '100%' }}>
      <div>
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase mb-14" style={{ color: ACCENT }}>
          SHORTFORM PULSE
        </div>
        <div className="leading-[0.86] tracking-tight"
          style={{ fontFamily: "'Cafe24 Dangdanghae', Impact, sans-serif", fontSize: '72px', color: TEXT }}>
          CREATE<br />YOUR<br /><span style={{ color: ACCENT }}>STORY.</span>
        </div>
        <p className="mt-6 text-[14px] leading-[1.65]" style={{ color: DIM }}>
          내가 만들어서 특별한<br />1인 크리에이터를 꿈꾸는 당신에게.
        </p>
      </div>
      <div className="flex flex-col gap-3 mt-14">
        <button
          onClick={() => setScreen('setup')}
          className="w-full py-[18px] rounded-2xl text-[15px] font-semibold tracking-wide"
          style={{ background: ACCENT, color: BG }}>
          시작하기
        </button>
        <button
          onClick={() => finish(true)}
          className="w-full py-3 font-mono text-[11px] tracking-widest"
          style={{ color: DIM }}>
          건너뛰기
        </button>
      </div>
    </div>
  );

  // ── Setup (single scrollable page) ──────────────────────────
  return (
    <div className="flex flex-col" style={{ background: BG, minHeight: '100%' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0">
        <button
          onClick={() => setScreen('welcome')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-[20px]"
          style={{ color: TEXT }}>
          ←
        </button>
        <span className="text-[14px] font-semibold" style={{ color: TEXT }}>취향 설정</span>
        <button
          onClick={() => finish(true)}
          className="font-mono text-[12px] tracking-wider"
          style={{ color: DIM }}>
          건너뛰기
        </button>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto pb-4" style={{ scrollbarWidth: 'none' }}>

        {/* Q1: 플랫폼 */}
        <div className="px-5 py-5">
          <div className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1.5" style={{ color: DIM }}>플랫폼</div>
          <div className="text-[16px] font-semibold mb-4" style={{ color: TEXT, letterSpacing: '-0.01em' }}>
            어떤 플랫폼 자주 봐요?
          </div>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => {
              const sel = platforms.includes(p.value);
              return (
                <button key={p.value} onClick={() => togglePlatform(p.value)}
                  className="px-4 py-2.5 text-[14px] transition-all active:scale-95"
                  style={{
                    borderRadius: 4,
                    border: `1px solid ${sel ? ACCENT : BORDER}`,
                    background: sel ? `${ACCENT}18` : 'transparent',
                    color: sel ? ACCENT : TEXT,
                    fontWeight: sel ? 600 : 400,
                  }}>
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ height: 1, background: BORDER, margin: '0 20px', opacity: 0.6 }} />

        {/* Q2: 카테고리 */}
        <div className="px-5 py-5">
          <div className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1.5" style={{ color: DIM }}>카테고리</div>
          <div className="text-[16px] font-semibold mb-4" style={{ color: TEXT, letterSpacing: '-0.01em' }}>
            어떤 분야가 궁금해요?
          </div>
          <div className="flex flex-wrap gap-2">
            {CAT_CHIPS.map(c => {
              const sel = catChip === c.value && !catText.trim();
              return (
                <button key={c.value} onClick={() => selectCatChip(c.value)}
                  className="px-3 py-1.5 text-[12px] transition-all active:scale-95"
                  style={{
                    borderRadius: 3,
                    border: `1px solid ${sel ? ACCENT : BORDER}`,
                    background: sel ? `${ACCENT}18` : 'transparent',
                    color: sel ? ACCENT : DIM,
                    fontWeight: sel ? 600 : 400,
                  }}>
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* 또는 divider */}
          <div className="flex items-center gap-2.5 my-3">
            <div style={{ flex: 1, height: 1, background: BORDER }} />
            <span className="font-mono text-[9px] tracking-[0.12em]" style={{ color: DIM }}>또는</span>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
          </div>

          {/* 직접 입력 */}
          <input
            type="text"
            value={catText}
            onChange={e => handleTextInput(e.target.value)}
            placeholder="직접 입력 (예: 반려동물, 댄스...)"
            className="w-full bg-transparent outline-none text-[13px] pb-2"
            style={{
              borderBottom: `2px solid ${catText.trim() ? ACCENT : BORDER}`,
              color: TEXT,
              caretColor: ACCENT,
            }}
          />
        </div>

        <div style={{ height: 1, background: BORDER, margin: '0 20px', opacity: 0.6 }} />

        {/* Q3: 연령대 */}
        <div className="px-5 py-5">
          <div className="font-mono text-[9px] tracking-[0.18em] uppercase mb-1.5" style={{ color: DIM }}>시청자 연령</div>
          <div className="text-[16px] font-semibold mb-4" style={{ color: TEXT, letterSpacing: '-0.01em' }}>
            타깃 연령대가 어떻게 돼요?
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {AGE_GROUPS.map(ag => {
              const sel = ageGroup === ag.value;
              return (
                <button key={ag.value} onClick={() => setAgeGroup(ag.value)}
                  className="py-2.5 text-center text-[13px] transition-all active:scale-95"
                  style={{
                    borderRadius: 4,
                    border: `1px solid ${sel ? ACCENT : BORDER}`,
                    background: sel ? `${ACCENT}18` : 'transparent',
                    color: sel ? ACCENT : DIM,
                    fontWeight: sel ? 600 : 400,
                  }}>
                  {ag.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>

      {/* 하단 CTA */}
      <div className="px-5 pb-8 pt-3 flex-shrink-0" style={{ borderTop: `1px solid ${BORDER}` }}>
        <button
          onClick={() => finish(false)}
          disabled={!canSubmit}
          className="w-full py-[18px] rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.98]"
          style={{
            background: canSubmit ? ACCENT : SURFACE,
            color: canSubmit ? BG : DIM,
            cursor: canSubmit ? 'pointer' : 'default',
          }}>
          트렌드 보러가기
        </button>
      </div>
    </div>
  );
}
