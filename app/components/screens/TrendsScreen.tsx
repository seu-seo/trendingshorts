'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Trend } from '@/lib/types';
import { getSavedItems, saveItem, removeItem } from '@/lib/saved-items';

interface TrendsScreenProps {
  category: string;
  categories?: string[];
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

// videoUrl(유튜브)에서 영상 ID를 추출해 maxres 썸네일 URL 생성. 실패 시 t.thumb(실제 커버 이미지) fallback.
// t.thumb가 emoji fallback(이미지 URL 아님)인 경우 null을 반환해 placeholder를 렌더링.
function thumbUrl(t: Trend): string | null {
  const url = t.videoUrl ?? '';
  const m = url.match(/(?:v=|\/shorts\/|youtu\.be\/|\/vi\/)([\w-]{11})/);
  if (m) return `https://i.ytimg.com/vi/${m[1]}/maxresdefault.jpg`;
  return t.thumb.startsWith('http') ? t.thumb : null;
}

function formatViews(n: number): string {
  if (n >= 100_000_000) return `${Math.round(n / 10_000_000) / 10}억`;
  if (n >= 10_000) return `${Math.round(n / 10_000)}만`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}천`;
  return String(n);
}

export default function TrendsScreen({ category, categories, onSelect, onBack, onViewRivals, onNavigate }: TrendsScreenProps) {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [sheet, setSheet] = useState<Trend | null>(null);

  useEffect(() => {
    setSaved(new Set(getSavedItems().filter((i) => i.type === 'trend').map((i) => i.id)));
  }, []);

  function toggleSave(t: Trend) {
    const id = `trend_${t.id}`;
    if (saved.has(id)) {
      removeItem(id);
      setSaved((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } else {
      saveItem({ type: 'trend', id, title: t.title, views: formatViews(t.views), engagementRate: `${t.engagementRate}%`, heatLevel: t.heatLevel, savedAt: new Date().toISOString(), trend: t });
      setSaved((prev) => new Set([...prev, id]));
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/trends')
      .then((r) => r.json())
      .then((json: { data: Trend[] }) => {
        if (!cancelled) setTrends(json.data ?? []);
      })
      .catch(() => { if (!cancelled) setTrends([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(() => {
    if (categories && categories.length > 0) {
      const catSet = new Set(categories);
      return trends
        .filter((t) => catSet.has(t.category))
        .sort((a, b) => b.engagementRate - a.engagementRate)
        .slice(0, 12);
    }
    return [...trends].sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 12);
  }, [trends, categories]);

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
        <div id="trend-original-cards">
          {loading && <div className="v7-sub" style={{ padding: '24px 0' }}>트렌드를 불러오는 중...</div>}
          {visible.map((t) => {
            const badge = BADGE[t.heatLevel];
            const isSaved = saved.has(`trend_${t.id}`);
            const thumb = thumbUrl(t);
            return (
              <div className="v7-tcard" key={`${t.platform}_${t.id}`} onClick={() => setSheet(t)}>
                <div className="v7-tcard-top">
                  <div className="v7-tcard-title">{t.title}</div>
                  <span className={`v7-badge ${badge.cls}`}>{badge.label}</span>
                  <button className={`v7-save-btn${isSaved ? ' saved' : ''}`} onClick={(e) => { e.stopPropagation(); toggleSave(t); }}>
                    <svg viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  </button>
                </div>
                <div className="v7-tcard-meta">
                  <span className="v7-tcard-stat">조회 <b>{formatViews(t.views)}</b></span>
                  <span className="v7-tcard-stat">참여율 <b>{t.engagementRate}%</b></span>
                </div>
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="v7-tcard-thumb"
                    src={thumb}
                    alt={t.title}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="v7-tcard-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', background: 'rgba(255,255,255,0.04)' }}>
                    {t.thumb}
                  </div>
                )}
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

      {/* 트렌드 카드 바텀시트 */}
      {sheet && (
        <>
          <div onClick={() => setSheet(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 101 }} />
          <div style={{ position: 'absolute', bottom: '72px', left: 0, right: 0, background: 'var(--bg-card, #1a1a1a)', borderRadius: '20px 20px 0 0', padding: '20px 20px 36px', zIndex: 102, boxShadow: '0 -8px 24px rgba(0,0,0,0.35)' }}>
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px', lineHeight: 1.4 }}>{sheet.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '20px' }}>
              조회 {formatViews(sheet.views)} · 참여율 {sheet.engagementRate}%
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { toggleSave(sheet); setSheet(null); }}
                style={{ flex: 1, padding: '14px 8px', borderRadius: '14px', border: `1px solid ${saved.has(`trend_${sheet.id}`) ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}`, background: saved.has(`trend_${sheet.id}`) ? 'rgba(200,255,87,0.1)' : 'rgba(255,255,255,0.05)', color: saved.has(`trend_${sheet.id}`) ? 'var(--primary)' : 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={saved.has(`trend_${sheet.id}`) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                {saved.has(`trend_${sheet.id}`) ? '저장됨' : '저장'}
              </button>
              {sheet.videoUrl && (
                <a
                  href={sheet.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSheet(null)}
                  style={{ flex: 1.2, padding: '14px 8px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', textDecoration: 'none' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  콘텐츠 보기
                </a>
              )}
              <button
                onClick={() => { setSheet(null); onSelect(sheet); }}
                style={{ flex: 1.8, padding: '14px 8px', borderRadius: '14px', border: 'none', background: 'var(--primary)', color: 'var(--on-primary, #000)', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                이걸로 만들기 →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
