'use client';

import type { Category, Creator, FollowerTier } from '@/lib/types';
import { getCreatorRecommendations, experienceToFollowerTier, getNextTier, TIER_LABELS } from '@/lib/creator-recommend';

interface Props {
  category: Category;
  experience: 0 | 1 | 2 | 3 | 4 | 5;
}

export default function CreatorRecommendSection({ category, experience }: Props) {
  const currentTier = experienceToFollowerTier(experience);
  const targetTier = getNextTier(currentTier);
  const creators = getCreatorRecommendations(category, experience, 3);

  return (
    <div className="px-6 mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-0.5">
        <div className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-2" style={{ color: 'rgba(255,134,87,0.9)' }}>
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'rgb(255,134,87)', boxShadow: '0 0 8px rgb(255,134,87)' }}
          />
          성장 레퍼런스
        </div>
        <div className="flex items-center gap-1.5">
          <TierBadge tier={currentTier} dim />
          <span className="font-mono text-[9px] text-text-faint">→</span>
          <TierBadge tier={targetTier} />
        </div>
      </div>
      <div className="text-[11px] text-text-dim mb-3">
        {TIER_LABELS[targetTier]} 팔로워 크리에이터 — 한 단계 앞선 채널을 참고해보세요
      </div>

      <div className="flex flex-col gap-2.5">
        {creators.map((creator, idx) => (
          <CreatorCard key={creator.handle} creator={creator} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
}

function CreatorCard({ creator, rank }: { creator: Creator; rank: number }) {
  const growthColor = creator.growth >= 30
    ? 'rgb(200,255,87)'
    : creator.growth >= 20
    ? 'rgb(255,200,87)'
    : 'rgba(255,255,255,0.5)';

  const growthLabel = creator.growth >= 30 ? 'HOT' : creator.growth >= 20 ? 'UP' : null;

  return (
    <div
      className="rounded-2xl p-3.5 relative overflow-hidden"
      style={{ background: 'rgba(255,134,87,0.05)', border: '1px solid rgba(255,134,87,0.18)' }}
    >
      {/* Rank number */}
      <div
        className="absolute top-3.5 right-3.5 font-mono text-[28px] font-bold leading-none select-none"
        style={{ color: 'rgba(255,134,87,0.08)' }}
      >
        {String(rank).padStart(2, '0')}
      </div>

      {/* Top row: handle + followers */}
      <div className="flex items-start gap-2 mb-2 pr-8">
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-text truncate">{creator.handle}</div>
          <div className="font-mono text-[10px] text-text-dim mt-0.5">
            {creator.niche} · {creator.uploadFreq}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="font-mono text-[13px] font-bold" style={{ color: 'rgb(255,134,87)' }}>
            {creator.followersLabel}
          </div>
          <div className="flex items-center gap-1">
            {growthLabel && (
              <span
                className="font-mono text-[8px] font-bold px-1 py-0.5 rounded"
                style={{ background: 'rgba(200,255,87,0.12)', color: 'rgb(200,255,87)' }}
              >
                {growthLabel}
              </span>
            )}
            <span className="font-mono text-[10px]" style={{ color: growthColor }}>
              ↑{creator.growth}%
            </span>
          </div>
        </div>
      </div>

      {/* Score bar */}
      <ScoreBar score={creator.score} />

      {/* Reason */}
      <div
        className="rounded-lg px-2.5 py-1.5 flex items-start gap-1.5 mt-2"
        style={{ background: 'rgba(0,0,0,0.2)' }}
      >
        <span
          className="font-mono text-[8px] uppercase tracking-widest flex-shrink-0 mt-0.5"
          style={{ color: 'rgba(255,134,87,0.6)' }}
        >
          Why
        </span>
        <div className="text-[11px] text-text-dim leading-relaxed">{creator.reason}</div>
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90
    ? 'rgb(200,255,87)'
    : score >= 80
    ? 'rgb(255,134,87)'
    : 'rgba(255,255,255,0.35)';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-1 rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="font-mono text-[9px] flex-shrink-0" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function TierBadge({ tier, dim }: { tier: FollowerTier; dim?: boolean }) {
  return (
    <span
      className="font-mono text-[9px] px-2 py-0.5 rounded-full"
      style={dim
        ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }
        : { background: 'rgba(255,134,87,0.15)', color: 'rgb(255,134,87)', border: '1px solid rgba(255,134,87,0.35)' }
      }
    >
      T{tier} {TIER_LABELS[tier]}
    </span>
  );
}
