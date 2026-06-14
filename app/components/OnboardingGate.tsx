'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function OnboardingGate({ children }: { children: React.ReactNode }) {
  const onboardingDone = useStore((s) => s.onboardingDone);
  const pathname = usePathname();
  const router = useRouter();

  // v7 신규 플로우(/v7/*)는 자체 온보딩을 포함하므로 게이트 예외 처리
  const isExempt = pathname === '/onboarding' || pathname.startsWith('/v7');

  useEffect(() => {
    if (!onboardingDone && !isExempt) {
      router.replace('/onboarding');
    }
  }, [onboardingDone, isExempt, router]);

  // 온보딩 페이지·v7 플로우는 항상 렌더
  if (isExempt) return <>{children}</>;

  // 온보딩 완료 전 다른 페이지는 빈 화면 (redirect 중)
  if (!onboardingDone) return null;

  return <>{children}</>;
}
