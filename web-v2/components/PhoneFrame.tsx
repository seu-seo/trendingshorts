'use client';

import { usePathname } from 'next/navigation';
import AppHeader from './AppHeader';
import TabBar from './TabBar';

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === '/onboarding';
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
        className="relative w-full max-w-[420px] h-full max-h-[880px] flex flex-col overflow-hidden bg-bg border border-border-bright rounded-[36px]"
        style={{
          boxShadow: `
            0 0 0 6px var(--surface-2),
            0 40px 80px rgba(0, 0, 0, 0.5),
            0 0 60px rgba(200, 255, 87, 0.04)
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
