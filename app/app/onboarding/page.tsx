'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { PersonaInput, PersonaResult, AppIntent, OnboardingCategory } from '@/lib/types';

const ACCENT = ['#C8FF57', '#57C8FF', '#FF8657', '#C857FF'] as const;

const QUESTIONS = [
  {
    id: 'platform' as keyof PersonaInput,
    label: '주로 활동하는 플랫폼은 어디인가요?',
    type: 'single' as const,
    options: [
      { value: 'youtube', label: 'YouTube Shorts' },
      { value: 'tiktok', label: 'TikTok' },
      { value: 'instagram', label: 'Instagram Reels' },
      { value: 'multi', label: '멀티플랫폼' },
    ],
  },
  {
    id: 'category' as keyof PersonaInput,
    label: '내 채널의 주요 카테고리는?',
    type: 'single' as const,
    options: [
      { value: 'food', label: '요리 / 먹방' },
      { value: 'beauty', label: '뷰티 / 패션' },
      { value: 'lifestyle', label: '라이프스타일 / 일상' },
      { value: 'edu', label: '정보 / 자기계발' },
      { value: 'gaming', label: '게임 / 엔터테인먼트' },
      { value: 'fitness', label: '운동 / 건강' },
      { value: 'art', label: '예술 / 크리에이티브' },
    ],
  },
  {
    id: 'experience' as keyof PersonaInput,
    label: '숏폼 크리에이터 경력이 얼마나 됩니까?',
    type: 'slider' as const,
    slider: { min: 0, max: 5, labels: ['채널 없음', '1개월 미만', '1~6개월', '6개월~1년', '1~3년', '3년 이상'] },
  },
  {
    id: 'goal' as keyof PersonaInput,
    label: '지금 가장 원하는 목표는?',
    type: 'single' as const,
    options: [
      { value: 'growth', label: '구독자 / 팔로워 증가' },
      { value: 'monetize', label: '수익화 시작' },
      { value: 'brand', label: '브랜드 인지도 구축' },
      { value: 'community', label: '팬덤 / 커뮤니티' },
    ],
  },
  {
    id: 'styles' as keyof PersonaInput,
    label: '내 콘텐츠 스타일 키워드는? (최대 3개)',
    type: 'multi' as const,
    multiMax: 3,
    options: [
      { value: 'humor', label: '🎭 유머 / 웃음' },
      { value: 'info', label: '💡 정보 / 교육' },
      { value: 'emotion', label: '🤍 감성 / 공감' },
      { value: 'impact', label: '⚡ 자극 / 임팩트' },
      { value: 'honest', label: '📝 솔직 / 현실' },
      { value: 'visual', label: '✨ 비주얼 / 심미' },
      { value: 'challenge', label: '🔥 챌린지 / 트렌드' },
      { value: 'creative', label: '🧪 실험 / 독창성' },
    ],
  },
  {
    id: 'pain' as keyof PersonaInput,
    label: '숏폼 제작에서 가장 힘든 부분은?',
    type: 'single' as const,
    options: [
      { value: 'idea', label: '아이디어가 안 떠올라요' },
      { value: 'trend', label: '트렌드를 어떻게 써야 할지 모르겠어요' },
      { value: 'reach', label: '영상을 만들어도 반응이 없어요' },
      { value: 'consistency', label: '꾸준히 못하겠어요' },
    ],
  },
  {
    id: 'uploadFreq' as keyof PersonaInput,
    label: '앞으로 주당 몇 편을 올리고 싶나요?',
    type: 'single' as const,
    options: [
      { value: 'low', label: '1편 이하' },
      { value: 'mid', label: '1~2편' },
      { value: 'high', label: '3편 이상' },
      { value: 'undecided', label: '미정' },
    ],
  },
] as const;

const DEFAULT: PersonaInput = {
  platform: 'youtube', category: 'lifestyle', experience: 0,
  goal: 'growth', styles: [], pain: 'idea', uploadFreq: 'mid',
};

