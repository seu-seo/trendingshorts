'use client';

import { useState, useRef, useEffect } from 'react';

type Step = 'onboarding' | 'profile' | 'trends' | 'rivals' | 'script';

const STEP_ORDER: Step[] = ['onboarding', 'profile', 'trends', 'rivals', 'script'];

/* ── 상단 스텝바 (진행 N/5 + 뒤로가기) ──────────────────────────── */
function TopNav({ index, total, onBack }: { index: number; total: number; onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px 8px', flexShrink: 0 }}>
      <button
        onClick={onBack}
        disabled={index === 0}
        aria-label="뒤로"
        style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: 'var(--color-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.35 : 1 }}
      >
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--color-ink-2)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <div style={{ flex: 1, display: 'flex', gap: 5, alignItems: 'center' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= index ? 'var(--color-primary)' : 'var(--color-border)', transition: '.3s' }} />
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-ink-2)', flexShrink: 0, minWidth: 30, textAlign: 'right' }}>{index + 1}/{total}</div>
    </div>
  );
}

// 데모 v7-A-indigo 의 큐레이터 4문답
const CONVO = [
  { ai: '안녕하세요! 함께 첫 영상을 만들어볼 Pulse 큐레이터예요. 먼저, 어떤 이유로 숏폼을 시작하고 싶으세요?', hint: '예: 취미로 즐기고 싶어서 / 부업으로 / 일상 기록용' },
  { ai: '좋아요. 그럼 평소에 어떤 걸 할 때 가장 시간 가는 줄 모르세요?', hint: '예: 요리하고 먹을 때 / 운동할 때 / 뭔가 꾸밀 때' },
  { ai: '멋지네요! 주변에서 "넌 이거 참 잘한다" 하고 칭찬받는 게 있나요?', hint: '예: 설명을 쉽게 한다 / 분위기가 편하다 / 꾸준하다' },
  { ai: '마지막이에요. 누가 내 영상을 봐주면 제일 기쁠 것 같아요?', hint: '예: 나처럼 자취하는 사람 / 요리 초보 / 또래 친구들' },
];

// 대화 결과 기본값(답변이 없을 때 fallback)
const PROFILE_FALLBACK = {
  direction: '자취생을 위한 쉬운 집밥 레시피',
  strengths: ['쉬운 설명', '편안한 분위기', '꾸준함'],
  target: '자취 시작한 20대',
  format: '15초 · 자막 중심 · 얼굴 노출 최소',
};

export default function V7FlowPage() {
  const [step, setStep] = useState<Step>('onboarding');
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<string>('자취생 3분 계란요리 5가지');

  // ① 대화 답변을 ② CONTENT PROFILE 에 반영
  const profile = {
    direction: answers[1]?.trim() || PROFILE_FALLBACK.direction,
    strengths: answers[2]?.trim() ? [answers[2].trim()] : PROFILE_FALLBACK.strengths,
    target: answers[3]?.trim() || PROFILE_FALLBACK.target,
    format: PROFILE_FALLBACK.format,
  };

  const idx = STEP_ORDER.indexOf(step);
  const goBack = () => { if (idx > 0) setStep(STEP_ORDER[idx - 1]); };

  let view: React.ReactNode;
  if (step === 'onboarding') {
    view = <OnboardingView onDone={(a) => { setAnswers(a); setStep('profile'); }} />;
  } else if (step === 'profile') {
    view = <ProfileView profile={profile} onNext={() => setStep('trends')} />;
  } else if (step === 'trends') {
    view = (
      <TrendsView
        direction={profile.direction}
        onPick={(title) => { setSelectedTrend(title); setStep('script'); }}
        onRivals={() => setStep('rivals')}
      />
    );
  } else if (step === 'rivals') {
    view = <RivalsView onMake={() => setStep('script')} onTrends={() => setStep('trends')} />;
  } else {
    view = <ScriptContiView trend={selectedTrend} onNextTopic={() => setStep('trends')} />;
  }

  return (
    <>
      <TopNav index={idx} total={STEP_ORDER.length} onBack={goBack} />
      {view}
    </>
  );
}

