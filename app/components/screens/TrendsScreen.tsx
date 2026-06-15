'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Trend } from '@/lib/types';
import { getSavedItems, saveItem, removeItem } from '@/lib/saved-items';

interface TrendsScreenProps {
  category: string;
  platform?: string;
  categories?: string[];
  chatKeyword?: string;
  onSelect: (trend: Trend) => void;
  onBack?: () => void;
  onViewRivals?: () => void;
  onNavigate?: (screen: string) => void;
}

const BADGE: Record<Trend['heatLevel'], { cls: string; label: string }> = {
  HOT: { cls: 'v7-badge-hot', label: '반응 폭발' },
  WARM: { cls: 'v7-badge-warm', label: '상승 중' },
  COLD: { cls: 'v7-badge-warm', label: '꾸준함' },
};

// videoUrl(유튜브)에서 영상 ID를 추출해 maxres 썸네일 URL 생성. 실패 시 t.thumb fallback.
function thumbUrl(t: Trend): string {
  const url = t.videoUrl ?? '';
  const m = url.match(/(?:v=|\/shorts\/|youtu\.be\/|\/vi\/)([\w-]{11})/);
  if (m) return `https://i.ytimg.com/vi/${m[1]}/maxresdefault.jpg`;
  return t.thumb;
}

function formatViews(n: number): string {
  if (n >= 100_000_000) return `${Math.round(n / 10_000_000) / 10}억`;
  if (n >= 10_000) return `${Math.round(n / 10_000)}만`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}천`;
  return String(n);
}

export default function TrendsScreen({ category, platform, categories, chatKeyword, onSelect, onBack, onViewRivals, onNavigate }: TrendsScreenProps) {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setSaved(new Set(getSavedItems().filter((i) => i.type === 'trend').map((i) => i.id)));
  }, []);

  function toggleSave(t: Trend, e: React.MouseEvent) {
    e.stopPropagation();
    const id = `trend_${t.id}`;
    if (saved.has(id)) {
      removeItem(id);
      setSaved((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      saveItem({ type: 'trend', id, title: t.title, views: formatViews(t.views), engagementRate: `${t.engagementRate}%`, heatLevel: t.heatLevel, savedAt: new Date().toISOString() });
      setSaved((prev) => new Set([...prev, id]));
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url = platform && platform !== 'all' ? `/api/trends?platform=${platform}` : '/api/trends';
    fetch(url)
      .then((r) => r.json())
      .then((json: { data: Trend[] }) => {
        if (!cancelled) setTrends(json.data ?? []);
      })
      .catch(() => { if (!cancelled) setTrends([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [platform]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let pool = q
      ? trends.filter((t) => t.title.toLowerCase().includes(q) || t.hashtags.toLowerCase().includes(q))
      : trends;

    // 취향설정 카테고리로 필터링 (설문 결과 반영)
    if (!q && categories && categories.length > 0) {
      const catSet = new Set(categories);
      const filtered = pool.filter((t) => catSet.has(t.category));
      pool = filtered.length > 0 ? filtered : [...pool].sort((a, b) => b.engagementRate - a.engagementRate);
    }

    // 챗봇 첫 답변 키워드로 추가 정렬
    if (chatKeyword) {
      const kw = chatKeyword.toLowerCase();
      pool = [...pool].sort((a, b) => {
        const aM = a.title.toLowerCase().includes(kw) ? 1 : 0;
        const bM = b.title.toLowerCase().includes(kw) ? 1 : 0;
        return bM - aM || b.engagementRate - a.engagementRate;
      });
    }

    return pool.slice(0, 12);
  }, [trends, query, categories, chatKeyword]);

  return (
    <div className="screen active v7-screen" id="screen-v7-trends">
      <div className="status-bar"><span>9:41</span><span style={{ fontSize: '12px' }}>􀙇 􀛪</span></div>
      <div className="v7-back-row">
        <button className="v7-back-btn" onClick={onBack}>←</button>
      </div>
      <div className="v7-content">
        <span className="v7-eyebrow" id="v7-eyebrow-text">{category} · 지금 뜨는 영상</span>
        <div className="v7-title">이런 영상이<br />요즘 <em>반응</em>이 좋아요</div>
        <div className="v7-sub">마음에 드는 걸 누르면 바로 만들 수 있어요</div>
        <div className="v7-search-wrap">
          <svg className="v7-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            className="v7-search-input"
            id="trend-search-input"
            type="text"
            placeholder="키워드로 트렌드 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="v7-search-clear" id="trend-search-clear" onClick={() => setQuery('')}>✕</button>
          )}
        </div>
        <div id="trend-original-cards">
          {loading && <div className="v7-sub" style={{ padding: '24px 0' }}>트렌드를 불러오는 중...</div>}
          {!loading && visible.length === 0 && (
            <div className="v7-sub" style={{ padding: '24px 0' }}>검색 결과가 없어요</div>
          )}
          {visible.map((t) => {
            const badge = BADGE[t.heatLevel];
            return (
              <div className="v7-tcard" key={t.id} onClick={() => onSelect(t)}>
                <div className="v7-tcard-top">
                  <div className="v7-tcard-title">{t.title}</div>
                  <span className={`v7-badge ${badge.cls}`}>{badge.label}</span>
                  <button className={`v7-save-btn${saved.has(`trend_${t.id}`) ? ' saved' : ''}`} onClick={(e) => toggleSave(t, e)}>
                    <svg viewBox="0 0 24 24" fill={saved.has(`trend_${t.id}`) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  </button>
                </div>
                <div className="v7-tcard-meta">
                  <span className="v7-tcard-stat">조회 <b>{formatViews(t.views)}</b></span>
                  <span className="v7-tcard-stat">참여율 <b>{t.engagementRate}%</b></span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="v7-tcard-thumb" src={thumbUrl(t)} alt={t.title} loading="lazy" />
                <div className="v7-tcard-cta">이걸로 만들기 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></div>
              </div>
            );
          })}
        </div>
        <button className="v7-btn-ghost" onClick={onViewRivals}>먼저 비슷한 크리에이터 구경하기</button>
      </div>
      <div className="tab-bar">
        <div className="tab-item active">
          <div className="tab-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18 L8 13 L12 17 L21 6" /><path d="M16 6 L21 6 L21 11" /></svg>
          </div>
          <div className="tab-label">트렌드</div>
        </div>
        <div className="tab-item" onClick={() => onNavigate?.('my')}>
          <div className="tab-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          </div>
          <div className="tab-label">마이페이지</div>
        </div>
      </div>
    </div>
  );
}
