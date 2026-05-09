'use client';

import Link from 'next/link';
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
    label: '추천',
    href: '/recommend',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6L12 2z" />
      </svg>
    ),
  },
  {
    key: 'production',
    label: '제작',
    href: '/production',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const currentTab = useStore((s) => s.currentTab);
  const setTab = useStore((s) => s.setTab);
  const setSelectedTrendId = useStore((s) => s.setSelectedTrendId);

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
            onClick={() => {
              setTab(t.key);
              // If clicking production tab directly via tab bar, clear selection
              if (t.key === 'production') {
                setSelectedTrendId(null);
              }
            }}
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