const LIFECYCLE = {
  rising: { icon: '▲', label: 'RISING', color: '#C8FF57' },
  peak:   { icon: '◆', label: 'PEAK',   color: '#57C8FF' },
  fading: { icon: '▼', label: 'FADING', color: '#888' },
} as const;

const INTENT_OPTIONS: { value: AppIntent; emoji: string; label: string; sub: string }[] = [
  { value: 'explore', emoji: '📊', label: '트렌드 확인', sub: '내 카테고리 트렌드 탐색' },
  { value: 'produce', emoji: '🎬', label: '제작 도움',   sub: '대본·콘티 바로 생성' },
];

type Screen = 'intro' | 'survey' | 'loading' | 'result';

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const [screen, setScreen] = useState<Screen>('intro');
  const [step, setStep]     = useState(0);
  const [answers, setAnswers] = useState<PersonaInput>({ ...DEFAULT });
  const [result, setResult]   = useState<PersonaResult | null>(null);
  const [progress, setProgress] = useState(0);

  const q = QUESTIONS[step];
  const val = answers[q.id];
  const accent = result ? ACCENT[result.typeIndex ?? 0] : ACCENT[0];

  function setAnswer(id: keyof PersonaInput, value: unknown) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  function toggleMulti(id: keyof PersonaInput, value: string, max: number) {
    setAnswers(prev => {
      const cur = (prev[id] as string[]) ?? [];
      const next = cur.includes(value)
        ? cur.filter(v => v !== value)
        : cur.length < max ? [...cur, value] : cur;
      return { ...prev, [id]: next };
    });
  }

  function canProceed() {
    if (q.type === 'multi') return (val as string[]).length > 0;
    return val !== undefined && String(val) !== '';
  }

  function next() {
    if (!canProceed()) return;
    if (step < QUESTIONS.length - 1) setStep(s => s + 1);
    else startAnalysis();
  }

  function back() {
    if (step > 0) setStep(s => s - 1);
    else setScreen('intro');
  }

  async function startAnalysis() {
    setScreen('loading');
    setProgress(0);
    const timer = setInterval(() => setProgress(p => Math.min(p + 8, 90)), 300);
    try {
      const res = await fetch('/api/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      const data: PersonaResult = await res.json();
      setResult(data);
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => setScreen('result'), 400);
    } catch {
      clearInterval(timer);
      setScreen('result');
    }
  }

  function handleIntent(intent: AppIntent) {
    if (!result) return;
    completeOnboarding(answers, result, intent);
    if (intent === 'produce') router.push('/recommend');
    else router.push('/');
  }

  // ── 인트로 ─────────────────────────────────────────────────
  if (screen === 'intro') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center"
      style={{ background: 'var(--bg)' }}>
      <div className="text-5xl mb-6">⚡</div>
      <h1 className="font-display text-[30px] leading-tight tracking-tight text-text mb-3">
        나만의 크리에이터<br />
        <span style={{ color: ACCENT[0] }}>페르소나</span>를 찾아보세요
      </h1>
      <p className="text-[13px] text-text-dim leading-relaxed mb-10 max-w-[280px]">
        7가지 질문으로 내 채널에 맞는 트렌드와<br />오늘 찍을 콘텐츠 방향을 알려드립니다.
      </p>
      <button
        onClick={() => setScreen('survey')}
        className="w-full max-w-[320px] py-4 rounded-2xl font-semibold text-[15px] tracking-wide"
        style={{ background: ACCENT[0], color: '#0a0a0a' }}
      >
        시작하기 →
      </button>
    </div>
  );

  // ── 설문 ───────────────────────────────────────────────────
  if (screen === 'survey') return (
    <div className="px-6 py-8 pb-10" style={{ background: 'var(--bg)' }}>
      {/* 진행 바 */}
      <div className="mb-6">
        <div className="flex justify-between font-mono text-[9px] text-text-faint mb-2">
          <span>Q{step + 1} / {QUESTIONS.length}</span>
          <button onClick={back} className="text-text-faint hover:text-text transition-colors">← 이전</button>
        </div>
        <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-1 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%`, background: ACCENT[0] }} />
        </div>
      </div>

      {/* 질문 */}
      <div className="text-[18px] font-semibold text-text leading-snug mb-6">{q.label}</div>

      {/* 단일 선택 */}
      {'options' in q && q.type === 'single' && (
        <div className="flex flex-col gap-2.5 mb-8">
          {q.options.map(opt => {
            const sel = val === opt.value;
            return (
              <button key={opt.value} onClick={() => setAnswer(q.id, opt.value)}
                className="w-full py-3.5 px-4 rounded-xl text-left text-[14px] font-medium transition-all"
                style={{
                  background: sel ? `${ACCENT[0]}18` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${sel ? ACCENT[0] : 'rgba(255,255,255,0.1)'}`,
                  color: sel ? ACCENT[0] : 'rgba(255,255,255,0.85)',
                  fontWeight: sel ? 600 : 400,
                }}>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 다중 선택 */}
      {'options' in q && q.type === 'multi' && (
        <div className="grid grid-cols-2 gap-2.5 mb-8">
          {q.options.map(opt => {
            const sel = (val as string[])?.includes(opt.value);
            return (
              <button key={opt.value}
                onClick={() => toggleMulti(q.id, opt.value, ('multiMax' in q ? q.multiMax : 3) ?? 3)}
                className="py-3 px-3 rounded-xl text-left text-[13px] transition-all"
                style={{
                  background: sel ? `${ACCENT[0]}18` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${sel ? ACCENT[0] : 'rgba(255,255,255,0.1)'}`,
                  color: sel ? ACCENT[0] : 'rgba(255,255,255,0.85)',
                  fontWeight: sel ? 600 : 400,
                }}>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 슬라이더 */}
      {'slider' in q && q.type === 'slider' && (
        <div className="mb-8">
          <input type="range" min={q.slider.min} max={q.slider.max} value={val as number}
            onChange={e => setAnswer(q.id, Number(e.target.value))}
            className="w-full cursor-pointer"
            style={{ accentColor: ACCENT[0] }}
          />
          <div className="mt-4 py-3.5 px-4 rounded-xl text-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-[18px] font-bold" style={{ color: ACCENT[0] }}>
              {q.slider.labels.length > 0
                ? q.slider.labels[val as number]
                : `주 ${val}편`}
            </span>
          </div>
        </div>
      )}

      <button onClick={next} disabled={!canProceed()}
        className="w-full py-4 rounded-2xl font-semibold text-[15px] transition-all"
        style={{
          background: canProceed() ? ACCENT[0] : 'rgba(255,255,255,0.08)',
          color: canProceed() ? '#0a0a0a' : 'rgba(255,255,255,0.3)',
          cursor: canProceed() ? 'pointer' : 'default',
        }}>
        {step < QUESTIONS.length - 1 ? '다음' : '분석 시작'}
      </button>
    </div>
  );

  // ── 로딩 ───────────────────────────────────────────────────
  if (screen === 'loading') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--bg)' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="text-4xl mb-6" style={{ display: 'inline-block', animation: 'spin 1.5s linear infinite' }}>⚙️</div>
      <h2 className="text-[20px] font-bold text-text mb-2">페르소나 분석 중...</h2>
      <p className="text-[13px] text-text-dim mb-8">AI가 내 채널을 분석하고 있습니다</p>
      <div className="w-60 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-1 rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, background: ACCENT[0] }} />
      </div>
    </div>
  );

  // ── 결과 ───────────────────────────────────────────────────
  if (screen === 'result' && result) return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--bg)' }}>
      <div className="max-w-[480px] mx-auto px-5 pt-8">

        {/* 페르소나 카드 */}
        <div className="rounded-2xl p-7 mb-3 text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}40` }}>
          <div className="font-mono text-[9px] tracking-[0.2em] mb-2.5" style={{ color: accent }}>YOUR PERSONA</div>
          <div className="font-display text-[28px] font-black tracking-tight mb-1.5" style={{ color: accent }}>
            {result.personaType}
          </div>
          <div className="text-[13px] text-text-dim">{result.personaTagline}</div>
        </div>

        {/* 분석 요약 */}
        <ResultSection title="페르소나 분석" accent={accent}>
          <p className="text-[13px] text-text leading-relaxed">{result.personaSummary}</p>
        </ResultSection>

        {/* 채널 Fit 트렌드 */}
        <ResultSection title="채널 Fit 트렌드 TOP 3" accent={accent}>
          {result.topTrends.map((t, i) => {
            const lc = LIFECYCLE[t.state];
            return (
              <div key={i} className="flex gap-3 mb-4 last:mb-0 items-start">
                <div className="font-mono text-[10px] font-bold min-w-[54px] pt-0.5" style={{ color: lc.color }}>
                  {lc.icon} {lc.label}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[13px] font-semibold" style={{ color: accent }}>{t.keyword}</span>
                    <span className="font-mono text-[10px] text-text-faint">Fit {t.fitScore}%</span>
                  </div>
                  <p className="text-[11px] text-text-dim leading-snug">{t.reason}</p>
                </div>
              </div>
            );
          })}
        </ResultSection>

        {/* 추천 훅 패턴 */}
        <ResultSection title="추천 훅 패턴" accent={accent}>
          {result.hookPatterns.map((h, i) => (
            <div key={i} className="rounded-xl px-3.5 py-3 mb-2.5 last:mb-0"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="font-mono text-[9px] font-bold mb-1.5" style={{ color: accent }}>{h.type}</div>
              <p className="text-[12px] text-text leading-snug">&ldquo;{h.example}&rdquo;</p>
            </div>
          ))}
        </ResultSection>

        {/* 이번 주 플랜 */}
        <ResultSection title="이번 주 콘텐츠 플랜" accent={accent}>
          <p className="text-[13px] text-text leading-relaxed">{result.weeklyPlan}</p>
        </ResultSection>

        {/* 지금 당장 할 일 */}
        <ResultSection title="지금 당장 할 일 3가지" accent={accent}>
          {result.actionItems.map((a, i) => (
            <div key={i} className="flex gap-3 mb-4 last:mb-0">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                style={{ background: accent, color: '#0a0a0a' }}>{i + 1}</div>
              <div>
                <div className="text-[13px] font-semibold text-text mb-0.5">{a.title}</div>
                <p className="text-[11px] text-text-dim leading-snug">{a.desc}</p>
              </div>
            </div>
          ))}
        </ResultSection>

        {/* 의도 선택 — 어디로 갈지 */}
        <div className="mt-5 rounded-2xl p-5"
          style={{ background: 'rgba(200,255,87,0.04)', border: '1px solid rgba(200,255,87,0.2)' }}>
          <div className="font-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: ACCENT[0] }}>
            NEXT STEP
          </div>
          <div className="text-[15px] font-semibold text-text mb-4">지금 무엇을 하고 싶나요?</div>
          <div className="flex flex-col gap-2.5">
            {INTENT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => handleIntent(opt.value)}
                className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-left transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <span className="text-xl">{opt.emoji}</span>
                <div>
                  <div className="text-[13px] font-semibold text-text">{opt.label}</div>
                  <div className="font-mono text-[9px] text-text-faint">{opt.sub}</div>
                </div>
                <span className="ml-auto font-mono text-[10px]" style={{ color: ACCENT[0] }}>→</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => { setStep(0); setAnswers({ ...DEFAULT }); setScreen('intro'); }}
          className="mt-3 w-full py-3 rounded-xl font-mono text-[11px] text-text-faint transition-colors hover:text-text"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          설문 다시하기
        </button>
      </div>
    </div>
  );

  return null;
}

function ResultSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 mb-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="font-mono text-[9px] tracking-[0.15em] font-bold mb-3" style={{ color: accent }}>
        {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
}
