'use client';

import { useEffect } from 'react';

/**
 * v7 전용 풀스크린 라이트 레이아웃.
 * data-theme="indigo" 정적 지정 → --color-* 토큰 공급 (테마 깜빡임 없음).
 * position:fixed 로 기존 PhoneFrame 영역을 덮어 데모처럼 풀스크린 흰 배경.
 * 진입 동안 body 배경(#000)도 흰색으로 바꾸고 이탈 시 복원.
 */
export default function V7Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = '#FFFFFF';
    return () => { document.body.style.background = prev; };
  }, []);

  return (
    <div
      data-theme="indigo"
      style={{
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
