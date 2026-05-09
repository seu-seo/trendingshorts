'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { Trend } from '@/lib/types';

export default function SelectedTrendBanner({ trend }: { trend: Trend }) {
  const router = useRouter();
  const setSelectedTrendId = useStore((s) => s.setSelectedTrendId);
  const setTab = useStore((s) => s.setTab);

  const goBack = () => {
    setSelectedTrendId(null);
    setTab('dashboard');
    router.push('/');
  };

  return (
    <>
      <div className="px-6 pb-4">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 pl-2 pr-3 py-2 bg-surface-1 border border-border rounded-full text-text-dim font-mono text-[11px] tracking-wider uppercase cursor-pointer transition-all hover:bg-surface-2 hover:text-text hover:-translate-x-0.5"
        >
          <span className="w-[22px] h-[22px] rounded-full bg-surface-2 grid place-items-center text-sm leading-none">
            ←
          </span>
          <span>BACK</span>
        </button>
      </div>

      <div
        className="mx-6 mb-6 p-3.5 border border-border rounded-2xl flex gap-3 items-center relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(200, 255, 87, 0.08), rgba(87, 200, 255, 0.05))',
        }}
      >
        <div
          className="absolute -top-7 -right-7 w-20 h-20 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(200, 255, 87, 0.15), transparent 70%)',
          }}
        />
        <div className="w-13 h-13 rounded-[11px] bg-surface-2 grid place-items-center text-2xl flex-shrink-0 relative" style={{ width: 52, height: 52 }}>
          {trend.thumb}
        </div>
        <div className="flex-1 min-w-0 relative">
          <div className="font-mono text-[9px] text-accent-lime tracking-widest uppercase mb-1 flex items-center gap-1.5">
            <span
              className="w-[5px] h-[5px] rounded-full bg-accent-lime"
              style={{ boxShadow: '0 0 6px var(--accent-lime)' }}
            />
            SELECTED TREND · {trend.platformLabel}
          </div>
          <div className="text-sm font-semibold leading-snug line-clamp-2">{trend.title}</div>
        </div>
      </div>
    </>
  );
}
