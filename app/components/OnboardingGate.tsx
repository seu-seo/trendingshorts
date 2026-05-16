'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function OnboardingGate({ children }: { children: React.ReactNode }) {
  const onboardingDone = useStore((s) => s.onboardingDone);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!onboardingDone && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [onboardingDone, pathname, router]);

  // 온보딩 페이지 자체는 항상 렌더
  if (pathname === '/onboarding') return <>{children}</>;

  // 온보딩 완료 전 다른 페이지는 빈 화면 (redirect 중)
  if (!onboardingDone) return null;

  return <>{children}</>;
}
