'use client';

import type { Category, Creator, FollowerTier } from '@/lib/types';
import { getCreatorRecommendations, experienceToFollowerTier, getNextTier, TIER_LABELS } from '@/lib/creator-recommend';

interface Props {
  category: Category;
  experience: 0 | 1 | 2 | 3 | 4 | 5;
}

/**
 * 라이벌 크리에이터 추천 — v7 라이트 테마판.
 * 로직은 creator-recommend.ts 공용, 색은 전부 --color-* 토큰([data-theme])으로.
 * (기존 다크판 CreatorRecommendSection 은 recommend 화면용으로 그대로 둠)
 */
export default function CreatorRecommendV7({ category, experience }: Props) {
  const currentTier = experienceToFollowerTier(experience);
  const targetTier = getNextTier(currentTier);
  const creators = getCreatorRecommendations(category, experience, 3);

  return (
    <div className="px-6 mb-6">
      <div className="flex items-center justify-between mb-0.5">
        <div className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
          성장 레퍼런스
        </div>
        <div className="flex items-center gap-1.5">
          <TierBadge tier={currentTier} dim />
          <span className="font-mono text-[9px]" style={{ color: 'var(--color-ink-3)' }}>→</span>
          <TierBadge tier={targetTier} />
        </div>
      </div>
      <div className="text-[11px] mb-3" style={{ color: 'var(--color-ink-2)' }}>
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

function growthColor(growth: number): string {
  if (growth >= 30) return 'var(--color-up)';
  if (growth >= 20) return 'var(--color-warm)';
  return 'var(--color-ink-3)';
}

function CreatorCard({ creator, rank }: { creator: Creator; rank: number }) {
  const growthLabel = creator.growth >= 30 ? 'HOT' : creator.growth >= 20 ? 'UP' : null;

  return (
    <div
      className="p-3.5 relative overflow-hidden"
      style={{
        borderRadius: 'var(--radius, 16px)',
        background: 'var(--color-soft)',
        border: 'var(--border-width, 1px) solid var(--color-border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div
        className="absolute top-3.5 right-3.5 font-mono text-[28px] font-bold leading-none select-none"
        style={{ color: 'var(--color-primary-soft)' }}
      >
        {String(rank).padStart(2, '0')}
      </div>

      <div className="flex items-start gap-2 mb-2 pr-8">
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-ink)' }}>{creator.handle}</div>
          <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--color-ink-2)' }}>
            {creator.niche} · {creator.uploadFreq}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="font-mono text-[13px] font-bold" style={{ color: 'var(--color-primary)' }}>
            {creator.followersLabel}
          </div>
          <div className="flex items-center gap-1">
            {growthLabel && (
              <span
                className="font-mono text-[8px] font-bold px-1 py-0.5 rounded"
                style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary-deep)' }}
              >
                {growthLabel}
              </span>
            )}
            <span className="font-mono text-[10px]" style={{ color: growthColor(creator.growth) }}>
              ↑{creator.growth}%
            </span>
          </div>
        </div>
      </div>

      <ScoreBar score={creator.score} />

      <div
        className="rounded-lg px-2.5 py-1.5 flex items-start gap-1.5 mt-2"
        style={{ background: 'var(--color-tint)' }}
      >
        <span
          className="font-mono text-[8px] uppercase tracking-widest flex-shrink-0 mt-0.5"
          style={{ color: 'var(--color-primary)' }}
        >
          Why
        </span>
        <div className="text-[11px] leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>{creator.reason}</div>
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? 'var(--color-up)' : score >= 80 ? 'var(--color-primary)' : 'var(--color-ink-3)';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--color-border)' }}>
        <div className="h-1 rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
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
        ? { background: 'var(--color-soft)', color: 'var(--color-ink-3)', border: '1px solid var(--color-border)' }
        : { background: 'var(--color-primary-soft)', color: 'var(--color-primary-deep)', border: '1px solid var(--color-primary-mid)' }
      }
    >
      T{tier} {TIER_LABELS[tier]}
    </span>
  );
}
