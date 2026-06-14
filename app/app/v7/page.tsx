'use client';

import { useState, useRef, useEffect } from 'react';

type Step = 'onboarding' | 'profile' | 'trends' | 'rivals' | 'script';

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

  if (step === 'onboarding') {
    return <OnboardingView onDone={(a) => { setAnswers(a); setStep('profile'); }} />;
  }
  if (step === 'profile') {
    return <ProfileView profile={profile} onNext={() => setStep('trends')} />;
  }
  if (step === 'trends') {
    return (
      <TrendsView
        direction={profile.direction}
        onPick={(title) => { setSelectedTrend(title); setStep('script'); }}
        onRivals={() => setStep('rivals')}
      />
    );
  }

  // ④⑤ 는 다음 커밋에서 구현 — 임시 (selectedTrend 참조 유지)
  void selectedTrend;
  return (
    <div style={{ padding: '8px 24px 26px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 12 }}>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-ink)' }}>{step} 화면</div>
      <div style={sub}>다음 단계에서 구현 예정이에요.</div>
      <button onClick={() => setStep('profile')} style={ghostBtn}>← 대화 결과로</button>
    </div>
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
const ghostBtn: React.CSSProperties = { padding: '12px 20px', border: '1px solid var(--color-border)', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: 'var(--color-ink-2)' };
const ghostFullBtn: React.CSSProperties = { width: '100%', padding: 18, border: '1px solid var(--color-border-2)', borderRadius: 999, fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.02em', background: 'var(--color-surface)', color: 'var(--color-ink)' };
