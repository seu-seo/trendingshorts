'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { AgeGroup, PersonaResult } from '@/lib/types';

// ── 디자인 토큰 ──────────────────────────────────────────────────

const ACCENT  = '#C8FF57';
const BG      = '#0A0A0A';
const SURFACE = '#111114';
const BORDER  = '#2A2A30';
const TEXT    = '#F2F0EB';
const DIM     = '#8A8A92';
const FAINT   = '#5A5A62';

const FONT_HEADING = "'Cafe24 Dangdanghae', Impact, sans-serif";
const FONT_BODY    = "'Pretendard', 'Instrument Sans', sans-serif";

// ── 상수 ─────────────────────────────────────────────────────────

const PLATFORMS = [
  { value: 'youtube',   label: 'YouTube Shorts' },
  { value: 'tiktok',    label: 'TikTok'          },
  { value: 'instagram', label: 'Instagram Reels' },
];

const KEYWORD_MAP: { triggers: string[]; chips: string[] }[] = [
  { triggers: ['요리', '먹방', '쿠킹', '음식', '레시피', '쉐프', '베이킹'], chips: ['#먹방', '#요리', '#쿠킹', '#레시피'] },
  { triggers: ['뷰티', '메이크업', '화장', '스킨케어', '피부', '코스메틱'], chips: ['#뷰티', '#메이크업', '#스킨케어', '#GRWM'] },
  { triggers: ['패션', '옷', 'ootd', '스타일', '코디', '룩', '의류'],       chips: ['#패션', '#OOTD', '#코디', '#스타일링'] },
  { triggers: ['라이프', '일상', '브이로그', '데일리', '브이'],              chips: ['#일상', '#브이로그', '#데일리', '#라이프스타일'] },
  { triggers: ['정보', '공부', '자기계발', '꿀팁', '교육', '지식'],         chips: ['#정보', '#꿀팁', '#자기계발', '#공부'] },
  { triggers: ['게임', '롤', '배그', '리그', '스팀', 'fps', 'rpg'],         chips: ['#게임', '#게임방송', '#리뷰', '#공략'] },
  { triggers: ['운동', '헬스', '다이어트', '홈트', '피트니스', '필라테스'], chips: ['#운동', '#헬스', '#홈트레이닝', '#다이어트'] },
  { triggers: ['예술', '그림', '드로잉', '음악', '악기', '그래픽'],         chips: ['#예술', '#드로잉', '#음악', '#크리에이티브'] },
  { triggers: ['댄스', '춤', '안무', 'kpop', '케이팝', '아이돌'],           chips: ['#댄스', '#챌린지', '#KPOP', '#안무'] },
  { triggers: ['여행', '해외', '국내', '캠핑', '투어', '맛집'],             chips: ['#여행', '#브이로그', '#맛집', '#투어'] },
  { triggers: ['펫', '강아지', '고양이', '반려', '동물'],                   chips: ['#반려동물', '#강아지', '#고양이', '#펫'] },
];

const AGE_GROUPS: { value: AgeGroup; label: string; range: string }[] = [
  { value: '10s', label: '10대', range: '13 – 19' },
  { value: '20s', label: '20대', range: '20 – 29' },
  { value: '30s', label: '30대', range: '30 – 39' },
  { value: '40s', label: '40대', range: '40 – 49' },
  { value: '50+', label: '50대+', range: '50 –'   },
];

const LIFECYCLE_STYLE: Record<string, { label: string; color: string }> = {
  rising: { label: '▲ RISING', color: ACCENT     },
  peak:   { label: '◆ PEAK',   color: '#57C8FF'  },
  fading: { label: '▼ FADING', color: '#6A6A72'  },
};

type Screen = 'intro' | 'step1' | 'step2' | 'step3' | 'loading' | 'result';

const STEP_ORDER: Screen[] = ['step1', 'step2', 'step3'];
const TOTAL_STEPS = STEP_ORDER.length;

