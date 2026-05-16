import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shortform Pulse — Persona Demo',
  description: '7개 질문으로 당신의 페르소나를 찾아드려요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
