'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import type { Platform, Trend } from '@/lib/types';

const RINGS = [
  { key: 'instagram' as Platform, label: 'REELS',  color: '#A855F7', r: 78, delay: '0.1s' },
  { key: 'youtube'   as Platform, label: 'SHORTS', color: '#FF38A0', r: 57, delay: '0.25s' },
  { key: 'tiktok'    as Platform, label: 'TIKTOK', color: '#C8FF57', r: 36, delay: '0.4s' },
];

const AGE_LABEL: Record<string, string> = {
  '10s': '10대', '20s': '20대', '30s': '30대', '40s': '40대', '50+': '50대+',
};

const PLATFORM_KR: Record<Platform, string> = {
  youtube: '유튜브', tiktok: '틱톡', instagram: '인스타',
};

interface Props { trends: Trend[] }

export default function OpportunityRingChart({ trends }: Props) {
  const filterPlatform = useStore((s) => s.filterPlatform);
  const setFilterPlatform = useStore((s) => s.setFilterPlatform);
  const ageGroup = useStore((s) => s.ageGroup);

  const platformStats = useMemo(() => {
    const maxER = Math.max(
      ...RINGS.map(({ key }) => {
        const pts = trends.filter((t) => t.platform === key);
        return pts.length ? pts.reduce((s, t) => s + t.engagementRate, 0) / pts.length : 0;
      }),
      0.001,
    );
    return RINGS.map(({ key, label, color, r, delay }) => {
      const pts = trends.filter((t) => t.platform === key);
      const avgER = pts.length ? pts.reduce((s, t) => s + t.engagementRate, 0) / pts.length : 0;
      const fill = avgER / maxER;
      const C = 2 * Math.PI * r;
      const dashLen = fill * C;
      return { key, label, color, r, delay, avgER, fill, C, dashLen };
    });
  }, [trends]);

  const active = platformStats.find((p) => p.key === filterPlatform);
  const personalLabel =
    ageGroup && AGE_LABEL[ageGroup]
      ? `${AGE_LABEL[ageGroup]} ${PLATFORM_KR[filterPlatform as Platform] ?? filterPlatform} 트렌드`
      : '이번 주 트렌드';

  const CX = 100;
  const CY = 100;
  const SW = 13;

  return (
    <div className="mx-6 mb-5">
      {/* 개인화 헤더 */}
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="font-display text-[28px] leading-none tracking-tight">
            {personalLabel}
          </div>
          <div className="font-mono text-[9px] text-text-faint mt-1 tracking-widest uppercase">
            기회 지수 · 플랫폼별 평균 ER%
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        {/* SVG 링 */}
        <div className="relative flex-shrink-0">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {platformStats.map(({ key, color }) => (
                <filter key={`glow-${key}`} id={`glow-${key}`} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {platformStats.map(({ key, color, r, delay, C, dashLen }) => {
              const isActive = key === filterPlatform;
              const dimColor = `${color}22`;
              return (
                <g key={key} style={{ transform: `rotate(-90deg)`, transformOrigin: `${CX}px ${CY}px` }}>
                  {/* Track ring */}
                  <circle
                    cx={CX} cy={CY} r={r}
                    fill="none"
                    stroke={dimColor}
                    strokeWidth={SW}
                  />
                  {/* Fill ring */}
                  <circle
                    cx={CX} cy={CY} r={r}
                    fill="none"
                    stroke={isActive ? color : `${color}55`}
                    strokeWidth={SW}
                    strokeLinecap="round"
                    strokeDasharray={`${dashLen} ${C}`}
                    strokeDashoffset={dashLen}
                    filter={isActive ? `url(#glow-${key})` : undefined}
                    style={{
                      animation: `ringDraw-${key} 0.9s ease-out ${delay} forwards`,
                    }}
                  />
                </g>
              );
            })}

            {/* Center label */}
            <text x={CX} y={CY - 6} textAnchor="middle" fill="var(--text)" fontSize="20" fontWeight="700" fontFamily="monospace">
              {active ? `${active.avgER.toFixed(1)}%` : '—'}
            </text>
            <text x={CX} y={CY + 12} textAnchor="middle" fill="var(--text-faint)" fontSize="9" fontFamily="monospace" letterSpacing="0.12em">
              {active ? active.label : 'SELECT'}
            </text>
          </svg>

          <style>{`
            ${platformStats.map(({ key, dashLen }) => `
              @keyframes ringDraw-${key} {
                from { stroke-dashoffset: ${dashLen}; }
                to   { stroke-dashoffset: 0; }
              }
            `).join('')}
          `}</style>
        </div>

        {/* 플랫폼 선택 + ER 표시 */}
        <div className="flex flex-col gap-3 flex-1">
          {platformStats.map(({ key, label, color, avgER }) => {
            const isActive = key === filterPlatform;
            return (
              <button
                key={key}
                onClick={() => setFilterPlatform(key)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all text-left w-full"
                style={{
                  background: isActive ? `${color}12` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? `${color}40` : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: color,
                    boxShadow: isActive ? `0 0 6px ${color}` : 'none',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="font-mono text-[10px] font-bold tracking-wider"
                    style={{ color: isActive ? color : 'var(--text-faint)' }}
                  >
                    {label}
                  </div>
                  <div className="font-mono text-[9px] text-text-faint mt-0.5">
                    평균 ER {avgER > 0 ? `${avgER.toFixed(1)}%` : '—'}
                  </div>
                </div>
                {isActive && (
                  <div
                    className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${color}20`, color }}
                  >
                    선택
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
