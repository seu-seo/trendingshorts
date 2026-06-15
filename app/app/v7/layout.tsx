'use client';

import { useEffect } from 'react';

/**
 * v7 전용 풀스크린 라이트 레이아웃.
 * indigo 토큰(--color-*)을 컨테이너 인라인 스타일로 직접 정의한다.
 * (globals 의 [data-theme] CSS 규칙 캐시/적용 여부와 무관하게 항상 진한 잉크색이 적용됨)
 * position:fixed 로 기존 PhoneFrame 영역을 덮어 데모처럼 풀스크린 흰 배경.
 */
const INDIGO_VARS = {
  '--color-bg': '#FFFFFF',
  '--color-surface': '#FFFFFF',
  '--color-soft': '#F5F3FA',
  '--color-tint': '#F3EFFB',
  '--color-border': '#EFEBF5',
  '--color-border-2': '#E3DCEF',
  '--color-ink': '#16131F',
  '--color-ink-2': '#6A6478',
  '--color-ink-3': '#A6A0B5',
  '--color-primary': '#4F46E5',
  '--color-primary-deep': '#4338CA',
  '--color-primary-soft': '#EEF0FD',
  '--color-primary-mid': '#818CF8',
  '--color-up': '#10B981',
  '--color-hot': '#F43F8E',
  '--color-warm': '#F59E0B',
  '--radius': '16px',
  '--radius-lg': '22px',
  '--radius-xl': '28px',
  '--border-width': '1px',
  '--shadow': '0 10px 34px rgba(80,80,200,.12)',
  '--shadow-cta': '0 10px 26px rgba(79,70,229,.34)',
} as React.CSSProperties;

export default function V7Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prevBg = document.body.style.background;
    const prevColor = document.body.style.color;
    document.body.style.background = '#FFFFFF';
    document.body.style.color = '#16131F';
    return () => { document.body.style.background = prevBg; document.body.style.color = prevColor; };
  }, []);

  return (
    <div
      data-theme="indigo"
      style={{
        ...INDIGO_VARS,
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--color-bg)',
        color: 'var(--color-ink)',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: 460, margin: '0 auto', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