/* ── ① 온보딩 대화 ───────────────────────────────────────────── */
function OnboardingView({ onDone }: { onDone: (answers: string[]) => void }) {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<{ who: 'ai' | 'user'; text: string }[]>([]);
  const [hint, setHint] = useState('');
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [idx, setIdx] = useState(0);
  const answersRef = useRef<string[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  function ask(i: number) {
    setTyping(true);
    setHint('');
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { who: 'ai', text: CONVO[i].ai }]);
      setHint(CONVO[i].hint);
    }, 900);
  }

  function start() {
    setStarted(true);
    setIdx(0);
    answersRef.current = [];
    ask(0);
  }

  function send() {
    const val = input.trim();
    if (!val || typing) return;
    setMessages((m) => [...m, { who: 'user', text: val }]);
    answersRef.current = [...answersRef.current, val];
    setInput('');
    setHint('');
    const next = idx + 1;
    setIdx(next);
    if (next < CONVO.length) {
      setTimeout(() => ask(next), 500);
    } else {
      setTimeout(() => onDone(answersRef.current), 600);
    }
  }

  if (!started) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 26px' }}>
        <div style={{ width: 54, height: 54, borderRadius: 17, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, boxShadow: 'var(--shadow-cta)' }}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" /></svg>
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.045em', marginBottom: 14, color: 'var(--color-ink)' }}>
          막막한 첫 영상,<br /><em style={{ fontStyle: 'normal', color: 'var(--color-primary)' }}>같이</em> 만들어요
        </div>
        <div style={{ fontSize: 15, color: 'var(--color-ink-2)', lineHeight: 1.7 }}>3단계면 첫 영상 콘티까지 완성돼요.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '22px 0' }}>
          {['대화로 내 콘텐츠 방향 찾기', '나에게 맞는 트렌드 추천받기', '스크립트·콘티로 바로 제작'].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--color-surface)', borderRadius: 15, padding: '14px 16px', boxShadow: '0 2px 12px rgba(80,80,200,.06)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 9, background: 'var(--color-primary-soft)', color: 'var(--color-primary)', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-ink)' }}>{t}</div>
            </div>
          ))}
        </div>
        <div>
          <button onClick={start} style={ctaBtn}>대화 시작하기<Arrow /></button>
          <div style={{ fontSize: 12, color: 'var(--color-ink-3)', textAlign: 'center', marginTop: 13 }}>1분이면 충분해요</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '6px 24px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" /></svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>Pulse 큐레이터</div>
          <div style={{ fontSize: 11, color: 'var(--color-up)', fontWeight: 600 }}>● 대화 중</div>
        </div>
      </div>

      <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            maxWidth: '80%', fontSize: 14, lineHeight: 1.55, padding: '13px 16px', borderRadius: 20,
            alignSelf: m.who === 'user' ? 'flex-end' : 'flex-start',
            background: m.who === 'user' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: m.who === 'user' ? '#fff' : 'var(--color-ink)',
            borderBottomRightRadius: m.who === 'user' ? 6 : 20,
            borderBottomLeftRadius: m.who === 'user' ? 20 : 6,
            boxShadow: m.who === 'user' ? 'none' : '0 2px 10px rgba(80,80,200,.06)',
            whiteSpace: 'pre-wrap',
          }}>{m.text}</div>
        ))}
        {typing && (
          <div style={{ alignSelf: 'flex-start', background: 'var(--color-surface)', padding: '15px 17px', borderRadius: 20, borderBottomLeftRadius: 6, display: 'flex', gap: 4, boxShadow: '0 2px 10px rgba(80,80,200,.06)' }}>
            {[0, 1, 2].map((d) => <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-primary-mid)', animation: 'v7bounce 1.2s infinite', animationDelay: `${d * 0.2}s` }} />)}
          </div>
        )}
      </div>

      <div style={{ padding: '14px 20px 18px', flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginBottom: 10, minHeight: 16 }}>{hint}</div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder="여기에 답을 입력해보세요"
            autoComplete="off"
            style={{ flex: 1, border: '1px solid var(--color-border-2)', borderRadius: 16, padding: '14px 16px', fontSize: 14, color: 'var(--color-ink)', background: 'var(--color-surface)', outline: 'none' }}
          />
          <button onClick={send} disabled={!input.trim() || typing} style={{ width: 50, height: 50, borderRadius: 16, background: input.trim() && !typing ? 'var(--color-primary)' : 'var(--color-border-2)', border: 'none', cursor: input.trim() && !typing ? 'pointer' : 'not-allowed', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: input.trim() && !typing ? 'var(--shadow-cta)' : 'none' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      <style>{`@keyframes v7bounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}`}</style>
    </div>
  );
}

/* ── ② 대화 결과 CONTENT PROFILE ─────────────────────────────── */
function ProfileView({ profile, onNext }: { profile: typeof PROFILE_FALLBACK; onNext: () => void }) {
  return (
    <div style={{ padding: '8px 24px 26px', flex: 1 }}>
      <span style={eyebrow}>✦ 대화 분석 완료</span>
      <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.22, letterSpacing: '-0.04em', marginBottom: 10, color: 'var(--color-ink)' }}>
        이런 <em style={{ fontStyle: 'normal', color: 'var(--color-primary)' }}>크리에이터</em>가<br />되면 어울려요
      </div>
      <div style={{ ...sub, marginBottom: 20 }}>방금 입력해주신 답변을 바탕으로 정리했어요</div>

      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl, 28px)', padding: 24, marginBottom: 14, boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 16, letterSpacing: '0.04em', color: 'var(--color-primary)' }}>CONTENT PROFILE</div>
        <ProfileRow k="콘텐츠 방향" v={profile.direction} />
        <ProfileRow k="당신의 강점">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 3 }}>
            {profile.strengths.map((s) => <span key={s} style={chip}>{s}</span>)}
          </div>
        </ProfileRow>
        <ProfileRow k="추천 타깃" v={profile.target} />
        <ProfileRow k="추천 포맷" v={profile.format} last />
      </div>

      <div style={{ textAlign: 'center', padding: '24px 10px 18px' }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 5, color: 'var(--color-ink)' }}>자, 그럼 첫 영상 찍어볼까요?</div>
        <div style={sub}>당신 주제로 지금 반응 좋은 영상을 모아왔어요</div>
      </div>
      <button onClick={onNext} style={ctaBtn}>트렌드 보러가기<Arrow /></button>
    </div>
  );
}

