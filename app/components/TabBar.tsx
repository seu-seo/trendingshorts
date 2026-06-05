'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { Tab } from '@/lib/types';

interface TabItem {
  key: Tab;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const TABS: TabItem[] = [
  {
    key: 'dashboard',
    label: '대시보드',
    href: '/',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    key: 'recommend',
    label: '제작',
    href: '/recommend',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    key: 'my',
    label: '마이',
    href: '/my',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const currentTab = useStore((s) => s.currentTab);
  const setTab = useStore((s) => s.setTab);
  const pathname = usePathname();

  if (pathname === '/onboarding') return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 border-t border-border flex justify-around z-10 pt-2.5 pb-5"
      style={{
        background: 'rgba(10, 10, 11, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {TABS.map((t) => {
        const active = currentTab === t.key;
        return (
          <Link
            key={t.key}
            href={t.href}
            onClick={() => setTab(t.key)}
            className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
              active ? 'text-accent-lime' : 'text-text-faint hover:text-text'
            }`}
          >
            <div className="w-[22px] h-[22px] grid place-items-center">{t.icon}</div>
            <div className="font-mono text-[9px] tracking-wider uppercase">{t.label}</div>
          </Link>
        );
      })}
    </div>
  );
}
