'use client';

import { useStore } from '@/lib/store';

const TAB_LABELS: Record<string, string> = {
  dashboard:  'WEEKLY',
  recommend:  'FOR YOU',
  production: 'PRODUCE',
  my:         'PROFILE',
};

export default function AppHeader() {
  const currentTab = useStore((s) => s.currentTab);
  return (
    <div className="flex-shrink-0 px-6 pt-2 pb-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full bg-accent-lime animate-pulse-dot"
          style={{ boxShadow: '0 0 10px var(--accent-lime)' }}
        />
        <div className="font-display text-lg tracking-wider">SHORTFORM PULSE</div>
      </div>
      <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase">
        {TAB_LABELS[currentTab] || ''}
      </div>
    </div>
  );
}