/* ── ③ 트렌드 ───────────────────────────────────────────────── */
const TRENDS = [
  { title: '자취생 3분 계란요리 5가지', badge: '반응 폭발', hot: true, views: '92만', er: '8.4%', why: '"N가지" 정리형 제목과 자취생 공감 키워드가 요즘 강세예요' },
  { title: '편의점 재료로 만드는 야식', badge: '상승 중', hot: false, views: '54만', er: '6.1%', why: '"편의점" 키워드와 저비용 공감 포맷이 꾸준히 인기예요' },
  { title: '자취 한 달 식비 공개합니다', badge: '상승 중', hot: false, views: '38만', er: '7.2%', why: '"공개" 키워드와 구체적인 숫자가 저장을 부르는 포맷이에요' },
];

function TrendsView({ direction, onPick, onRivals }: { direction: string; onPick: (title: string) => void; onRivals: () => void }) {
  return (
    <div style={{ padding: '8px 24px 26px', flex: 1 }}>
      <span style={eyebrow}>{direction} · 지금 뜨는 영상</span>
      <div style={{ fontSize: 25, fontWeight: 800, lineHeight: 1.22, letterSpacing: '-0.04em', marginBottom: 10, color: 'var(--color-ink)' }}>
        이런 영상이<br />요즘 <em style={{ fontStyle: 'normal', color: 'var(--color-primary)' }}>반응</em>이 좋아요
      </div>
      <div style={{ ...sub, marginBottom: 20 }}>마음에 드는 걸 누르면 바로 만들 수 있어요</div>

      {TRENDS.map((t) => (
        <div key={t.title} onClick={() => onPick(t.title)}
          style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg, 22px)', padding: 18, marginBottom: 12, cursor: 'pointer', boxShadow: '0 3px 16px rgba(80,80,200,.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 11 }}>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, letterSpacing: '-0.015em', color: 'var(--color-ink)' }}>{t.title}</div>
            <span style={{ fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0, height: 'fit-content', background: `color-mix(in srgb, ${t.hot ? 'var(--color-hot)' : 'var(--color-warm)'} 14%, transparent)`, color: t.hot ? 'var(--color-hot)' : 'var(--color-warm)' }}>{t.badge}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 11 }}>
            <span style={{ fontSize: 13, color: 'var(--color-ink-2)' }}>조회 <b style={{ color: 'var(--color-ink)' }}>{t.views}</b></span>
            <span style={{ fontSize: 13, color: 'var(--color-ink-2)' }}>참여율 <b style={{ color: 'var(--color-ink)' }}>{t.er}</b></span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-2)', background: 'var(--color-soft)', borderRadius: 12, padding: '12px 14px', lineHeight: 1.55 }}>
            <b style={{ color: 'var(--color-primary)', fontWeight: 700 }}>왜 떴을까요?</b> {t.why}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, marginTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
            이걸로 만들기
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </div>
        </div>
      ))}

      <button onClick={onRivals} style={{ ...ghostFullBtn, marginTop: 6 }}>먼저 비슷한 크리에이터 구경하기</button>
    </div>
  );
}

