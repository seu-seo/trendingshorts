'use client';

import { useState } from 'react';

type Step = 'onboarding' | 'profile' | 'trends' | 'rivals' | 'script';

// 데모 v7-A-indigo 의 CONTENT PROFILE mock (대화 결과). 추후 온보딩 대화 결과로 대체.
const PROFILE = {
  direction: '자취생을 위한 쉬운 집밥 레시피',
  strengths: ['쉬운 설명', '편안한 분위기', '꾸준함'],
  target: '자취 시작한 20대',
  format: '15초 · 자막 중심 · 얼굴 노출 최소',
};

export default function V7FlowPage() {
  // 데모는 단일 페이지 5스텝. 이번 커밋에선 ② profile 뷰부터 구현.
  const [step, setStep] = useState<Step>('profile');

  if (step === 'profile') {
    return <ProfileView onNext={() => setStep('trends')} />;
  }

  // ①③④⑤ 는 다음 커밋에서 구현 — 임시 플레이스홀더
  return (
    <div style={{ padding: '8px 24px 26px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 12 }}>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-ink)' }}>
        {step} 화면
      </div>
      <div style={{ fontSize: 14, color: 'var(--color-ink-2)', lineHeight: 1.65 }}>
        다음 단계에서 구현 예정이에요.
      </div>
      <button onClick={() => setStep('profile')} style={ghostBtn}>← 대화 결과로</button>
    </div>
  );
}

function ProfileView({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ padding: '8px 24px 26px', flex: 1 }}>
      <span style={eyebrow}>✦ 대화 분석 완료</span>

      <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.22, letterSpacing: '-0.04em', marginBottom: 10, color: 'var(--color-ink)' }}>
        이런 <em style={{ fontStyle: 'normal', color: 'var(--color-primary)' }}>크리에이터</em>가<br />되면 어울려요
      </div>
      <div style={{ ...sub, marginBottom: 20 }}>방금 입력해주신 답변을 바탕으로 정리했어요</div>

      {/* CONTENT PROFILE 카드 */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl, 28px)',
          padding: 24,
          marginBottom: 14,
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 16, letterSpacing: '0.04em', color: 'var(--color-primary)' }}>
          CONTENT PROFILE
        </div>

        <ProfileRow k="콘텐츠 방향" v={PROFILE.direction} />
        <ProfileRow k="당신의 강점">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 3 }}>
            {PROFILE.strengths.map((s) => (
              <span key={s} style={chip}>{s}</span>
            ))}
          </div>
        </ProfileRow>
        <ProfileRow k="추천 타깃" v={PROFILE.target} />
        <ProfileRow k="추천 포맷" v={PROFILE.format} last />
      </div>

      {/* nudge */}
      <div style={{ textAlign: 'center', padding: '24px 10px 18px' }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 5, color: 'var(--color-ink)' }}>
          자, 그럼 첫 영상 찍어볼까요?
        </div>
        <div style={sub}>당신 주제로 지금 반응 좋은 영상을 모아왔어요</div>
      </div>

      <button onClick={onNext} style={ctaBtn}>
        트렌드 보러가기
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
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

const eyebrow: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700,
  marginBottom: 14, background: 'var(--color-soft)', padding: '6px 13px', borderRadius: 999, color: 'var(--color-primary)',
};
const sub: React.CSSProperties = { fontSize: 14, color: 'var(--color-ink-2)', lineHeight: 1.65 };
const chip: React.CSSProperties = {
  background: 'var(--color-primary-soft)', borderRadius: 999, padding: '6px 13px', fontSize: 13, color: 'var(--color-primary)', fontWeight: 700,
};
const ctaBtn: React.CSSProperties = {
  width: '100%', padding: 18, border: 'none', borderRadius: 999, fontSize: 16, fontWeight: 700,
  cursor: 'pointer', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  background: 'var(--color-primary)', color: '#fff', boxShadow: 'var(--shadow-cta)',
};
const ghostBtn: React.CSSProperties = {
  padding: '12px 20px', border: '1px solid var(--color-border)', borderRadius: 999, fontSize: 14, fontWeight: 600,
  cursor: 'pointer', background: 'transparent', color: 'var(--color-ink-2)',
};
