/**
 * v7 전용 풀스크린 라이트 레이아웃.
 * data-theme="indigo" 를 정적으로 지정해 --color-* 토큰을 공급한다
 * (applyTheme/clearTheme JS 없이 → 라우트 전환 시 테마 깜빡임 없음).
 * position:fixed 로 기존 PhoneFrame 다크 테두리를 덮어 데모처럼 풀스크린 흰 배경을 만든다.
 */
export default function V7Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-theme="indigo"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
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
