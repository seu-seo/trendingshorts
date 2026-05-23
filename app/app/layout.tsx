import type { Metadata, Viewport } from 'next';
import './globals.css';
import PhoneFrame from '@/components/PhoneFrame';
import OnboardingGate from '@/components/OnboardingGate';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Shortform Pulse',
  description: '팔로워 1만 명 미만 초기 크리에이터를 위한 숏폼 트렌드 가이드',
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
