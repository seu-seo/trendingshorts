'use client';

import { useEffect, useState } from 'react';
import type { Trend } from '@/lib/types';

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
  onSelectTrend?: (trend: Trend) => void;
}

const PLATFORM_CLASS: Record<Trend['platform'], string> = {
  instagram: 'platform-insta',
  youtube: 'platform-youtube',
  tiktok: 'platform-tiktok',
};

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
);

export default function DashboardScreen({ onNavigate, onSelectTrend }: DashboardScreenProps) {
  const [trends, setTrends] = useState<Trend[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/trends')
      .then((r) => r.json())
      .then((json: { data: Trend[] }) => { if (!cancelled) setTrends((json.data ?? []).slice(0, 5)); })
      .catch(() => { if (!cancelled) setTrends([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="screen active dash-screen" id="screen-trend">
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
      </div>
      <div className="screen-content">
        <div className="dash-header">
          <div className="dash-logo">Pulse<span className="dot">.</span></div>
          <div className="cmd-k">
            <svg className="cmd-k-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="5" />
              <path d="M14 14L11 11" strokeLinecap="round" />
            </svg>
            <span className="cmd-k-text">검색하기</span>
          </div>
          <div className="avatar-mini" onClick={() => onNavigate('my')}>S</div>
        </div>

        <div className="dash-hero"></div>

        {/* AI BRIEFING */}
        <div className="ai-briefing" id="ai-briefing">
          <div className="briefing-header">
            <div className="briefing-tag">
              <span className="briefing-tag-dot"></span>
              AI Daily Briefing
            </div>
            <div className="briefing-time">9:30 AM</div>
          </div>

          <div className="briefing-teaser">
            <div className="briefing-teaser-text">
              <span className="teaser-highlight">3줄</span>도 못읽는데 괜찮겠어요?
            </div>
            <div className="briefing-teaser-read">읽어볼게요 →</div>
          </div>

          <div className="briefing-body">
            <div className="briefing-greeting">
              안녕하세요, <span className="name">수진</span>님.<br />
              오늘 트렌드를 정리했어요.
            </div>
            <div className="briefing-summary">
              오늘은 <span className="highlight">직장인 콘텐츠가 강세</span>예요.
              출근·퇴근 루틴 관련이 Top 5에 3개나 있어요.
              짧고 실용적인 게 통하는 날이에요.
            </div>
            <div className="briefing-points">
              <div className="briefing-point">
                <div className="briefing-point-num">01</div>
                <div className="briefing-point-text">
                  <strong>&quot;출근길 5분 루틴&quot;이 +312%</strong> — 오늘의 빅 트렌드. 5월 들어 출근 시간이 평균 7분 늘었어요.
                </div>
              </div>
              <div className="briefing-point">
                <div className="briefing-point-num">02</div>
                <div className="briefing-point-text">
                  <strong>짠테크·홈카페</strong>가 함께 떠올랐어요. 절약+자기관리 콤보가 30대에서 화제예요.
                </div>
              </div>
              <div className="briefing-point">
                <div className="briefing-point-num">03</div>
                <div className="briefing-point-text">
                  인스타그램이 어제보다 <strong>2배 활발</strong>. 릴스 업로드가 평소보다 많아요.
                </div>
              </div>
            </div>
            <div className="briefing-footer">
              <div className="briefing-source">SOURCE: 오늘 · IG + YT + TT</div>
              <button className="briefing-collapse-btn">접기 ↑</button>
            </div>
          </div>
        </div>

        {/* KEYWORDS */}
        <div className="keywords">
          <div className="section-head" style={{ padding: '0 12px' }}>
            <div className="section-title">실시간 해시태그</div>
            <div className="section-meta">LIVE</div>
          </div>
          <div className="bubble-wrap">
            <div className="bubble b1"><div className="bubble-word">#출근길5분</div><div className="bubble-pct">+312%</div></div>
            <div className="bubble b2"><div className="bubble-word">#짠테크루틴</div><div className="bubble-pct">+248%</div></div>
            <div className="bubble b3"><div className="bubble-word">#홈카페</div><div className="bubble-pct">+187%</div></div>
            <div className="bubble b3"><div className="bubble-word">#2010년대</div><div className="bubble-pct">+142%</div></div>
            <div className="bubble b4"><div className="bubble-word">#미라클모닝</div><div className="bubble-pct">+98%</div></div>
            <div className="bubble b4"><div className="bubble-word">#도시락</div><div className="bubble-pct">+75%</div></div>
            <div className="bubble b5"><div className="bubble-word">#퇴근루틴</div><div className="bubble-pct">+68%</div></div>
            <div className="bubble b5"><div className="bubble-word">#커피절약</div><div className="bubble-pct">+54%</div></div>
          </div>
        </div>

        {/* TRENDING */}
        <div className="section">
          <div className="section-head">
            <div className="section-title">지금 뜨고 있어요</div>
            <div className="section-meta" onClick={() => onNavigate('trends')}>더보기 →</div>
          </div>
          <div className="trend-list">
            {trends.map((t, i) => (
              <div className={`trend-item ${PLATFORM_CLASS[t.platform]}`} key={t.id} onClick={() => (onSelectTrend ? onSelectTrend(t) : onNavigate('trends'))}>
                <div className="trend-item-main">
                  <div className="trend-rank">{i + 1}</div>
                  <div className="trend-body">
                    <div className="trend-title">{t.title}</div>
                    <div className="trend-meta">
                      <span className="platform-name">{t.platformLabel}</span>
                      <span className="bullet"></span>
                      <span>{formatViews(t.views)}</span>
                    </div>
                  </div>
                  <div className="trend-stat">
                    <span className="trend-growth">{t.engagementRate}%</span>
                  </div>
                  <button className="heart-btn"><HeartIcon /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tab-bar">
        <div className="tab-item active">
          <div className="tab-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18 L8 13 L12 17 L21 6" />
              <path d="M16 6 L21 6 L21 11" />
            </svg>
          </div>
          <div className="tab-label">트렌드</div>
        </div>
        <div className="tab-item" id="tab-my" onClick={() => onNavigate('my')}>
          <div className="tab-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21 C4 16 7.5 14 12 14 C16.5 14 20 16 20 21" />
            </svg>
          </div>
          <div className="tab-label">마이페이지</div>
        </div>
      </div>
    </div>
  );
}
