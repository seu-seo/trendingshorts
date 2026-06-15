'use client';

import type { ThemeName } from '@/lib/themes/types';

const LABELS: Record<ThemeName, string> = {
  indigo: 'A 인디고',
  purple: 'C 퍼플',
  bold: 'B 볼드',
};

interface ThemeSwitcherProps {
  value: ThemeName;
  onChange: (theme: ThemeName) => void;
  /** 노출할 테마 목록. 기본은 3종 전부. (PoC에서 A/C만 쓰려면 ['indigo','purple']) */
  options?: ThemeName[];
}

/**
 * PoC용 테마 토글. 화면 우상단 구석에 임시로 떠 있는 작은 위젯.
 * controlled 컴포넌트 — 상태는 부모가 들고, 실제 적용(applyTheme)도 부모가 한다.
 */
export default function ThemeSwitcher({
  value,
  onChange,
  options = ['indigo', 'purple', 'bold'],
}: ThemeSwitcherProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 10,
        background: 'rgba(0,0,0,0.06)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {options.map((t) => {
        const active = t === value;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            style={{
              padding: '4px 9px',
              fontSize: 11,
              fontWeight: active ? 600 : 400,
              borderRadius: 7,
              border: '1px solid var(--color-border, #E3DCEF)',
              background: active ? 'var(--color-primary, #4F46E5)' : 'transparent',
              color: active ? '#fff' : 'var(--color-ink-2, #6A6478)',
              cursor: 'pointer',
            }}
          >
            {LABELS[t]}
          </button>
        );
      })}
    </div>
  );
}
