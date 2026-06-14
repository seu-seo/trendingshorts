'use client';

import { usePathname } from 'next/navigation';
import AppHeader from './AppHeader';
import TabBar from './TabBar';

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === '/onboarding';

  // v7 플로우는 데모처럼 풀스크린 — 기존 셸(헤더/탭바/다크 프레임) 없이 렌더
  if (pathname?.startsWith('/v7')) {
    return <>{children}</>;
  }

  return (
    <div
      className="h-screen w-screen grid place-items-center p-5"
      style={{
        background: `
          radial-gradient(circle at 20% 10%, rgba(200, 255, 87, 0.04), transparent 50%),
          radial-gradient(circle at 80% 90%, rgba(255, 61, 127, 0.05), transparent 50%),
          var(--bg-darker)
        `,
      }}
    >
      <div
        className="relative w-full max-w-[420px] h-full max-h-[880px] flex flex-col overflow-hidden border rounded-[36px]"
        style={{
          background: 'var(--color-bg, #0A0A0B)',
          borderColor: 'var(--color-border-2, #3A3A42)',
          boxShadow: `
            0 0 0 6px var(--color-soft, #18181C),
            0 40px 80px rgba(0, 0, 0, 0.5),
            0 0 60px color-mix(in srgb, var(--color-primary, #C8FF57) 4%, transparent)
          `,
        }}
      >
        <AppHeader />
        <div className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin ${isOnboarding ? '' : 'pb-24'}`}>
          {children}
        </div>
        <TabBar />
      </div>
    </div>
  );
}
