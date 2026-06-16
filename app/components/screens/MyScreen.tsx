'use client';

import { useEffect, useState } from 'react';
import { getSavedItems, removeItem, type SavedConti, type SavedCreator, type SavedItem, type SavedScript, type SavedTrend } from '@/lib/saved-items';
import type { Trend } from '@/lib/types';

interface MyScreenProps {
  onNavigate: (screen: string) => void;
  onSelectTrend?: (trend: Trend) => void;
}

const HEAT_LABEL: Record<string, string> = { HOT: '반응 폭발', WARM: '상승 중', COLD: '꾸준함' };
const HEAT_CLS: Record<string, string> = { HOT: 'v7-badge-hot', WARM: 'v7-badge-warm', COLD: 'v7-badge-warm' };

export default function MyScreen({ onNavigate, onSelectTrend }: MyScreenProps) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [trendSheet, setTrendSheet] = useState<SavedTrend | null>(null);
  const [creatorSheet, setCreatorSheet] = useState<SavedCreator | null>(null);

  useEffect(() => { setItems(getSavedItems()); }, []);

  function remove(id: string) {
    removeItem(id);
    setItems(getSavedItems());
  }

  const trends = items.filter((i): i is SavedTrend => i.type === 'trend');
  const creators = items.filter((i): i is SavedCreator => i.type === 'creator');
  const scripts = items.filter((i): i is SavedScript => i.type === 'script');
  const contis = items.filter((i): i is SavedConti => i.type === 'conti');

  return (
    <div className="screen active my-screen" id="screen-my">
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
      </div>
      <div className="screen-content">
        <div className="my-header">
          <div className="my-page-title">MY PAGE</div>
        </div>

        <div className="profile-section">
          <div className="profile-row">
            <div className="big-avatar">S</div>
            <div className="profile-info">
              <div className="profile-name">수진<span className="nim"> 님</span></div>
              <div className="profile-meta">팔로워 4,200명 · 크리에이터</div>
            </div>
            <div className="profile-arrow">→</div>
          </div>
          <div className="tag-row" id="my-tags">
            <div className="tag">인스타그램</div>
            <div className="tag">먹방</div>
            <div className="tag">30대</div>
          </div>
        </div>

        {/* 바로가기 */}
        <div style={{ display: 'flex', gap: '10px', margin: '0 16px 16px' }}>
          <button onClick={() => onNavigate('trends')} style={{ flex: '1', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,255,87,0.3)', borderRadius: '14px', padding: '14px 12px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }}>
            <div style={{ fontSize: '10px', color: 'rgba(200,255,87,0.6)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '4px' }}>TREND</div>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>트렌드 다시 고르기 <span style={{ color: '#C8FF57' }}>→</span></span>
          </button>
          <button onClick={() => onNavigate('rivals')} style={{ flex: '1', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,255,87,0.3)', borderRadius: '14px', padding: '14px 12px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }}>
            <div style={{ fontSize: '10px', color: 'rgba(200,255,87,0.6)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '4px' }}>CREATOR</div>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>크리에이터 다시 고르기 <span style={{ color: '#C8FF57' }}>→</span></span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', margin: '0 16px 10px' }}>
          <button onClick={() => onNavigate('my-growth')} style={{ flex: '1', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,255,87,0.3)', borderRadius: '14px', padding: '14px 12px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }}>
            <div style={{ fontSize: '10px', color: 'rgba(200,255,87,0.6)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '4px' }}>GROWTH</div>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>채널 성장 기록 <span style={{ color: '#C8FF57' }}>→</span></span>
          </button>
          <button onClick={() => onNavigate('goal')} style={{ flex: '1', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,255,87,0.3)', borderRadius: '14px', padding: '14px 12px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', backdropFilter: 'blur(4px)' }}>
            <div style={{ fontSize: '10px', color: 'rgba(200,255,87,0.6)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '4px' }}>GOAL</div>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>목표 트래커 <span style={{ color: '#C8FF57' }}>→</span></span>
          </button>
        </div>
        <div style={{ margin: '0 16px 16px' }}>
          <button onClick={() => onNavigate('deep-profile')} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,255,87,0.3)', borderRadius: '14px', padding: '16px 18px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(4px)' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(200,255,87,0.6)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '4px' }}>AI NICHE</div>
              <span style={{ color: 'rgba(255,255,255,0.85)' }}>AI 니치 분석 받기</span>
            </div>
            <span style={{ color: '#C8FF57', fontSize: '18px' }}>✦</span>
          </button>
        </div>

        {/* 저장한 트렌드 영상 */}
        <div className="collection-section">
          <div className="section-head">
            <div className="section-title">저장한 트렌드 영상</div>
          </div>
          {trends.length === 0 ? (
            <div className="collection-empty">
              <div className="collection-empty-text">저장한 트렌드 영상이 없어요</div>
              <div className="collection-empty-sub">트렌드 카드의 ♡ 버튼을 눌러보세요</div>
            </div>
          ) : (
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {trends.map((t) => (
                <div key={t.id} onClick={() => setTrendSheet(t)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray)' }}>조회 {t.views} · 참여율 {t.engagementRate}</div>
                  </div>
                  <span className={`v7-badge ${HEAT_CLS[t.heatLevel] ?? 'v7-badge-warm'}`} style={{ flexShrink: 0 }}>{HEAT_LABEL[t.heatLevel] ?? t.heatLevel}</span>
                  <button onClick={(e) => { e.stopPropagation(); remove(t.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)', fontSize: '16px', flexShrink: 0 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 저장한 크리에이터 */}
        <div className="collection-section">
          <div className="section-head">
            <div className="section-title">저장한 크리에이터</div>
          </div>
          {creators.length === 0 ? (
            <div className="collection-empty">
              <div className="collection-empty-text">저장한 크리에이터가 없어요</div>
              <div className="collection-empty-sub">크리에이터 화면에서 ♡를 눌러보세요</div>
            </div>
          ) : (
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {creators.map((c) => (
                <div key={c.id} className="v7-bcard" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setCreatorSheet(c)}>
                  {c.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.thumbnail} alt={c.channelTitle} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(200,255,87,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#C8FF57', flexShrink: 0 }}>{c.channelTitle[0]}</div>
                  )}
                  <div className="v7-binfo">
                    <div className="v7-bname">{c.channelTitle}</div>
                    <div className="v7-bmeta">{c.handle} · {c.niche}</div>
                    <div className="v7-bgrow">{c.subscribersLabel}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); remove(c.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)', fontSize: '16px', position: 'absolute', top: '10px', right: '10px' }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 저장한 대본·콘티 */}
        {(scripts.length > 0 || contis.length > 0) && (
          <div className="collection-section">
            <div className="section-head">
              <div className="section-title">저장한 대본·콘티</div>
            </div>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {scripts.map((s) => (
                <div key={s.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '10px', color: 'rgba(200,255,87,0.6)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '3px' }}>SCRIPT</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.trendTitle}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '2px' }}>대본 {s.items.length}종</div>
                  </div>
                  <button onClick={() => remove(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)', fontSize: '16px', flexShrink: 0 }}>×</button>
                </div>
              ))}
              {contis.map((c) => (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '10px', color: 'rgba(200,255,87,0.6)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: '3px' }}>CONTI</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.trendTitle}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '2px' }}>콘티 {c.cutsCount}컷</div>
                  </div>
                  <button onClick={() => remove(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)', fontSize: '16px', flexShrink: 0 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 트렌드 바텀시트 */}
      {trendSheet && (
        <>
          <div onClick={() => setTrendSheet(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 101 }} />
          <div style={{ position: 'absolute', bottom: '72px', left: 0, right: 0, background: 'var(--bg-card, #1a1a1a)', borderRadius: '20px 20px 0 0', padding: '20px 20px 28px', zIndex: 102, boxShadow: '0 -8px 24px rgba(0,0,0,0.35)' }}>
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px', lineHeight: 1.4 }}>{trendSheet.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '20px' }}>
              조회 {trendSheet.views} · 참여율 {trendSheet.engagementRate}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {trendSheet.trend.videoUrl ? (
                <a
                  href={trendSheet.trend.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setTrendSheet(null)}
                  style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                >
                  영상 보러가기 ↗
                </a>
              ) : null}
              <button
                onClick={() => { setTrendSheet(null); onSelectTrend?.(trendSheet.trend); }}
                style={{ flex: 2, padding: '14px', borderRadius: '14px', border: 'none', background: 'var(--primary)', color: 'var(--on-primary, #000)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                이걸로 만들기 →
              </button>
            </div>
          </div>
        </>
      )}

      {/* 크리에이터 바텀시트 */}
      {creatorSheet && (
        <>
          <div onClick={() => setCreatorSheet(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 101 }} />
          <div style={{ position: 'absolute', bottom: '72px', left: 0, right: 0, background: 'var(--bg-card, #1a1a1a)', borderRadius: '20px 20px 0 0', padding: '20px 20px 28px', zIndex: 102, boxShadow: '0 -8px 24px rgba(0,0,0,0.35)' }}>
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
              {creatorSheet.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={creatorSheet.thumbnail} alt={creatorSheet.channelTitle} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(200,255,87,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{creatorSheet.channelTitle[0]}</div>
              )}
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>{creatorSheet.channelTitle}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '2px' }}>{creatorSheet.handle} · {creatorSheet.subscribersLabel}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '2px' }}>{creatorSheet.niche}</div>
              </div>
            </div>
            <a
              href={creatorSheet.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setCreatorSheet(null)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'var(--primary)', color: 'var(--on-primary, #000)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}
            >
              채널 보러가기 →
            </a>
          </div>
        </>
      )}

      <div className="tab-bar">
        <div className="tab-item" onClick={() => onNavigate('trends')}>
          <div className="tab-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18 L8 13 L12 17 L21 6" /><path d="M16 6 L21 6 L21 11" />
            </svg>
          </div>
          <div className="tab-label">트렌드</div>
        </div>
        <div className="tab-item active">
          <div className="tab-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" /><path d="M4 21 C4 16 7.5 14 12 14 C16.5 14 20 16 20 21" />
            </svg>
          </div>
          <div className="tab-label">마이페이지</div>
        </div>
      </div>
    </div>
  );
}