// ── 컴포넌트 ─────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const [screen,       setScreen]       = useState<Screen>('intro');
  const [platforms,    setPlatforms]    = useState<string[]>([]);
  const [category,     setCategory]     = useState('');
  const [ageGroup,     setAgeGroup]     = useState<AgeGroup | ''>('');
  const [personaResult, setPersonaResult] = useState<PersonaResult | null>(null);
  const [progress,     setProgress]     = useState(0);

  const stepIndex   = STEP_ORDER.indexOf(screen);
  const currentStep = stepIndex + 1;

  // ── 헬퍼 ───────────────────────────────────────────────────────

  function goBack() {
    const prev: Record<Screen, Screen> = {
      intro: 'intro', step1: 'intro', step2: 'step1',
      step3: 'step2', loading: 'step3', result: 'step3',
    };
    setScreen(prev[screen]);
  }

  function togglePlatform(value: string) {
    setPlatforms(prev =>
      prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
    );
  }

  function advance(to: Screen) {
    setScreen(to);
    window.scrollTo({ top: 0 });
  }

  // Q3 → API 호출 → 로딩 → 결과
  async function handleCallPersona() {
    if (!ageGroup) return;
    setScreen('loading');
    setProgress(0);

    const timer = setInterval(() => {
      setProgress(p => (p < 88 ? p + 9 : p));
    }, 250);

    try {
      const res = await fetch('/api/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform:    platforms[0] ?? 'youtube',
          category,
          experience:  2,
          goal:        'growth',
          styles:      [],
          pain:        'idea',
          uploadFreq:  'mid',
        }),
      });
      const data: PersonaResult = await res.json();
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => { setPersonaResult(data); setScreen('result'); }, 350);
    } catch {
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => setScreen('result'), 350);
    }
  }

  // 결과 카드 → 완료
  function handleFinish() {
    completeOnboarding(platforms, category.trim(), ageGroup as AgeGroup, personaResult ?? undefined);
    router.replace('/');
  }

  // Q2 자동 매칭 칩
  const suggestedChips = useMemo(() => {
    const q = category.trim().toLowerCase();
    if (!q) return [];
    const matched = new Set<string>();
    for (const { triggers, chips } of KEYWORD_MAP) {
      if (triggers.some(t => q.includes(t) || t.includes(q))) {
        chips.forEach(c => matched.add(c));
      }
    }
    return [...matched].slice(0, 8);
  }, [category]);

  // ── 인트로 ────────────────────────────────────────────────────

  if (screen === 'intro') return (
    <div className="flex flex-col justify-between px-6 pt-12 pb-10"
      style={{ background: BG, minHeight: '100%' }}>
      <div>
        <span className="font-mono text-[10px] tracking-[0.28em] uppercase" style={{ color: ACCENT }}>
          SHORTFORM PULSE
        </span>
        <h1 className="mt-12 leading-[0.86] tracking-tight"
          style={{ fontFamily: FONT_HEADING, fontSize: '76px', color: TEXT }}>
          BEGIN<br />YOUR<br /><span style={{ color: ACCENT }}>STORY</span>
        </h1>
        <p className="mt-7 text-[14px] leading-[1.65]" style={{ fontFamily: FONT_BODY, color: DIM }}>
          3가지 질문으로 내 채널에 맞는<br />트렌드를 바로 확인하세요.
        </p>
      </div>
      <div className="flex flex-col gap-3 mt-14">
        <p className="font-mono text-[9px] tracking-[0.2em] text-center uppercase" style={{ color: BORDER }}>
          플랫폼 · 카테고리 · 연령대
        </p>
        <button onClick={() => advance('step1')}
          className="w-full py-[18px] rounded-2xl text-[15px] font-semibold tracking-wide transition-all active:scale-[0.98]"
          style={{ background: ACCENT, color: BG, fontFamily: FONT_BODY }}>
          시작하기
        </button>
      </div>
    </div>
  );

  // ── 로딩 ──────────────────────────────────────────────────────

  if (screen === 'loading') return (
    <div className="flex flex-col items-center justify-center text-center px-6"
      style={{ background: BG, minHeight: '100%', paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="w-2.5 h-2.5 rounded-full mb-10 animate-pulse-dot"
        style={{ background: ACCENT, boxShadow: `0 0 14px ${ACCENT}` }} />
      <h2 className="leading-[0.9] tracking-tight mb-4"
        style={{ fontFamily: FONT_HEADING, fontSize: '36px', color: TEXT }}>
        페르소나<br />분석 중
      </h2>
      <p className="text-[13px] mb-14 leading-relaxed" style={{ fontFamily: FONT_BODY, color: DIM }}>
        내 채널에 맞는 트렌드를<br />준비하고 있습니다
      </p>
      <div className="w-52 h-[2px] rounded-full" style={{ background: '#1A1A1A' }}>
        <div className="h-[2px] rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, background: ACCENT }} />
      </div>
      <p className="font-mono text-[9px] tracking-widest mt-4" style={{ color: FAINT }}>
        {progress}%
      </p>
    </div>
  );

  // ── 결과 카드 ─────────────────────────────────────────────────

  if (screen === 'result') return (
    <div className="flex flex-col px-5 pt-8 pb-10 gap-3"
      style={{ background: BG, minHeight: '100%' }}>

      {/* 페르소나 헤더 카드 */}
      <div className="rounded-2xl p-6"
        style={{ background: SURFACE, border: `1px solid ${ACCENT}30` }}>
        <p className="font-mono text-[9px] tracking-[0.22em] mb-4" style={{ color: ACCENT }}>
          YOUR PERSONA
        </p>
        <h2 className="leading-[0.88] tracking-tight mb-2"
          style={{ fontFamily: FONT_HEADING, fontSize: '38px', color: ACCENT }}>
          {personaResult?.personaType ?? 'THE CREATOR'}
        </h2>
        <p className="text-[13px] leading-snug" style={{ fontFamily: FONT_BODY, color: DIM }}>
          {personaResult?.personaTagline}
        </p>
      </div>

      {/* 분석 요약 */}
      {personaResult?.personaSummary && (
        <div className="rounded-xl p-5" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <p className="font-mono text-[9px] tracking-[0.15em] mb-2.5" style={{ color: FAINT }}>
            ANALYSIS
          </p>
          <p className="text-[13px] leading-[1.7]" style={{ fontFamily: FONT_BODY, color: TEXT }}>
            {personaResult.personaSummary}
          </p>
        </div>
      )}

      {/* 채널 Fit 트렌드 */}
      {personaResult?.topTrends && personaResult.topTrends.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <p className="font-mono text-[9px] tracking-[0.15em] mb-4" style={{ color: FAINT }}>
            FIT TRENDS TOP 3
          </p>
          {personaResult.topTrends.map((t, i) => {
            const lc = LIFECYCLE_STYLE[t.state] ?? LIFECYCLE_STYLE.fading;
            return (
              <div key={i} className="flex gap-3 items-start mb-4 last:mb-0">
                <span className="font-mono text-[9px] font-bold min-w-[54px] pt-0.5"
                  style={{ color: lc.color }}>
                  {lc.label}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[13px] font-semibold" style={{ fontFamily: FONT_BODY, color: ACCENT }}>
                      {t.keyword}
                    </span>
                    <span className="font-mono text-[9px]" style={{ color: FAINT }}>
                      Fit {t.fitScore}%
                    </span>
                  </div>
                  <p className="text-[11px] leading-snug" style={{ fontFamily: FONT_BODY, color: DIM }}>
                    {t.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <button onClick={handleFinish}
        className="w-full py-[18px] rounded-2xl text-[15px] font-semibold mt-2 transition-all active:scale-[0.98]"
        style={{ background: ACCENT, color: BG, fontFamily: FONT_BODY }}>
        트렌드 보러가기
      </button>

      <button onClick={() => { setScreen('step3'); setPersonaResult(null); }}
        className="w-full py-3 rounded-xl font-mono text-[10px] tracking-wider transition-opacity hover:opacity-60"
        style={{ background: 'transparent', color: FAINT }}>
        다시 선택하기
      </button>
    </div>
  );

  // ── 스텝 공통 래퍼 ───────────────────────────────────────────

  return (
    <div className="flex flex-col px-6 pt-6 pb-10"
      style={{ background: BG, minHeight: '100%' }}>

      {/* 진행 표시 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2.5">
          <button onClick={goBack}
            className="font-mono text-[10px] tracking-wider transition-opacity hover:opacity-60"
            style={{ color: FAINT }}>
            ← 이전
          </button>
          <span className="font-mono text-[10px] tracking-widest" style={{ color: FAINT }}>
            {String(currentStep).padStart(2, '0')} / 0{TOTAL_STEPS}
          </span>
        </div>
        <div className="h-[2px] w-full rounded-full" style={{ background: '#1A1A1A' }}>
          <div className="h-[2px] rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%`, background: ACCENT }} />
        </div>
      </div>

      {/* ── Step 1: 플랫폼 선택 ──────────────────────────────── */}
      {screen === 'step1' && (
        <>
          <h2 className="leading-[0.9] tracking-tight mb-8"
            style={{ fontFamily: FONT_HEADING, fontSize: '46px', color: TEXT }}>
            어떤 플랫폼에서<br />
            <span style={{ color: ACCENT }}>활동하나요?</span>
          </h2>

          <div className="flex flex-col gap-3">
            {PLATFORMS.map(p => {
              const sel = platforms.includes(p.value);
              return (
                <button key={p.value} onClick={() => togglePlatform(p.value)}
                  className="w-full py-[18px] px-5 rounded-xl text-left transition-all active:scale-[0.99]"
                  style={{
                    background: sel ? `${ACCENT}12` : SURFACE,
                    border:     `1.5px solid ${sel ? ACCENT : BORDER}`,
                    color:      sel ? ACCENT : TEXT,
                    fontSize:   '15px',
                    fontWeight: sel ? 600 : 400,
                    fontFamily: FONT_BODY,
                  }}>
                  {p.label}
                </button>
              );
            })}
          </div>

          <p className="mt-3 font-mono text-[9px] tracking-wider" style={{ color: FAINT }}>
            복수 선택 가능
          </p>

          <button onClick={() => { if (platforms.length > 0) advance('step2'); }}
            className="w-full py-[18px] rounded-2xl text-[15px] font-semibold mt-10 transition-all active:scale-[0.98]"
            style={{
              background: platforms.length > 0 ? ACCENT : '#1A1A1A',
              color:      platforms.length > 0 ? BG     : '#3A3A42',
              fontFamily: FONT_BODY,
              cursor:     platforms.length > 0 ? 'pointer' : 'default',
            }}>
            다음
          </button>
        </>
      )}

      {/* ── Step 2: 카테고리 입력 ────────────────────────────── */}
      {screen === 'step2' && (
        <>
          <h2 className="leading-[0.9] tracking-tight mb-10"
            style={{ fontFamily: FONT_HEADING, fontSize: '46px', color: TEXT }}>
            내 채널의<br />
            <span style={{ color: ACCENT }}>카테고리는?</span>
          </h2>

          <div className="mb-8">
            <input type="text" value={category} onChange={e => setCategory(e.target.value)}
              placeholder="예: 뷰티, 먹방, 게임..." autoFocus
              className="w-full pb-3 pt-1 bg-transparent outline-none text-[20px] transition-colors placeholder:text-text-faint"
              style={{
                borderBottom: `2px solid ${category.trim() ? ACCENT : BORDER}`,
                color:        TEXT,
                fontFamily:   FONT_BODY,
                caretColor:   ACCENT,
              }} />
          </div>

          <div className="min-h-[88px]">
            {suggestedChips.length > 0 && (
              <>
                <p className="font-mono text-[9px] tracking-[0.18em] mb-3" style={{ color: FAINT }}>
                  추천 태그
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedChips.map(chip => (
                    <button key={chip} onClick={() => setCategory(chip.replace('#', ''))}
                      className="py-1.5 px-3 rounded-full font-mono text-[11px] tracking-wider transition-all active:scale-[0.96]"
                      style={{
                        background: `${ACCENT}0F`,
                        border:     `1px solid ${ACCENT}50`,
                        color:      ACCENT,
                      }}>
                      {chip}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button onClick={() => { if (category.trim()) advance('step3'); }}
            className="w-full py-[18px] rounded-2xl text-[15px] font-semibold mt-10 transition-all active:scale-[0.98]"
            style={{
              background: category.trim() ? ACCENT : '#1A1A1A',
              color:      category.trim() ? BG     : '#3A3A42',
              fontFamily: FONT_BODY,
              cursor:     category.trim() ? 'pointer' : 'default',
            }}>
            다음
          </button>
        </>
      )}

      {/* ── Step 3: 연령대 선택 ──────────────────────────────── */}
      {screen === 'step3' && (
        <>
          <h2 className="leading-[0.9] tracking-tight mb-8"
            style={{ fontFamily: FONT_HEADING, fontSize: '46px', color: TEXT }}>
            주요 시청자<br />
            <span style={{ color: ACCENT }}>연령대는?</span>
          </h2>

          <div className="flex flex-col gap-2.5">
            {AGE_GROUPS.map(ag => {
              const sel = ageGroup === ag.value;
              return (
                <button key={ag.value} onClick={() => setAgeGroup(ag.value)}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all active:scale-[0.99]"
                  style={{
                    background: sel ? `${ACCENT}12` : SURFACE,
                    border:     `1.5px solid ${sel ? ACCENT : BORDER}`,
                  }}>
                  <span style={{
                    fontFamily: FONT_HEADING,
                    fontSize:   '26px',
                    lineHeight: 1,
                    color:      sel ? ACCENT : TEXT,
                  }}>
                    {ag.label}
                  </span>
                  <span className="font-mono text-[10px] tracking-wider"
                    style={{ color: sel ? `${ACCENT}80` : FAINT }}>
                    {ag.range}
                  </span>
                </button>
              );
            })}
          </div>

          <button onClick={handleCallPersona}
            className="w-full py-[18px] rounded-2xl text-[15px] font-semibold mt-8 transition-all active:scale-[0.98]"
            style={{
              background: ageGroup ? ACCENT : '#1A1A1A',
              color:      ageGroup ? BG     : '#3A3A42',
              fontFamily: FONT_BODY,
              cursor:     ageGroup ? 'pointer' : 'default',
            }}>
            트렌드 보러가기
          </button>
        </>
      )}
    </div>
  );
}
