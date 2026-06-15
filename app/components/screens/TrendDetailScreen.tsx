'use client';

import type { Trend } from '@/lib/types';

interface TrendDetailScreenProps {
  trend: Trend;
  onBack?: () => void;
  onMake?: (trend: Trend) => void;
}

function formatViews(n: number): string {
  if (n >= 100_000_000) return `${Math.round(n / 10_000_000) / 10}억`;
  if (n >= 10_000) return `${Math.round(n / 10_000)}만`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}천`;
  return String(n);
}

export default function TrendDetailScreen({ trend, onBack, onMake }: TrendDetailScreenProps) {
  const tags = trend.hashtags
    .split(/[\s,]+/)
    .map((t) => t.replace(/^#/, ''))
    .filter(Boolean)
    .slice(0, 8);

  return (
    <div className="screen active trend-detail-screen" id="screen-trend-detail">
      <div className="status-bar"><span>9:41</span><span style={{ fontSize: '12px' }}>􀙇 􀛪</span></div>
      <div className="deep-header">
        <button className="back-btn" id="trend-detail-back" onClick={onBack}>←</button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-soft)', letterSpacing: '0.06em' }}>TRENDING</span>
        <div style={{ width: '32px' }}></div>
      </div>
      <div className="trend-detail-content">
        <div className="trend-detail-hero">
          <div className="trend-detail-platform" id="td-platform">{trend.platformLabel}</div>
          <div className="trend-detail-title" id="td-title">{trend.title}</div>
          <div className="trend-detail-stats">
            <div className="trend-detail-growth" id="td-growth">참여율 {trend.engagementRate}%</div>
            <div className="trend-detail-views" id="td-views">{formatViews(trend.views)} views</div>
          </div>
        </div>
        <div className="trend-detail-tags" id="td-tags">
          {tags.map((t, i) => (
            <div className="trend-detail-tag" key={i}>{t}</div>
          ))}
        </div>
        <div className="trend-detail-section-title">관련 영상</div>
        <div className="video-cards" id="td-videos">
          <div className="video-card">
            <div className="video-thumb">▶</div>
            <div className="video-card-body">
              <div className="video-card-title">{trend.title}</div>
              <div className="video-card-meta">{trend.creator} · {formatViews(trend.views)}</div>
            </div>
          </div>
        </div>
        <button className="welcome-start-btn" onClick={() => onMake?.(trend)} style={{ maxWidth: '100%', margin: '16px 0 0' }}>이걸로 만들기 →</button>
      </div>
    </div>
  );
}
