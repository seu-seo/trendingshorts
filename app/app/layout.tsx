import type { Metadata } from 'next';
import './globals.css';
import PhoneFrame from '@/components/PhoneFrame';
import OnboardingGate from '@/components/OnboardingGate';

export const metadata: Metadata = {
  title: 'Shortform Pulse',
  description: '팔로워 1만 명 미만 초기 크리에이터를 위한 숏폼 트렌드 가이드',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <PhoneFrame>
          <OnboardingGate>{children}</OnboardingGate>
        </PhoneFrame>
      </body>
    </html>
  );
}
