import type { ThemeName } from './types';

/**
 * v7 테마 적용 헬퍼.
 * <html> 요소에 data-theme 속성을 설정/해제한다.
 * globals.css의 [data-theme="…"] 블록이 --color-* / 구조 토큰을 교체한다.
 *
 * v7 토큰은 --color-* 네임스페이스라 기존 다크 :root 토큰(--bg, --accent-lime 등)과
 * 겹치지 않으므로, 이 속성을 설정해도 아직 마이그레이션되지 않은 화면은 영향받지 않는다.
 */
export function applyTheme(theme: ThemeName): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}

/** data-theme 속성을 제거해 v7 테마를 해제한다. */
export function clearTheme(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.removeAttribute('data-theme');
}
