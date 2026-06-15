import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Pulse — 트렌드',
  description: '팔로워 1만 명 미만 초기 크리에이터를 위한 숏폼 트렌드 가이드',
};

// demo.html은 자체 .stage/.phone 셸과 온보딩을 포함하므로
// 별도 PhoneFrame/OnboardingGate 래퍼 없이 그대로 렌더한다.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
