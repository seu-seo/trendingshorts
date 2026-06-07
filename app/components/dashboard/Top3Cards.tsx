'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { Trend } from '@/lib/types';

const PLATFORM_COLOR: Record<string, string> = {
  youtube: '#FF4466',
  tiktok: '#69C9D0',
  instagram: '#FF6699',
};

const HEAT_COLOR: Record<string, string> = {
  HOT: '#C8FF57',
  WARM: '#57C8FF',
  COLD: '#666',
};

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function TrendCard({ trend, rank }: { trend: Trend; rank: number }) {
  const router = useRouter();
  const setSelectedTrendId = useStore((s) => s.setSelectedTrendId);
  const setTab = useStore((s) => s.setTab);
  const heatColor = HEAT_COLOR[trend.heatLevel] ?? '#666';
  const pc = PLATFORM_COLOR[trend.platform] ?? '#888';

  const handleClick = () => {
    setSelectedTrendId(trend.id);
    setTab('recommend');
    router.push('/recommend');
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* 썸네일 영역 */}
      <div className="relative h-[100px] flex items-center justify-center text-[48px]"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))' }}>
        {/* 상단 배지들 */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,0,0,0.7)', color: pc }}>
            {trend.platformLabel}
          </span>
          <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,0,0,0.7)', color: heatColor }}>
            {trend.engagementRate > 0 ? `${trend.engagementRate}%` : '—'} {trend.heatLevel}
          </span>
        </div>
        {/* 순위 */}
        <div className="absolute top-2.5 right-2.5 font-mono text-[11px] font-black"
          style={{ color: rank === 1 ? '#C8FF57' : 'rgba(255,255,255,0.3)' }}>
          #{rank}
        </div>
        <span>{trend.thumb}</span>
      </div>

      {/* 정보 영역 */}
      <div className="px-3.5 py-3">
        <div className="text-[13px] font-semibold text-text leading-snug mb-1 line-clamp-2">
          {trend.title}
        </div>
        <div className="font-mono text-[10px] text-text-faint mb-2.5">
          {trend.creator} · {trend.time}
        </div>

        {/* 수치 */}
        <div className="flex gap-3 mb-2.5">
          <Stat icon="👁" value={formatNum(trend.views)} />
          <Stat icon="♥" value={formatNum(trend.likes)} />
          {trend.shares > 0 && <Stat icon="↗" value={formatNum(trend.shares)} />}
        </div>

        {/* 해시태그 */}
        {trend.hashtags && (
          <div className="flex flex-wrap gap-1">
            {trend.hashtags.split(' ').slice(0, 3).map(tag => (
              <span key={tag} className="font-mono text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(200,255,87,0.08)', color: 'rgba(200,255,87,0.6)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

function Stat({ icon, value }: { icon: string; value: string }) {
  return (
    <div className="flex items-center gap-0.5 text-[10px] text-text-dim">
      <span>{icon}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

export default function Top3Cards({ trends }: { trends: Trend[] }) {
  const top3 = trends.slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div className="px-6 pb-5">
      <div className="font-mono text-[9px] tracking-widest text-accent-lime uppercase mb-3 flex items-center gap-1.5">
        <span className="w-[5px] h-[5px] rounded-full bg-accent-lime"
          style={{ boxShadow: '0 0 6px var(--accent-lime)' }} />
        카테고리 TOP 3
      </div>
      <div className="flex flex-col gap-3">
        {top3.map((t, i) => (
          <TrendCard key={t.id} trend={t} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