/* ── ⑤ 스크립트 / 콘티 ──────────────────────────────────────── */
const SCRIPTS = [
  ['정보형', '"자취생이라면 꼭 알아야 할 계란요리 5가지, 지금 알려드릴게요."'],
  ['스토리형', '"자취 첫날 계란프라이도 못 했던 제가, 이제 5가지나 합니다."'],
  ['훅형', '"계란 하나로 이게 된다고요? 끝까지 보면 깜짝 놀라요."'],
];
const CUTS = [
  ['CUT 1 · 훅', '0-3초', 'M12 2v4M12 18v4', '"자취생이라면 꼭 봐야 해요"', '계란 들고 정면 클로즈업으로 시작'],
  ['CUT 2 · 전환', '3-6초', 'M5 12h14', '"이거 하나로 5가지가 돼요"', '프라이팬 위 계란, 손 동작 강조'],
  ['CUT 3 · 본론', '6-12초', 'M4 4h16v16H4z', '"첫째 스크램블, 둘째..."', '요리 과정 빠른 컷 편집'],
  ['CUT 4 · 클로징', '12-15초', 'M20 6L9 17l-5-5', '"여러분도 해보세요!"', '완성 요리와 먹는 모습 마무리'],
];

function ScriptContiView({ trend, onNextTopic }: { trend: string; onNextTopic: () => void }) {
  const [mode, setMode] = useState<'select' | 'loading' | 'script' | 'conti'>('select');

  function make(target: 'script' | 'conti') {
    setMode('loading');
    setTimeout(() => setMode(target), 1500);
  }

  return (
    <div style={{ padding: '8px 24px 26px', flex: 1 }}>
      <div style={{ fontSize: 11, color: 'var(--color-ink-3)', fontWeight: 600, marginBottom: 8, paddingLeft: 2 }}>선택한 주제</div>
      <div style={{ background: 'var(--color-surface)', borderRadius: 15, padding: '14px 16px', marginBottom: 18, fontSize: 14, color: 'var(--color-ink)', fontWeight: 700, display: 'flex', gap: 9, alignItems: 'center', boxShadow: '0 3px 14px rgba(80,80,200,.07)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        {trend}
      </div>

      {mode === 'select' && (
        <>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6, color: 'var(--color-ink)' }}>어떻게 만들어볼까요?</div>
          <div style={{ ...sub, marginBottom: 20 }}>둘 다 받아볼 수도 있어요</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MakeChoice label="스크립트" desc={'뭐라고 말할지\n대본 3종'} onClick={() => make('script')}
              icon={<path d="M4 4h16v16H4zM8 9h8M8 13h6" />} />
            <MakeChoice label="콘티" desc={'어떻게 찍을지\n4컷 구성'} onClick={() => make('conti')}
              icon={<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 4v6" /></>} />
          </div>
        </>
      )}

      {mode === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 0', gap: 16 }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'v7rot .8s linear infinite' }} />
          <div style={{ fontSize: 14, color: 'var(--color-ink-2)', fontWeight: 600 }}>만들고 있어요...</div>
          <style>{`@keyframes v7rot{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {mode === 'script' && (
        <>
          <span style={eyebrow}>스크립트 3종</span>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', margin: '4px 0 16px', color: 'var(--color-ink)' }}>마음에 드는 걸로 골라보세요</div>
          {SCRIPTS.map(([tag, text]) => (
            <div key={tag} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg, 22px)', padding: 17, marginBottom: 12, boxShadow: '0 3px 16px rgba(80,80,200,.07)' }}>
              <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, color: '#fff', background: 'var(--color-primary)', padding: '5px 12px', borderRadius: 999, marginBottom: 10 }}>{tag}</span>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-ink)' }}>{text}</div>
            </div>
          ))}
          <button onClick={() => setMode('select')} style={{ ...ghostFullBtn, marginTop: 6 }}>콘티도 받아보기</button>
          <button onClick={onNextTopic} style={{ ...ctaBtn, marginTop: 10 }}>저장하고 다음 주제 받기<Arrow /></button>
        </>
      )}

      {mode === 'conti' && (
        <>
          <span style={eyebrow}>콘티 4컷</span>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', margin: '4px 0 16px', color: 'var(--color-ink)' }}>이 순서로 찍어보세요</div>
          {CUTS.map(([label, time, path, line, note]) => (
            <div key={label} style={{ borderRadius: 'var(--radius-lg, 22px)', overflow: 'hidden', marginBottom: 12, background: 'var(--color-surface)', boxShadow: '0 3px 16px rgba(80,80,200,.07)' }}>
              <div style={{ background: 'var(--color-primary-soft)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-primary)' }}>{label}</span>
                <span style={{ fontSize: 12, color: 'var(--color-ink-2)', fontWeight: 600 }}>{time}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr' }}>
                <div style={{ aspectRatio: '1', background: 'var(--color-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.55 }}><path d={path} /></svg>
                </div>
                <div style={{ padding: '13px 15px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, marginBottom: 5, color: 'var(--color-ink)' }}>{line}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-2)', lineHeight: 1.5 }}>{note}</div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={onNextTopic} style={{ ...ctaBtn, marginTop: 6 }}>저장하고 다음 주제 받기<Arrow /></button>
        </>
      )}
    </div>
  );
}

function MakeChoice({ label, desc, icon, onClick }: { label: string; desc: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ borderRadius: 'var(--radius-lg, 22px)', padding: '24px 16px', textAlign: 'center', cursor: 'pointer', background: 'var(--color-surface)', boxShadow: '0 3px 16px rgba(80,80,200,.07)' }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3, color: 'var(--color-ink)' }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--color-ink-2)', lineHeight: 1.45, whiteSpace: 'pre-line' }}>{desc}</div>
    </div>
  );
}

/* ── ④ 라이벌 크리에이터 (계정 + 최근 영상 + 성장 스토리) ────────── */
const RIVALS = [
  { ava: '민', handle: '자취요리_민지', meta: '팔로워 2,400 · 자취 집밥', grow: '3개월 전엔 50명이었대요', videos: [{ thumb: '🍳', title: '계란말이 꿀팁', views: '12만' }, { thumb: '🍚', title: '5분 덮밥', views: '8.3만' }] },
  { ava: '혼', handle: '혼밥의정석', meta: '팔로워 3,800 · 자취 집밥', grow: '최근 한 달 +1,200', videos: [{ thumb: '🍜', title: '봉지라면 끝판왕', views: '21만' }, { thumb: '🥗', title: '귀찮을 때 한그릇', views: '15만' }] },
  { ava: '원', handle: '원룸쿡', meta: '팔로워 5,100 · 자취 집밥', grow: '6개월 만에 5천 돌파', videos: [{ thumb: '🍳', title: '원룸 냉장고 털기', views: '33만' }, { thumb: '🍲', title: '국물요리 3종', views: '19만' }] },
];

function RivalsView({ onMake, onTrends }: { onMake: () => void; onTrends: () => void }) {
  return (
    <div style={{ padding: '8px 24px 26px', flex: 1 }}>
      <span style={eyebrow}>벤치마크 크리에이터</span>
      <div style={{ fontSize: 25, fontWeight: 800, lineHeight: 1.22, letterSpacing: '-0.04em', marginBottom: 10, color: 'var(--color-ink)' }}>
        이 분들도<br />비슷하게 <em style={{ fontStyle: 'normal', color: 'var(--color-primary)' }}>시작</em>했어요
      </div>
      <div style={{ ...sub, marginBottom: 20 }}>조금 앞서가는 분들이에요. 부담 없이 참고해보세요</div>

      {RIVALS.map((r) => (
        <div key={r.handle} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg, 22px)', padding: 16, marginBottom: 12, boxShadow: '0 3px 16px rgba(80,80,200,.07)' }}>
          <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
            <div style={{ width: 50, height: 50, borderRadius: 16, background: 'var(--color-primary-soft)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, fontWeight: 800, color: 'var(--color-primary)' }}>{r.ava}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>{r.handle}</div>
              <div style={{ fontSize: 13, color: 'var(--color-ink-2)', marginTop: 2, fontWeight: 500 }}>{r.meta}</div>
              <div style={{ fontSize: 12, color: 'var(--color-up)', fontWeight: 700, marginTop: 4 }}>↑ {r.grow}</div>
            </div>
          </div>
          {/* 최근 영상 */}
          <div style={{ display: 'flex', gap: 8, marginTop: 13 }}>
            {r.videos.map((v) => (
              <div key={v.title} style={{ flex: 1, background: 'var(--color-soft)', borderRadius: 12, padding: 10 }}>
                <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 7 }}>{v.thumb}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginTop: 3 }}>조회 {v.views}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={onMake} style={{ ...ctaBtn, marginTop: 6 }}>나도 만들어보기<Arrow /></button>
      <button onClick={onTrends} style={{ ...ghostFullBtn, marginTop: 10 }}>다른 트렌드 다시 보기</button>
    </div>
  );
}

function ProfileRow({ k, v, children, last }: { k: string; v?: string; children?: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ padding: '13px 0', borderBottom: last ? 'none' : '1px solid var(--color-border)' }}>
      <div style={{ fontSize: 12, color: 'var(--color-ink-2)', fontWeight: 600, marginBottom: 4 }}>{k}</div>
      {v && <div style={{ fontSize: 15, color: 'var(--color-ink)', fontWeight: 700, letterSpacing: '-0.01em' }}>{v}</div>}
      {children}
    </div>
  );
}

function Arrow() {
  return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

const eyebrow: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, marginBottom: 14, background: 'var(--color-soft)', padding: '6px 13px', borderRadius: 999, color: 'var(--color-primary)' };
const sub: React.CSSProperties = { fontSize: 14, color: 'var(--color-ink-2)', lineHeight: 1.65 };
const chip: React.CSSProperties = { background: 'var(--color-primary-soft)', borderRadius: 999, padding: '6px 13px', fontSize: 13, color: 'var(--color-primary)', fontWeight: 700 };
const ctaBtn: React.CSSProperties = { width: '100%', padding: 18, border: 'none', borderRadius: 999, fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--color-primary)', color: '#fff', boxShadow: 'var(--shadow-cta)' };
const ghostFullBtn: React.CSSProperties = { width: '100%', padding: 18, border: '1px solid var(--color-border-2)', borderRadius: 999, fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.02em', background: 'var(--color-surface)', color: 'var(--color-ink)' };
