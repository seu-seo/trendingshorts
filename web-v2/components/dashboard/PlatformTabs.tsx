'use client';

import { useStore } from '@/lib/store';
import type { Platform } from '@/lib/types';

const PLATFORMS: { key: Platform; label: string }[] = [
  { key: 'youtube',   label: 'SHORTS'   },
  { key: 'tiktok',    label: 'TIKTOK'   },
  { key: 'instagram', label: 'REELS'    },
];

const PLATFORM_COLOR: Record<Platform, string> = {
  youtube:   '#FF4466',
  tiktok:    '#69C9D0',
  instagram: '#FF6699',
};

export default function PlatformTabs() {
  const filterPlatform = useStore((s) => s.filterPlatform);
  const setFilterPlatform = useStore((s) => s.setFilterPlatform);

  return (
    <div className="px-6 pb-3 flex gap-2">
      {PLATFORMS.map(({ key, label }) => {
        const active = filterPlatform === key;
        const color = PLATFORM_COLOR[key];
        return (
          <button
            key={key}
            onClick={() => setFilterPlatform(key)}
            className="flex-1 py-2 rounded-xl font-mono text-[10px] tracking-widest uppercase transition-all"
            style={active ? {
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${color} 50%, transparent)`,
              color,
            } : {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-faint)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
